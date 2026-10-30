import type { Metadata } from "next";
import Link from "next/link";
import { ContactEmail, LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: "Vilkår for bruk — RenoEstimate" };

const SECTIONS: readonly LegalSection[] = [
  {
    heading: "Hva RenoEstimate er",
    body: [
      "RenoEstimate lar deg utforske ideer for hjemmet ditt i 3D og se et veiledende budsjettintervall ta form underveis. Du kan kjøpe en anbudspakke: et utskriftsklart dokument med mengder og kostnadsdrivere som du kan sende til håndverkere for å be om fastpris.",
      `Tjenesten tilbys av ${LEGAL.sellerName} (org.nr. ${LEGAL.orgNumber}). Ved å bruke tjenesten godtar du disse vilkårene.`,
    ],
  },
  {
    heading: "Estimatene er budsjettintervaller, ikke avtaler",
    body: [
      "Alle tall du ser er kvalifiserte budsjettintervaller (fra og til), beregnet ut fra generelle markedssatser, regionale indekser og mengder du selv har simulert. De er ment som et ærlig utgangspunkt for planlegging, ikke som et tilbud.",
      "Et estimat er ikke en bindende prisavtale, ikke en entreprisekontrakt og ikke en garanti for hva en håndverker vil ta betalt. Faktiske priser påvirkes av blant annet grunnforhold, tilstand på eksisterende konstruksjon, materialvalg, tilgjengelighet og lokale forhold.",
      "RenoEstimate er heller ikke en rådgivende ingeniørtjeneste. Verken estimater, 3D-visninger eller anbudspakker er statiske beregninger, konstruksjonstegninger eller godkjenning av noe tiltak.",
    ],
  },
  {
    heading: "Bærende konstruksjoner krever en statiker",
    body: [
      "Før en bærevegg fjernes eller endres må tiltaket vurderes og dokumenteres av en kvalifisert byggteknisk rådgiver (statiker). Mange tiltak er også søknadspliktige etter plan- og bygningsloven, og du er selv ansvarlig for å undersøke og innhente nødvendige tillatelser.",
      "Beskrivelsen av bærevegger i anbudspakken, inkludert antatt bjelketype og spennvidde, er en forenklet forutsetning for prisberegning. Den skal ikke brukes til å dimensjonere eller utføre arbeid.",
    ],
  },
  {
    heading: "30 og 90 dagers grenser",
    body: [
      "For at tallene skal være til å stole på, gjelder to tidsgrenser for en kjøpt anbudspakke:",
    ],
    list: [
      "30 dager: prisintervallene i pakken er veiledende i 30 dager fra kjøpsdato. Material- og arbeidspriser endrer seg, så etter 30 dager bør du beregne på nytt før du bruker tallene i en tilbudsforespørsel.",
      "90 dager: beskrivelsen av bærende tiltak i pakken er ment som underlag for tilbudsforespørsler i inntil 90 dager fra kjøpsdato. Etter det bør tiltaket vurderes på nytt, og du må i alle tilfeller ha en statikervurdering før arbeid starter.",
    ],
  },
  {
    heading: "Kjøp og betaling",
    body: [
      "Anbudspakken er et engangskjøp for ett bestemt design (de mengdene og den regionen du har simulert). Betalingen håndteres av Paddle.com Market Limited, som er forhandler (merchant of record) og står for betaling, merverdiavgift eller salgsskatt og kvittering. Endelig pris og eventuelle avgifter vises i kassen før du betaler.",
      "En betaling gjelder kun designet den ble gjort for. Endrer du mengder eller region, må du kjøpe en ny pakke.",
    ],
  },
  {
    heading: "Ditt ansvar",
    body: ["Du er ansvarlig for hvordan du bruker informasjonen i tjenesten. Det betyr blant annet at du:"],
    list: [
      "kontrollerer mengder og mål mot den virkelige boligen før du ber om tilbud",
      "bruker autoriserte håndverkere og innhenter statikervurdering og tillatelser der det kreves",
      "ikke baserer økonomiske beslutninger utelukkende på et estimat",
    ],
  },
  {
    heading: "Ansvarsbegrensning",
    body: [
      "Vi gjør vårt beste for å holde tjenesten og beregningene nøyaktige, men leverer dem uten garantier om at estimatene treffer en faktisk pris. Vi er ikke ansvarlige for tap som skyldes at et estimat avviker fra faktiske kostnader, eller for arbeid utført på grunnlag av tjenesten.",
      "Dette begrenser ikke ansvar vi ikke kan begrense etter loven, for eksempel ved forsett eller grov uaktsomhet, og det påvirker ikke dine ufravikelige rettigheter som forbruker.",
    ],
  },
  {
    heading: "Angrerett og refusjon",
    body: [
      <>
        Anbudspakken leveres digitalt og umiddelbart. Hvordan refusjon fungerer, står i våre{" "}
        <Link href="/refunds" className="text-sky-200 underline-offset-4 hover:underline">
          Refusjonsregler
        </Link>
        .
      </>,
    ],
  },
  {
    heading: "Immaterielle rettigheter",
    body: [
      "Tjenesten, designet og beregningsmodellene tilhører oss. Du får en personlig, ikke-eksklusiv rett til å bruke anbudspakken du har kjøpt til ditt eget boligprosjekt, inkludert å sende den til håndverkere. Du eier designet og mengdene du selv har simulert.",
    ],
  },
  {
    heading: "Lovvalg og tvister",
    body: [
      "Vilkårene reguleres av norsk rett. Er du forbruker, beholder du de rettighetene du har etter ufravikelige forbrukerregler i landet der du bor. Kontakt oss først, så løser vi det helst i fellesskap. Du kan også ta kontakt med Forbrukertilsynet.",
    ],
  },
  {
    heading: "Endringer og kontakt",
    body: [
      "Vi kan oppdatere vilkårene. Datoen øverst viser siste revisjon, og endringer gjelder for kjøp etter at de er publisert.",
      <>
        Spørsmål? Kontakt oss på <ContactEmail />.
      </>,
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Vilkår for bruk"
      intro="Kort fortalt: tallene våre er ærlige budsjettintervaller som hjelper deg å planlegge, ikke en bindende pris eller en ingeniørvurdering. Her er hele bildet."
      sections={SECTIONS}
    />
  );
}
