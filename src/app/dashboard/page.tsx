import { createServerClient } from "@/app/lib/supabase/server";
import Link from "next/link";
import type { QuoteStatus } from "@/app/lib/supabase/types";

const statusLabels: Record<QuoteStatus, string> = {
  draft: "Lead",
  new: "Nuovo",
  contacted: "Contattato",
  in_progress: "In lavorazione",
  quoted: "Preventivato",
  accepted: "Accettato",
  rejected: "Rifiutato",
  archived: "Archiviato",
};

const statusColors: Record<QuoteStatus, string> = {
  draft: "bg-orange-500/20 text-orange-400",
  new: "bg-blue-500/20 text-blue-400",
  contacted: "bg-yellow-500/20 text-yellow-400",
  in_progress: "bg-purple-500/20 text-purple-400",
  quoted: "bg-accent/20 text-accent",
  accepted: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
  archived: "bg-muted/20 text-muted",
};

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: allQuotes } = await supabase
    .from("quotes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: previews } = await supabase
    .from("previews")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(6);

  const quotes = allQuotes?.filter((q) => q.status !== "draft") ?? [];

  return (
    <>
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[0.35em] text-accent mb-4 font-mono">
          Dashboard
        </p>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight">
          I tuoi preventivi
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
        <div className="border border-border p-6">
          <p className="font-display text-2xl text-accent">
            {quotes.length}
          </p>
          <p className="text-xs text-muted mt-1">Preventivi</p>
        </div>
        <div className="border border-border p-6">
          <p className="font-display text-2xl text-accent">
            {quotes.filter((q) => q.status === "accepted").length}
          </p>
          <p className="text-xs text-muted mt-1">Accettati</p>
        </div>
        <div className="border border-border p-6">
          <p className="font-display text-2xl text-accent">
            {previews?.length ?? 0}
          </p>
          <p className="text-xs text-muted mt-1">Preview generate</p>
        </div>
      </div>

      {/* Quotes list */}
      <div className="mb-12">
        <h2 className="font-display text-xl mb-6">Preventivi recenti</h2>
        {quotes.length === 0 ? (
          <div className="border border-border p-12 text-center">
            <p className="text-muted text-sm mb-4">
              Non hai ancora nessun preventivo
            </p>
            <Link
              href="/#pricing"
              className="text-xs text-accent hover:text-foreground transition-colors uppercase tracking-widest"
            >
              Configura il tuo primo pacchetto
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {quotes.map((quote) => (
              <Link
                key={quote.id}
                href={`/dashboard/quotes/${quote.id}`}
                className="group flex items-center justify-between p-6 border border-border hover:border-accent/30 transition-all duration-300"
              >
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-sm font-medium group-hover:text-accent transition-colors">
                      {quote.service_name} — {quote.tier_name}
                    </p>
                    <p className="text-xs text-muted mt-1">
                      {new Date(quote.created_at).toLocaleDateString("it-IT", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-[10px] uppercase tracking-widest px-3 py-1 ${statusColors[quote.status as QuoteStatus]}`}
                  >
                    {statusLabels[quote.status as QuoteStatus]}
                  </span>
                  <p className="font-display text-lg text-accent">
                    {quote.tier_price > 0
                      ? `€${quote.tier_price.toLocaleString("it-IT")}`
                      : "Su preventivo"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
