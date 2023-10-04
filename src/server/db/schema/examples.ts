import { mysqlTable } from "@/server/db/mysqlTable";
import { sql } from "drizzle-orm";
import { timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
import { type Id } from "resource-id";

export const examples = mysqlTable(
  "examples",
  {
    id: varchar("id", { length: 80 }).notNull().primaryKey().$type<Id<"exp">>(),
    name: varchar("name", { length: 256 }),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (exp) => ({
    nameIndex: uniqueIndex("name_idx").on(exp.name),
  }),
);
