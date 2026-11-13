/**
 * CLI for the local PostgreSQL service.
 *
 *   npm run db:start      # start and keep running (Ctrl+C to stop)
 *   npm run db:create     # start briefly, ensure databases, print URL, stop
 */
import { startLocalPostgres } from "./local-postgres";

const command = process.argv[2] ?? "start";
const databases = ["vera", "vera_test"];

async function main() {
  if (command === "start") {
    const handle = await startLocalPostgres({ databases, persistent: true });
    console.log(`\nPostgreSQL ready at ${handle.connectionString("vera")}\n`);
    console.log("Press Ctrl+C to stop.\n");

    const shutdown = async () => {
      console.log("\nStopping PostgreSQL...");
      try {
        await handle.stop();
      } finally {
        process.exit(0);
      }
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    return; // keep process alive
  }

  if (command === "create") {
    const handle = await startLocalPostgres({ databases, persistent: true });
    console.log(handle.connectionString("vera"));
    await handle.stop();
    return;
  }

  console.error(`Unknown command: ${command}`);
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
