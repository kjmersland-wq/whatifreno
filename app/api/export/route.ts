import { NextResponse } from "next/server";
import { CONTINGENCY, MODIFICATION_KINDS, estimateRenovation } from "@/lib/costEstimator";
import { isEmptyDesign, sanitizeDesign } from "@/lib/design";
import { formatMoney, formatQuantity } from "@/lib/format";
import { verifyPaidTransaction } from "@/lib/paddleServer";
import { tenderCopyFor } from "@/lib/tenderCopy";
import { formatMass, formatVolume, formatWasteWeight } from "@/lib/units";

/**
 * POST /api/export — returns a print-friendly tender pack (HTML). PAID FEATURE.
 * Body: { transactionId: string, region: RegionId, quantities: Record<ModificationKind, number> }
 *
 * The document is only compiled after Paddle confirms the transaction is paid and was created
 * for this exact design. Language, units (metric / imperial) and currency follow the region;
 * quantities and prices are recomputed here, client-supplied figures are never trusted.
 */

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function POST(request: Request) {
  let body: { transactionId?: unknown; region?: unknown; quantities?: unknown } | null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const raw = (typeof body.quantities === "object" && body.quantities !== null ? body.quantities : {}) as Record<string, unknown>;
  const design = sanitizeDesign(body.region, (kind) => raw[kind]);
  if (isEmptyDesign(design)) {
    return NextResponse.json({ error: "No changes selected" }, { status: 400 });
  }

  // Paywall: nothing below runs unless Paddle confirms payment for this design.
  const payment = await verifyPaidTransaction(body.transactionId, design);
  if (!payment.ok) {
    return NextResponse.json({ error: payment.reason }, { status: payment.status });
  }

  const estimate = estimateRenovation(
    MODIFICATION_KINDS.map((kind) => ({ kind, quantity: design.quantities[kind] })),
    design.region,
  );
  const { region, total, takeoff } = estimate;
  const t = tenderCopyFor(region.id);
  const system = region.unitSystem;
  const q = (value: number, dimension: "length" | "area" | "count") => formatQuantity(value, dimension, region);

  const line = (kind: string) => estimate.lines.find((l) => l.kind === kind);
  const walls = line("load-bearing-wall-removal");
  const windows = line("window-addition");
  const garage = line("garage-addition");

  const date = new Intl.DateTimeFormat(region.locale, { dateStyle: "medium" }).format(new Date());
  const pct = `${Math.round(CONTINGENCY.min * 100)}–${Math.round(CONTINGENCY.max * 100)}${t.lang.startsWith("en") ? "%" : " %"}`;
  const windowCount = windows ? new Intl.NumberFormat(region.locale).format(windows.quantity) : "";

  const workRows = [
    walls && [t.demoWork, t.demoScope(q(walls.quantity, "length")), t.demoDrivers],
    windows && [t.facadeWork, t.facadeScope(windowCount), t.facadeDrivers],
    garage && [t.garageWork, t.garageScope(q(garage.quantity, "area")), t.garageDrivers],
  ].filter((row): row is string[] => Boolean(row));

  const takeoffRows = [
    takeoff.concreteM3 > 0 && [t.concrete, formatVolume(takeoff.concreteM3, system, region.locale)],
    takeoff.steelKg > 0 && [
      takeoff.beamSection
        ? `${t.steel} (${t.steelDetail(takeoff.beamSection, q(takeoff.beamSpanM, "length"))})`
        : t.steel,
      formatMass(takeoff.steelKg, system, region.locale),
    ],
    takeoff.wasteTonnes > 0 && [t.waste, formatWasteWeight(takeoff.wasteTonnes, system, region.locale)],
  ].filter((row): row is string[] => Boolean(row));

  const e = escapeHtml;
  const html = `<!DOCTYPE html>
<html lang="${e(t.lang)}">
<head>
<meta charset="utf-8">
<title>${e(t.docTitle)}</title>
<style>
  body { font-family: sans-serif; color: #1c1917; padding: 40px; line-height: 1.5; }
  .header { border-bottom: 2px solid #e7e5e4; padding-bottom: 20px; margin-bottom: 30px; }
  .title { font-size: 28px; font-weight: bold; color: #09090b; margin: 0; }
  .subtitle { font-size: 14px; color: #78716c; margin-top: 5px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
  .card { border: 1px solid #e7e5e4; padding: 20px; border-radius: 8px; }
  .card-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; color: #44403c; }
  .price-box { background-color: #f5f5f4; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 30px; }
  .price-range { font-size: 32px; font-weight: bold; color: #16a34a; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
  th, td { border-bottom: 1px solid #e7e5e4; padding: 12px; text-align: left; }
  th { background-color: #fafaf9; color: #57534e; }
  td.num { text-align: right; white-space: nowrap; }
  .footer-disclaimer { font-size: 11px; color: #a8a29e; text-align: center; margin-top: 50px; border-top: 1px solid #e7e5e4; padding-top: 20px; }
</style>
</head>
<body>
  <div class="header">
    <h1 class="title">${e(t.docTitle)}</h1>
    <div class="subtitle">${e(t.regionLabel)}: ${e(region.label)} | ${e(t.dateLabel)}: ${e(date)}</div>
  </div>

  <div class="price-box">
    <div class="card-title">${e(t.budgetTitle)}</div>
    <div class="price-range">${e(formatMoney(total.min, region))} – ${e(formatMoney(total.max, region))}</div>
    <div class="subtitle">${e(t.budgetNote(pct))}</div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">${e(t.specTitle)}</div>
      <p><strong>${e(t.wallLabel)}:</strong> ${walls ? e(q(walls.quantity, "length")) : e(t.no)}</p>
      <p><strong>${e(t.windowsLabel)}:</strong> ${windows ? e(t.windowsCount(windowCount)) : e(t.no)}</p>
      <p><strong>${e(t.garageLabel)}:</strong> ${garage ? e(q(garage.quantity, "area")) : e(t.no)}</p>
    </div>
    <div class="card">
      <div class="card-title">${e(t.nextTitle)}</div>
      ${t.next.map((step, i) => `<p>${i + 1}. ${e(step)}</p>`).join("\n      ")}
    </div>
  </div>

  <h2>${e(t.tableTitle)}</h2>
  <table>
    <thead>
      <tr><th>${e(t.colWork)}</th><th>${e(t.colScope)}</th><th>${e(t.colDrivers)}</th></tr>
    </thead>
    <tbody>
      ${workRows.map(([work, scope, drivers]) => `<tr><td><strong>${e(work!)}</strong></td><td>${e(scope!)}</td><td>${e(drivers!)}</td></tr>`).join("\n      ")}
    </tbody>
  </table>

  <h2>${e(t.takeoffTitle)}</h2>
  <table>
    <tbody>
      ${takeoffRows.map(([label, value]) => `<tr><td>${e(label!)}</td><td class="num">${e(value!)}</td></tr>`).join("\n      ")}
    </tbody>
  </table>

  <div class="footer-disclaimer">${e(t.disclaimer)}</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="RenoEstimate_${region.id}.html"`,
    },
  });
}
