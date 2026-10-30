import Link from "next/link";
import type { ReactNode } from "react";
import { LEGAL } from "@/lib/legal";
import { SiteFooter } from "@/components/SiteFooter";

export interface LegalSection {
  readonly heading: string;
  /** Paragraphs (strings or rich nodes). */
  readonly body: readonly ReactNode[];
  /** Optional bullet list after the paragraphs. */
  readonly list?: readonly ReactNode[];
}

interface LegalPageProps {
  title: string;
  intro: string;
  sections: readonly LegalSection[];
}

/** Shared dark-zinc layout for the compliance documents. Static: no runtime or data needs. */
export function LegalPage({ title, intro, sections }: LegalPageProps) {
  return (
    <main>
      <div className="mx-auto max-w-3xl px-5 pt-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-sm font-medium tracking-tight text-zinc-100">
            Reno<span className="text-sky-300">Estimate</span>
          </Link>
          <Link href="/workspace" className="text-sm text-zinc-500 transition hover:text-zinc-300">
            Åpne arbeidsområdet
          </Link>
        </header>

        <article className="py-14">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-sky-300/80">
            Sist oppdatert {LEGAL.updated}
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">{title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-400">{intro}</p>

          <div className="mt-12 space-y-10">
            {sections.map((s, i) => (
              <section key={s.heading}>
                <h2 className="text-lg font-semibold text-zinc-100">
                  <span className="mr-3 font-mono text-sm text-zinc-600">{String(i + 1).padStart(2, "0")}</span>
                  {s.heading}
                </h2>
                <div className="mt-3 space-y-3 leading-relaxed text-zinc-400">
                  {s.body.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                  {s.list && (
                    <ul className="list-disc space-y-1.5 pl-5 marker:text-zinc-600">
                      {s.list.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}
          </div>
        </article>
      </div>
      <SiteFooter />
    </main>
  );
}

/** Mail link that degrades to plain text while the placeholder address is still in place. */
export function ContactEmail() {
  const email = LEGAL.contactEmail;
  return email.includes("@") ? (
    <a href={`mailto:${email}`} className="text-sky-200 underline-offset-4 hover:underline">
      {email}
    </a>
  ) : (
    <span>{email}</span>
  );
}
