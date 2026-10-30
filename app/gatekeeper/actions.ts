"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
  credentialsValid,
  safeNextPath,
} from "@/lib/session";

export interface LoginState {
  readonly error: string | null;
}

/** Validates the staging credentials and starts a session. Always answers slowly on failure. */
export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? ""));

  const valid = await credentialsValid(email, password);
  const token = valid ? await createSessionToken() : null;

  if (!valid) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { error: "Wrong email or password." };
  }
  if (!token) {
    return { error: "The server is missing its AUTH_SECRET. Sign-in is disabled." };
  }

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  redirect(next);
}
