"use server";

import api from "@/lib/api";

export async function checkUsernameAvailability(
  username: string,
): Promise<boolean | null> {
  try {
    const res = await api.get(
      `auth/check-username?username=${encodeURIComponent(username)}`,
    );
    return res?.data?.available ?? null;
  } catch {
    return null;
  }
}

export async function signUp(payload: {
  name: string;
  username: string;
  email: string;
  password: string;
  isTermsAgreed: boolean;
}) {
  try {
    return await api.post("auth/signup", payload);
  } catch (err) {
    return err;
  }
}
