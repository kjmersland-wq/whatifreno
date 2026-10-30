import type { RegionProfile } from "./costEstimator";

/** Format a whole-number money amount in the region's currency and locale. */
export function formatMoney(value: number, region: RegionProfile): string {
  return new Intl.NumberFormat(region.locale, {
    style: "currency",
    currency: region.currency,
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

/** Format a quantity with at most one decimal and its unit, e.g. "2.5 m". */
export function formatQuantity(value: number, unit: string): string {
  const text = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return `${text} ${unit}`;
}
