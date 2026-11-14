/**
 * Application error taxonomy.
 *
 * Every service throws AppError; route handlers map it to a stable JSON body:
 *   { "error": { "code": "FORBIDDEN", "message": "...", "requestId": "..." } }
 */

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "PAYLOAD_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "PRECONDITION_FAILED"
  | "QUOTA_EXCEEDED"
  | "BAD_REQUEST"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR";

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 422,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  PRECONDITION_FAILED: 412,
  QUOTA_EXCEEDED: 413,
  BAD_REQUEST: 400,
  SERVICE_UNAVAILABLE: 503,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;
  readonly headers?: Record<string, string>;

  constructor(code: ErrorCode, message: string, options?: { details?: unknown; headers?: Record<string, string> }) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.details = options?.details;
    this.headers = options?.headers;
  }

  toJSON(requestId?: string) {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details !== undefined ? { details: this.details } : {}),
        ...(requestId ? { requestId } : {}),
      },
    };
  }
}

export const errors = {
  unauthenticated: (message = "You must be signed in to do that.") => new AppError("UNAUTHENTICATED", message),
  forbidden: (message = "You do not have permission to do that.") => new AppError("FORBIDDEN", message),
  notFound: (message = "Not found.") => new AppError("NOT_FOUND", message),
  conflict: (message = "That conflicts with existing data.", details?: unknown) =>
    new AppError("CONFLICT", message, { details }),
  validation: (message = "The submitted data is invalid.", details?: unknown) =>
    new AppError("VALIDATION_ERROR", message, { details }),
  rateLimited: (retryAfterSeconds: number, message = "Too many requests. Please slow down.") =>
    new AppError("RATE_LIMITED", message, { headers: { "Retry-After": String(Math.max(1, Math.ceil(retryAfterSeconds))) } }),
  quotaExceeded: (message = "Storage quota exceeded.", details?: unknown) =>
    new AppError("QUOTA_EXCEEDED", message, { details }),
  payloadTooLarge: (message = "The uploaded file is too large.") => new AppError("PAYLOAD_TOO_LARGE", message),
  unsupportedMedia: (message = "That file type is not allowed.") => new AppError("UNSUPPORTED_MEDIA_TYPE", message),
  preconditionFailed: (message: string, details?: unknown) => new AppError("PRECONDITION_FAILED", message, { details }),
  badRequest: (message = "Bad request.") => new AppError("BAD_REQUEST", message),
  unavailable: (message = "Service temporarily unavailable.") => new AppError("SERVICE_UNAVAILABLE", message),
  internal: (message = "Something went wrong.") => new AppError("INTERNAL_ERROR", message),
};

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
