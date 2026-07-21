import { z } from "zod";

export const signInPayload = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string(),
});

export type SignInPayload = z.infer<typeof signInPayload>;
