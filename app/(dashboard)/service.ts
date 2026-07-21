"use server";

import api from "@/lib/api";
import { clearAuthTokens, getRefreshToken } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function getMe() {
  try {
    return await api.get("auth/me");
  } catch (error) {
    return error;
  }
}

export async function logOut() {
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    try {
      await api.post("auth/logout", { refreshToken });
    } catch {
      // proceed with local logout even if server call fails
    }
  }
  await clearAuthTokens();
  redirect("/sign-in");
}
