import { z } from "zod";

export const resetPasswordPayload = z.object({
  new_password: z.string().min(6, "Password must be at least 6 characters"),
});

export type ResetPasswordPayload = z.infer<typeof resetPasswordPayload>;
