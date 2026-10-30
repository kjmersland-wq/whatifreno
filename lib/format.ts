import type { RegionProfile } from "./costEstimator";
import { formatMeasure, type Dimension } from "./units";

/** Format a whole-number money amount in the region's currency and locale. */
export function formatMoney(value: number, region: RegionProfile): string {
  return new Intl.NumberFormat(region.locale, {
    style: "currency",
    currency: region.currency,
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

/** Format a metric quantity in the region's unit system and locale, e.g. "2,5 m" or "9′ 10″". */
export function formatQuantity(value: number, dimension: Dimension, region: RegionProfile): string {
  return formatMeasure(value, dimension, region.unitSystem, region.locale);
}
