// Dynamic page (reads searchParams): @cloudflare/next-on-pages requires it to run on the edge.
export const runtime = "edge";

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MODIFICATION_KINDS, estimateRenovation } from "@/lib/costEstimator";
import { designFromSearchParams, isEmptyDesign } from "@/lib/design";
import { formatMoney, formatQuantity } from "@/lib/format";
import { SiteFooter } from "@/components/SiteFooter";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = { title: "Checkout — RenoEstimate" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Billing view. The simulated design arrives via URL search parameters, is re-validated here,
 * and is handed to the client checkout. An empty design has nothing to buy, so it bounces back.
 */
export default async function CheckoutPage({ searchParams }: { searchParams: SearchParams }) {
  const design = designFromSearchParams(await searchParams);
  if (isEmptyDesign(design)) redirect("/workspace");

  const estimate = estimateRenovation(
    MODIFICATION_KINDS.map((kind) => ({ kind, quantity: design.quantities[kind] })),
    design.region,
  );
  const { region, total, lines } = estimate;

  return (
    <main className="mx-auto min-h-dvh max-w-5xl px-5 py-8">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-sm font-medium tracking-tight text-zinc-100">
          Reno<span className="text-sky-300">Estimate</span>
        </Link>
        <Link
          href={`/workspace`}
          className="text-sm text-zinc-500 transition hover:text-zinc-300"
        >
          ← Back to workspace
        </Link>
      </header>

      <div className="mt-10 grid gap-8 md:grid-cols-[1fr_1.2fr]">
        <section className="glass h-fit rounded-3xl p-6">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-50">Your tender pack</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            A print-ready document with quantities and cost drivers, ready to send to local
            tradespeople for fixed-price quotes.
          </p>

          <div className="mt-6 rounded-2xl bg-white/5 p-4">
            <div className="text-[11px] uppercase tracking-wider text-zinc-500">
              Estimated range · {region.label}
            </div>
            <div className="mt-1 font-mono text-lg tabular-nums text-zinc-50">
              {formatMoney(total.min, region)} – {formatMoney(total.max, region)}
            </div>
          </div>

          <ul className="mt-5 space-y-2 text-sm">
            {lines.map((line) => (
              <li key={line.kind} className="flex justify-between gap-3">
                <span className="text-zinc-300">{line.label}</span>
                <span className="font-mono text-zinc-500">{formatQuantity(line.quantity, line.dimension, region)}</span>
              </li>
            ))}
          </ul>

          <Link
            href={`/workspace`}
            className="mt-6 inline-block text-xs text-sky-200/80 hover:text-sky-100"
          >
            Change the design
          </Link>
        </section>

        <section className="glass rounded-3xl p-4 sm:p-6" aria-label="Payment">
          {/* `design` is already sanitised, so the client only ever sees valid values. */}
          <CheckoutClient design={design} />
        </section>
      </div>
      <SiteFooter className="px-0" />
    </main>
  );
}
