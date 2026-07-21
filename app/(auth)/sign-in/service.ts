"use server";

import api from "@/lib/api";
import { setAuthTokens } from "@/lib/auth";
import { SignInPayload } from "./types";

export async function SignIn(payload: SignInPayload) {
  try {
    const response = await api.post("auth/login", payload);
    if (response.success && response.data?.accessToken) {
      await setAuthTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      });
    }
    return response;
  } catch (error) {
    return error;
  }
}
