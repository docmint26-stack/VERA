import { createHash } from "node:crypto";
import { createReadStream, createWriteStream, promises as fs } from "node:fs";
import path from "node:path";
import type { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { getEnv } from "@/lib/config/env";
import { StorageError, type ObjectMetadata, type ObjectStorageProvider, type PresignedDownload, type PutOptions, type PutResult } from "./types";

/**
 * Filesystem object storage (default provider).
 *
 * Layout: <STORAGE_DIR>/<key> where key is always server-generated
 * (`users/<userId>/<uuid><ext>`). Writes go to a temp file first and are
 * renamed atomically, so a crashed upload never leaves a partial object
 * visible under its final key.
 */
export class LocalFsStorage implements ObjectStorageProvider {
  readonly kind = "local" as const;

  constructor(private readonly baseDir: string) {}

  private resolveKey(key: string): string {
    if (key.includes("..") || path.isAbsolute(key)) {
      throw new StorageError(`invalid storage key`, "WRITE_FAILED");
    }
    const full = path.resolve(this.baseDir, key);
    const base = path.resolve(this.baseDir);
    if (!full.startsWith(base + path.sep)) {
      throw new StorageError("invalid storage key", "WRITE_FAILED");
    }
    return full;
  }

  async put(key: string, data: Readable | Buffer, opts: PutOptions): Promise<PutResult> {
    const target = this.resolveKey(key);
    await fs.mkdir(path.dirname(target), { recursive: true });
    const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;

    const hash = createHash("sha256");
    let size = 0;
    let tooLarge = false;

    const source = Buffer.isBuffer(data)
      ? async function* () {
          yield data;
        }
      : data;

    const limit = async function* (input: AsyncIterable<Buffer> | NodeJS.ReadableStream): AsyncGenerator<Buffer> {
      for await (const chunk of input as AsyncIterable<Buffer>) {
        size += chunk.length;
        if (size > opts.maxBytes) {
          tooLarge = true;
          throw new StorageError(`file exceeds ${opts.maxBytes} bytes`, "TOO_LARGE");
        }
        hash.update(chunk);
        yield chunk;
      }
    };

    try {
      await pipeline(limit(source as AsyncIterable<Buffer>), createWriteStream(tmp));
    } catch (error) {
      await fs.rm(tmp, { force: true });
      if (tooLarge) throw error;
      throw new StorageError(`write failed: ${error instanceof Error ? error.message : "unknown"}`, "WRITE_FAILED");
    }

    await fs.rename(tmp, target);
    return { key, size, checksumSha256: hash.digest("hex") };
  }

  async getStream(key: string): Promise<Readable> {
    const target = this.resolveKey(key);
    try {
      await fs.access(target);
    } catch {
      throw new StorageError(`object not found: ${key}`, "NOT_FOUND");
    }
    return createReadStream(target);
  }

  async head(key: string): Promise<ObjectMetadata | null> {
    try {
      const stat = await fs.stat(this.resolveKey(key));
      // Content type is owned by the database record; local head only reports size.
      return { contentType: "application/octet-stream", size: stat.size };
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    await fs.rm(this.resolveKey(key), { force: true });
  }

  /**
   * Local storage has no external URL space — downloads stream through the
   * application route so authorization is always enforced.
   */
  async presignDownload(key: string): Promise<PresignedDownload> {
    const url = `/api/v1/vault/content?key=${encodeURIComponent(key)}`;
    return { url, expiresAt: new Date(Date.now() + 5 * 60_000).toISOString() };
  }
}

export function createLocalStorage(): ObjectStorageProvider {
  const env = getEnv();
  return new LocalFsStorage(path.resolve(process.cwd(), env.STORAGE_DIR));
}
