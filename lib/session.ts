/**
 * Staging-wall session handling. Edge-compatible: Web Crypto only, no Node APIs.
 *
 * - Credentials are checked against a hardcoded, salted SHA-256 digest of
 *   "whatifreno|<email lower-cased>|<password>". The password itself is not stored in source.
 * - A successful login sets an HTTP-only cookie holding "<expiry>.<hmac>", signed with
 *   AUTH_SECRET. It carries no personal data; forging it requires the secret.
 * - Fails closed: with no AUTH_SECRET in production nobody can log in and every request is walled.
 */

export const SESSION_COOKIE = "whatifreno_auth";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const CREDENTIAL_DIGEST = "28fbf307e860c7980083a9f9edecda113ce7f1421ae00fe7d2dd9eef95f5bc98";

const encoder = new TextEncoder();

const toHex = (bytes: ArrayBuffer): string =>
  Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");

/** Constant-time string comparison (length is not secret here). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** AUTH_SECRET, with a fixed value only outside production so local dev works without setup. */
function authSecret(): string | undefined {
  return process.env.AUTH_SECRET ?? (process.env.NODE_ENV === "production" ? undefined : "dev-only-insecure-secret");
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

/** True when the submitted email and password match the authorised account. */
export async function credentialsValid(email: string, password: string): Promise<boolean> {
  const digest = toHex(
    await crypto.subtle.digest("SHA-256", encoder.encode(`whatifreno|${email.trim().toLowerCase()}|${password}`)),
  );
  return safeEqual(digest, CREDENTIAL_DIGEST);
}

/** New signed session token, or null when the server has no signing secret. */
export async function createSessionToken(): Promise<string | null> {
  const secret = authSecret();
  if (!secret) return null;
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  return `${expires}.${await sign(`v1.${expires}`, secret)}`;
}

/** Validates signature and expiry of a session cookie value. */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  const secret = authSecret();
  if (!secret || !token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || !/^\d+$/.test(expires)) return false;
  if (Number(expires) < Date.now() / 1000) return false;
  return safeEqual(signature, await sign(`v1.${expires}`, secret));
}

/** Only same-site relative paths are valid post-login destinations (no open redirects). */
export function safeNextPath(next: string | null | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/gatekeeper") ? next : "/";
}
