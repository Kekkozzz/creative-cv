import { Metadata } from "next";
import { categories } from "@/app/data/packages";
import { getServicePageData } from "@/app/data/service-details";
import ServiceHero from "../components/ServiceHero";
import ProblemSolution from "../components/ProblemSolution";
import TierSelector from "../components/TierSelector";
import FeatureDeepDive from "../components/FeatureDeepDive";
import UseCases from "../components/UseCases";
import AddOnsSection from "../components/AddOnsSection";
import ProcessSteps from "../components/ProcessSteps";
import ComparisonTable from "../components/ComparisonTable";
import ServiceFAQ from "../components/ServiceFAQ";
import ServiceCTA from "../components/ServiceCTA";
import Breadcrumbs from "../components/Breadcrumbs";

const SERVICE_ID = "mobile-app";

export const metadata: Metadata = {
  title: "Mobile App — Prezzi e Pacchetti | Edizioni Duepuntozero",
  description:
    "App iOS e Android native e cross-platform. Da €3.999, consegna in 10 giorni. Design intuitivo, pubblicazione store inclusa.",
  openGraph: {
    title: "Mobile App — Prezzi e Pacchetti | Edizioni Duepuntozero",
    description:
      "App iOS e Android native e cross-platform. Da €3.999, consegna in 10 giorni. Design intuitivo, pubblicazione store inclusa.",
    type: "website",
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Mobile App",
  description:
    "App iOS e Android native e cross-platform. Da €3.999, consegna in 10 giorni. Design intuitivo, pubblicazione store inclusa.",
  provider: {
    "@type": "Organization",
    name: "Edizioni Duepuntozero",
  },
  offers: [
    {
      "@type": "Offer",
      name: "Base",
      price: "3999",
      priceCurrency: "EUR",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "7999",
      priceCurrency: "EUR",
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Meglio cross-platform o nativa?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Cross-platform (Base) è perfetta per app semplici, costa meno e si sviluppa più velocemente. Nativa (Pro/Premium) per performance critiche, animazioni complesse o accesso hardware avanzato.",
      },
    },
    {
      "@type": "Question",
      name: "Quanto costa pubblicare sugli store?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Apple Developer Program: €99/anno. Google Play: €25 una tantum. La pubblicazione è gestita da noi, inclusa nel pacchetto.",
      },
    },
    {
      "@type": "Question",
      name: "Posso aggiornare i contenuti dell'app?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sì, con un CMS backend puoi modificare testi e immagini senza rilasciare nuove versioni sugli store.",
      },
    },
    {
      "@type": "Question",
      name: "L'app funziona su tutti i telefoni?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Supportiamo iOS 15+ e Android 10+, coprendo il 95%+ dei dispositivi attivi.",
      },
    },
    {
      "@type": "Question",
      name: "Come gestite gli aggiornamenti iOS/Android?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Con l'add-on Manutenzione, aggiorniamo l'app ad ogni major release OS (iOS 18, Android 15, ecc.).",
      },
    },
    {
      "@type": "Question",
      name: "Quanto tempo per un aggiornamento dell'app?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bug fix: 24-48h. Nuove feature: preventivo separato con timeline dedicata.",
      },
    },
  ],
};

export default function MobileAppPage() {
  const data = getServicePageData(SERVICE_ID)!;
  const category = categories.find((c) => c.id === SERVICE_ID)!;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Breadcrumbs serviceName="Mobile App" />
      <ServiceHero hero={data.hero} serviceId={SERVICE_ID} lottiePath={category.lottie || ""} />
      <ProblemSolution data={data.problemSolution} />
      <TierSelector serviceId={SERVICE_ID} tierDetails={data.tierDetails} tiers={category.tiers} />
      <FeatureDeepDive features={data.featureDetails} />
      <UseCases cases={data.useCases} />
      <AddOnsSection addOns={category.addOns} />
      <ProcessSteps />
      <ComparisonTable />
      <ServiceFAQ items={data.faq} />
      <ServiceCTA serviceId={SERVICE_ID} />
    </>
  );
}
