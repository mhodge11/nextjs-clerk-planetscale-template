import { env } from "@/env.mjs";
import { type Config } from "drizzle-kit";

export default {
  schema: "./src/server/db/schema.ts",
  driver: "mysql2",
  dbCredentials: {
    connectionString: env.DATABASE_URL,
  },
  tablesFilter: [`${env.DATABASE_TABLE_PREFIX}*`],
} satisfies Config;
