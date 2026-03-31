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

const SERVICE_ID = "siti-web";

export const metadata: Metadata = {
  title: "Siti Web — Prezzi e Pacchetti | Edizioni Duepuntozero",
  description:
    "Siti web responsive, veloci e ottimizzati per Google. Da €499, consegna in 3 giorni. Design su misura, SEO inclusa, prezzo trasparente.",
  openGraph: {
    title: "Siti Web — Prezzi e Pacchetti | Edizioni Duepuntozero",
    description:
      "Siti web responsive, veloci e ottimizzati per Google. Da €499, consegna in 3 giorni. Design su misura, SEO inclusa, prezzo trasparente.",
    type: "website",
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Siti Web",
  description:
    "Siti web responsive, veloci e ottimizzati per Google. Da €499, consegna in 3 giorni. Design su misura, SEO inclusa, prezzo trasparente.",
  provider: {
    "@type": "Organization",
    name: "Edizioni Duepuntozero",
  },
  offers: [
    {
      "@type": "Offer",
      name: "Base",
      price: "499",
      priceCurrency: "EUR",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "999",
      priceCurrency: "EUR",
    },
    {
      "@type": "Offer",
      name: "Premium",
      price: "1999",
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
      name: "Quanto tempo ci vuole per avere il sito online?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Base: 3-5 giorni lavorativi. Pro: 5-7 giorni. Premium: 7-10 giorni. I tempi partono dall'approvazione del design e dalla ricezione dei contenuti.",
      },
    },
    {
      "@type": "Question",
      name: "Cosa devo fornire io?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Logo, testi (o aggiungere l'add-on Copywriting), immagini e le informazioni sulla tua attività. Ti guidiamo noi con un brief strutturato.",
      },
    },
    {
      "@type": "Question",
      name: "Posso aggiornare il sito da solo dopo la consegna?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Con i pacchetti Pro e Premium sì, grazie al CMS integrato. Con il pacchetto Base, le modifiche richiedono il nostro intervento (coperto dalla manutenzione).",
      },
    },
    {
      "@type": "Question",
      name: "Il dominio e l'hosting sono inclusi?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Il dominio è a carico tuo (da €10/anno). L'hosting è disponibile come add-on gestito a €9/mese, oppure puoi usare il tuo hosting.",
      },
    },
    {
      "@type": "Question",
      name: "E se non mi piace il design?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ogni pacchetto include revisioni (1 per Base, 3 per Pro, illimitate per Premium). Inoltre, con la nostra preview AI puoi vedere un'anteprima del sito prima ancora di iniziare.",
      },
    },
    {
      "@type": "Question",
      name: "Come funziona il pagamento?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "50% all'ordine, 50% alla consegna. Per i pacchetti Premium con preventivo personalizzato, definiamo insieme le milestone di pagamento.",
      },
    },
  ],
};

export default function SitiWebPage() {
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
      <Breadcrumbs serviceName="Siti Web" />
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
