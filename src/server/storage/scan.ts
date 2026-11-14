import net from "node:net";
import { getEnv, getFeatures } from "@/lib/config/env";
import { logger } from "@/server/observability/logger";

/**
 * Upload content validation.
 *
 * Two layers, both mandatory where applicable:
 *  1. `static-v1` — always runs. Filename hygiene, MIME allow-list and
 *     magic-byte sniffing. Catches disguised executables, empty files,
 *     extension/MIME mismatches and path traversal attempts.
 *  2. `clamav` — runs only when CLAMAV_HOST is configured. When absent the
 *     engine is reported honestly as `static-v1`; we never claim a scan that
 *     did not happen.
 */

export type ScanVerdict = "CLEAN" | "MALWARE" | "UNSAFE" | "ERROR";

export interface ScanResult {
  engine: "static-v1" | "clamav";
  status: ScanVerdict;
  message?: string;
}

/** Sanitize a client-supplied display filename. Never used to build keys. */
export function sanitizeFilename(raw: string): string {
  const base = raw.split(/[\\/]/).pop() ?? "file";
  const cleaned = base
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/^\.+/, "")
    .replace(/[<>:"|?*]/g, "_")
    .trim()
    .slice(0, 200);
  return cleaned || "file";
}

interface Signature {
  mime: string;
  ext: string;
  test: (b: Buffer) => boolean;
}

const signatures: Signature[] = [
  { mime: "application/pdf", ext: ".pdf", test: (b) => b.subarray(0, 5).toString("latin1") === "%PDF-" },
  { mime: "image/png", ext: ".png", test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mime: "image/jpeg", ext: ".jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: "image/gif", ext: ".gif", test: (b) => b.subarray(0, 6).toString("latin1").startsWith("GIF8") },
  {
    mime: "image/webp",
    ext: ".webp",
    test: (b) => b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP",
  },
  { mime: "image/bmp", ext: ".bmp", test: (b) => b.subarray(0, 2).toString("latin1") === "BM" },
  { mime: "application/zip", ext: ".zip", test: (b) => b[0] === 0x50 && b[1] === 0x4b && (b[2] === 0x03 || b[2] === 0x05 || b[2] === 0x07) },
  { mime: "application/gzip", ext: ".gz", test: (b) => b[0] === 0x1f && b[1] === 0x8b },
  { mime: "application/x-7z-compressed", ext: ".7z", test: (b) => b.subarray(0, 6).toString("latin1") === "7z\xbc\xaf\x27\x1c" },
  { mime: "application/x-rar-compressed", ext: ".rar", test: (b) => b.subarray(0, 4).toString("latin1") === "Rar!" },
  { mime: "text/plain", ext: ".txt", test: (b) => isMostlyText(b) },
  { mime: "text/csv", ext: ".csv", test: (b) => isMostlyText(b) },
  { mime: "video/mp4", ext: ".mp4", test: (b) => b.subarray(4, 8).toString("latin1") === "ftyp" },
  { mime: "audio/mpeg", ext: ".mp3", test: (b) => b.subarray(0, 3).toString("latin1") === "ID3" || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) },
];

/** MIME types we refuse outright, whatever the extension claims. */
const BLOCKED_MIME = [
  "application/x-msdownload",
  "application/x-msdos-program",
  "application/x-executable",
  "application/x-sharedlib",
  "application/vnd.microsoft.portable-executable",
  "application/x-sh",
  "application/x-bat",
];

/** Extensions that are never acceptable uploads. */
const BLOCKED_EXT = [".exe", ".dll", ".so", ".dylib", ".msi", ".scr", ".bat", ".cmd", ".com", ".pif", ".js", ".jse", ".vbs", ".ps1", ".jar", ".apk", ".app", ".deb", ".rpm"];

/** MIME types we accept (allow-list). */
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/zip",
  "application/gzip",
  "application/x-7z-compressed",
  "application/x-rar-compressed",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "application/msword",
  "application/vnd.ms-excel",
  "text/plain",
  "text/csv",
  "text/markdown",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/bmp",
  "video/mp4",
  "audio/mpeg",
  "application/json",
]);

/** MIMEs that may legitimately sniff as one of these container types. */
const ZIP_CONTAINER = new Set([
  "application/zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/msword",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
]);

/** Validate only the client-declared type before bytes exist. */
export function declaredUploadAllowed(declaredMime: string, filename: string): boolean {
  const ext = filename.toLowerCase().includes(".") ? filename.toLowerCase().slice(filename.lastIndexOf(".")) : "";
  const mime = declaredMime.split(";")[0].trim().toLowerCase();
  return !BLOCKED_EXT.includes(ext) && !BLOCKED_MIME.includes(mime) && ALLOWED_MIME.has(mime);
}

function isMostlyText(b: Buffer): boolean {
  if (b.length === 0) return true;
  const sample = b.subarray(0, Math.min(b.length, 4096));
  let suspicious = 0;
  for (const byte of sample) {
    if (byte === 0x00) return false;
    if (byte < 0x09 || (byte > 0x0d && byte < 0x20)) suspicious++;
  }
  return suspicious / sample.length < 0.1;
}

export function sniffMime(b: Buffer): string | null {
  for (const sig of signatures) {
    if (sig.test(b)) return sig.mime;
  }
  return null;
}

export function extensionForMime(mime: string): string {
  const found = signatures.find((s) => s.mime === mime);
  if (found) return found.ext;
  if (ZIP_CONTAINER.has(mime)) return ".docx";
  if (mime === "application/json") return ".json";
  if (mime === "text/markdown") return ".md";
  return "";
}

/**
 * Static validation: allow-list + magic-byte consistency.
 * Returns CLEAN, UNSAFE (policy violation) or ERROR (cannot determine).
 */
export function staticValidate(buffer: Buffer, declaredMime: string, filename: string): ScanResult {
  const engine = "static-v1" as const;

  if (buffer.length === 0) {
    return { engine, status: "UNSAFE", message: "empty file" };
  }

  const lowerName = filename.toLowerCase();
  const ext = lowerName.includes(".") ? lowerName.slice(lowerName.lastIndexOf(".")) : "";
  if (BLOCKED_EXT.includes(ext)) {
    return { engine, status: "UNSAFE", message: `file type not allowed: ${ext}` };
  }

  const declared = declaredMime.split(";")[0].trim().toLowerCase();
  if (BLOCKED_MIME.includes(declared)) {
    return { engine, status: "UNSAFE", message: `content type not allowed: ${declared}` };
  }
  if (declared !== "application/octet-stream" && !ALLOWED_MIME.has(declared)) {
    return { engine, status: "UNSAFE", message: `content type not allowed: ${declared}` };
  }

  const sniffed = sniffMime(buffer);

  if (ZIP_CONTAINER.has(declared)) {
    // OOXML/legacy office formats are ZIP (or OLE2 for .doc/.xls) containers.
    if (declared === "application/msword" || declared === "application/vnd.ms-excel") {
      if (buffer.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))) {
        return { engine, status: "CLEAN", message: "ole2 container" };
      }
    }
    if (sniffed !== "application/zip") {
      return { engine, status: "UNSAFE", message: "container signature mismatch" };
    }
    return { engine, status: "CLEAN", message: "zip container" };
  }

  if (declared === "application/octet-stream") {
    if (!sniffed || !ALLOWED_MIME.has(sniffed)) {
      return { engine, status: "UNSAFE", message: "unrecognised binary content" };
    }
    return { engine, status: "CLEAN", message: `sniffed ${sniffed}` };
  }

  if (declared === "text/csv" || declared === "text/plain" || declared === "text/markdown" || declared === "application/json") {
    if (!isMostlyText(buffer)) {
      return { engine, status: "UNSAFE", message: "declared text content contains binary data" };
    }
    return { engine, status: "CLEAN", message: "text content" };
  }

  if (!sniffed) {
    return { engine, status: "UNSAFE", message: "content does not match its declared type" };
  }

  // image/svg+xml is intentionally absent from ALLOWED_MIME (scriptable).
  const compatible =
    sniffed === declared ||
    (sniffed === "application/zip" && ZIP_CONTAINER.has(declared)) ||
    (sniffed === "text/plain" && (declared === "text/csv" || declared === "text/markdown"));

  if (!compatible) {
    return { engine, status: "UNSAFE", message: `declared ${declared} but content looks like ${sniffed}` };
  }

  return { engine, status: "CLEAN", message: `verified ${sniffed}` };
}

/** Minimal ClamAV INSTREAM client. Returns null when no daemon is reachable. */
async function clamavScan(buffer: Buffer): Promise<ScanResult | null> {
  const env = getEnv();
  if (!env.CLAMAV_HOST) return null;
  const engine = "clamav" as const;

  return new Promise((resolve) => {
    const socket = net.createConnection({ host: env.CLAMAV_HOST, port: env.CLAMAV_PORT, timeout: 15_000 });
    let response = "";
    let settled = false;

    const finish = (result: ScanResult) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(15_000, () => finish({ engine, status: "ERROR", message: "clamav timeout" }));
    socket.on("error", (err) => {
      logger.warn("clamav_unreachable", { error: err.message });
      finish({ engine, status: "ERROR", message: `clamav unreachable: ${err.message}` });
    });
    socket.on("data", (chunk) => {
      response += chunk.toString("latin1");
      if (response.includes("\n")) {
        if (response.startsWith("OK")) finish({ engine, status: "CLEAN" });
        else if (response.includes("FOUND")) finish({ engine, status: "MALWARE", message: response.trim().slice(0, 300) });
        else finish({ engine, status: "ERROR", message: response.trim().slice(0, 300) });
      }
    });

    socket.on("connect", () => {
      socket.write("INSTREAM\n");
      const CHUNK = 2 * 1024 * 1024;
      let offset = 0;
      const pump = () => {
        if (offset >= buffer.length) {
          socket.write("0\n");
          return;
        }
        const slice = buffer.subarray(offset, offset + CHUNK);
        const len = Buffer.alloc(4);
        len.writeUInt32BE(slice.length, 0);
        socket.write(Buffer.concat([len, slice]));
        offset += slice.length;
        setImmediate(pump);
      };
      pump();
    });
  });
}

/**
 * Full scan pipeline for an in-memory upload buffer.
 * Static validation always runs first; ClamAV runs when configured.
 */
export async function scanUpload(buffer: Buffer, declaredMime: string, filename: string): Promise<ScanResult> {
  const staticResult = staticValidate(buffer, declaredMime, filename);
  if (staticResult.status !== "CLEAN") return staticResult;

  if (!getFeatures().clamav) {
    // Static validation is useful for rejecting malformed content, but it is
    // not malware scanning. Keep the object quarantined until ClamAV (or a
    // reviewed equivalent) is configured.
    return { engine: "static-v1", status: "ERROR", message: "malware scanner is not configured" };
  }

  const av = await clamavScan(buffer);
  if (!av) return { engine: "static-v1", status: "CLEAN", message: staticResult.message ?? "static validation passed" };
  if (av.status === "ERROR") {
    // Fail closed: an AV that cannot run must not be reported as a pass.
    return av;
  }
  return { ...av, message: av.message ?? staticResult.message };
}
