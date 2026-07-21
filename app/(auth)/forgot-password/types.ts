import { z } from "zod";

export const forgotPasswordPayload = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
});

export type ForgotPasswordPayload = z.infer<typeof forgotPasswordPayload>;
