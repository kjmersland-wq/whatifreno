"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { initializePaddle, type Environments } from "@paddle/paddle-js";
import { designFingerprint, type Design } from "@/lib/design";

const FRAME_CLASS = "paddle-checkout-frame";

type Phase = "loading" | "ready" | "paid" | "misconfigured";

/**
 * Paddle.js inline checkout, dark-themed. On `checkout.completed` the transaction id is kept
 * in memory and used to request the export; the server independently re-verifies it with Paddle.
 */
export function CheckoutClient({ design }: { design: Design }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    const priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID;
    const environment: Environments =
      process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox";

    if (!token || !priceId) {
      setPhase("misconfigured");
      return;
    }
    // Strict Mode runs effects twice in dev; open the inline frame only once.
    if (started.current) return;
    started.current = true;

    initializePaddle({
      environment,
      token,
      eventCallback: (event) => {
        if (event.name === "checkout.completed" && event.data?.transaction_id) {
          setTransactionId(event.data.transaction_id);
          setPhase("paid");
        }
      },
    })
      .then((paddle) => {
        if (!paddle) {
          setPhase("misconfigured");
          return;
        }
        paddle.Checkout.open({
          items: [{ priceId, quantity: 1 }],
          // Binds the payment to this exact design; the export route checks it.
          customData: { design: designFingerprint(design) },
          settings: {
            displayMode: "inline",
            theme: "dark",
            frameTarget: FRAME_CLASS,
            frameInitialHeight: 480,
            frameStyle: "width: 100%; min-width: 312px; background-color: transparent; border: none;",
          },
        });
        setPhase("ready");
      })
      .catch(() => setPhase("misconfigured"));
  }, [design]);

  const download = useCallback(async () => {
    if (!transactionId) return;
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, region: design.region, quantities: design.quantities }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Could not generate the document. Please try again.");
        return;
      }
      const filename = /filename="([^"]+)"/.exec(res.headers.get("content-disposition") ?? "")?.[1];
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = filename ?? "RenoEstimate_tender-pack.html";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }, [transactionId, design]);

  if (phase === "misconfigured") {
    return (
      <p className="p-4 text-sm leading-relaxed text-zinc-400">
        Payments aren&apos;t available right now. Nothing has been charged. Please try again later.
      </p>
    );
  }

  return (
    <div>
      {phase !== "paid" && (
        <>
          {phase === "loading" && <p className="p-4 text-sm text-zinc-500">Preparing secure checkout…</p>}
          <div className={FRAME_CLASS} />
        </>
      )}

      {phase === "paid" && (
        <div className="p-4 text-center">
          <h2 className="text-lg font-semibold text-zinc-50">Thank you. Your tender pack is ready.</h2>
          <p className="mt-2 text-sm text-zinc-400">Download it before leaving this page. A receipt has been sent to your email.</p>
          <button
            type="button"
            onClick={download}
            disabled={downloading}
            className="mt-6 rounded-full bg-sky-200 px-6 py-3 text-sm font-medium text-zinc-950 transition hover:bg-sky-100 disabled:opacity-60"
          >
            {downloading ? "Preparing…" : "Download tender pack"}
          </button>
          {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
        </div>
      )}
    </div>
  );
}
