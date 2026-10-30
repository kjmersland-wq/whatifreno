import type { Metadata } from "next";
import { ContactEmail, LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: "Personvernerklæring — RenoEstimate" };

const SECTIONS: readonly LegalSection[] = [
  {
    heading: "Hvem er behandlingsansvarlig",
    body: [
      <>
        {LEGAL.sellerName} (org.nr. {LEGAL.orgNumber}) er behandlingsansvarlig for personopplysninger i
        RenoEstimate. Spørsmål om personvern kan sendes til <ContactEmail />.
      </>,
    ],
  },
  {
    heading: "Dine designdata er konfidensielle",
    body: [
      "Det du tegner, simulerer og laster opp hos oss, som planløsninger, 3D-vektorer og designmengder (for eksempel meter vegg, antall vinduer og areal), er strengt konfidensielt. Vi selger dem aldri, deler dem ikke med håndverkere, leverandører eller andre tredjeparter for markedsføring, og bruker dem ikke til å selge deg noe.",
      "Du bestemmer selv hvem som får se anbudspakken: den er din, og det er du som sender den til håndverkere du ønsker tilbud fra.",
    ],
  },
  {
    heading: "Hvilke opplysninger vi behandler",
    body: [],
    list: [
      "Designmengder og valgt region. Disse sendes til oss når du går til kassen og når du laster ned en anbudspakke, slik at vi kan beregne og lage dokumentet. Vi lagrer dem ikke i en kundedatabase.",
      "Språk og tidssone fra nettleseren din. De brukes bare i nettleseren for å velge riktig enhetssystem og valuta, og sendes ikke til oss.",
      "Betalingsopplysninger. Betalingen håndteres helt av Paddle. Vi ser aldri kortnummer. Vi mottar en transaksjons-ID fra Paddle som vi bruker til å bekrefte at en pakke er betalt.",
      "Tekniske data som IP-adresse og nettlesertype, som behandles av hosting-leverandøren vår i driftsloggene.",
    ],
  },
  {
    heading: "Hvorfor og på hvilket grunnlag",
    body: [],
    list: [
      "For å levere tjenesten og anbudspakken du har kjøpt (avtale, GDPR art. 6 nr. 1 b).",
      "For å bekrefte betaling og forebygge misbruk (berettiget interesse, art. 6 nr. 1 f).",
      "For å oppfylle regnskaps- og avgiftsplikter. Dette håndteres i hovedsak av Paddle som forhandler (rettslig forpliktelse, art. 6 nr. 1 c).",
      "For å holde tjenesten sikker og stabil gjennom driftslogger (berettiget interesse).",
    ],
  },
  {
    heading: "Hvem vi deler med",
    body: [
      "Vi bruker et fåtall leverandører for å drive tjenesten:",
    ],
    list: [
      "Paddle.com Market Limited: forhandler og betalingsbehandler. Paddle er selvstendig behandlingsansvarlig for betalingsdata og har egen personvernerklæring.",
      "Cloudflare: hosting og levering av nettstedet.",
    ],
  },
  {
    heading: "Informasjonskapsler og sporing",
    body: [
      "Vi bruker ingen sporings- eller markedsføringskapsler og ingen analyseverktøy som følger deg på tvers av nettsteder. Paddles kasse kan sette egne nødvendige kapsler for å gjennomføre og sikre betalingen.",
    ],
  },
  {
    heading: "Hvor lenge vi beholder opplysninger",
    body: [
      "Designdata du sender til oss behandles for å lage dokumentet og lagres ikke varig. Driftslogger slettes etter kort tid. Opplysninger som Paddle behandler i egenskap av forhandler, oppbevares etter Paddles retningslinjer og lovpålagte krav til regnskap.",
    ],
  },
  {
    heading: "Dine rettigheter",
    body: [
      "Du har rett til innsyn, retting og sletting, til å begrense eller protestere mot behandling, og til dataportabilitet der det gjelder. Send en henvendelse til oss, så svarer vi innen 30 dager.",
      "Er du uenig i hvordan vi behandler opplysninger, kan du klage til Datatilsynet (datatilsynet.no).",
    ],
  },
  {
    heading: "Endringer",
    body: [
      "Vi oppdaterer denne erklæringen hvis tjenesten eller regelverket endrer seg. Datoen øverst viser siste revisjon. Behandler vi data på nye måter, for eksempel hvis du senere kan laste opp egne planløsninger, informerer vi om det før det tas i bruk.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Personvernerklæring"
      intro="Det du designer er ditt. Her forklarer vi hvilke opplysninger vi trenger, hvorfor, og hva vi aldri gjør med dem."
      sections={SECTIONS}
    />
  );
}
