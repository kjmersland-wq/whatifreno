/**
 * Seller identity shown on the compliance pages. Set the NEXT_PUBLIC_* variables in the
 * hosting environment before going live: the bracketed fallbacks are placeholders only.
 */
export const LEGAL = {
  productName: "RenoEstimate",
  sellerName: process.env.NEXT_PUBLIC_SELLER_NAME ?? "[Selskapsnavn]",
  orgNumber: process.env.NEXT_PUBLIC_SELLER_ORG_NUMBER ?? "[Organisasjonsnummer]",
  contactEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "[kontakt-e-post]",
  /** Date the texts were last revised. */
  updated: "30. oktober 2026",
} as const;
