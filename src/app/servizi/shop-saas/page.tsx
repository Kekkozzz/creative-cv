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

const SERVICE_ID = "shop-saas";

export const metadata: Metadata = {
  title: "Shop & SaaS — Prezzi e Pacchetti | Edizioni Duepuntozero",
  description:
    "Piattaforme per abbonamenti e servizi online con checkout Stripe. Da €999, consegna in 5 giorni. Pagamenti sicuri, area clienti, prezzo trasparente.",
  openGraph: {
    title: "Shop & SaaS — Prezzi e Pacchetti | Edizioni Duepuntozero",
    description:
      "Piattaforme per abbonamenti e servizi online con checkout Stripe. Da €999, consegna in 5 giorni. Pagamenti sicuri, area clienti, prezzo trasparente.",
    type: "website",
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Shop & SaaS",
  description:
    "Piattaforme per abbonamenti e servizi online con checkout Stripe. Da €999, consegna in 5 giorni. Pagamenti sicuri, area clienti, prezzo trasparente.",
  provider: {
    "@type": "Organization",
    name: "Edizioni Duepuntozero",
  },
  offers: [
    {
      "@type": "Offer",
      name: "Base",
      price: "999",
      priceCurrency: "EUR",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "1999",
      priceCurrency: "EUR",
    },
    {
      "@type": "Offer",
      name: "Premium",
      price: "3999",
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
      name: "Posso vendere solo servizi online e abbonamenti?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sì, l'offerta Shop & SaaS è pensata proprio per servizi digitali, membership e modelli ricorrenti.",
      },
    },
    {
      "@type": "Question",
      name: "Come funzionano i pagamenti?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Stripe gestisce tutto: carte, wallet, addebiti. Ricevi i fondi sul tuo conto in 2-7 giorni lavorativi.",
      },
    },
    {
      "@type": "Question",
      name: "Posso migrare dal mio shop attuale?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sì, con l'add-on Migrazione dati trasferiamo catalogo, clienti e ordini dalla piattaforma attuale.",
      },
    },
    {
      "@type": "Question",
      name: "E le tasse/fatturazione?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Stripe calcola l'IVA automaticamente. Integrazione disponibile con i principali tool di fatturazione italiana.",
      },
    },
    {
      "@type": "Question",
      name: "Quanti piani/offerte posso aggiungere dopo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Entro i limiti del tier scelto. L'upgrade a un tier superiore è possibile in qualsiasi momento.",
      },
    },
    {
      "@type": "Question",
      name: "È sicuro per i pagamenti?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Stripe è certificato PCI DSS Level 1 — lo standard più alto per la sicurezza dei pagamenti online.",
      },
    },
  ],
};

export default function ShopSaasPage() {
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
      <Breadcrumbs serviceName="Shop & SaaS" />
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
