import { z } from "zod";

export const examplesRouterSchema = {
  hello: {
    input: z.object({ text: z.string() }),
    output: z.object({ greeting: z.string() }),
  },
  getAll: {
    input: undefined,
    output: z.array(z.object({ id: z.number(), text: z.string() })),
  },
  getSecretMessage: {
    input: undefined,
    output: z.string(),
  },
};
