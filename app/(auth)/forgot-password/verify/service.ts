"use server";

import api from "@/lib/api";
import { setAuthTokens } from "@/lib/auth";
import { forgotPassword } from "../service";

export async function verifyResetOtp(email: string, otp: string) {
  try {
    const response = await api.post("auth/verify-reset-otp", { email, otp });
    if (response?.success && response?.data?.reset_token) {
      await setAuthTokens({ access_token: response.data.reset_token });
    }
    return response;
  } catch (err) {
    return err;
  }
}

export { forgotPassword as resendResetOtp };
