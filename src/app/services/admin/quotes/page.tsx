import { adminGetAllQuotes } from "@/app/actions/admin";
import Link from "next/link";
import type { QuoteStatus } from "@/app/lib/supabase/types";
import { StatusSelect } from "./StatusSelect";
import { statusLabels, statusColors } from "./constants";

const SERVICE_FILTERS = [
  { id: "", label: "Tutti i servizi" },
  { id: "siti-web", label: "Siti Web" },
  { id: "shop-saas", label: "Shop & SaaS" },
  { id: "web-app", label: "Web App" },
  { id: "mobile-app", label: "Mobile App" },
];

const STATUS_FILTERS = [
  { id: "", label: "Tutti gli status" },
  { id: "draft", label: "Lead (draft)" },
  { id: "new", label: "Nuovo" },
  { id: "contacted", label: "Contattato" },
  { id: "in_progress", label: "In lavorazione" },
  { id: "quoted", label: "Preventivato" },
  { id: "accepted", label: "Accettato" },
  { id: "rejected", label: "Rifiutato" },
  { id: "archived", label: "Archiviato" },
];

type Props = {
  searchParams: Promise<{ status?: string; service?: string }>;
};

export default async function AdminQuotesPage({ searchParams }: Props) {
  const params = await searchParams;
  const { quotes } = await adminGetAllQuotes({
    status: params.status || undefined,
    service: params.service || undefined,
  });

  return (
    <>
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.35em] text-accent mb-4 font-mono">
          Admin
        </p>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight">
          Gestione Quote
        </h1>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-8">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.id}
            href={`/admin/quotes?status=${f.id}&service=${params.service || ""}`}
            className={`text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-all duration-300 ${
              (params.status || "") === f.id
                ? "border-accent text-accent"
                : "border-border text-muted hover:border-accent/30 hover:text-foreground"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="flex gap-3 mb-8">
        {SERVICE_FILTERS.map((f) => (
          <Link
            key={f.id}
            href={`/admin/quotes?status=${params.status || ""}&service=${f.id}`}
            className={`text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-all duration-300 ${
              (params.service || "") === f.id
                ? "border-accent text-accent"
                : "border-border text-muted hover:border-accent/30 hover:text-foreground"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs text-muted mb-4">{quotes.length} risultati</p>

      {/* Table */}
      {quotes.length === 0 ? (
        <div className="border border-border p-12 text-center">
          <p className="text-muted text-sm">Nessuna quote trovata con questi filtri</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {/* Header */}
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_0.5fr] gap-4 px-6 py-3 text-[10px] uppercase tracking-widest text-muted border-b border-border">
            <span>Cliente</span>
            <span>Servizio</span>
            <span>Status</span>
            <span>Prezzo</span>
            <span>Data</span>
            <span></span>
          </div>

          {quotes.map((quote) => {
            return (
              <div
                key={quote.id}
                className="group grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_0.5fr] gap-4 px-6 py-4 border-b border-border/30 hover:bg-surface/30 transition-all items-center"
              >
                {/* Cliente */}
                <div>
                  <p className="text-sm font-medium">
                    {quote.business_name || quote.contact_name || "—"}
                  </p>
                  <p className="text-[11px] text-muted">
                    {quote.contact_email || "Nessuna email di contatto"}
                  </p>
                </div>

                {/* Servizio */}
                <div>
                  <p className="text-sm">{quote.service_name}</p>
                  <p className="text-[11px] text-muted">{quote.tier_name}</p>
                </div>

                {/* Status */}
                <StatusSelect
                  quoteId={quote.id}
                  currentStatus={quote.status as QuoteStatus}
                  statusLabels={statusLabels}
                  statusColors={statusColors}
                />

                {/* Prezzo */}
                <p className="text-sm text-accent font-display">
                  {quote.tier_price > 0
                    ? `€${quote.tier_price.toLocaleString("it-IT")}`
                    : "Su prev."}
                </p>

                {/* Data */}
                <p className="text-xs text-muted">
                  {new Date(quote.created_at).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                {/* Link */}
                <Link
                  href={`/admin/quotes/${quote.id}`}
                  className="text-xs text-muted hover:text-accent transition-colors text-right"
                >
                  Dettaglio &rarr;
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
