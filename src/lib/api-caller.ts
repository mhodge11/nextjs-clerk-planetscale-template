import { appRouter } from "@/server/api/root";
import { db } from "@/server/db";
import * as schema from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";

export function apiCaller() {
  return appRouter.createCaller({
    auth: auth(),
    db,
    schema,
  });
}
