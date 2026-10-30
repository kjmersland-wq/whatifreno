import Link from "next/link";
import { IllustrationPlaceholder } from "@/components/IllustrationPlaceholder";

/**
 * Landing page. Tone: curious, unhurried, collaborative. We ask; we never pitch.
 * Each question invites the visitor to find their own gap between dream and budget.
 */

const QUESTIONS: ReadonlyArray<{ lead: string; body: string }> = [
  {
    lead: "Hva om…",
    body: "that wall between the kitchen and living room simply wasn't there? What would your evenings feel like?",
  },
  {
    lead: "Hva om…",
    body: "the morning light had one more window to come through? What would you notice first?",
  },
  {
    lead: "Hva om…",
    body: "the garage you keep imagining cost less than you fear, or more than you hoped? Wouldn't you rather know?",
  },
];

const STEPS: ReadonlyArray<{ n: string; title: string; body: string }> = [
  {
    n: "01",
    title: "Wander through your plan",
    body: "Move around a calm 3D model of your home. Nothing is committed. You're only looking.",
  },
  {
    n: "02",
    title: "Try an idea on",
    body: "Take out a wall. Add a window. Place a garage. The budget range moves with you, in real time.",
  },
  {
    n: "03",
    title: "Notice what it tells you",
    body: "See where the numbers surprise you, and decide for yourself what matters most.",
  },
];

export default function LandingPage() {
  return (
    <main className="relative overflow-x-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <span className="text-sm font-medium tracking-tight text-zinc-100">
          Reno<span className="text-sky-300">Estimate</span>
        </span>
        <Link
          href="/workspace"
          className="glass rounded-full px-4 py-2 text-sm text-zinc-200 transition hover:text-white"
        >
          Open the workspace
        </Link>
      </header>

      {/* Hero */}
      <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-24 pt-12 md:grid-cols-2 md:pt-20">
        <div className="blueprint-grid pointer-events-none absolute inset-0 -z-10" aria-hidden />
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-sky-300/80">
            A quieter way to plan a renovation
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">
            What would you change about your home, <span className="text-zinc-400">if you could?</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
            There is no right answer, and no one to impress. Explore your space, try a few ideas, and
            watch an honest budget range appear beside them. You stay in charge of every decision.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/workspace"
              className="rounded-full bg-sky-200 px-6 py-3 text-sm font-medium text-zinc-950 transition hover:bg-sky-100"
            >
              Start exploring
            </Link>
            <span className="text-sm text-zinc-500">Free. No sign-up. Nothing to decide today.</span>
          </div>
        </div>
        <IllustrationPlaceholder
          slot="hero-floorplan"
          brief="Isometric line illustration of a home opening up: one wall dissolving into light."
        />
      </section>

      {/* Reflective questions */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
          Some questions worth sitting with
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {QUESTIONS.map((q) => (
            <article key={q.body} className="glass rounded-3xl p-7">
              <p className="text-2xl font-semibold text-sky-200">{q.lead}</p>
              <p className="mt-3 leading-relaxed text-zinc-400">{q.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="grid items-center gap-12 md:grid-cols-[1fr_1.1fr]">
          <IllustrationPlaceholder
            slot="how-it-works"
            brief="Three-frame sequence: walking the plan, trying an idea, reading the range."
            className="order-2 md:order-1"
          />
          <div className="order-1 md:order-2">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
              Curiosity first. Numbers second.
            </h2>
            <ol className="mt-8 space-y-7">
              {STEPS.map((s) => (
                <li key={s.n} className="flex gap-5">
                  <span className="font-mono text-sm text-sky-300/80">{s.n}</span>
                  <div>
                    <h3 className="font-medium text-zinc-100">{s.title}</h3>
                    <p className="mt-1 leading-relaxed text-zinc-400">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="mx-auto max-w-4xl px-5 pb-28">
        <div className="glass rounded-[2rem] px-8 py-14 text-center sm:px-14">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-50">
            Where does your budget end, and your imagination begin?
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-zinc-400">
            Take your time. The only thing you&apos;ll leave with is a clearer picture of what you
            actually want.
          </p>
          <Link
            href="/workspace"
            className="mt-8 inline-block rounded-full bg-sky-200 px-6 py-3 text-sm font-medium text-zinc-950 transition hover:bg-sky-100"
          >
            Take a first look
          </Link>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 pb-10 text-xs leading-relaxed text-zinc-600">
        Estimates are indicative ranges for early planning, not quotes. Always confirm with a
        qualified contractor and, for structural work, a structural engineer.
      </footer>
    </main>
  );
}
