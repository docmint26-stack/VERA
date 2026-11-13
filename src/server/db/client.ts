import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { getEnv } from "@/lib/config/env";

/**
 * Prisma 7 client (driver adapter: @prisma/adapter-pg).
 * One client per process; survives dev-server hot reloads via globalThis.
 */

const globalForPrisma = globalThis as unknown as { __veraPrisma?: PrismaClient };

function createClient(): PrismaClient {
  const { DATABASE_URL } = getEnv();
  const adapter = new PrismaPg({ connectionString: DATABASE_URL, max: 10 });
  return new PrismaClient({ adapter });
}

export function getDb(): PrismaClient {
  if (!globalForPrisma.__veraPrisma) {
    globalForPrisma.__veraPrisma = createClient();
  }
  return globalForPrisma.__veraPrisma;
}

/** Close the shared client (used by tests and worker shutdown). */
export async function closeDb(): Promise<void> {
  const client = globalForPrisma.__veraPrisma;
  if (client) {
    delete globalForPrisma.__veraPrisma;
    await client.$disconnect();
  }
}
