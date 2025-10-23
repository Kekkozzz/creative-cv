/**
 * Sections Configuration
 * Defines all sections/chapters of the CV story
 * Used by Sidebar navigation and scroll spy
 */

export const sections = [
  {
    id: 'hero',
    number: '00',
    title: 'Intro',
    shortTitle: 'Intro',
    fullTitle: 'Introduzione',
    enabled: true,
  },
  {
    id: 'section01',
    number: '01',
    title: 'La Prima Riga',
    shortTitle: 'La Prima Riga',
    fullTitle: 'La Prima Riga di Codice',
    enabled: true,
  },
  // Future sections (disabled for now)
  {
    id: 'section02',
    number: '02',
    title: 'Aulab',
    shortTitle: 'Aulab',
    fullTitle: 'Aulab: Dove Tutto È Iniziato',
    enabled: false,
  },
  {
    id: 'section03',
    number: '03',
    title: 'Backend',
    shortTitle: 'Backend',
    fullTitle: 'La Fatica del Backend',
    enabled: false,
  },
  {
    id: 'section04',
    number: '04',
    title: 'React',
    shortTitle: 'React',
    fullTitle: 'React: Quando Ho Capito',
    enabled: false,
  },
  {
    id: 'section05',
    number: '05',
    title: 'Primo Lavoro',
    shortTitle: 'Lavoro',
    fullTitle: 'Il Primo Lavoro: La Realtà',
    enabled: false,
  },
  {
    id: 'section06',
    number: '06',
    title: "L'AI",
    shortTitle: 'AI',
    fullTitle: "L'AI: Non È Magia, È Tool",
    enabled: false,
  },
  {
    id: 'section07',
    number: '07',
    title: 'Animazioni',
    shortTitle: 'GSAP',
    fullTitle: 'Le Animazioni: Dare Vita al Web',
    enabled: false,
  },
  {
    id: 'section08',
    number: '08',
    title: 'Next.js',
    shortTitle: 'Next.js',
    fullTitle: 'Next.js: Maturità Tecnica',
    enabled: false,
  },
  {
    id: 'section09',
    number: '09',
    title: 'Three.js',
    shortTitle: 'Three.js',
    fullTitle: 'Three.js: La Nuova Frontiera',
    enabled: false,
  },
  {
    id: 'section10',
    number: '10',
    title: 'Oggi e Domani',
    shortTitle: 'Futuro',
    fullTitle: 'Oggi, E Domani',
    enabled: false,
  },
];

/**
 * Get only enabled sections
 */
export const getEnabledSections = () => {
  return sections.filter(section => section.enabled);
};

/**
 * Get section by ID
 */
export const getSectionById = (id) => {
  return sections.find(section => section.id === id);
};

/**
 * Get next section
 */
export const getNextSection = (currentId) => {
  const enabledSections = getEnabledSections();
  const currentIndex = enabledSections.findIndex(s => s.id === currentId);
  if (currentIndex === -1 || currentIndex === enabledSections.length - 1) {
    return null;
  }
  return enabledSections[currentIndex + 1];
};

/**
 * Get previous section
 */
export const getPreviousSection = (currentId) => {
  const enabledSections = getEnabledSections();
  const currentIndex = enabledSections.findIndex(s => s.id === currentId);
  if (currentIndex <= 0) {
    return null;
  }
  return enabledSections[currentIndex - 1];
};
