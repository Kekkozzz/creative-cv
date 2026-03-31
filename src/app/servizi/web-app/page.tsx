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

const SERVICE_ID = "web-app";

export const metadata: Metadata = {
  title: "Web App — Prezzi e Pacchetti | Edizioni Duepuntozero",
  description:
    "Applicazioni web su misura con dashboard e autenticazione. Da €2.999, consegna in 7 giorni. Scalabili, sicure, prezzo trasparente.",
  openGraph: {
    title: "Web App — Prezzi e Pacchetti | Edizioni Duepuntozero",
    description:
      "Applicazioni web su misura con dashboard e autenticazione. Da €2.999, consegna in 7 giorni. Scalabili, sicure, prezzo trasparente.",
    type: "website",
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Web App",
  description:
    "Applicazioni web su misura con dashboard e autenticazione. Da €2.999, consegna in 7 giorni. Scalabili, sicure, prezzo trasparente.",
  provider: {
    "@type": "Organization",
    name: "Edizioni Duepuntozero",
  },
  offers: [
    {
      "@type": "Offer",
      name: "Base",
      price: "2999",
      priceCurrency: "EUR",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "5999",
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
      name: "Che tipo di web app potete realizzare?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Qualsiasi: CRM, gestionali, portali, piattaforme SaaS, tool interni. Partiamo dal tuo bisogno specifico.",
      },
    },
    {
      "@type": "Question",
      name: "100 utenti bastano?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Per il tier Base sì. Se cresci, l'upgrade a Pro (1.000 utenti) è semplice e senza downtime.",
      },
    },
    {
      "@type": "Question",
      name: "Posso integrare con i miei sistemi?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pro: integrazioni standard (API, webhook). Premium: integrazioni custom con qualsiasi sistema.",
      },
    },
    {
      "@type": "Question",
      name: "Chi gestisce hosting e infrastruttura?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Noi, incluso nel servizio. Deploy su cloud con scaling automatico.",
      },
    },
    {
      "@type": "Question",
      name: "Come funziona il supporto?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Base: email (48h). Pro: prioritario (24h). Premium: dedicato con canale diretto.",
      },
    },
    {
      "@type": "Question",
      name: "E se ho bisogno di funzionalità aggiuntive dopo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sviluppo incrementale disponibile. Ogni feature aggiuntiva ha un preventivo separato.",
      },
    },
  ],
};

export default function WebAppPage() {
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
      <Breadcrumbs serviceName="Web App" />
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
