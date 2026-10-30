/**
 * Unit conversion and measurement formatting.
 *
 * Rule: every stored or calculated quantity is METRIC (m, m², m³, kg, tonnes).
 * Imperial exists only at the display edge (sliders, labels, documents).
 *
 * Factors come from the exact international definitions (1 ft = 0.3048 m exactly), which gives
 * 3.280839895… ft/m and 10.76391041… ft²/m², i.e. the commonly quoted 3.28084 and 10.7639
 * without their rounding error.
 */

export type UnitSystem = "metric" | "imperial";

/** What a quantity measures. "count" is unit-less (pieces) and never converted. */
export type Dimension = "length" | "area" | "count";

const M_PER_FT = 0.3048;
const M2_PER_FT2 = M_PER_FT * M_PER_FT;
const M3_PER_YD3 = 0.9144 ** 3;
const KG_PER_LB = 0.45359237;
const TONNE_PER_SHORT_TON = 0.90718474;

export const FT_PER_M = 1 / M_PER_FT;
export const FT2_PER_M2 = 1 / M2_PER_FT2;

export const metersToFeet = (m: number): number => m / M_PER_FT;
export const feetToMeters = (ft: number): number => ft * M_PER_FT;
export const m2ToFt2 = (m2: number): number => m2 / M2_PER_FT2;
export const ft2ToM2 = (ft2: number): number => ft2 * M2_PER_FT2;
export const m3ToYd3 = (m3: number): number => m3 / M3_PER_YD3;
export const kgToLb = (kg: number): number => kg / KG_PER_LB;
export const tonnesToShortTons = (t: number): number => t / TONNE_PER_SHORT_TON;

/** Metric canonical value → value in the user's display unit. */
export function toDisplayValue(value: number, dimension: Dimension, system: UnitSystem): number {
  if (system === "metric" || dimension === "count") return value;
  return dimension === "length" ? metersToFeet(value) : m2ToFt2(value);
}

/** Value in the user's display unit → metric canonical value. */
export function fromDisplayValue(value: number, dimension: Dimension, system: UnitSystem): number {
  if (system === "metric" || dimension === "count") return value;
  return dimension === "length" ? feetToMeters(value) : ft2ToM2(value);
}

/** Short unit symbol for sliders, e.g. "m", "ft", "m²", "ft²". */
export function displayUnit(dimension: Dimension, system: UnitSystem): string {
  if (dimension === "count") return "pcs";
  if (dimension === "length") return system === "metric" ? "m" : "ft";
  return system === "metric" ? "m²" : "ft²";
}

const number = (value: number, digits: number, locale: string): string =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value);

/**
 * Format a metric quantity for display.
 *  - metric length: "3 m", "2,5 m", "50 cm" (below one metre)
 *  - imperial length: feet and inches, e.g. 9′ 10″
 *  - area: "18 m²" / "194 ft²"
 */
export function formatMeasure(
  value: number,
  dimension: Dimension,
  system: UnitSystem,
  locale: string,
): string {
  if (dimension === "count") return `${number(value, 0, locale)} pcs`;

  if (dimension === "area") {
    return system === "metric"
      ? `${number(value, 1, locale)} m²`
      : `${number(m2ToFt2(value), 0, locale)} ft²`;
  }

  if (system === "metric") {
    return value > 0 && value < 1 ? `${number(value * 100, 0, locale)} cm` : `${number(value, 1, locale)} m`;
  }
  const totalInches = Math.round(metersToFeet(value) * 12);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return feet === 0 ? `${inches}″` : `${feet}′ ${inches}″`;
}

/** Concrete volume: m³ or yd³. */
export function formatVolume(m3: number, system: UnitSystem, locale: string): string {
  return system === "metric"
    ? `${number(m3, 1, locale)} m³`
    : `${number(m3ToYd3(m3), 1, locale)} yd³`;
}

/** Steel mass: kg or lb. */
export function formatMass(kg: number, system: UnitSystem, locale: string): string {
  return system === "metric" ? `${number(kg, 0, locale)} kg` : `${number(kgToLb(kg), 0, locale)} lb`;
}

/** Waste weight: metric tonnes or US short tons. */
export function formatWasteWeight(tonnes: number, system: UnitSystem, locale: string): string {
  return system === "metric"
    ? `${number(tonnes, 1, locale)} t`
    : `${number(tonnesToShortTons(tonnes), 1, locale)} tons`;
}
