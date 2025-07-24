import { migrate } from "drizzle-orm/mysql2/migrator";
import { buildDrizzleDb } from "../../src/index";
import path from "path";
import { Config } from "../../src/config";

export async function runMigrations() {
  const config = Config().get();
  if (!config.mysqlConnectionString) {
    throw new Error(
      "MySQL connection string is not defined in the configuration."
    );
  }
  const db = buildDrizzleDb();
  await migrate(db, {
    migrationsFolder: path.resolve(__dirname, "../../drizzle"),
  });
}
