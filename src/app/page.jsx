import Scene3D from '@/components/Scene3D';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-8 overflow-hidden">
        <h1 className="text-center mb-6 relative z-10">
          Creative Portfolio
        </h1>
        <p className="text-center max-w-2xl text-lg opacity-70 relative z-10">
          Portfolio con 3D interattivo, smooth scroll e animazioni moderne.
        </p>
        <div className="mt-8 text-sm opacity-50 relative z-10">
          ↓ Scroll Down
        </div>
      </section>

      {/* Section 2 */}
      <section className="min-h-screen flex items-center justify-center bg-[#0a0a0a] dark:bg-white text-white dark:text-black px-8">
        <div className="max-w-4xl">
          <h2 className="mb-6">Smooth Scroll</h2>
          <p className="text-lg leading-relaxed opacity-80">
            Questo è un test per verificare che Lenis funzioni correttamente.
            Lo scroll dovrebbe essere fluido e naturale, con una durata di circa 1.2 secondi
            e un easing exponenziale.
          </p>
        </div>
      </section>

      {/* Section 3 */}
      <section className="min-h-screen flex items-center justify-center px-8">
        <div className="max-w-4xl">
          <h2 className="mb-6">Typography Test</h2>
          <div className="space-y-4">
            <h3>Space Grotesk Headings</h3>
            <p>
              Il font principale è Space Grotesk per gli headings, mentre DM Sans è usato
              per il body text. Questa combinazione offre un look moderno e tech-forward.
            </p>
            <h4>Subtitle Example</h4>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
              tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4 */}
      <section className="min-h-screen flex items-center justify-center bg-[#0a0a0a] dark:bg-white text-white dark:text-black px-8">
        <div className="max-w-4xl">
          <h2 className="mb-6">Performance</h2>
          <p className="text-lg leading-relaxed opacity-80">
            Lenis utilizza requestAnimationFrame per garantire performance ottimali
            e uno scroll buttery smooth anche su dispositivi meno potenti.
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white/5 dark:bg-black/5 rounded-lg">
              <h5 className="mb-2">60 FPS</h5>
              <p className="text-sm opacity-70">Smooth & Performant</p>
            </div>
            <div className="p-6 bg-white/5 dark:bg-black/5 rounded-lg">
              <h5 className="mb-2">1.2s Duration</h5>
              <p className="text-sm opacity-70">Optimal Feel</p>
            </div>
            <div className="p-6 bg-white/5 dark:bg-black/5 rounded-lg">
              <h5 className="mb-2">easeOutExpo</h5>
              <p className="text-sm opacity-70">Natural Easing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 - Final */}
      <section className="min-h-screen flex flex-col items-center justify-center px-8">
        <h2 className="mb-6">Ready to Build</h2>
        <p className="text-center max-w-2xl text-lg opacity-70 mb-8">
          Con Lenis configurato, sei pronto per aggiungere le altre features del portfolio:
          3D scenes, animazioni con Framer Motion e molto altro.
        </p>
        <div className="text-sm opacity-50">
          ↑ Scroll to Top
        </div>
      </section>
    </div>
  );
}
