import { createHash } from "node:crypto";
import { Readable } from "node:stream";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getEnv } from "@/lib/config/env";
import { StorageError, type ObjectMetadata, type ObjectStorageProvider, type PresignedDownload, type PutOptions, type PutResult } from "./types";

/**
 * S3-compatible object storage (R2 / MinIO / AWS).
 *
 * Uploads still stream through this provider from the API layer so content
 * checks run first; only downloads use short-lived presigned URLs after the
 * caller has been authorized.
 */
export class S3Storage implements ObjectStorageProvider {
  readonly kind = "s3" as const;
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    const env = getEnv();
    if (!env.S3_BUCKET) {
      throw new StorageError("S3_BUCKET is required when STORAGE_PROVIDER=s3", "PROVIDER_MISCONFIGURED");
    }
    this.bucket = env.S3_BUCKET;
    this.client = new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT || undefined,
      forcePathStyle: env.S3_FORCE_PATH_STYLE,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
    });
  }

  async put(key: string, data: Readable | Buffer, opts: PutOptions): Promise<PutResult> {
    // Buffer with a hard cap — the API layer already enforces MAX_UPLOAD_BYTES.
    const chunks: Buffer[] = [];
    let size = 0;
    if (Buffer.isBuffer(data)) {
      chunks.push(data);
      size = data.length;
    } else {
      for await (const chunk of data as AsyncIterable<Buffer>) {
        size += chunk.length;
        if (size > opts.maxBytes) {
          throw new StorageError(`file exceeds ${opts.maxBytes} bytes`, "TOO_LARGE");
        }
        chunks.push(chunk);
      }
    }
    if (size > opts.maxBytes) throw new StorageError(`file exceeds ${opts.maxBytes} bytes`, "TOO_LARGE");

    const body = Buffer.concat(chunks);
    try {
      await this.client.send(
        new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: opts.contentType }),
      );
    } catch (error) {
      throw new StorageError(`s3 put failed: ${error instanceof Error ? error.message : "unknown"}`, "WRITE_FAILED");
    }
    return { key, size, checksumSha256: createHash("sha256").update(body).digest("hex") };
  }

  async getStream(key: string): Promise<Readable> {
    try {
      const res = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
      if (!res.Body) throw new StorageError("empty object body", "READ_FAILED");
      return Readable.fromWeb(res.Body as unknown as import("stream/web").ReadableStream);
    } catch (error) {
      if (error instanceof StorageError) throw error;
      const name = (error as { name?: string }).name;
      if (name === "NoSuchKey" || name === "NotFound") {
        throw new StorageError(`object not found: ${key}`, "NOT_FOUND");
      }
      throw new StorageError(`s3 get failed: ${error instanceof Error ? error.message : "unknown"}`, "READ_FAILED");
    }
  }

  async head(key: string): Promise<ObjectMetadata | null> {
    try {
      const res = await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return { contentType: res.ContentType ?? "application/octet-stream", size: res.ContentLength ?? 0 };
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    } catch (error) {
      throw new StorageError(`s3 delete failed: ${error instanceof Error ? error.message : "unknown"}`, "WRITE_FAILED");
    }
  }

  async presignDownload(key: string, opts: { downloadName?: string; ttlSeconds?: number } = {}): Promise<PresignedDownload> {
    const env = getEnv();
    const ttl = opts.ttlSeconds ?? env.S3_PRESIGN_EXPIRES;
    const url = await getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ResponseContentDisposition: opts.downloadName ? `attachment; filename="${opts.downloadName.replace(/"/g, "")}"` : undefined,
      }),
      { expiresIn: ttl },
    );
    return { url, expiresAt: new Date(Date.now() + ttl * 1000).toISOString() };
  }
}
