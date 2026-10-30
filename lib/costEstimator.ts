/**
 * costEstimator — foundational, pure pricing engine for RenoEstimate.
 *
 * Design notes
 * - All catalog prices are expressed in EUR for a "typical Nordic mid-market" job
 *   (ex. VAT). Regions then apply separate labour / material indices and an FX rate.
 * - Every figure is a [min, max] interval; we never emit a single "magic" number.
 * - The indices below are INDICATIVE PLACEHOLDERS for early product work. Replace
 *   them with sourced data (e.g. national building-cost indices) before launch.
 * - No I/O, no React, no side effects: safe to run on server, client or in tests.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Currency = "NOK" | "SEK" | "DKK" | "EUR" | "USD";

export type RegionId = "norway" | "sweden" | "denmark" | "finland" | "global";

export type ModificationKind =
  | "load-bearing-wall-removal"
  | "window-addition"
  | "garage-addition";

export type QuantityUnit = "m" | "pcs" | "m²";

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

/** One simulated change to the building. */
export interface Modification {
  readonly kind: ModificationKind;
  readonly quantity: number;
}

/** Catalog entry describing how a kind of modification is priced. */
export interface ModificationSpec {
  readonly kind: ModificationKind;
  readonly label: string;
  readonly description: string;
  readonly unit: QuantityUnit;
  readonly step: number;
  readonly maxQuantity: number;
  /** Cost per unit of quantity, EUR base. */
  readonly perUnit: CostSplit;
  /** One-off cost incurred whenever quantity > 0 (engineering, permits, rigging), EUR base. */
  readonly fixed: CostSplit;
}

export interface RegionProfile {
  readonly id: RegionId;
  readonly label: string;
  readonly currency: Currency;
  readonly locale: string;
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
  readonly quantity: number;
  readonly unit: QuantityUnit;
  readonly labor: CostInterval;
  readonly material: CostInterval;
  readonly total: CostInterval;
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
}

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

const range = (min: number, max: number): CostInterval => ({ min, max });
const ZERO: CostInterval = range(0, 0);

export const MODIFICATION_CATALOG: Readonly<Record<ModificationKind, ModificationSpec>> = {
  "load-bearing-wall-removal": {
    kind: "load-bearing-wall-removal",
    label: "Remove load-bearing wall",
    description: "Opens the plan. Includes a beam, temporary propping and finishing.",
    unit: "m",
    step: 0.5,
    maxQuantity: 6,
    perUnit: { labor: range(900, 1800), material: range(600, 1400) },
    // Structural engineer sign-off and permit handling.
    fixed: { labor: range(1500, 3500), material: ZERO },
  },
  "window-addition": {
    kind: "window-addition",
    label: "Add window",
    description: "New opening in an exterior wall with lintel, frame and trim.",
    unit: "pcs",
    step: 1,
    maxQuantity: 6,
    perUnit: { labor: range(600, 1300), material: range(900, 2800) },
    fixed: { labor: ZERO, material: ZERO },
  },
  "garage-addition": {
    kind: "garage-addition",
    label: "Add external garage",
    description: "Attached single-storey garage with slab foundation and envelope.",
    unit: "m²",
    step: 3,
    maxQuantity: 36,
    perUnit: { labor: range(700, 1200), material: range(800, 1500) },
    // Groundworks set-up, drawings and building application.
    fixed: { labor: range(4000, 9000), material: ZERO },
  },
};

export const MODIFICATION_KINDS = Object.keys(MODIFICATION_CATALOG) as ModificationKind[];

export const REGIONS: Readonly<Record<RegionId, RegionProfile>> = {
  norway: {
    id: "norway", label: "Norway", currency: "NOK", locale: "nb-NO",
    fxPerEur: 11.7, labourIndex: 1.35, materialIndex: 1.12, roundingStep: 1000,
  },
  sweden: {
    id: "sweden", label: "Sweden", currency: "SEK", locale: "sv-SE",
    fxPerEur: 11.3, labourIndex: 1.05, materialIndex: 1.0, roundingStep: 1000,
  },
  denmark: {
    id: "denmark", label: "Denmark", currency: "DKK", locale: "da-DK",
    fxPerEur: 7.46, labourIndex: 1.2, materialIndex: 1.05, roundingStep: 500,
  },
  finland: {
    id: "finland", label: "Finland", currency: "EUR", locale: "fi-FI",
    fxPerEur: 1, labourIndex: 1.0, materialIndex: 0.98, roundingStep: 100,
  },
  global: {
    id: "global", label: "Global average", currency: "USD", locale: "en-US",
    fxPerEur: 1.08, labourIndex: 0.9, materialIndex: 1.0, roundingStep: 100,
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

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Price a single modification line in local currency. Returns null when quantity is zero. */
export function estimateLine(mod: Modification, region: RegionProfile): EstimateLine | null {
  const spec = MODIFICATION_CATALOG[mod.kind];
  const quantity = clamp(mod.quantity, 0, spec.maxQuantity);
  if (quantity <= 0) return null;

  const toLocal = (base: CostInterval, index: number): CostInterval =>
    scaleInterval(base, index * region.fxPerEur);

  const labor = toLocal(
    addIntervals(scaleInterval(spec.perUnit.labor, quantity), spec.fixed.labor),
    region.labourIndex,
  );
  const material = toLocal(
    addIntervals(scaleInterval(spec.perUnit.material, quantity), spec.fixed.material),
    region.materialIndex,
  );

  return {
    kind: spec.kind,
    label: spec.label,
    quantity,
    unit: spec.unit,
    labor,
    material,
    total: addIntervals(labor, material),
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

  return { region, lines, labor, material, subtotal, contingency, total };
}
