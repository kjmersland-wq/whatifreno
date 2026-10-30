import type { RegionId } from "./costEstimator";

/**
 * Regional configuration detector. Pure: callers pass what they can observe, so it works in
 * the browser (navigator.language, Intl time zone) and on the edge (e.g. Cloudflare's
 * CF-IPCountry header → `country`).
 */

export interface RegionSignals {
  /** BCP-47 tag such as "nb-NO" or "en-US". */
  readonly locale?: string;
  /** IANA zone such as "Europe/Oslo". */
  readonly timeZone?: string;
  /** ISO 3166-1 alpha-2 country code. Strongest signal when present. */
  readonly country?: string;
}

const BY_COUNTRY: Readonly<Record<string, RegionId>> = {
  NO: "norway",
  SE: "sweden",
  DK: "denmark",
  FI: "finland",
  US: "usa",
};

const BY_LANGUAGE: Readonly<Record<string, RegionId>> = {
  nb: "norway",
  nn: "norway",
  no: "norway",
  sv: "sweden",
  da: "denmark",
  fi: "finland",
};

const BY_TIME_ZONE: Readonly<Record<string, RegionId>> = {
  "Europe/Oslo": "norway",
  "Europe/Stockholm": "sweden",
  "Europe/Copenhagen": "denmark",
  "Europe/Helsinki": "finland",
};

/**
 * Picks the pricing/unit region. Priority: country → locale region → language → time zone.
 * United States signals select imperial units and USD; everything unrecognised is "global"
 * (metric, EUR).
 */
export function detectRegion({ locale, timeZone, country }: RegionSignals): RegionId {
  const fromCountry = country ? BY_COUNTRY[country.toUpperCase()] : undefined;
  if (fromCountry) return fromCountry;

  const [language = "", regionSubtag = ""] = (locale ?? "").split("-");
  const fromLocaleRegion = BY_COUNTRY[regionSubtag.toUpperCase()];
  if (fromLocaleRegion) return fromLocaleRegion;

  const fromLanguage = BY_LANGUAGE[language.toLowerCase()];
  if (fromLanguage) return fromLanguage;

  if (timeZone) {
    const fromZone = BY_TIME_ZONE[timeZone];
    if (fromZone) return fromZone;
    if (timeZone.startsWith("America/") && language.toLowerCase() === "en") return "usa";
  }
  return "global";
}
