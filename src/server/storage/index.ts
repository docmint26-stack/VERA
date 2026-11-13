import { randomUUID } from "node:crypto";
import { getEnv } from "@/lib/config/env";
import { createLocalStorage } from "./local";
import { S3Storage } from "./s3";
import { extensionForMime } from "./scan";
import type { ObjectStorageProvider } from "./types";

export { StorageError } from "./types";
export type { ObjectStorageProvider, PutResult, PresignedDownload } from "./types";
export { scanUpload, sanitizeFilename, staticValidate } from "./scan";

let instance: ObjectStorageProvider | null = null;

export function getObjectStorage(): ObjectStorageProvider {
  if (instance) return instance;
  const env = getEnv();
  instance = env.STORAGE_PROVIDER === "s3" ? new S3Storage() : createLocalStorage();
  return instance;
}

/** Test seam: swap the provider (e.g. an in-memory fake). */
export function setObjectStorage(provider: ObjectStorageProvider | null): void {
  instance = provider;
}

/**
 * Server-generated object key. The user's id scopes the object and the
 * filename never participates — collisions and traversal are impossible.
 */
export function generateStorageKey(ownerId: string, mime: string): string {
  const ext = extensionForMime(mime);
  return `users/${ownerId}/${randomUUID()}${ext}`;
}
