import {
  MODIFICATION_CATALOG,
  MODIFICATION_KINDS,
  REGIONS,
  type ModificationKind,
  type RegionId,
} from "./costEstimator";

/**
 * A simulated design: the single value that flows workspace → checkout → export.
 * Everything arriving from a URL or request body goes through `sanitizeDesign`.
 */

export type Quantities = Readonly<Record<ModificationKind, number>>;

export interface Design {
  readonly region: RegionId;
  readonly quantities: Quantities;
}

/** Short URL parameter names for each modification kind. */
const PARAM_BY_KIND: Readonly<Record<ModificationKind, string>> = {
  "load-bearing-wall-removal": "wall",
  "window-addition": "windows",
  "garage-addition": "garage",
};

export const EMPTY_QUANTITIES = Object.fromEntries(
  MODIFICATION_KINDS.map((kind) => [kind, 0]),
) as Quantities;

const DEFAULT_REGION: RegionId = "norway";

const isRegionId = (value: unknown): value is RegionId =>
  typeof value === "string" && Object.hasOwn(REGIONS, value);

/** Coerce untrusted input into a valid Design: unknown region → default, numbers clamped to catalog limits. */
export function sanitizeDesign(region: unknown, raw: (kind: ModificationKind) => unknown): Design {
  const quantities = Object.fromEntries(
    MODIFICATION_KINDS.map((kind) => {
      const value = Number(raw(kind));
      const max = MODIFICATION_CATALOG[kind].maxQuantity;
      return [kind, Number.isFinite(value) ? Math.min(max, Math.max(0, value)) : 0];
    }),
  ) as Quantities;
  return { region: isRegionId(region) ? region : DEFAULT_REGION, quantities };
}

export const isEmptyDesign = (design: Design): boolean =>
  MODIFICATION_KINDS.every((kind) => design.quantities[kind] === 0);

/** Design → query string for /checkout. */
export function designToSearchParams(design: Design): URLSearchParams {
  const params = new URLSearchParams({ region: design.region });
  for (const kind of MODIFICATION_KINDS) {
    params.set(PARAM_BY_KIND[kind], String(design.quantities[kind]));
  }
  return params;
}

type SearchParamValue = string | string[] | undefined;

/** Next.js `searchParams` → Design. */
export function designFromSearchParams(params: Record<string, SearchParamValue>): Design {
  const first = (v: SearchParamValue) => (Array.isArray(v) ? v[0] : v);
  return sanitizeDesign(first(params.region), (kind) => first(params[PARAM_BY_KIND[kind]]));
}

/**
 * Stable string identifying a design. It is stored on the Paddle transaction as custom data
 * at checkout and compared on export, so a payment only unlocks the design that was paid for.
 */
export function designFingerprint(design: Design): string {
  return [design.region, ...MODIFICATION_KINDS.map((kind) => design.quantities[kind])].join("|");
}
