import type { Readable } from "node:stream";

/**
 * Object storage abstraction.
 *
 * Phase 2 ships two providers behind one interface:
 *  - `local`  — filesystem under STORAGE_DIR (default for dev/tests)
 *  - `s3`     — S3-compatible bucket (R2/MinIO/AWS) for production
 *
 * Design decisions:
 *  - Uploads are always proxied through the API so size, MIME and malware
 *    checks cannot be bypassed (no client-side direct-to-bucket PUT).
 *  - Storage keys are server-generated (`users/<userId>/<uuid>.<ext>`) and
 *    never derived from user input.
 *  - Download URLs are only handed out after an authorization check; the
 *    presigned URL itself is short-lived.
 */

export interface ObjectMetadata {
  contentType: string;
  size: number;
}

export interface PutResult {
  key: string;
  size: number;
  checksumSha256: string;
}

export interface PutOptions {
  contentType: string;
  /** Hard limit enforced while streaming — never buffer unbounded input. */
  maxBytes: number;
}

export interface PresignedDownload {
  url: string;
  expiresAt: string;
}

export interface ObjectStorageProvider {
  readonly kind: "local" | "s3";
  put(key: string, data: Readable | Buffer, opts: PutOptions): Promise<PutResult>;
  getStream(key: string): Promise<Readable>;
  head(key: string): Promise<ObjectMetadata | null>;
  delete(key: string): Promise<void>;
  /**
   * Short-lived download URL. Local provider returns an application URL that
   * still runs through authorization; S3 returns a presigned GET.
   */
  presignDownload(key: string, opts: { downloadName?: string; ttlSeconds?: number }): Promise<PresignedDownload>;
}

export class StorageError extends Error {
  constructor(
    message: string,
    readonly code:
      | "TOO_LARGE"
      | "NOT_FOUND"
      | "WRITE_FAILED"
      | "READ_FAILED"
      | "PROVIDER_MISCONFIGURED",
  ) {
    super(message);
    this.name = "StorageError";
  }
}
