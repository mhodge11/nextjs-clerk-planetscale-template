import { db } from "@/server/db";
import * as schema from "@/server/db/schema";
import { clerkClient } from "@clerk/nextjs";
import { type RequestLike } from "@clerk/nextjs/dist/types/server/types";
import {
  getAuth,
  type SignedInAuthObject,
  type SignedOutAuthObject,
} from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { ZodError } from "zod";

interface AuthContext {
  auth: SignedInAuthObject | SignedOutAuthObject;
}

type CreateContextOptions = AuthContext;

const createInnerTRPCContext = ({ auth }: CreateContextOptions) => {
  return {
    db,
    schema,
    auth,
  };
};

export const createTRPCContext = (opts: FetchCreateContextFnOptions) => {
  return createInnerTRPCContext({
    auth: getAuth(opts.req as RequestLike),
  });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

type AugmentedAuth = AuthContext["auth"] & {
  user: ReturnType<typeof clerkClient.users.getUser>;
  admin: boolean;
  orgId: string;
  orgRole: "owner" | "member";
};

const augmentAuth = async (auth: AuthContext["auth"]) => {
  const user = auth.userId
    ? await clerkClient.users.getUser(auth.userId)
    : null;

  const admin = !!user?.publicMetadata?.admin;
  const orgId = user?.publicMetadata?.orgId as string | undefined;
  const orgRole = user?.publicMetadata?.orgRole as "owner" | "member";

  return {
    ...auth,
    user,
    admin,
    orgId,
    orgRole,
  } as AugmentedAuth;
};

// check if the user is signed in, otherwise through a UNAUTHORIZED CODE
const isAuthed = t.middleware(async ({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const auth = await augmentAuth(ctx.auth);

  return next({
    ctx: {
      auth,
    },
  });
});

const isOrged = t.middleware(async ({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const auth = await augmentAuth(ctx.auth);
  const { admin, orgId } = auth;

  if (orgId ?? admin) {
    return next({
      ctx: {
        auth: auth,
      },
    });
  }

  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: "No organization id",
  });
});

const isAdmin = t.middleware(async ({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const auth = await augmentAuth(ctx.auth);
  const { admin } = auth;

  if (admin) {
    return next({
      ctx: {
        auth: auth,
      },
    });
  }

  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: "User is not and admin",
  });
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const organizationProcedure = t.procedure.use(isOrged);
export const adminProcedure = t.procedure.use(isAdmin);
