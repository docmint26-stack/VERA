/**
 * Local PostgreSQL management for VERA development and integration tests.
 *
 * Uses `embedded-postgres` (official PostgreSQL binaries, no Docker required)
 * so the whole stack can run on a bare machine. Docker users can instead run
 * `docker compose up postgres` — both expose the same DATABASE_URL shape.
 */
import EmbeddedPostgres from "embedded-postgres";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export interface LocalPostgresOptions {
  /** Cluster directory. Defaults to `.local/pgdata`. */
  dir?: string;
  /** TCP port. Defaults to 5432. */
  port?: number;
  /** Databases to guarantee exist after start. */
  databases?: string[];
  user?: string;
  password?: string;
  /** Keep data on stop (dev) or wipe (tests). Defaults to true (keep). */
  persistent?: boolean;
  quiet?: boolean;
}

export interface LocalPostgresHandle {
  port: number;
  user: string;
  password: string;
  connectionString(database?: string): string;
  createDatabase(name: string): Promise<void>;
  stop(): Promise<void>;
}

function resolveOptions(options: LocalPostgresOptions) {
  const port = options.port ?? Number(process.env.PGPORT ?? 5432);
  const user = options.user ?? process.env.PGUSER ?? "postgres";
  const password = options.password ?? process.env.PGPASSWORD ?? "postgres";
  const dir = options.dir ?? path.join(root, ".local", "pgdata");
  return { port, user, password, dir };
}

export async function startLocalPostgres(
  options: LocalPostgresOptions = {},
): Promise<LocalPostgresHandle> {
  const { port, user, password, dir } = resolveOptions(options);
  const databases = options.databases ?? [];
  const quiet = options.quiet ?? false;

  mkdirSync(dir, { recursive: true });

  const pg = new EmbeddedPostgres({
    databaseDir: dir,
    user,
    password,
    port,
    persistent: options.persistent ?? true,
    authMethod: "password",
    autoRehydrateSymlinks: true,
    onLog: quiet ? () => {} : (message) => console.log(`[pg] ${message}`),
    onError: quiet ? () => {} : (message) => console.error(`[pg] ${message}`),
  });

  const initialised = existsSync(path.join(dir, "PG_VERSION"));
  if (!initialised) {
    await pg.initialise();
  }
  await pg.start();

  const connectionString = (database = "postgres") =>
    `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@127.0.0.1:${port}/${database}?schema=public`;

  for (const database of databases) {
    await ensureDatabase(pg, database, quiet);
  }

  return {
    port,
    user,
    password,
    connectionString,
    createDatabase: (name: string) => ensureDatabase(pg, name, quiet),
    stop: () => pg.stop(),
  };
}

async function ensureDatabase(
  pg: InstanceType<typeof EmbeddedPostgres>,
  database: string,
  quiet: boolean,
): Promise<void> {
  const client = pg.getPgClient();
  await client.connect();
  try {
    const result = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [
      database,
    ]);
    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE "${database.replace(/"/g, '""')}"`);
      if (!quiet) console.log(`[pg] created database ${database}`);
    }
  } finally {
    await client.end();
  }
}

export function defaultConnectionString(database = "vera"): string {
  const { port, user, password } = resolveOptions({});
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@127.0.0.1:${port}/${database}?schema=public`;
}
