"use server";

import api from "@/lib/api";

export async function forgotPassword(email: string) {
  try {
    return await api.post("auth/forgot-password", { email });
  } catch (err) {
    return err;
  }
}
