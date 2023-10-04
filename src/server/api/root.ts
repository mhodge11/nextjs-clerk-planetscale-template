import { examplesRouter } from "@/server/api/routers";
import { createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
  examples: examplesRouter,
});

export type AppRouter = typeof appRouter;
