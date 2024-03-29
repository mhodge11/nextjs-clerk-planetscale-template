import { env } from "@/env.mjs";
import * as schema from "@/server/db/schema";
import { Client } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

export const db = drizzle(
  new Client({
    url: env.DATABASE_URL,
  }).connection(),
  { schema },
);
