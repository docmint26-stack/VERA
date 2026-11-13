import { connection } from "next/server";

/**
 * Liveness probe — no dependency on database or external services.
 * Never exposes environment information.
 */
export async function GET(): Promise<Response> {
  await connection(); // never prerendered at build time
  return Response.json(
    {
      status: "ok",
      service: "vera-api",
      time: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
