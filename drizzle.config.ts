import { defineConfig } from "drizzle-kit";
import { Config } from "./src/config";

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    url: Config().get().mysqlConnectionString,
  }
});