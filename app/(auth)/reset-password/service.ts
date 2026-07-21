"use server";

import api from "@/lib/api";
import { clearAuthTokens } from "@/lib/auth";

export async function resetPassword(new_password: string) {
  try {
    const response = await api.post("auth/reset-password", { new_password });
    if (response?.success) {
      await clearAuthTokens();
    }
    return response;
  } catch (err) {
    return err;
  }
}
