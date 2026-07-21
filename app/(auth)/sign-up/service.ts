"use server";

import api from "@/lib/api";
import { setAuthTokens } from "@/lib/auth";
import type { SignUpPayload } from "./types";

// POST /auth/register { email, password, name } → { user, accessToken, refreshToken }.
// The backend logs the account in on registration, so we persist the tokens and
// the caller can go straight into the app. isTermsAgreed stays client-side.
export async function signUp(payload: SignUpPayload) {
  try {
    const response = await api.post("auth/register", {
      name: payload.name,
      email: payload.email,
      password: payload.password,
    });
    if (response.success && response.data?.accessToken) {
      await setAuthTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      });
    }
    return response;
  } catch (err) {
    return err;
  }
}
