import { z } from "zod";

export const verifyResetOtpPayload = z.object({
  otp: z.string().length(6, "Enter all 6 digits"),
});

export type VerifyResetOtpPayload = z.infer<typeof verifyResetOtpPayload>;
