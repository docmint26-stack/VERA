import { NextRequest } from "next/server";
import { connection } from "next/server";
import { z } from "zod";
import { AppError, errors, isAppError } from "@/lib/errors/app-error";
import { logger } from "@/server/observability/logger";
import { auth } from "@/server/auth/auth";
import { enforceRateLimit, clientIp, type RateLimitRuleConfig } from "@/server/security/rate-limit";

/**
 * Thin route-handler framework.
 *
 * Route Handler → Validation → Authentication → Authorization → Service → DB
 *
 * Handlers stay declarative: declare body/query schemas, auth requirement and
 * rate limits, then implement a service call. Everything else (request id,
 * error mapping, logging, safe serialization) happens here.
 */

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string;
  status: string;
  slug: string | null;
  createdAt: Date;
}

export interface ApiContext<B = unknown, Q = unknown> {
  req: NextRequest;
  params: Record<string, string>;
  query: Q;
  body: B;
  requestId: string;
  ip: string;
  user: AuthUser | null;
  headers: Headers;
}

export type AuthRequirement = "required" | "optional" | "none";

export interface ApiRouteOptions<
  Body extends z.ZodType = z.ZodType,
  Query extends z.ZodType = z.ZodType,
> {
  auth?: AuthRequirement;
  body?: Body;
  query?: Query;
  rateLimit?: RateLimitRuleConfig | ((ctx: { requestId: string; ip: string; userId?: string; email?: string }) => RateLimitRuleConfig | null);
  /** Extra error mapping, e.g. Prisma known errors. */
  handler: (ctx: ApiContext<z.output<Body>, z.output<Query>>) => Promise<unknown> | unknown;
}

export function newRequestId(): string {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj && "randomUUID" in cryptoObj) return cryptoObj.randomUUID();
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Convert BigInt / Date / undefined into JSON-safe values. */
export function jsonSafe(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(jsonSafe);
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = jsonSafe(val);
    }
    return out;
  }
  return value;
}

export function ok(data: unknown, init?: ResponseInit): Response {
  return Response.json({ data: jsonSafe(data) }, { status: 200, ...init });
}

export function created(data: unknown, init?: ResponseInit): Response {
  return Response.json({ data: jsonSafe(data) }, { status: 201, ...init });
}

export function noContent(): Response {
  return new Response(null, { status: 204 });
}

async function resolveSession(req: NextRequest): Promise<{ user: AuthUser | null; raw: unknown }> {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return { user: null, raw: null };
    const u = session.user as unknown as AuthUser & Record<string, unknown>;
    return {
      raw: session,
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        emailVerified: Boolean(u.emailVerified),
        image: u.image ?? null,
        role: String(u.role ?? "USER"),
        status: String(u.status ?? "ACTIVE"),
        slug: u.slug ?? null,
        createdAt: u.createdAt instanceof Date ? u.createdAt : new Date(u.createdAt as string),
      },
    };
  } catch (error) {
    logger.warn("auth.session-resolve-failed", { service: "api", error });
    return { user: null, raw: null };
  }
}

function formatZodError(error: z.ZodError): Array<{ path: string; message: string }> {
  return error.issues.map((issue) => ({
    path: issue.path.map(String).join("."),
    message: issue.message,
  }));
}

export function apiRoute<Body extends z.ZodType, Query extends z.ZodType>(
  options: ApiRouteOptions<Body, Query>,
) {
  const authRequirement = options.auth ?? "required";

  return async function handler(req: NextRequest, routeCtx?: { params?: Promise<unknown> }): Promise<Response> {
    const requestId = newRequestId();
    const started = Date.now();
    const ip = clientIp(req);
    const params = routeCtx?.params ? (await routeCtx.params) as Record<string, string> : {};
    const url = new URL(req.url);

    let user: AuthUser | null = null;
    let query: unknown = undefined;
    let body: unknown = undefined;

    try {
      // 0. Opt out of build-time prerendering (cacheComponents): every API
      //    route reads the session cookie and must run per request.
      await connection();

      // 1. Authentication
      if (authRequirement !== "none") {
        const session = await resolveSession(req);
        user = session.user;
        if (authRequirement === "required" && !user) {
          throw errors.unauthenticated();
        }
        if (user && user.status === "SUSPENDED") {
          throw errors.forbidden("This account is suspended.");
        }
      }

      // 2. Validation — query
      if (options.query) {
        const parsed = options.query.safeParse(Object.fromEntries(url.searchParams));
        if (!parsed.success) {
          throw errors.validation("Invalid query parameters.", formatZodError(parsed.error));
        }
        query = parsed.data;
      }

      // 3. Validation — body
      if (options.body) {
        const contentType = req.headers.get("content-type") ?? "";
        if (!contentType.includes("application/json")) {
          throw errors.validation("Expected a JSON request body.");
        }
        let raw: unknown;
        try {
          raw = await req.json();
        } catch {
          throw errors.validation("Malformed JSON body.");
        }
        const parsed = options.body.safeParse(raw);
        if (!parsed.success) {
          throw errors.validation("Invalid request body.", formatZodError(parsed.error));
        }
        body = parsed.data;
      }

      // 4. Abuse controls
      if (options.rateLimit) {
        const rule =
          typeof options.rateLimit === "function"
            ? options.rateLimit({ requestId, ip, userId: user?.id, email: user?.email })
            : options.rateLimit;
        if (rule) {
          await enforceRateLimit(rule, { requestId, ip, userId: user?.id, email: user?.email });
        }
      }

      // 5. Service call
      const ctx: ApiContext<z.output<Body>, z.output<Query>> = {
        req,
        params,
        query: query as z.output<Query>,
        body: body as z.output<Body>,
        requestId,
        ip,
        user,
        headers: req.headers,
      };
      const result = await options.handler(ctx);
      if (result instanceof Response) {
        withRequestId(result, requestId);
        return result;
      }
      const response = ok(result);
      withRequestId(response, requestId);
      return response;
    } catch (error) {
      return errorResponse(error, requestId, req);
    } finally {
      const durationMs = Date.now() - started;
      const level = durationMs > 2000 ? "warn" : "debug";
      logger[level]("api.request", {
        service: "api",
        operation: `${req.method} ${url.pathname}`,
        requestId,
        userId: user?.id,
        durationMs,
      });
    }
  };
}

function withRequestId(response: Response, requestId: string): void {
  response.headers.set("X-Request-Id", requestId);
}

function errorResponse(error: unknown, requestId: string, req: NextRequest): Response {
  if (isAppError(error)) {
    if (error.status >= 500) {
      logger.error("api.error", { service: "api", requestId, operation: `${req.method} ${new URL(req.url).pathname}`, error });
    }
    const headers: Record<string, string> = { "X-Request-Id": requestId, ...(error.headers ?? {}) };
    if (error.code === "UNAUTHENTICATED") {
      headers["Cache-Control"] = "no-store";
    }
    return Response.json(error.toJSON(requestId), { status: error.status, headers });
  }

  if (error instanceof z.ZodError) {
    return Response.json(
      errors.validation("Invalid request.", formatZodError(error)).toJSON(requestId),
      { status: 422, headers: { "X-Request-Id": requestId } },
    );
  }

  // Prisma known error codes
  const prismaError = error as { code?: string; meta?: { target?: string[] } };
  if (prismaError?.code === "P2002") {
    const target = prismaError.meta?.target?.join(", ");
    return Response.json(
      errors.conflict(target ? `That ${target} is already taken.` : "That value already exists.").toJSON(requestId),
      { status: 409, headers: { "X-Request-Id": requestId } },
    );
  }
  if (prismaError?.code === "P2025") {
    return Response.json(errors.notFound().toJSON(requestId), { status: 404, headers: { "X-Request-Id": requestId } });
  }

  logger.error("api.unhandled-error", {
    service: "api",
    requestId,
    operation: `${req.method} ${new URL(req.url).pathname}`,
    error,
  });
  return Response.json(errors.internal().toJSON(requestId), {
    status: 500,
    headers: { "X-Request-Id": requestId, "Cache-Control": "no-store" },
  });
}

export { AppError };
