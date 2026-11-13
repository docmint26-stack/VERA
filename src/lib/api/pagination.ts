import { z } from "zod";

/** Cursor pagination helpers — bounded, stable, no OFFSET scans. */

export const paginationQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().max(512).optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuery>;

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
  total?: number;
}

interface CursorPayload {
  /** Sort field value of the last item. */
  v: string | number;
  /** Tie-breaking id of the last item. */
  id: string;
}

export function encodeCursor(value: string | number, id: string): string {
  const payload: CursorPayload = { v: value, id };
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeCursor(cursor: string): CursorPayload | null {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as CursorPayload;
    if (parsed && typeof parsed.v !== "undefined" && typeof parsed.id === "string") return parsed;
    return null;
  } catch {
    return null;
  }
}

type SortDirection = "asc" | "desc";

/**
 * Build the Prisma `where` fragment that continues after a cursor for a
 * two-column keyset (sortField, id).
 */
export function cursorWhere(
  sortField: string,
  cursor: string | undefined,
  direction: SortDirection,
): Record<string, unknown> | undefined {
  if (!cursor) return undefined;
  const payload = decodeCursor(cursor);
  if (!payload) return undefined;
  const comparison = direction === "desc" ? "lt" : "gt";
  return {
    OR: [
      { [sortField]: { [comparison]: payload.v } },
      { [sortField]: payload.v, id: { [comparison]: payload.id } },
    ],
  };
}

export function orderByWithCursor(
  sortField: string,
  direction: SortDirection,
): Array<Record<string, "asc" | "desc">> {
  return [{ [sortField]: direction }, { id: direction }];
}

/**
 * Resolve a page of items plus the cursor for the next page.
 * `sortValue` extracts the keyset value from each item.
 */
export function toPage<T extends { id: string }>(
  rows: T[],
  limit: number,
  sortValue: (row: T) => string | number,
): Page<T> {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const last = items[items.length - 1];
  return {
    items,
    nextCursor: hasMore && last ? encodeCursor(sortValue(last), last.id) : null,
  };
}

export const sortDirection = z.enum(["asc", "desc"]).default("desc");
