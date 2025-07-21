import { migrate } from "drizzle-orm/mysql2/migrator";
import { buildDrizzleDb } from "../../src/index";
import path from "path";
import { Config } from "../../src/config";

export async function runMigrations() {
  let config = Config().get();
  if (!config.mysqlConnectionString) {
    throw new Error(
      "MySQL connection string is not defined in the configuration."
    );
  }
  console.log(
    "Running migrations for auth service..." + config.mysqlConnectionString
  );
  const db = buildDrizzleDb();
  await migrate(db, {
    migrationsFolder: path.resolve(__dirname, "../../drizzle"),
  });

  console.log("Migrations completed successfully.");
}
