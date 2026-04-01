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
]
