import "server-only";
import { designFingerprint, type Design } from "./design";

/**
 * Server-only Paddle helpers. Edge-compatible: Web APIs only (fetch, crypto.subtle), no node:* imports.
 * Never import from a client component:
 * `server-only` makes the build fail if that happens, keeping PADDLE_API_KEY out of the bundle.
 */

export type PaymentCheck =
  | { ok: true }
  | { ok: false; status: 400 | 402 | 502 | 503; reason: string };

const TRANSACTION_ID = /^txn_[a-z0-9]{20,40}$/;
/** Paddle statuses that mean the customer has paid. */
const PAID_STATUSES: ReadonlySet<string> = new Set(["paid", "completed"]);

const apiBase = (): string =>
  process.env.NEXT_PUBLIC_PADDLE_ENV === "production"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";

/**
 * Confirms with Paddle's API that `transactionId` is paid AND was created for exactly this design.
 * Fails closed: any missing config, network error or mismatch denies access.
 */
export async function verifyPaidTransaction(transactionId: unknown, design: Design): Promise<PaymentCheck> {
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) return { ok: false, status: 503, reason: "Payments are not configured" };
  if (typeof transactionId !== "string" || !TRANSACTION_ID.test(transactionId)) {
    return { ok: false, status: 400, reason: "Invalid transaction id" };
  }

  let res: Response;
  try {
    res = await fetch(`${apiBase()}/transactions/${transactionId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
  } catch {
    return { ok: false, status: 502, reason: "Could not reach payment provider" };
  }
  if (res.status === 404) return { ok: false, status: 402, reason: "Transaction not found" };
  if (!res.ok) return { ok: false, status: 502, reason: "Payment provider error" };

  const { data } = (await res.json()) as {
    data?: { status?: string; custom_data?: { design?: unknown } | null };
  };
  if (!data?.status || !PAID_STATUSES.has(data.status)) {
    return { ok: false, status: 402, reason: "Payment not completed" };
  }
  if (data.custom_data?.design !== designFingerprint(design)) {
    return { ok: false, status: 402, reason: "Payment does not match this design" };
  }
  return { ok: true };
}

/**
 * Verifies a Paddle webhook signature: header `Paddle-Signature: ts=<unix>;h1=<hmac>`,
 * where h1 = HMAC-SHA256(secret, `${ts}:${rawBody}`). Rejects timestamps older than 5 minutes.
 */
export async function verifyWebhookSignature(
  rawBody: string,
  header: string | null,
  secret: string,
): Promise<boolean> {
  if (!header) return false;
  const parts = new Map(header.split(";").map((p) => p.split("=", 2) as [string, string]));
  const ts = parts.get("ts");
  const h1 = parts.get("h1");
  if (!ts || !h1 || !/^[0-9a-f]+$/i.test(h1) || h1.length % 2 !== 0) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;

  const signature = Uint8Array.from(h1.match(/../g) ?? [], (byte) => parseInt(byte, 16));
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  // subtle.verify compares in constant time.
  return crypto.subtle.verify("HMAC", key, signature, enc.encode(`${ts}:${rawBody}`));
}
