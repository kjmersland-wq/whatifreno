export const runtime = "edge";

import type { Metadata } from "next";
import { safeNextPath } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Gatekeeper — RenoEstimate",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Staging wall sign-in. Middleware sends every unauthenticated visitor here. */
export default async function GatekeeperPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = (await searchParams).next;
  const next = safeNextPath(Array.isArray(raw) ? raw[0] : raw);

  return (
    <main className="relative grid min-h-dvh place-items-center px-5">
      <div className="blueprint-grid pointer-events-none absolute inset-0" aria-hidden />
      <section className="glass relative w-full max-w-sm rounded-3xl p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-sky-300/80">
          Private staging
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50">
          Reno<span className="text-sky-300">Estimate</span>
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          This site is under construction. Sign in to continue.
        </p>
        <LoginForm next={next} />
      </section>
    </main>
  );
}
