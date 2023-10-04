/* eslint-disable @typescript-eslint/no-explicit-any */

import * as schema from "@/server/db/schema";
import { type MySqlTableWithColumns } from "drizzle-orm/mysql-core";
import { generate } from "resource-id";

type Schema = typeof schema;
type Tables<T> = T extends MySqlTableWithColumns<infer C>
  ? MySqlTableWithColumns<{
      name: C["name"];
      schema: any;
      columns: any;
      dialect: any;
    }>
  : never;

function isTable<Name extends string>(
  x: MySqlTableWithColumns<any>,
  y: MySqlTableWithColumns<{
    name: Name;
    schema: any;
    columns: any;
    dialect: any;
  }>,
): x is typeof y {
  return x === y;
}

export function newId(table: Tables<Schema[keyof Schema]>): string {
  if (isTable(table, schema.examples)) {
    return generate("exp");
  } else {
    assertUnreachable(table);
  }
}

function assertUnreachable(x: never): never {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`Table ${x} does not have a case statement in newId()!`);
}
