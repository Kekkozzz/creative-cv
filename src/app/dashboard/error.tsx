"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h2 className="font-display text-2xl text-foreground mb-4">
        Qualcosa è andato storto
      </h2>
      <p className="text-sm text-muted mb-8 max-w-md">
        Si è verificato un errore nel caricamento della pagina.
        {error.digest && (
          <span className="block mt-2 text-xs text-muted/50">
            Codice: {error.digest}
          </span>
        )}
      </p>
      <button
        onClick={reset}
        className="px-8 py-3 bg-accent text-background text-sm font-medium uppercase tracking-widest hover:bg-accent/90 transition-colors"
      >
        Riprova
      </button>
    </div>
  );
}
