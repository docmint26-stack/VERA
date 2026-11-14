import { describe, expect, it } from "vitest";
import { jsonSafe } from "@/lib/api/route";

describe("API serialization", () => {
  it("serializes BigInt, dates, and nested values", () => {
    expect(jsonSafe({ count: BigInt(2), at: new Date("2026-01-02T03:04:05.000Z"), nested: [BigInt(1)] })).toEqual({
      count: "2", at: "2026-01-02T03:04:05.000Z", nested: ["1"],
    });
  });
});
