import { z } from "zod";

export const verifyOtpPayload = z.object({
  otp: z.string().length(6, "Enter all 6 digits"),
});

export type VerifyOtpPayload = z.infer<typeof verifyOtpPayload>;
