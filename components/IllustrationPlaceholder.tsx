interface IllustrationPlaceholderProps {
  /** Stable id for the art team, e.g. "hero-floorplan". Exposed as data-slot. */
  slot: string;
  /** Short brief shown inside the frame describing what art belongs here. */
  brief: string;
  className?: string;
}

/**
 * Clearly marked drop-in slot for a professional SVG illustration.
 * Replace the component usage with an <Image> or inline <svg> once art is delivered.
 */
export function IllustrationPlaceholder({ slot, brief, className = "" }: IllustrationPlaceholderProps) {
  return (
    <figure
      data-slot={slot}
      className={`glass relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl ${className}`}
    >
      <div className="blueprint-grid absolute inset-0" aria-hidden />
      <svg viewBox="0 0 320 240" className="absolute inset-0 h-full w-full text-sky-200/30" aria-hidden>
        <g fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="60" y="50" width="200" height="140" rx="2" />
          <path d="M160 50v140M60 120h100" strokeDasharray="4 4" />
          <path d="M110 50v-10M210 50v-10M60 190v12M260 190v12" />
          <circle cx="110" cy="120" r="14" strokeDasharray="2 3" />
        </g>
      </svg>
      <figcaption className="relative max-w-[16rem] px-4 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-sky-200/70">
          Illustration slot · {slot}
        </span>
        <span className="mt-2 block text-sm text-zinc-400">{brief}</span>
      </figcaption>
    </figure>
  );
}
