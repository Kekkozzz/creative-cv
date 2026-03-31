// app/data/service-details.ts
// Single source of truth for per-service page content.
// Prices and feature comparisons stay in packages.ts.
// Add-ons also stay in packages.ts — not duplicated here.

export type ServiceHeroData = {
  label: string;           // "01 — Siti Web"
  headline: string;        // "Il tuo sito web,"
  headlineAccent: string;  // "chiavi in mano."
  description: string;
  priceLabel: string;      // "Da €499 · Consegna da 3 giorni"
};

export type PainPoint = { text: string; bold: string };

export type ProblemSolutionData = {
  problems: PainPoint[];
  solutions: PainPoint[];
};

export type TierDetail = {
  key: "base" | "pro" | "premium";
  tagline: string;
  description: string;
  highlighted: boolean;    // true for "Più scelto" tier
  includes: string;
  ctaType: "wizard" | "contact";  // wizard for fixed-price, contact for "su preventivo"
};

export type FeatureIcon =
  | "palette"
  | "search"
  | "file-text"
  | "chart-bar"
  | "pen-square"
  | "credit-card"
  | "refresh-cw"
  | "user"
  | "tag"
  | "zap"
  | "mail"
  | "lock"
  | "database"
  | "bell"
  | "link"
  | "smartphone"
  | "wifi-off"
  | "store"
  | "settings";

export type FeatureDetail = {
  icon: FeatureIcon;
  name: string;
  description: string;
  tiers: string;           // e.g. "Pro/Premium" or "Tutti i tier"
};

export type UseCase = {
  title: string;
  description: string;
  recommendedTier: string;
};

export type FAQItem = {
  question: string;
  answer: string;
};

export type ServicePageData = {
  id: string;
  hero: ServiceHeroData;
  problemSolution: ProblemSolutionData;
  tierDetails: TierDetail[];
  featureDetails: FeatureDetail[];
  useCases: UseCase[];
  faq: FAQItem[];
};

// ─── SITI WEB ────────────────────────────────────────────────────────────────

const sitiWeb: ServicePageData = {
  id: "siti-web",
  hero: {
    label: "01 — Siti Web",
    headline: "Il tuo sito web,",
    headlineAccent: "chiavi in mano.",
    description:
      "Siti responsive, veloci e ottimizzati per Google. Dal biglietto da visita digitale al sito corporate completo — design su misura, consegna in giorni, non mesi.",
    priceLabel: "Da €499 · Consegna da 3 giorni · Preview AI inclusa",
  },
  problemSolution: {
    problems: [
      {
        text: "Il 75% dei clienti giudica la credibilità di un'azienda dal suo sito",
        bold: "75% dei clienti",
      },
      {
        text: "Un sito lento perde il 53% del traffico mobile",
        bold: "53% del traffico mobile",
      },
      {
        text: "Senza SEO, il tuo sito è invisibile su Google",
        bold: "invisibile su Google",
      },
      {
        text: "Le grandi agenzie chiedono €3.000-€15.000 e mesi di attesa",
        bold: "€3.000-€15.000",
      },
    ],
    solutions: [
      {
        text: "Design premium a prezzo accessibile",
        bold: "premium",
      },
      {
        text: "Performance ottimizzate — Core Web Vitals in verde",
        bold: "ottimizzate",
      },
      {
        text: "SEO on-page inclusa nei tier Pro e Premium",
        bold: "inclusa",
      },
      {
        text: "Consegna in 3-10 giorni, non mesi",
        bold: "3-10 giorni",
      },
    ],
  },
  tierDetails: [
    {
      key: "base",
      tagline: "Il tuo biglietto da visita digitale",
      description:
        "Perfetto per chi inizia. Un sito da 1-3 pagine, pulito e responsive, con design template personalizzabile. Ideale per professionisti, freelancer e piccole attività che vogliono essere presenti online senza complessità.",
      highlighted: false,
      includes:
        "1-3 pagine · Design template · Responsive · Form contatto · 1 revisione · Consegna 3-5 giorni",
      ctaType: "wizard",
    },
    {
      key: "pro",
      tagline: "Il sito che lavora per te",
      description:
        "Il pacchetto completo. Design custom, 5-8 pagine, SEO base integrata, CMS per gestire i contenuti in autonomia e Google Analytics. Per aziende che vogliono un sito che genera lead e costruisce credibilità.",
      highlighted: true,
      includes:
        "5-8 pagine · Design custom · SEO base · CMS · Google Analytics · 3 revisioni · Consegna 5-7 giorni",
      ctaType: "wizard",
    },
    {
      key: "premium",
      tagline: "La tua presenza digitale definitiva",
      description:
        "Il top della gamma. Pagine illimitate, design premium su misura, SEO avanzata, blog integrato e revisioni illimitate. Per chi vuole dominare il proprio mercato online con un sito che impressiona e converte.",
      highlighted: false,
      includes:
        "Pagine illimitate · Design premium su misura · SEO avanzata · CMS · Blog · Analytics · Revisioni illimitate · Consegna 7-10 giorni",
      ctaType: "wizard",
    },
  ],
  featureDetails: [
    {
      icon: "palette",
      name: "Design Responsive",
      description:
        "Il tuo sito si adatta automaticamente a ogni dispositivo. Con il 60%+ del traffico web proveniente da mobile, un design responsive non è un extra — è essenziale. Ogni elemento viene testato su desktop, tablet e smartphone.",
      tiers: "Tutti i tier",
    },
    {
      icon: "search",
      name: "SEO On-Page",
      description:
        "Ottimizzazione di meta title, description, heading structure, alt text immagini, sitemap XML e robots.txt. Il tuo sito nasce già pronto per essere trovato su Google. Tier Base: struttura SEO-friendly. Pro: SEO base attiva. Premium: SEO avanzata con schema markup e ottimizzazione Core Web Vitals.",
      tiers: "Pro / Premium",
    },
    {
      icon: "file-text",
      name: "CMS (Gestione Contenuti)",
      description:
        "Con i tier Pro e Premium, il tuo sito include un CMS intuitivo che ti permette di aggiornare testi, immagini e contenuti in totale autonomia. Niente più email al web developer per cambiare un numero di telefono.",
      tiers: "Pro / Premium",
    },
    {
      icon: "chart-bar",
      name: "Google Analytics",
      description:
        "Sapere chi visita il tuo sito, da dove arriva e cosa fa. Installiamo e configuriamo Google Analytics 4 con gli eventi chiave tracciati: visite, click su CTA, compilazione form, tempo sulla pagina.",
      tiers: "Pro / Premium",
    },
    {
      icon: "pen-square",
      name: "Blog",
      description:
        "Disponibile nel tier Premium. Un blog professionale integrato con categorie, tag, ricerca e paginazione. Lo strumento più potente per il content marketing: pubblica articoli, guida traffico organico e posizionati come esperto nel tuo settore.",
      tiers: "Premium",
    },
  ],
  useCases: [
    {
      title: "Attività Locali",
      description: "Ristoranti, studi professionali, negozi, artigiani.",
      recommendedTier: "Base o Pro",
    },
    {
      title: "Professionisti & Freelancer",
      description: "Portfolio, personal branding, landing page servizi.",
      recommendedTier: "Base o Pro",
    },
    {
      title: "Startup & MVP",
      description: "Landing page per validare idee, raccogliere lead, attrarre investitori.",
      recommendedTier: "Pro",
    },
    {
      title: "PMI & Aziende",
      description: "Sito corporate completo, blog aziendale, lead generation strutturata.",
      recommendedTier: "Premium",
    },
  ],
  faq: [
    {
      question: "Quanto tempo ci vuole per avere il sito online?",
      answer:
        "Base: 3-5 giorni lavorativi. Pro: 5-7 giorni. Premium: 7-10 giorni. I tempi partono dall'approvazione del design e dalla ricezione dei contenuti.",
    },
    {
      question: "Cosa devo fornire io?",
      answer:
        "Logo, testi (o aggiungere l'add-on Copywriting), immagini e le informazioni sulla tua attività. Ti guidiamo noi con un brief strutturato.",
    },
    {
      question: "Posso aggiornare il sito da solo dopo la consegna?",
      answer:
        "Con i pacchetti Pro e Premium sì, grazie al CMS integrato. Con il pacchetto Base, le modifiche richiedono il nostro intervento (coperto dalla manutenzione).",
    },
    {
      question: "Il dominio e l'hosting sono inclusi?",
      answer:
        "Il dominio è a carico tuo (da €10/anno). L'hosting è disponibile come add-on gestito a €9/mese, oppure puoi usare il tuo hosting.",
    },
    {
      question: "E se non mi piace il design?",
      answer:
        "Ogni pacchetto include revisioni (1 per Base, 3 per Pro, illimitate per Premium). Inoltre, con la nostra preview AI puoi vedere un'anteprima del sito prima ancora di iniziare.",
    },
    {
      question: "Come funziona il pagamento?",
      answer:
        "50% all'ordine, 50% alla consegna. Per i pacchetti Premium con preventivo personalizzato, definiamo insieme le milestone di pagamento.",
    },
    {
      question: "Posso vedere un'anteprima del mio sito prima di iniziare?",
      answer:
        "Sì. Durante la configurazione del pacchetto, puoi generare una preview AI personalizzata. Descrivi la tua attività, scegli lo stile e i colori — e vedrai un mockup del tuo sito in pochi secondi. Incluso in tutti i pacchetti.",
    },
  ],
};

// ─── SHOP & SAAS ──────────────────────────────────────────────────────────────

const shopSaas: ServicePageData = {
  id: "shop-saas",
  hero: {
    label: "02 — Shop & SaaS",
    headline: "Vendi online,",
    headlineAccent: "dal giorno uno.",
    description:
      "Piattaforme per abbonamenti e servizi online con pagamenti sicuri, checkout Stripe e area clienti. Dalla landing con checkout alla piattaforma SaaS completa.",
    priceLabel: "Da €999 · Consegna da 5 giorni · Preview AI inclusa",
  },
  problemSolution: {
    problems: [
      {
        text: "La subscription economy cresce rapidamente: chi non attiva ricavi ricorrenti resta indietro",
        bold: "ricavi ricorrenti",
      },
      {
        text: "Piattaforme no-code costano €300+/mese con personalizzazione limitata",
        bold: "€300+/mese",
      },
      {
        text: "Integrare pagamenti è complesso e rischioso",
        bold: "complesso e rischioso",
      },
      {
        text: "Gestire abbonamenti ricorrenti richiede infrastruttura",
        bold: "abbonamenti ricorrenti",
      },
    ],
    solutions: [
      {
        text: "Piattaforma pronta con Stripe integrato",
        bold: "Stripe integrato",
      },
      {
        text: "Proprietà totale della piattaforma",
        bold: "Proprietà totale",
      },
      {
        text: "Checkout sicuro PCI-compliant",
        bold: "PCI-compliant",
      },
      {
        text: "Abbonamenti e automazioni inclusi nei tier Pro e Premium",
        bold: "Abbonamenti e automazioni",
      },
    ],
  },
  tierDetails: [
    {
      key: "base",
      tagline: "Inizia a vendere subito",
      description:
        "Landing page con checkout Stripe per fino a 3 piani o servizi digitali. Email transazionali incluse. Perfetto per validare un'offerta online senza complessità.",
      highlighted: false,
      includes:
        "Landing + checkout · Fino a 3 piani/servizi · Checkout Stripe · Email transazionali · 1 revisione · Consegna 5-7 giorni",
      ctaType: "wizard",
    },
    {
      key: "pro",
      tagline: "Il tuo shop completo",
      description:
        "Piattaforma completa fino a 20 piani/offerte con abbonamenti ricorrenti, area clienti base, coupon e sconti. Per chi vuole scalare la vendita di servizi online.",
      highlighted: true,
      includes:
        "Piattaforma completa · Fino a 20 piani/offerte · Abbonamenti · Area clienti · Coupon · 3 revisioni · Consegna 7-10 giorni",
      ctaType: "wizard",
    },
    {
      key: "premium",
      tagline: "La tua piattaforma SaaS",
      description:
        "Piattaforma completa con piani e offerte illimitate, area clienti avanzata, webhook e automazioni. Per chi vuole costruire un business digitale scalabile.",
      highlighted: false,
      includes:
        "Piattaforma SaaS · Piani/offerte illimitate · Area clienti avanzata · Webhook · Automazioni · Revisioni illimitate · Consegna 10-15 giorni",
      ctaType: "wizard",
    },
  ],
  featureDetails: [
    {
      icon: "credit-card",
      name: "Checkout Stripe",
      description:
        "Pagamenti sicuri con carte di credito/debito, Apple Pay, Google Pay. Certificazione PCI DSS compliant. I tuoi clienti pagano in sicurezza, tu ricevi i fondi sul conto in 2-7 giorni.",
      tiers: "Tutti i tier",
    },
    {
      icon: "refresh-cw",
      name: "Abbonamenti Ricorrenti",
      description:
        "Gestione piani con upgrade/downgrade, fatturazione automatica e gestione dei pagamenti falliti. Perfetto per SaaS, membership e servizi in abbonamento.",
      tiers: "Pro / Premium",
    },
    {
      icon: "user",
      name: "Area Clienti",
      description:
        "Login, gestione profilo, storico pagamenti e abbonamenti. Il tier Base include un'area cliente essenziale. Pro: area clienti base. Premium: dashboard personalizzata con analytics per il cliente.",
      tiers: "Pro / Premium",
    },
    {
      icon: "tag",
      name: "Coupon e Sconti",
      description:
        "Crea codici sconto a percentuale o importo fisso, con scadenza e limiti d'uso. Strumento essenziale per promozioni e acquisizione clienti.",
      tiers: "Pro / Premium",
    },
    {
      icon: "zap",
      name: "Webhook e Automazioni",
      description:
        "Integrazione con CRM, email marketing, Zapier e workflow custom. Automatizza notifiche, rinnovi e sincronizzazione dati con i tuoi strumenti.",
      tiers: "Premium",
    },
    {
      icon: "mail",
      name: "Email Transazionali",
      description:
        "Conferma iscrizione, rinnovo, fattura — template personalizzabili con il tuo brand. Il cliente riceve comunicazioni professionali ad ogni step.",
      tiers: "Tutti i tier",
    },
  ],
  useCases: [
    {
      title: "Membership & Community",
      description: "Piani ricorrenti, contenuti riservati, area membri.",
      recommendedTier: "Base o Pro",
    },
    {
      title: "Creatori Digitali",
      description: "Corsi, ebook, template, asset digitali.",
      recommendedTier: "Pro",
    },
    {
      title: "Startup SaaS",
      description: "Abbonamenti, area clienti, automazioni.",
      recommendedTier: "Premium",
    },
    {
      title: "Aziende di Servizi",
      description: "Pacchetti consulenza, piani ricorrenti, area riservata.",
      recommendedTier: "Pro o Premium",
    },
  ],
  faq: [
    {
      question: "Posso vendere solo servizi online e abbonamenti?",
      answer: "Sì, l'offerta Shop & SaaS è pensata proprio per servizi digitali, membership e modelli ricorrenti.",
    },
    {
      question: "Come funzionano i pagamenti?",
      answer:
        "Stripe gestisce tutto: carte, wallet, addebiti. Ricevi i fondi sul tuo conto in 2-7 giorni lavorativi.",
    },
    {
      question: "Posso migrare dal mio shop attuale?",
      answer:
        "Sì, con l'add-on Migrazione dati trasferiamo catalogo, clienti e ordini dalla piattaforma attuale.",
    },
    {
      question: "E le tasse/fatturazione?",
      answer:
        "Stripe calcola l'IVA automaticamente. Integrazione disponibile con i principali tool di fatturazione italiana.",
    },
    {
      question: "Quanti piani/offerte posso aggiungere dopo?",
      answer:
        "Entro i limiti del tier scelto. L'upgrade a un tier superiore è possibile in qualsiasi momento.",
    },
    {
      question: "È sicuro per i pagamenti?",
      answer:
        "Stripe è certificato PCI DSS Level 1 — lo standard più alto per la sicurezza dei pagamenti online.",
    },
    {
      question: "Posso vedere un'anteprima della mia piattaforma prima di iniziare?",
      answer:
        "Sì. Durante la configurazione del pacchetto, puoi generare una preview AI personalizzata. Descrivi la tua attività, scegli lo stile e i colori — e vedrai un mockup della tua piattaforma in pochi secondi. Incluso in tutti i pacchetti.",
    },
  ],
};

// ─── WEB APP ──────────────────────────────────────────────────────────────────

const webApp: ServicePageData = {
  id: "web-app",
  hero: {
    label: "03 — Web App",
    headline: "Digitalizza",
    headlineAccent: "i tuoi processi.",
    description:
      "Applicazioni web su misura con dashboard, autenticazione, notifiche e database ottimizzato. Dalla gestione interna alla piattaforma pubblica.",
    priceLabel: "Da €2.999 · Consegna da 7 giorni · Preview AI inclusa",
  },
  problemSolution: {
    problems: [
      {
        text: "Il 60% delle PMI perde oltre 5 ore a settimana in processi manuali",
        bold: "5 ore a settimana",
      },
      {
        text: "Il 70% delle aziende abbandona software generici entro 12 mesi",
        bold: "abbandona entro 12 mesi",
      },
      {
        text: "Le grandi software house chiedono €20.000-€50.000+",
        bold: "€20.000-€50.000+",
      },
      {
        text: "Senza supporto dedicato, il 40% dei progetti software viene abbandonato dopo il lancio",
        bold: "40% dei progetti",
      },
    ],
    solutions: [
      {
        text: "Applicazione costruita sul tuo workflow",
        bold: "tuo workflow",
      },
      {
        text: "Interfaccia intuitiva, zero formazione necessaria",
        bold: "zero formazione",
      },
      {
        text: "Prezzo trasparente e accessibile",
        bold: "trasparente e accessibile",
      },
      {
        text: "Supporto continuo e aggiornamenti inclusi",
        bold: "Supporto continuo",
      },
    ],
  },
  tierDetails: [
    {
      key: "base",
      tagline: "La tua prima web app",
      description:
        "Complessità semplice, fino a 100 utenti, autenticazione email/password, notifiche email, supporto via email. Perfetto per digitalizzare un processo interno o creare un tool semplice.",
      highlighted: false,
      includes:
        "Complessità semplice · Fino a 100 utenti · Auth email/password · Notifiche email · Supporto email · 2 revisioni · Consegna 7-10 giorni",
      ctaType: "wizard",
    },
    {
      key: "pro",
      tagline: "Scala il tuo business",
      description:
        "Complessità media, fino a 1.000 utenti, SSO/OAuth, dashboard con metriche, database ottimizzato, supporto prioritario. Per aziende che vogliono scalare.",
      highlighted: true,
      includes:
        "Complessità media · Fino a 1.000 utenti · SSO/OAuth · Dashboard · DB ottimizzato · Supporto prioritario · 5 revisioni · Consegna 10-15 giorni",
      ctaType: "wizard",
    },
    {
      key: "premium",
      tagline: "La soluzione enterprise",
      description:
        "Complessità elevata, utenti illimitati, autenticazione custom, dashboard avanzata, database scalabile, supporto dedicato, revisioni illimitate. Per esigenze enterprise.",
      highlighted: false,
      includes:
        "Complessità elevata · Utenti illimitati · Auth custom · Dashboard avanzata · DB scalabile · Supporto dedicato · Revisioni illimitate",
      ctaType: "contact",
    },
  ],
  featureDetails: [
    {
      icon: "lock",
      name: "Autenticazione",
      description:
        "Email/password per il tier Base. SSO con Google/Microsoft/OAuth per Pro. Sistemi custom con 2FA e RBAC (Role-Based Access Control) per Premium.",
      tiers: "Tutti i tier",
    },
    {
      icon: "chart-bar",
      name: "Dashboard",
      description:
        "Pannello con metriche, grafici e KPI personalizzati. Dati in tempo reale, export CSV/PDF. Disponibile nei tier Pro e Premium.",
      tiers: "Pro / Premium",
    },
    {
      icon: "database",
      name: "Database",
      description:
        "PostgreSQL ottimizzato. Base: struttura standard. Pro: indici e query ottimizzate. Premium: sharding, replica e cache layer per massima scalabilità.",
      tiers: "Tutti i tier",
    },
    {
      icon: "bell",
      name: "Notifiche",
      description:
        "Email transazionali per tutti i tier. Push notification e notifiche in-app per Pro e Premium.",
      tiers: "Tutti i tier",
    },
    {
      icon: "link",
      name: "API & Integrazioni",
      description:
        "REST API documentata, webhook, integrazione con servizi terzi. Disponibile nel tier Premium per massima flessibilità.",
      tiers: "Premium",
    },
  ],
  useCases: [
    {
      title: "Gestione Interna",
      description: "CRM, ticketing, inventario, prenotazioni.",
      recommendedTier: "Base o Pro",
    },
    {
      title: "Piattaforme Clienti",
      description: "Portali clienti, area riservata, reporting.",
      recommendedTier: "Pro",
    },
    {
      title: "Tool SaaS",
      description: "Applicazioni multi-tenant, billing, analytics.",
      recommendedTier: "Premium",
    },
    {
      title: "Automazione Processi",
      description: "Workflow, approvazioni, pipeline.",
      recommendedTier: "Pro o Premium",
    },
  ],
  faq: [
    {
      question: "Che tipo di web app potete realizzare?",
      answer:
        "Qualsiasi: CRM, gestionali, portali, piattaforme SaaS, tool interni. Partiamo dal tuo bisogno specifico.",
    },
    {
      question: "100 utenti bastano?",
      answer:
        "Per il tier Base sì. Se cresci, l'upgrade a Pro (1.000 utenti) è semplice e senza downtime.",
    },
    {
      question: "Posso integrare con i miei sistemi?",
      answer:
        "Pro: integrazioni standard (API, webhook). Premium: integrazioni custom con qualsiasi sistema.",
    },
    {
      question: "Chi gestisce hosting e infrastruttura?",
      answer: "Noi, incluso nel servizio. Deploy su cloud con scaling automatico.",
    },
    {
      question: "Come funziona il supporto?",
      answer: "Base: email (48h). Pro: prioritario (24h). Premium: dedicato con canale diretto.",
    },
    {
      question: "E se ho bisogno di funzionalità aggiuntive dopo?",
      answer:
        "Sviluppo incrementale disponibile. Ogni feature aggiuntiva ha un preventivo separato.",
    },
    {
      question: "Posso vedere un'anteprima della mia web app prima di iniziare?",
      answer:
        "Sì. Durante la configurazione del pacchetto, puoi generare una preview AI personalizzata. Descrivi il tuo progetto, scegli lo stile e i colori — e vedrai un mockup della tua web app in pochi secondi. Incluso in tutti i pacchetti.",
    },
  ],
};

// ─── MOBILE APP ───────────────────────────────────────────────────────────────

const mobileApp: ServicePageData = {
  id: "mobile-app",
  hero: {
    label: "04 — Mobile App",
    headline: "La tua app,",
    headlineAccent: "su ogni schermo.",
    description:
      "Applicazioni mobile cross-platform per iOS e Android con design intuitivo, push notification e pubblicazione sugli store. Un unico investimento, due piattaforme.",
    priceLabel: "Da €3.999 · Consegna da 10 giorni · Preview AI inclusa",
  },
  problemSolution: {
    problems: [
      {
        text: "Gli utenti passano il 90% del tempo mobile nelle app, non nel browser",
        bold: "90% del tempo",
      },
      {
        text: "Sviluppare un'app da zero richiede competenze specifiche e mesi di lavoro",
        bold: "mesi di lavoro",
      },
      {
        text: "Pubblicare sugli store è un processo burocratico complesso",
        bold: "burocratico complesso",
      },
      {
        text: "Mantenere un'app aggiornata con ogni versione OS è costoso",
        bold: "costoso",
      },
    ],
    solutions: [
      {
        text: "Un'unica codebase per iOS e Android — costi dimezzati, stessa qualità",
        bold: "costi dimezzati",
      },
      {
        text: "Pubblicazione store gestita da noi",
        bold: "gestita da noi",
      },
      {
        text: "Design UI/UX che segue le linee guida Apple e Google",
        bold: "linee guida Apple e Google",
      },
      {
        text: "Manutenzione e aggiornamenti OS disponibili come add-on",
        bold: "Manutenzione e aggiornamenti",
      },
    ],
  },
  tierDetails: [
    {
      key: "base",
      tagline: "Il tuo MVP mobile",
      description:
        "iOS + Android, complessità semplice, design template, push notification, pubblicazione store. Perfetto per una prima app o un MVP.",
      highlighted: false,
      includes:
        "iOS + Android · Complessità semplice · Design template · Push notification · Pubblicazione store · 2 revisioni · Consegna 10-15 giorni",
      ctaType: "wizard",
    },
    {
      key: "pro",
      tagline: "Performance senza compromessi",
      description:
        "iOS + Android, complessità media, design custom UI/UX, modalità offline, autenticazione SSO/biometrica, API backend avanzata. Per app che devono performare.",
      highlighted: true,
      includes:
        "iOS + Android · Complessità media · Design custom · Offline · SSO/biometrica · API avanzata · 5 revisioni · Consegna 15-25 giorni",
      ctaType: "wizard",
    },
    {
      key: "premium",
      tagline: "L'app che cambia il gioco",
      description:
        "iOS + Android, complessità elevata, design premium su misura, autenticazione custom, API scalabile, revisioni illimitate. Per chi vuole un prodotto di livello mondiale.",
      highlighted: false,
      includes:
        "iOS + Android · Complessità elevata · Design premium · Auth custom · API scalabile · Revisioni illimitate",
      ctaType: "contact",
    },
  ],
  featureDetails: [
    {
      icon: "smartphone",
      name: "iOS + Android",
      description:
        "Un'unica codebase per entrambe le piattaforme grazie a React Native e Flutter. Costi ridotti, tempi rapidi e stessa qualità su iOS e Android. Ogni tier copre entrambi gli store.",
      tiers: "Tutti i tier",
    },
    {
      icon: "bell",
      name: "Push Notification",
      description:
        "Notifiche personalizzate, segmentazione utenti, scheduling e deep linking. Raggiungi i tuoi utenti al momento giusto con il messaggio giusto.",
      tiers: "Tutti i tier",
    },
    {
      icon: "wifi-off",
      name: "Modalità Offline",
      description:
        "L'app funziona anche senza connessione internet, con sincronizzazione automatica al ritorno online. Essenziale per app usate in mobilità.",
      tiers: "Pro / Premium",
    },
    {
      icon: "lock",
      name: "Autenticazione",
      description:
        "Email e social login per il tier Base. SSO e biometrica (Face ID/Touch ID) per Pro. Sistemi custom per Premium.",
      tiers: "Tutti i tier",
    },
    {
      icon: "store",
      name: "Pubblicazione Store",
      description:
        "Gestiamo tutto il processo di submission su App Store e Google Play, inclusi screenshot, descrizioni e metadata ottimizzati.",
      tiers: "Tutti i tier",
    },
    {
      icon: "settings",
      name: "API Backend",
      description:
        "Endpoint REST per comunicazione app-server. Base: standard. Pro: ottimizzata con caching. Premium: scalabile con load balancing.",
      tiers: "Tutti i tier",
    },
  ],
  useCases: [
    {
      title: "App Vetrina/Companion",
      description: "Estensione del sito/shop, catalogo mobile.",
      recommendedTier: "Base o Pro",
    },
    {
      title: "App di Servizio",
      description: "Prenotazioni, ordini, delivery, loyalty program.",
      recommendedTier: "Pro o Premium",
    },
    {
      title: "App Core Business",
      description: "La tua app È il prodotto — social, marketplace, tool.",
      recommendedTier: "Premium",
    },
    {
      title: "App Interne",
      description: "Comunicazione team, field service, reporting mobile.",
      recommendedTier: "Base o Pro",
    },
  ],
  faq: [
    {
      question: "Su quali tecnologie sviluppate?",
      answer:
        "Utilizziamo React Native e Flutter, framework cross-platform che permettono di sviluppare un'unica app per iOS e Android con performance eccellenti e costi contenuti.",
    },
    {
      question: "Quanto costa pubblicare sugli store?",
      answer:
        "Apple Developer Program: €99/anno. Google Play: €25 una tantum. La pubblicazione è gestita da noi, inclusa nel pacchetto.",
    },
    {
      question: "Posso aggiornare i contenuti dell'app?",
      answer:
        "Sì, con un CMS backend puoi modificare testi e immagini senza rilasciare nuove versioni sugli store.",
    },
    {
      question: "L'app funziona su tutti i telefoni?",
      answer:
        "Supportiamo iOS 15+ e Android 10+, coprendo il 95%+ dei dispositivi attivi.",
    },
    {
      question: "Come gestite gli aggiornamenti iOS/Android?",
      answer:
        "Con l'add-on Manutenzione, aggiorniamo l'app ad ogni major release OS (iOS 18, Android 15, ecc.).",
    },
    {
      question: "Quanto tempo per un aggiornamento dell'app?",
      answer:
        "Bug fix: 24-48h. Nuove feature: preventivo separato con timeline dedicata.",
    },
    {
      question: "Posso vedere un'anteprima della mia app prima di iniziare?",
      answer:
        "Sì. Durante la configurazione del pacchetto, puoi generare una preview AI personalizzata. Descrivi il tuo progetto, scegli lo stile e i colori — e vedrai un mockup della tua app in pochi secondi. Incluso in tutti i pacchetti.",
    },
  ],
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const servicePages: Record<string, ServicePageData> = {
  "siti-web": sitiWeb,
  "shop-saas": shopSaas,
  "web-app": webApp,
  "mobile-app": mobileApp,
};

export function getServicePageData(slug: string): ServicePageData | undefined {
  return servicePages[slug];
}
