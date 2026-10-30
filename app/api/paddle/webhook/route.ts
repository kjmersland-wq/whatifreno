export const runtime = "edge";

import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paddleServer";

/**
 * POST /api/paddle/webhook — receives Paddle events.
 * Access to exports is decided live against Paddle's API (see lib/paddleServer.ts), so this
 * endpoint currently only authenticates and acknowledges events. Persist them here
 * (e.g. for receipts or refunds) once a database exists.
 */
export async function POST(request: Request) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });

  const rawBody = await request.text();
  if (!(await verifyWebhookSignature(rawBody, request.headers.get("paddle-signature"), secret))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  return NextResponse.json({ received: true });
}
