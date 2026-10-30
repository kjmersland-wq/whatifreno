import type { Metadata } from "next";
import Link from "next/link";
import { ContactEmail, LegalPage, type LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Refusjonsregler — RenoEstimate" };

const SECTIONS: readonly LegalSection[] = [
  {
    heading: "Kort fortalt",
    body: [
      "Anbudspakken leveres digitalt og umiddelbart etter kjøp. Derfor gjelder dette: du kan få pengene tilbake innen 14 dager etter kjøpet, så lenge du ikke har startet nedlastingen av den ferdige pakken.",
    ],
  },
  {
    heading: "Hvorfor nedlastingen er skillet",
    body: [
      "Mengdespesifikasjonen og rapporten er ferdig og i dine hender i det du laster den ned, og den kan ikke leveres tilbake. Så lenge du ikke har lastet ned, har du ikke mottatt det du har kjøpt, og da refunderer vi gjerne.",
      "Når du starter nedlastingen, begynner leveringen av det digitale innholdet. Du samtykker da til at leveringen starter og erkjenner at angreretten for digitalt innhold bortfaller, slik loven tillater.",
    ],
  },
  {
    heading: "Slik ber du om refusjon",
    body: [
      <>
        Send en e-post til <ContactEmail /> innen 14 dager fra kjøpsdatoen. Ta med transaksjons-ID-en
        (den står på kvitteringen fra Paddle) og e-postadressen du brukte i kassen.
      </>,
      "Vi bekrefter forespørselen, kontrollerer at nedlastingen ikke er startet, og behandler refusjonen uten unødvendig opphold.",
    ],
  },
  {
    heading: "Når pengene kommer",
    body: [
      "Refusjonen går tilbake til betalingsmåten du brukte, og det er Paddle som utfører den. Pengene er vanligvis på kontoen innen 5–10 virkedager, avhengig av banken din.",
    ],
  },
  {
    heading: "Etter at pakken er lastet ned",
    body: ["Refusjon er som hovedregel ikke mulig etter nedlasting. Vi gjør likevel unntak, og du beholder lovfestede rettigheter, hvis:"],
    list: [
      "dokumentet har en teknisk feil eller ikke samsvarer med designet du betalte for",
      "du ble belastet flere ganger for samme kjøp",
      "nedlastingen mislyktes og du ikke fikk filen",
    ],
  },
  {
    heading: "Estimater og refusjon",
    body: [
      <>
        At et estimat avviker fra en håndverkers faktiske tilbud, gir ikke i seg selv rett til refusjon.
        Tallene er budsjettintervaller, som forklart i{" "}
        <Link href="/terms" className="text-sky-200 underline-offset-4 hover:underline">
          Vilkår for bruk
        </Link>
        .
      </>,
    ],
  },
  {
    heading: "Spørsmål",
    body: [
      <>
        Er du usikker på noe, skriv til <ContactEmail />. Vi hjelper deg gjerne, uten salgstrykk.
      </>,
    ],
  },
];

export default function RefundsPage() {
  return (
    <LegalPage
      title="Refusjonsregler"
      intro="Enkelt og åpent: 14 dagers refusjon så lenge du ikke har lastet ned den ferdige pakken."
      sections={SECTIONS}
    />
  );
}
