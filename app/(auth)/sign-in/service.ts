"use server";

import api from "@/lib/api";
import { setAuthTokens } from "@/lib/auth";
import { SignInPayload } from "./types";

export async function SignIn(payload: SignInPayload) {
  try {
    const response = await api.post("auth/signin", payload);
    if (response.success && response.data?.access_token) {
      await setAuthTokens({
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
      });
    }
    return response;
  } catch (error) {
    return error;
  }
}
