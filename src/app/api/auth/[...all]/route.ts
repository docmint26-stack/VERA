import { connection } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/server/auth/auth";

/**
 * Better Auth endpoint catch-all.
 *
 * Library-owned paths (/api/auth/*) are intentionally NOT versioned; all
 * application APIs live under /api/v1. See docs/api/OPENAPI.yaml.
 *
 * `await connection()` opts every handler out of build-time prerendering —
 * session responses must never be statically cached.
 */
const handler = toNextJsHandler(auth.handler);

export async function GET(request: Request): Promise<Response> {
  await connection();
  return handler.GET(request);
}

export async function POST(request: Request): Promise<Response> {
  await connection();
  return handler.POST(request);
}

export async function PATCH(request: Request): Promise<Response> {
  await connection();
  return handler.PATCH(request);
}

export async function PUT(request: Request): Promise<Response> {
  await connection();
  return handler.PUT(request);
}

export async function DELETE(request: Request): Promise<Response> {
  await connection();
  return handler.DELETE(request);
}
