import Link from "next/link";

const LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: "/terms", label: "Vilkår for bruk" },
  { href: "/privacy", label: "Personvernerklæring" },
  { href: "/refunds", label: "Refusjonsregler" },
];

/** Subtle footer with the compliance links. Used on every public page except the full-screen workspace. */
export function SiteFooter({ className = "" }: { className?: string }) {
  return (
    <footer className={`mx-auto max-w-6xl px-5 pb-10 pt-6 ${className}`}>
      <div className="flex flex-col gap-4 border-t border-white/5 pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl leading-relaxed text-zinc-600">
          Estimates are indicative ranges for early planning, not quotes. Always confirm with a
          qualified contractor and, for structural work, a structural engineer.
        </p>
        <nav aria-label="Juridisk" className="flex flex-wrap gap-x-5 gap-y-2">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-zinc-300">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
