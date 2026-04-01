export const chapters = [
  {
    id: 0,
    title: 'INTRO',
    subtitle: 'Hello',
    materiality: 0.0,
    objects: ['desk', 'crt', 'chair'],
    clickables: [
      { id: 'crt', action: 'typing', content: 'Hello World' },
    ],
    bloomIntensity: 1.5,
    narrativePosition: 'center',
    narrativeContent: {
      number: '00',
      heading: 'Hello',
      text: 'Ricordo ancora quel primo "Hello World". Il cursore lampeggiava su uno schermo nero, e io non avevo idea di cosa stessi facendo. Ma qualcosa è scattato.',
    },
  },
  {
    id: 1,
    title: 'LA PRIMA RIGA',
    subtitle: 'Il primo Hello World',
    materiality: 0.1,
    objects: ['desk', 'crt', 'chair', 'mug', 'notepad', 'sheets'],
    clickables: [
      { id: 'crt', action: 'typing', content: 'Hello World' },
    ],
    bloomIntensity: 1.3,
    narrativePosition: 'left',
    narrativeContent: {
      number: '01',
      heading: 'La Prima Riga',
      text: "Ricordo ancora quel primo 'Hello World'. Le mani sulla tastiera, incerte. Non sapevo che quelle poche righe di codice avrebbero cambiato la mia vita. Era l'inizio di tutto.",
    },
  },
  {
    id: 2,
    title: 'AULAB',
    subtitle: 'Dove tutto è iniziato davvero',
    materiality: 0.25,
    objects: ['desk', 'flatMonitor', 'chair', 'mug', 'notepad', 'sheets', 'keyboard', 'books', 'clock'],
    clickables: [
      { id: 'books', action: 'typing', content: 'HTML/CSS → JavaScript → PHP → Laravel\nMySQL → Git → Bootstrap → jQuery' },
      { id: 'clock', action: 'typing', content: '⏱ 847 ore di pratica\n📅 6 mesi intensivi\n💻 12 progetti completati' },
    ],
    bloomIntensity: 1.2,
    narrativePosition: 'right',
    narrativeContent: {
      number: '02',
      heading: 'Aulab',
      text: "Aulab non era solo un corso online. Erano notti insonni, bug frustranti, ma anche quella sensazione incredibile quando finalmente il codice funzionava. Ho trovato mentori, compagni di viaggio, e soprattutto, ho trovato me stesso.",
    },
  },
]
