interface HeroBlueprintProps {
  className?: string;
}

/**
 * Hand-coded blueprint of a home with one load-bearing wall under simulation.
 * Pure SVG, server-rendered. Colour comes only from Tailwind tokens (zinc for drafting
 * lines, `text-sky-300` → currentColor for the neon accent), so it follows the theme.
 * `vector-effect: non-scaling-stroke` keeps every hairline 1–2px crisp at any width.
 */
export function HeroBlueprint({ className = "" }: HeroBlueprintProps) {
  return (
    <figure
      data-slot="hero-floorplan"
      className={`glass relative overflow-hidden rounded-3xl p-2 sm:p-4 ${className}`}
    >
      <svg
        viewBox="0 0 640 480"
        role="img"
        aria-label="Architectural floor plan with one load-bearing wall highlighted as a simulated change"
        className="block h-auto w-full text-sky-300 [&_*]:[vector-effect:non-scaling-stroke]"
      >
        <defs>
          <pattern id="bp-minor" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M16 0H0V16" className="fill-none stroke-zinc-800" strokeWidth="1" />
          </pattern>
          <pattern id="bp-major" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M80 0H0V80" className="fill-none stroke-zinc-700/70" strokeWidth="1" />
          </pattern>
          <radialGradient id="bp-fade" cx="50%" cy="50%" r="62%">
            <stop offset="50%" stopColor="#fff" />
            <stop offset="100%" stopColor="#000" />
          </radialGradient>
          <mask id="bp-mask">
            <rect width="640" height="480" fill="url(#bp-fade)" />
          </mask>
          <filter id="bp-glow" x="-30%" y="-10%" width="160%" height="120%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {/* Drafting grid, faded toward the edges */}
        <g mask="url(#bp-mask)">
          <rect width="640" height="480" fill="url(#bp-minor)" />
          <rect width="640" height="480" fill="url(#bp-major)" />
        </g>

        {/* Dimension lines */}
        <g className="fill-none stroke-zinc-600" strokeWidth="1">
          <path d="M100 62H540M100 55V69M540 55V69" />
          <path d="M72 90V420M65 90H79M65 420H79" />
        </g>
        <g className="fill-zinc-500 font-mono" fontSize="14" textAnchor="middle">
          <text x="320" y="48">8,00 m</text>
          <text transform="translate(50 255) rotate(-90)">6,00 m</text>
        </g>

        {/* Outer walls (double line) with window openings */}
        <path
          d="M160 90H100V420H540V90H460M400 90H220"
          className="fill-none stroke-zinc-500"
          strokeWidth="2.5"
          strokeLinecap="square"
        />
        <path
          d="M160 98H108V412H532V98H460M400 98H220"
          className="fill-none stroke-zinc-700"
          strokeWidth="1"
        />
        {[160, 400].map((x) => (
          <g key={x} className="fill-none" strokeWidth="1">
            <rect x={x} y="90" width="60" height="8" className="stroke-zinc-600" />
            <path d={`M${x} 94H${x + 60}`} className="stroke-sky-300/50" />
          </g>
        ))}

        {/* Interior partitions and door swing */}
        <g className="fill-none stroke-zinc-600" strokeWidth="1.5" strokeLinecap="square">
          <path d="M108 260H150M180 260H214V412M480 98V180H532" />
        </g>
        <path d="M150 260V230A30 30 0 0 1 180 260" className="fill-none stroke-zinc-600" strokeWidth="1" />

        {/* Furniture */}
        <g className="fill-none stroke-zinc-700" strokeWidth="1">
          <rect x="124" y="300" width="76" height="96" rx="4" />
          <rect x="130" y="306" width="28" height="16" rx="3" />
          <rect x="166" y="306" width="28" height="16" rx="3" />
          <rect x="230" y="350" width="70" height="40" rx="6" />
          <rect x="244" y="300" width="42" height="28" rx="4" />
          <circle cx="212" cy="170" r="26" />
          <circle cx="174" cy="170" r="8" />
          <circle cx="250" cy="170" r="8" />
          <circle cx="212" cy="132" r="8" />
          <circle cx="212" cy="208" r="8" />
          <rect x="332" y="382" width="190" height="24" />
          <rect x="420" y="388" width="34" height="12" rx="2" />
          <rect x="380" y="320" width="100" height="30" rx="2" />
        </g>

        {/* The wall under simulation: glow, animated dashed edges, end handles */}
        <path
          d="M320 98V412"
          className="fill-none stroke-sky-300"
          strokeWidth="10"
          opacity="0.35"
          filter="url(#bp-glow)"
        />
        <g className="animate-blueprint-dash fill-none stroke-sky-300" strokeWidth="2" strokeDasharray="10 6">
          <path d="M316 98V412" />
          <path d="M324 98V412" />
        </g>
        <g className="fill-zinc-950 stroke-sky-300" strokeWidth="1.5">
          <circle cx="320" cy="98" r="4.5" />
          <circle cx="320" cy="412" r="4.5" />
        </g>

        {/* Callout */}
        <path d="M324 250H366" className="fill-none stroke-sky-300/60" strokeWidth="1" />
        <rect
          x="366"
          y="224"
          width="150"
          height="54"
          rx="10"
          className="fill-zinc-900/80 stroke-sky-300/40"
          strokeWidth="1"
        />
        <text x="380" y="246" className="fill-sky-300 font-mono" fontSize="14">
          BÆREVEGG · 3,0 m
        </text>
        <text x="380" y="266" className="fill-zinc-300" fontSize="15">
          Hva om…?
        </text>

        {/* North arrow */}
        <g className="fill-none stroke-zinc-700" strokeWidth="1">
          <circle cx="596" cy="66" r="16" />
          <path d="M596 52L602 74L596 69L590 74Z" className="fill-zinc-600" />
        </g>
        <text x="596" y="36" className="fill-zinc-500 font-mono" fontSize="13" textAnchor="middle">
          N
        </text>

        {/* Title block */}
        <path d="M100 444H540" className="stroke-zinc-800" strokeWidth="1" />
        <g className="fill-zinc-500 font-mono" fontSize="13">
          <text x="100" y="467">RENOESTIMATE · PLAN 1:50</text>
          <text x="540" y="467" textAnchor="end">A-101 · SIMULERING</text>
        </g>
      </svg>
    </figure>
  );
}
