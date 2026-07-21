"use server";

import api from "@/lib/api";
import { setAuthTokens } from "@/lib/auth";
import { forgotPassword } from "../service";

export async function verifyResetOtp(email: string, otp: string) {
  try {
    const response = await api.post("auth/verify-reset-otp", { email, otp });
    if (response?.success && response?.data?.resetToken) {
      await setAuthTokens({ accessToken: response.data.resetToken });
    }
    return response;
  } catch (err) {
    return err;
  }
}

export { forgotPassword as resendResetOtp };
