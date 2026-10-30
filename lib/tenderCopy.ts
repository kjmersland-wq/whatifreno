import type { RegionId } from "./costEstimator";

/**
 * All user-facing text of the tender pack, per language. Measurements and money are NOT
 * written here: they are formatted from the region (see lib/units.ts, lib/format.ts) and
 * passed into the template functions, so text, symbols and currency always agree.
 */
export interface TenderCopy {
  readonly lang: string;
  readonly docTitle: string;
  readonly regionLabel: string;
  readonly dateLabel: string;
  /** e.g. "excl. VAT": also used in the budget heading. */
  readonly exclTax: string;
  readonly budgetTitle: string;
  readonly budgetNote: (contingencyPct: string) => string;
  readonly specTitle: string;
  readonly wallLabel: string;
  readonly windowsLabel: string;
  readonly garageLabel: string;
  readonly no: string;
  readonly windowsCount: (n: string) => string;
  readonly nextTitle: string;
  readonly next: readonly [string, string, string];
  readonly tableTitle: string;
  readonly colWork: string;
  readonly colScope: string;
  readonly colDrivers: string;
  readonly demoWork: string;
  readonly demoScope: (length: string) => string;
  readonly demoDrivers: string;
  readonly facadeWork: string;
  readonly facadeScope: (count: string) => string;
  readonly facadeDrivers: string;
  readonly garageWork: string;
  readonly garageScope: (area: string) => string;
  readonly garageDrivers: string;
  readonly takeoffTitle: string;
  readonly concrete: string;
  readonly steel: string;
  readonly steelDetail: (section: string, span: string) => string;
  readonly waste: string;
  readonly disclaimer: string;
}

const nb: TenderCopy = {
  lang: "nb",
  docTitle: "RenoEstimate – Anbudspakke",
  regionLabel: "Region",
  dateLabel: "Dato",
  exclTax: "ekskl. MVA",
  budgetTitle: "Estimert budsjettramme (ekskl. MVA)",
  budgetNote: (p) => `Basert på simulerte strukturelle endringer, inkl. ${p} margin for uforutsett`,
  specTitle: "Prosjektspesifikasjoner",
  wallLabel: "Riving av bærevegg",
  windowsLabel: "Nye vindusåpninger",
  garageLabel: "Ekstern garasje",
  no: "Nei",
  windowsCount: (n) => `${n} stk`,
  nextTitle: "Neste steg",
  next: [
    "Send dette dokumentet til 2–3 lokale godkjente håndverkere.",
    "Be om fastpris basert på spesifiserte mengder.",
    "Ved bærevegg: innhent vurdering fra statiker før arbeid starter.",
  ],
  tableTitle: "Mengde- og materialspesifikasjon",
  colWork: "Tiltak",
  colScope: "Simulert omfang",
  colDrivers: "Kostnadsdrivere inkludert",
  demoWork: "Strukturell riving",
  demoScope: (l) => `${l} bærevegg`,
  demoDrivers: "Midlertidig avstivning, stålbjelke, statikk, avfallshåndtering og finish.",
  facadeWork: "Fasadeendring",
  facadeScope: (n) => `${n} nye vinduer`,
  facadeDrivers: "Utskjæring i stenderverk, overligger, tolags energiglass, listing og utbedring.",
  garageWork: "Eksternt byggverk",
  garageScope: (a) => `${a} garasje`,
  garageDrivers: "Støpt såle og kantbjelker, bindingsverk, tak, tekking, port og byggesøknad.",
  takeoffTitle: "Estimerte materialmengder",
  concrete: "Betong",
  steel: "Konstruksjonsstål",
  steelDetail: (s, span) => `${s}, fri spennvidde ${span}`,
  waste: "Avfall til deponi",
  disclaimer:
    "Dette dokumentet inneholder budsjettindikasjoner, ikke et tilbud. Faktiske priser varierer med grunnforhold og materialstandard.",
};

const sv: TenderCopy = {
  lang: "sv",
  docTitle: "RenoEstimate – Anbudspaket",
  regionLabel: "Region",
  dateLabel: "Datum",
  exclTax: "exkl. moms",
  budgetTitle: "Uppskattad budgetram (exkl. moms)",
  budgetNote: (p) => `Baserad på simulerade strukturella ändringar, inkl. ${p} marginal för oförutsett`,
  specTitle: "Projektspecifikation",
  wallLabel: "Rivning av bärande vägg",
  windowsLabel: "Nya fönsteröppningar",
  garageLabel: "Fristående garage",
  no: "Nej",
  windowsCount: (n) => `${n} st`,
  nextTitle: "Nästa steg",
  next: [
    "Skicka detta dokument till 2–3 lokala, behöriga hantverkare.",
    "Be om fast pris baserat på de angivna mängderna.",
    "Vid bärande vägg: låt en konstruktör bedöma innan arbetet startar.",
  ],
  tableTitle: "Mängd- och materialspecifikation",
  colWork: "Åtgärd",
  colScope: "Simulerad omfattning",
  colDrivers: "Ingående kostnadsdrivare",
  demoWork: "Konstruktiv rivning",
  demoScope: (l) => `${l} bärande vägg`,
  demoDrivers: "Tillfällig avstämning, stålbalk, konstruktion, avfallshantering och slutbehandling.",
  facadeWork: "Fasadändring",
  facadeScope: (n) => `${n} nya fönster`,
  facadeDrivers: "Håltagning i regelstomme, överligger, tvåglasfönster, foder och återställning.",
  garageWork: "Fristående byggnad",
  garageScope: (a) => `${a} garage`,
  garageDrivers: "Gjuten platta och sulor, regelstomme, tak, takläggning, port och bygglovsansökan.",
  takeoffTitle: "Beräknade materialmängder",
  concrete: "Betong",
  steel: "Konstruktionsstål",
  steelDetail: (s, span) => `${s}, fri spännvidd ${span}`,
  waste: "Avfall till deponi",
  disclaimer:
    "Detta dokument innehåller budgetindikationer, inte en offert. Faktiska priser varierar med markförhållanden och materialstandard.",
};

const da: TenderCopy = {
  lang: "da",
  docTitle: "RenoEstimate – Tilbudspakke",
  regionLabel: "Region",
  dateLabel: "Dato",
  exclTax: "ekskl. moms",
  budgetTitle: "Estimeret budgetramme (ekskl. moms)",
  budgetNote: (p) => `Baseret på simulerede konstruktive ændringer, inkl. ${p} margen til det uforudsete`,
  specTitle: "Projektspecifikation",
  wallLabel: "Nedrivning af bærende væg",
  windowsLabel: "Nye vinduesåbninger",
  garageLabel: "Fritliggende garage",
  no: "Nej",
  windowsCount: (n) => `${n} stk.`,
  nextTitle: "Næste skridt",
  next: [
    "Send dette dokument til 2–3 lokale, godkendte håndværkere.",
    "Bed om fast pris baseret på de angivne mængder.",
    "Ved bærende væg: indhent vurdering fra en statiker, før arbejdet starter.",
  ],
  tableTitle: "Mængde- og materialespecifikation",
  colWork: "Indgreb",
  colScope: "Simuleret omfang",
  colDrivers: "Medregnede omkostningsdrivere",
  demoWork: "Konstruktiv nedrivning",
  demoScope: (l) => `${l} bærende væg`,
  demoDrivers: "Midlertidig afstivning, stålbjælke, statik, affaldshåndtering og afslutning.",
  facadeWork: "Facadeændring",
  facadeScope: (n) => `${n} nye vinduer`,
  facadeDrivers: "Udskæring i skelet, overligger, tolagsrude, indfatning og istandsættelse.",
  garageWork: "Fritstående bygning",
  garageScope: (a) => `${a} garage`,
  garageDrivers: "Støbt bundplade og soklen, skelet, tag, tagdækning, port og byggeansøgning.",
  takeoffTitle: "Estimerede materialemængder",
  concrete: "Beton",
  steel: "Konstruktionsstål",
  steelDetail: (s, span) => `${s}, frit spænd ${span}`,
  waste: "Affald til deponi",
  disclaimer:
    "Dette dokument indeholder budgetindikationer, ikke et tilbud. Faktiske priser varierer med jordbundsforhold og materialestandard.",
};

const fi: TenderCopy = {
  lang: "fi",
  docTitle: "RenoEstimate – Tarjouspyyntöpaketti",
  regionLabel: "Alue",
  dateLabel: "Päivämäärä",
  exclTax: "ilman ALV",
  budgetTitle: "Arvioitu budjettihaarukka (ilman ALV)",
  budgetNote: (p) => `Perustuu simuloituihin rakenteellisiin muutoksiin, sis. ${p} varaus odottamattomille`,
  specTitle: "Hankkeen määrittely",
  wallLabel: "Kantavan seinän purku",
  windowsLabel: "Uudet ikkuna-aukot",
  garageLabel: "Erillinen autotalli",
  no: "Ei",
  windowsCount: (n) => `${n} kpl`,
  nextTitle: "Seuraavat askeleet",
  next: [
    "Lähetä tämä asiakirja 2–3 paikalliselle pätevälle urakoitsijalle.",
    "Pyydä kiinteä hinta määritellyillä määrillä.",
    "Kantavan seinän kohdalla: pyydä rakennesuunnittelijan arvio ennen töiden aloitusta.",
  ],
  tableTitle: "Määrä- ja materiaaliluettelo",
  colWork: "Toimenpide",
  colScope: "Simuloitu laajuus",
  colDrivers: "Mukaan lasketut kustannustekijät",
  demoWork: "Rakenteellinen purku",
  demoScope: (l) => `${l} kantava seinä`,
  demoDrivers: "Tilapäinen tuenta, teräspalkki, rakennesuunnittelu, jätehuolto ja viimeistely.",
  facadeWork: "Julkisivumuutos",
  facadeScope: (n) => `${n} uutta ikkunaa`,
  facadeDrivers: "Aukon sahaus runkoon, yläpuolinen tuki, kaksinkertainen lasitus, listat ja korjaukset.",
  garageWork: "Erillinen rakennus",
  garageScope: (a) => `${a} autotalli`,
  garageDrivers: "Valettu laatta ja perustukset, runko, katto, katteet, ovi ja rakennuslupa.",
  takeoffTitle: "Arvioidut materiaalimäärät",
  concrete: "Betoni",
  steel: "Rakenneteräs",
  steelDetail: (s, span) => `${s}, vapaa jänneväli ${span}`,
  waste: "Kaatopaikalle vietävä jäte",
  disclaimer:
    "Tämä asiakirja sisältää budjettiarvioita, ei tarjousta. Todelliset hinnat vaihtelevat maaperän ja materiaalitason mukaan.",
};

const en: TenderCopy = {
  lang: "en",
  docTitle: "RenoEstimate – Tender Pack",
  regionLabel: "Region",
  dateLabel: "Date",
  exclTax: "excl. VAT",
  budgetTitle: "Estimated budget range (excl. VAT)",
  budgetNote: (p) => `Based on simulated structural changes, incl. a ${p} allowance for the unexpected`,
  specTitle: "Project specification",
  wallLabel: "Load-bearing wall removal",
  windowsLabel: "New window openings",
  garageLabel: "External garage",
  no: "No",
  windowsCount: (n) => `${n} pcs`,
  nextTitle: "Next steps",
  next: [
    "Send this document to 2–3 local licensed contractors.",
    "Ask for a fixed price based on the quantities listed.",
    "For a load-bearing wall: get a structural engineer's assessment before work starts.",
  ],
  tableTitle: "Quantities and material specification",
  colWork: "Work item",
  colScope: "Simulated scope",
  colDrivers: "Cost drivers included",
  demoWork: "Structural demolition",
  demoScope: (l) => `${l} load-bearing wall`,
  demoDrivers: "Temporary propping, steel beam, engineering, waste handling and finishing.",
  facadeWork: "Facade alteration",
  facadeScope: (n) => `${n} new windows`,
  facadeDrivers: "Opening cut in the frame, lintel, standard double glazing, trim and making good.",
  garageWork: "Detached structure",
  garageScope: (a) => `${a} garage`,
  garageDrivers: "Concrete slab and footings, framing, roof, roofing, door and building application.",
  takeoffTitle: "Estimated material quantities",
  concrete: "Concrete",
  steel: "Structural steel",
  steelDetail: (s, span) => `${s}, clear span ${span}`,
  waste: "Waste for disposal",
  disclaimer:
    "This document contains budget indications, not a quote. Actual prices vary with ground conditions and material standard.",
};

const enUS: TenderCopy = {
  ...en,
  lang: "en-US",
  exclTax: "excl. sales tax",
  budgetTitle: "Estimated budget range (excl. sales tax)",
  facadeDrivers: "Opening cut in the framing, header, standard double glazing, trim and making good.",
  garageDrivers: "Concrete slab and footings, framing, roof, roofing, garage door and building permit.",
  next: [
    "Send this document to 2–3 local licensed contractors.",
    "Ask for a fixed price based on the quantities listed.",
    "For a load-bearing wall: get a structural engineer's assessment and a permit before work starts.",
  ],
};

const COPY_BY_REGION: Readonly<Record<RegionId, TenderCopy>> = {
  norway: nb,
  sweden: sv,
  denmark: da,
  finland: fi,
  usa: enUS,
  global: en,
};

export const tenderCopyFor = (region: RegionId): TenderCopy => COPY_BY_REGION[region];
