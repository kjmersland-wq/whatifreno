export const runtime = "edge";

import { NextResponse } from "next/server";
import { MODIFICATION_KINDS, estimateRenovation } from "@/lib/costEstimator";
import { isEmptyDesign, sanitizeDesign } from "@/lib/design";
import { formatMoney } from "@/lib/format";
import { verifyPaidTransaction } from "@/lib/paddleServer";

/**
 * POST /api/export — returns a print-friendly tender pack (HTML, Norwegian). PAID FEATURE.
 * Body: { transactionId: string, region: RegionId, quantities: Record<ModificationKind, number> }
 * The document is only compiled after Paddle confirms the transaction is paid and was created
 * for this exact design. The price range is recomputed here; client-supplied prices are never trusted.
 */

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function POST(request: Request) {
  let body: { transactionId?: unknown; region?: unknown; quantities?: unknown } | null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ugyldig JSON" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 });
  }

  const raw = (typeof body.quantities === "object" && body.quantities !== null ? body.quantities : {}) as Record<string, unknown>;
  const design = sanitizeDesign(body.region, (kind) => raw[kind]);
  if (isEmptyDesign(design)) {
    return NextResponse.json({ error: "Ingen tiltak valgt" }, { status: 400 });
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

  const line = (kind: string) => estimate.lines.find((l) => l.kind === kind);
  const walls = line("load-bearing-wall-removal");
  const windows = line("window-addition");
  const garage = line("garage-addition");
  const { region: profile, total } = estimate;

  const html = `<!DOCTYPE html>
<html lang="nb">
<head>
<meta charset="utf-8">
<title>RenoEstimate – Anbudspakke</title>
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
  .footer-disclaimer { font-size: 11px; color: #a8a29e; text-align: center; margin-top: 50px; border-top: 1px solid #e7e5e4; padding-top: 20px; }
</style>
</head>
<body>
  <div class="header">
    <h1 class="title">RenoEstimate – Anbudspakke</h1>
    <div class="subtitle">Region: ${escapeHtml(profile.label)} | Dato: ${new Date().toLocaleDateString("nb-NO")}</div>
  </div>

  <div class="price-box">
    <div class="card-title">Estimert budsjettramme (ekskl. MVA)</div>
    <div class="price-range">${escapeHtml(formatMoney(total.min, profile))} – ${escapeHtml(formatMoney(total.max, profile))}</div>
    <div class="subtitle">Basert på simulerte strukturelle endringer, inkl. 5–18 % margin for uforutsett</div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Prosjektspesifikasjoner</div>
      <p><strong>Riving av bærevegg:</strong> ${walls ? `${walls.quantity} meter` : "Nei"}</p>
      <p><strong>Nye vindusåpninger:</strong> ${windows ? `${windows.quantity} stk` : "Nei"}</p>
      <p><strong>Ekstern garasje:</strong> ${garage ? `${garage.quantity} m²` : "Nei"}</p>
    </div>
    <div class="card">
      <div class="card-title">Neste steg</div>
      <p>1. Send dette dokumentet til 2–3 lokale godkjente håndverkere.</p>
      <p>2. Be om fastpris basert på spesifiserte mengder.</p>
      <p>3. Ved bærevegg: innhent vurdering fra statiker før arbeid starter.</p>
    </div>
  </div>

  <h2>Mengde- og materialspesifikasjon</h2>
  <table>
    <thead>
      <tr><th>Tiltak</th><th>Simulert omfang</th><th>Kostnadsdrivere inkludert</th></tr>
    </thead>
    <tbody>
      ${walls ? `<tr><td><strong>Strukturell riving</strong></td><td>${walls.quantity} m bærevegg</td><td>Midlertidig avstivning, drager, statikk, avfallshåndtering og finish.</td></tr>` : ""}
      ${windows ? `<tr><td><strong>Fasadeendring</strong></td><td>${windows.quantity} nye vinduer</td><td>Utskjæring i stenderverk, overligger, fuktsikring, isolering, beslag og listing.</td></tr>` : ""}
      ${garage ? `<tr><td><strong>Eksternt byggverk</strong></td><td>${garage.quantity} m² garasje</td><td>Støpt såle, bindingsverk, tak, tekking, port og byggesøknad.</td></tr>` : ""}
    </tbody>
  </table>

  <div class="footer-disclaimer">
    Dette dokumentet inneholder budsjettindikasjoner, ikke et tilbud. Faktiske priser varierer med grunnforhold og materialstandard.
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": 'attachment; filename="RenoEstimate_Anbudspakke.html"',
    },
  });
}
