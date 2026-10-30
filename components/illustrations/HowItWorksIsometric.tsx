/**
 * Three-step isometric illustration: scan → shape → report.
 * Hand-coded SVG, server-rendered. Geometry is generated from a tiny isometric projection
 * helper so every solid stays consistent; colours are Tailwind tokens only (zinc surfaces,
 * `text-sky-300` → currentColor accent). Strokes are non-scaling so lines stay crisp.
 */

type Point = readonly [number, number];
type IsoFn = (x: number, y: number, z: number) => Point;

const COS30 = 0.866;
const SIN30 = 0.5;
const ROW_HEIGHT = 210;
const SCENE_X = 290;
const SCENE_Y = 85;
const PLANE = 100;

/** World (x right-down, y left-down, z up) → screen. */
const makeIso =
  (ox: number, oy: number): IsoFn =>
  (x, y, z) => [ox + (x - y) * COS30, oy + (x + y) * SIN30 - z];

const poly = (points: readonly Point[]): string =>
  points.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(" ");

interface BoxClasses {
  readonly top: string;
  readonly left: string;
  readonly right: string;
  readonly dash?: string;
}

interface IsoBoxProps extends BoxClasses {
  readonly iso: IsoFn;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly w: number;
  readonly d: number;
  readonly h: number;
}

/** Three visible faces of a box: top, front-left (+y) and front-right (+x). */
function IsoBox({ iso, x, y, z, w, d, h, top, left, right, dash }: IsoBoxProps) {
  return (
    <g strokeWidth="1" strokeLinejoin="round" strokeDasharray={dash}>
      <polygon
        points={poly([iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h)])}
        className={top}
      />
      <polygon
        points={poly([iso(x, y + d, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x, y + d, z + h)])}
        className={left}
      />
      <polygon
        points={poly([iso(x + w, y, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x + w, y, z + h)])}
        className={right}
      />
    </g>
  );
}

const SOLID: BoxClasses = {
  top: "fill-zinc-700 stroke-zinc-500",
  left: "fill-zinc-800 stroke-zinc-600",
  right: "fill-zinc-900 stroke-zinc-600",
};

const GHOST: BoxClasses = {
  top: "fill-sky-300/10 stroke-sky-300",
  left: "fill-sky-300/5 stroke-sky-300",
  right: "fill-sky-300/5 stroke-sky-300",
  dash: "5 4",
};

/** Square floor tile with a faint grid. */
function Plane({ iso }: { iso: IsoFn }) {
  const lines: number[] = [25, 50, 75];
  return (
    <g>
      <polygon
        points={poly([iso(0, 0, 0), iso(PLANE, 0, 0), iso(PLANE, PLANE, 0), iso(0, PLANE, 0)])}
        className="fill-zinc-900 stroke-zinc-700"
        strokeWidth="1"
      />
      <g className="stroke-zinc-800" strokeWidth="1">
        {lines.map((n) => (
          <g key={n}>
            <line x1={iso(n, 0, 0)[0]} y1={iso(n, 0, 0)[1]} x2={iso(n, PLANE, 0)[0]} y2={iso(n, PLANE, 0)[1]} />
            <line x1={iso(0, n, 0)[0]} y1={iso(0, n, 0)[1]} x2={iso(PLANE, n, 0)[0]} y2={iso(PLANE, n, 0)[1]} />
          </g>
        ))}
      </g>
    </g>
  );
}

/** Line with a filled triangular head at `to`. Colour comes from the passed stroke/fill classes. */
function Arrow({ from, to, className }: { from: Point; to: Point; className: string }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const head = 9;
  const half = 4.5;
  const bx = x2 - ux * head;
  const by = y2 - uy * head;
  return (
    <g className={className}>
      <line x1={x1} y1={y1} x2={bx} y2={by} strokeWidth="2" strokeLinecap="round" />
      <polygon
        points={poly([[x2, y2], [bx - uy * half, by + ux * half], [bx + uy * half, by - ux * half]])}
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </g>
  );
}

/** Step 1: a phone above a floor plane, scanning a highlighted patch. */
function ScanScene() {
  const iso = makeIso(SCENE_X, SCENE_Y);
  const [px, py, pz, pw, pd, ph] = [35, 20, 30, 30, 5, 52];
  const faceY = py + pd;
  const patch: readonly [number, number, number][] = [
    [20, 45, 0],
    [85, 45, 0],
    [85, 85, 0],
    [20, 85, 0],
  ];
  return (
    <g>
      <Plane iso={iso} />
      <polygon
        points={poly(patch.map(([x, y, z]) => iso(x, y, z)))}
        className="fill-sky-300/15 stroke-sky-300"
        strokeWidth="1.5"
        strokeDasharray="5 4"
      />
      {/* Scan cone */}
      <polygon
        points={poly([iso(px, faceY, pz), iso(px + pw, faceY, pz), iso(85, 85, 0), iso(20, 85, 0)])}
        className="fill-sky-300/10"
      />
      <g className="stroke-sky-300/70" strokeWidth="1" strokeDasharray="3 4">
        <line x1={iso(px, faceY, pz)[0]} y1={iso(px, faceY, pz)[1]} x2={iso(20, 85, 0)[0]} y2={iso(20, 85, 0)[1]} />
        <line x1={iso(px + pw, faceY, pz)[0]} y1={iso(px + pw, faceY, pz)[1]} x2={iso(85, 85, 0)[0]} y2={iso(85, 85, 0)[1]} />
      </g>
      {/* Phone */}
      <IsoBox iso={iso} x={px} y={py} z={pz} w={pw} d={pd} h={ph} {...SOLID} />
      <polygon
        points={poly([
          iso(px + 3, faceY, pz + 5),
          iso(px + pw - 3, faceY, pz + 5),
          iso(px + pw - 3, faceY, pz + ph - 7),
          iso(px + 3, faceY, pz + ph - 7),
        ])}
        className="fill-sky-300/20 stroke-sky-300/70"
        strokeWidth="1"
      />
      <circle cx={iso(px + pw / 2, faceY, pz + ph - 3.5)[0]} cy={iso(px + pw / 2, faceY, pz + ph - 3.5)[1]} r="1.8" className="fill-zinc-500" />
    </g>
  );
}

/** Step 2: a wall with a section lifted out and 3D axis arrows to reshape it. */
function ShapeScene() {
  const iso = makeIso(SCENE_X, SCENE_Y);
  const [wy, wd, wh] = [38, 8, 46];
  const zMid = wh / 2;
  return (
    <g>
      <Plane iso={iso} />
      <IsoBox iso={iso} x={10} y={wy} z={0} w={24} d={wd} h={wh} {...SOLID} />
      <IsoBox iso={iso} x={66} y={wy} z={0} w={24} d={wd} h={wh} {...SOLID} />
      <IsoBox iso={iso} x={34} y={wy} z={0} w={32} d={wd} h={wh} {...GHOST} />

      {/* Axis handles on the removed section */}
      <Arrow from={iso(50, 42, wh)} to={iso(50, 42, wh + 32)} className="fill-sky-300 stroke-sky-300" />
      <Arrow from={iso(50, 42, zMid)} to={iso(63, 42, zMid)} className="fill-amber-300 stroke-amber-300" />
      <Arrow from={iso(50, 42, zMid)} to={iso(37, 42, zMid)} className="fill-amber-300 stroke-amber-300" />
      <Arrow from={iso(50, 46, zMid)} to={iso(50, 78, zMid)} className="fill-zinc-200 stroke-zinc-200" />
      <circle
        cx={iso(50, 42, zMid)[0]}
        cy={iso(50, 42, zMid)[1]}
        r="3.5"
        className="fill-zinc-950 stroke-sky-300"
        strokeWidth="1.5"
      />
    </g>
  );
}

/** Step 3: a stamped budget report sheet lying on a surface. */
function ReportScene() {
  const iso = makeIso(SCENE_X, SCENE_Y);
  const [sx, sy, sw, sd, sh] = [5, 0, 90, 100, 3];
  const [tx, ty] = iso(sx, sy, sh);
  return (
    <g>
      <IsoBox iso={iso} x={sx} y={sy} z={0} w={sw} d={sd} h={sh} top="fill-zinc-800 stroke-zinc-500" left="fill-zinc-700 stroke-zinc-600" right="fill-zinc-900 stroke-zinc-600" />
      {/* Sheet content is drawn flat, then skewed onto the iso top face. */}
      <g transform={`matrix(${COS30} ${SIN30} ${-COS30} ${SIN30} ${tx.toFixed(1)} ${ty.toFixed(1)})`}>
        <rect x="6" y="6" width="42" height="5" rx="1" className="fill-zinc-400" />
        <rect x="6" y="14" width="26" height="3" rx="1" className="fill-zinc-600" />
        <path d="M6 22H84" className="stroke-zinc-600" strokeWidth="1" />
        <rect x="6" y="28" width="46" height="34" className="fill-none stroke-zinc-500" strokeWidth="1" />
        <path d="M29 28V62" className="stroke-sky-300" strokeWidth="1.5" strokeDasharray="3 2" />
        <path d="M6 45H17M41 45H52" className="stroke-zinc-600" strokeWidth="1" />
        <rect x="6" y="68" width="72" height="3" rx="1" className="fill-zinc-700" />
        <rect x="6" y="75" width="56" height="3" rx="1" className="fill-zinc-700" />
        <rect x="6" y="84" width="78" height="6" rx="3" className="fill-zinc-900 stroke-zinc-600" strokeWidth="1" />
        <rect x="22" y="84" width="40" height="6" rx="3" className="fill-sky-300" />
        {/* Stamp */}
        <g transform="translate(66 44) rotate(-14)" className="fill-none stroke-emerald-300">
          <circle r="15" strokeWidth="1.5" />
          <circle r="11" strokeWidth="1" opacity="0.6" />
          <path d="M-5 0L-1.5 4L5 -4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
    </g>
  );
}

const STEPS: readonly { n: string; label: string; Scene: () => React.JSX.Element }[] = [
  { n: "01", label: "SCAN", Scene: ScanScene },
  { n: "02", label: "SHAPE", Scene: ShapeScene },
  { n: "03", label: "REPORT", Scene: ReportScene },
];

export function HowItWorksIsometric({ className = "" }: { className?: string }) {
  return (
    <figure
      data-slot="how-it-works"
      className={`glass overflow-hidden rounded-3xl p-3 sm:p-5 ${className}`}
    >
      <svg
        viewBox={`0 0 520 ${ROW_HEIGHT * STEPS.length}`}
        role="img"
        aria-label="Three steps: scan the room with a phone, reshape a wall with 3D handles, receive a stamped budget report"
        className="block h-auto w-full text-sky-300 [&_*]:[vector-effect:non-scaling-stroke]"
      >
        {/* Connector between step badges */}
        <path
          d={`M40 ${SCENE_Y + 36}V${ROW_HEIGHT + SCENE_Y - 16}M40 ${ROW_HEIGHT + SCENE_Y + 16}V${2 * ROW_HEIGHT + SCENE_Y - 16}`}
          className="fill-none stroke-zinc-700"
          strokeWidth="1"
          strokeDasharray="3 5"
        />
        {STEPS.map(({ n, label, Scene }, i) => (
          <g key={n} transform={`translate(0 ${i * ROW_HEIGHT})`}>
            <circle cx="40" cy={SCENE_Y} r="16" className="fill-zinc-900 stroke-zinc-700" strokeWidth="1" />
            <text x="40" y={SCENE_Y} textAnchor="middle" dominantBaseline="central" className="fill-sky-300 font-mono" fontSize="13">
              {n}
            </text>
            <text x="40" y={SCENE_Y + 32} textAnchor="middle" className="fill-zinc-500 font-mono" fontSize="11">
              {label}
            </text>
            <Scene />
          </g>
        ))}
      </svg>
    </figure>
  );
}
