"use server";

import api from "@/lib/api";
import { clearAuthTokens } from "@/lib/auth";
import { redirect } from "next/navigation";

// GET /auth/me (Bearer) → { data: UserEntity }
export async function getMe() {
  try {
    return await api.get("auth/me");
  } catch (error) {
    return error;
  }
}

// The auth contract has no server-side logout/revocation endpoint, so logout is
// a local token clear. (Revisit if the backend adds refresh-token revocation.)
export async function logOut() {
  await clearAuthTokens();
  redirect("/sign-in");
}
