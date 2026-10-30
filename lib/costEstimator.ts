/**
 * costEstimator — foundational, pure pricing engine for RenoEstimate.
 *
 * Design notes
 * - Everything is METRIC internally (m, m², m³, kg, tonnes). Imperial exists only at the display
 *   edge (see ./units); quantities passed in and out of this module are always metric.
 * - Catalog prices are EUR for a Norwegian mid-market job (ex. VAT). Regions then apply separate
 *   labour / material indices and an FX rate. Norway is the calibration reference, e.g. at the
 *   Norwegian indices a 3 m load-bearing wall opening lands at NOK 58–135k, one new window at
 *   NOK 11–28k and a 36 m² uninsulated double garage at NOK 380–745k (all incl. contingency).
 * - Material cost = lump "other materials" per unit + quantity takeoff × unit price. The takeoff
 *   (concrete m³, structural steel kg, waste tonnes) is derived from geometry, see TAKEOFF below.
 * - Every figure is a [min, max] interval. Rates are INDICATIVE, estimated by us rather than
 *   taken from a published index: replace with sourced data (e.g. SSB building-cost indices,
 *   supplier price lists) before relying on them commercially.
 * - No I/O, no React, no side effects: safe on the server, the edge, the client and in tests.
 */

import type { Dimension, UnitSystem } from "./units";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Currency = "NOK" | "SEK" | "DKK" | "EUR" | "USD";

export type RegionId = "norway" | "sweden" | "denmark" | "finland" | "usa" | "global";

export type ModificationKind =
  | "load-bearing-wall-removal"
  | "window-addition"
  | "garage-addition";

/** An inclusive price bracket. Invariant: min <= max. */
export interface CostInterval {
  readonly min: number;
  readonly max: number;
}

/** A cost bracket split into its two drivers. */
export interface CostSplit {
  readonly labor: CostInterval;
  readonly material: CostInterval;
}

/** One simulated change to the building. `quantity` is metric (m, m²) or a piece count. */
export interface Modification {
  readonly kind: ModificationKind;
  readonly quantity: number;
}

/** Bill of quantities derived from geometry. All metric. */
export interface Takeoff {
  readonly concreteM3: number;
  readonly steelKg: number;
  readonly wasteTonnes: number;
  /** Chosen steel beam section for a wall opening, e.g. "HEB 200". */
  readonly beamSection: string | null;
  /** Clear span of that beam in metres (0 when none). */
  readonly beamSpanM: number;
}

/** Display step per unit system, expressed in that system's display unit (m / ft, m² / ft²). */
export interface SliderSteps {
  readonly metric: number;
  readonly imperial: number;
}

/** Catalog entry describing how a kind of modification is priced. */
export interface ModificationSpec {
  readonly kind: ModificationKind;
  readonly label: string;
  readonly description: string;
  readonly dimension: Dimension;
  readonly step: SliderSteps;
  /** Upper bound, metric (m, m²) or pieces. */
  readonly maxQuantity: number;
  /** Cost per unit of quantity (excluding takeoff-driven material), EUR base. */
  readonly perUnit: CostSplit;
  /** One-off cost incurred whenever quantity > 0 (engineering, permits, set-up), EUR base. */
  readonly fixed: CostSplit;
  /** Geometry → quantities. */
  readonly takeoff: (quantity: number) => Takeoff;
}

export interface RegionProfile {
  readonly id: RegionId;
  readonly label: string;
  readonly currency: Currency;
  readonly locale: string;
  readonly unitSystem: UnitSystem;
  /** Units of local currency per 1 EUR. */
  readonly fxPerEur: number;
  /** Multiplier on the EUR labour baseline. */
  readonly labourIndex: number;
  /** Multiplier on the EUR material baseline. */
  readonly materialIndex: number;
  /** Totals are rounded outward to this step in local currency. */
  readonly roundingStep: number;
}

export interface EstimateLine {
  readonly kind: ModificationKind;
  readonly label: string;
  /** Metric quantity (m, m²) or piece count. */
  readonly quantity: number;
  readonly dimension: Dimension;
  readonly labor: CostInterval;
  readonly material: CostInterval;
  readonly total: CostInterval;
  readonly takeoff: Takeoff;
}

export interface EstimateResult {
  readonly region: RegionProfile;
  readonly lines: readonly EstimateLine[];
  readonly labor: CostInterval;
  readonly material: CostInterval;
  readonly subtotal: CostInterval;
  readonly contingency: CostInterval;
  /** Subtotal + contingency, rounded outward. This is the headline range. */
  readonly total: CostInterval;
  /** Combined bill of quantities for the whole job. */
  readonly takeoff: Takeoff;
}

// ---------------------------------------------------------------------------
// Takeoff assumptions (metric)
// ---------------------------------------------------------------------------

export const GARAGE_DEPTH_M = 6;

/**
 * Typical residential steel beams (HEB) with the clear span each carries for a ~25 kN/m line
 * load at roughly 80% utilisation. A structural engineer always confirms the real section; the
 * fixed engineering fee in the catalog pays for exactly that.
 */
const BEAM_SECTIONS: readonly { name: string; kgPerM: number; maxSpanM: number }[] = [
  { name: "HEB 160", kgPerM: 42.6, maxSpanM: 2.5 },
  { name: "HEB 200", kgPerM: 61.3, maxSpanM: 3.5 },
  { name: "HEB 240", kgPerM: 83.2, maxSpanM: 4.5 },
  { name: "HEB 300", kgPerM: 117, maxSpanM: 6.5 },
];

const TAKEOFF = {
  /** Beam bearing allowance per end (m). */
  beamBearingM: 0.2,
  /** Plates, stiffeners and connections as a fraction of beam mass. */
  connectionAllowance: 0.08,
  /** Demolished masonry wall: height (m), thickness (m), density (t/m³), debris allowance. */
  wallHeightM: 2.5,
  wallThicknessM: 0.2,
  wallDensityTPerM3: 1.8,
  wallDebrisFactor: 1.15,
  /** Angle-iron lintel per new window opening (kg), and wall debris per opening (t). */
  lintelKg: 15,
  windowDebrisT: 0.15,
  /** Garage: slab 150 mm, strip footing 300 × 400 mm, 5% overpour. */
  slabThicknessM: 0.15,
  footingWidthM: 0.3,
  footingHeightM: 0.4,
  overpour: 1.05,
  /** Garage excavation spoil: depth (m) × bulk density (t/m³). */
  excavationDepthM: 0.35,
  soilDensityTPerM3: 1.7,
} as const;

const NO_TAKEOFF: Takeoff = { concreteM3: 0, steelKg: 0, wasteTonnes: 0, beamSection: null, beamSpanM: 0 };

const wallTakeoff = (lengthM: number): Takeoff => {
  const section = BEAM_SECTIONS.find((s) => lengthM <= s.maxSpanM) ?? BEAM_SECTIONS[BEAM_SECTIONS.length - 1]!;
  const beamLengthM = lengthM + 2 * TAKEOFF.beamBearingM;
  const removedVolumeM3 = lengthM * TAKEOFF.wallHeightM * TAKEOFF.wallThicknessM;
  return {
    ...NO_TAKEOFF,
    steelKg: section.kgPerM * beamLengthM * (1 + TAKEOFF.connectionAllowance),
    wasteTonnes: removedVolumeM3 * TAKEOFF.wallDensityTPerM3 * TAKEOFF.wallDebrisFactor,
    beamSection: section.name,
    beamSpanM: lengthM,
  };
};

const windowTakeoff = (count: number): Takeoff => ({
  ...NO_TAKEOFF,
  steelKg: count * TAKEOFF.lintelKg,
  wasteTonnes: count * TAKEOFF.windowDebrisT,
});

const garageTakeoff = (areaM2: number): Takeoff => {
  const widthM = areaM2 / GARAGE_DEPTH_M;
  const perimeterM = 2 * (GARAGE_DEPTH_M + widthM);
  const slabM3 = areaM2 * TAKEOFF.slabThicknessM;
  const footingM3 = perimeterM * TAKEOFF.footingWidthM * TAKEOFF.footingHeightM;
  return {
    ...NO_TAKEOFF,
    concreteM3: (slabM3 + footingM3) * TAKEOFF.overpour,
    wasteTonnes: areaM2 * TAKEOFF.excavationDepthM * TAKEOFF.soilDensityTPerM3,
  };
};

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

const range = (min: number, max: number): CostInterval => ({ min, max });
const ZERO: CostInterval = range(0, 0);

/** Takeoff unit prices, EUR base, supplied and installed. */
const UNIT_PRICE = {
  steelPerKg: range(2.2, 3.6),
  concretePerM3: range(260, 380),
  wastePerTonne: range(130, 230),
} as const;

export const MODIFICATION_CATALOG: Readonly<Record<ModificationKind, ModificationSpec>> = {
  "load-bearing-wall-removal": {
    kind: "load-bearing-wall-removal",
    label: "Remove load-bearing wall",
    description: "Steel beam with bearing allowance, temporary propping, engineer sign-off and finishing.",
    dimension: "length",
    step: { metric: 0.5, imperial: 1 },
    maxQuantity: 6,
    perUnit: { labor: range(450, 900), material: range(120, 280) },
    // Structural engineer, drawings and permit handling.
    fixed: { labor: range(1150, 2550), material: ZERO },
    takeoff: wallTakeoff,
  },
  "window-addition": {
    kind: "window-addition",
    label: "Add window",
    description: "Standard double-glazed window in a new opening, with lintel, trim and making good.",
    dimension: "count",
    step: { metric: 1, imperial: 1 },
    maxQuantity: 6,
    perUnit: { labor: range(450, 950), material: range(240, 560) },
    fixed: { labor: ZERO, material: ZERO },
    takeoff: windowTakeoff,
  },
  "garage-addition": {
    kind: "garage-addition",
    label: "Add external garage",
    description: "Uninsulated double garage on a concrete slab with strip footings.",
    dimension: "area",
    step: { metric: 3, imperial: 25 },
    maxQuantity: 36,
    perUnit: { labor: range(285, 475), material: range(200, 345) },
    // Groundworks set-up, drawings and building application.
    fixed: { labor: range(2550, 5700), material: ZERO },
    takeoff: garageTakeoff,
  },
};

export const MODIFICATION_KINDS = Object.keys(MODIFICATION_CATALOG) as ModificationKind[];

export const REGIONS: Readonly<Record<RegionId, RegionProfile>> = {
  norway: {
    id: "norway", label: "Norway", currency: "NOK", locale: "nb-NO", unitSystem: "metric",
    fxPerEur: 11.7, labourIndex: 1.35, materialIndex: 1.12, roundingStep: 1000,
  },
  sweden: {
    id: "sweden", label: "Sweden", currency: "SEK", locale: "sv-SE", unitSystem: "metric",
    fxPerEur: 11.3, labourIndex: 1.05, materialIndex: 1.0, roundingStep: 1000,
  },
  denmark: {
    id: "denmark", label: "Denmark", currency: "DKK", locale: "da-DK", unitSystem: "metric",
    fxPerEur: 7.46, labourIndex: 1.2, materialIndex: 1.05, roundingStep: 500,
  },
  finland: {
    id: "finland", label: "Finland", currency: "EUR", locale: "fi-FI", unitSystem: "metric",
    fxPerEur: 1, labourIndex: 1.0, materialIndex: 0.98, roundingStep: 100,
  },
  usa: {
    id: "usa", label: "United States", currency: "USD", locale: "en-US", unitSystem: "imperial",
    fxPerEur: 1.08, labourIndex: 1.15, materialIndex: 1.0, roundingStep: 100,
  },
  global: {
    id: "global", label: "Global average", currency: "EUR", locale: "en-IE", unitSystem: "metric",
    fxPerEur: 1, labourIndex: 0.9, materialIndex: 1.0, roundingStep: 100,
  },
};

/** Contingency band added on top of the subtotal: unknowns lean upward. */
export const CONTINGENCY: CostInterval = range(0.05, 0.18);

// ---------------------------------------------------------------------------
// Interval helpers
// ---------------------------------------------------------------------------

const addIntervals = (a: CostInterval, b: CostInterval): CostInterval =>
  range(a.min + b.min, a.max + b.max);

const scaleInterval = (a: CostInterval, factor: number): CostInterval =>
  range(a.min * factor, a.max * factor);

const roundOutward = (a: CostInterval, step: number): CostInterval =>
  range(Math.floor(a.min / step) * step, Math.ceil(a.max / step) * step);

const clamp = (value: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, value));

const addTakeoffs = (a: Takeoff, b: Takeoff): Takeoff => ({
  concreteM3: a.concreteM3 + b.concreteM3,
  steelKg: a.steelKg + b.steelKg,
  wasteTonnes: a.wasteTonnes + b.wasteTonnes,
  beamSection: b.beamSection ?? a.beamSection,
  beamSpanM: Math.max(a.beamSpanM, b.beamSpanM),
});

/** Material cost (EUR base) of a takeoff. */
const takeoffMaterial = (t: Takeoff): CostInterval =>
  addIntervals(
    addIntervals(
      scaleInterval(UNIT_PRICE.steelPerKg, t.steelKg),
      scaleInterval(UNIT_PRICE.concretePerM3, t.concreteM3),
    ),
    scaleInterval(UNIT_PRICE.wastePerTonne, t.wasteTonnes),
  );

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Price a single modification line in local currency. Returns null when quantity is zero. */
export function estimateLine(mod: Modification, region: RegionProfile): EstimateLine | null {
  const spec = MODIFICATION_CATALOG[mod.kind];
  const quantity = clamp(mod.quantity, 0, spec.maxQuantity);
  if (quantity <= 0) return null;

  const takeoff = spec.takeoff(quantity);
  const toLocal = (base: CostInterval, index: number): CostInterval =>
    scaleInterval(base, index * region.fxPerEur);

  const labor = toLocal(
    addIntervals(scaleInterval(spec.perUnit.labor, quantity), spec.fixed.labor),
    region.labourIndex,
  );
  const material = toLocal(
    addIntervals(
      addIntervals(scaleInterval(spec.perUnit.material, quantity), spec.fixed.material),
      takeoffMaterial(takeoff),
    ),
    region.materialIndex,
  );

  return {
    kind: spec.kind,
    label: spec.label,
    quantity,
    dimension: spec.dimension,
    labor,
    material,
    total: addIntervals(labor, material),
    takeoff,
  };
}

/** Compute the full min/max estimate for a set of simulated modifications. */
export function estimateRenovation(
  modifications: readonly Modification[],
  regionId: RegionId = "norway",
): EstimateResult {
  const region = REGIONS[regionId];
  const lines = modifications
    .map((mod) => estimateLine(mod, region))
    .filter((line): line is EstimateLine => line !== null);

  const labor = lines.reduce((sum, l) => addIntervals(sum, l.labor), ZERO);
  const material = lines.reduce((sum, l) => addIntervals(sum, l.material), ZERO);
  const subtotal = addIntervals(labor, material);

  const contingency = range(subtotal.min * CONTINGENCY.min, subtotal.max * CONTINGENCY.max);
  const total =
    lines.length === 0
      ? ZERO
      : roundOutward(addIntervals(subtotal, contingency), region.roundingStep);
  const takeoff = lines.reduce((sum, l) => addTakeoffs(sum, l.takeoff), NO_TAKEOFF);

  return { region, lines, labor, material, subtotal, contingency, total, takeoff };
}
