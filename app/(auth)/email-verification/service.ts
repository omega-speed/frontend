"use server";

import api from "@/lib/api";

export async function verifyOtp(email: string, otp: string) {
  try {
    return await api.post("auth/verify-otp", { email, otp });
  } catch (err) {
    return err;
  }
}

export async function resendOtp(email: string) {
  try {
    return await api.post("auth/resend-otp", { email });
  } catch (err) {
    return err;
  }
}
