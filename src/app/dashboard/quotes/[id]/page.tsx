import { createServerClient } from "@/app/lib/supabase/server";
import { createServiceClient } from "@/app/lib/supabase/service";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { QuoteStatus } from "@/app/lib/supabase/types";
import { InteractivePreview } from "@/app/components/InteractivePreview";

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
  draft: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  in_progress: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  quoted: "bg-accent/20 text-accent border-accent/30",
  accepted: "bg-green-500/20 text-green-400 border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  archived: "bg-muted/20 text-muted border-muted/30",
};

const statusTimeline: QuoteStatus[] = [
  "draft",
  "new",
  "contacted",
  "in_progress",
  "quoted",
  "accepted",
];

type Props = {
  params: Promise<{ id: string }>;
};

export default async function QuoteDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return notFound();

  const { data: quote } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!quote) return notFound();

  // Cookie-free client for all service-role operations (DB + storage)
  const directClient = createServiceClient();

  // Get associated previews
  const { data: previews } = await directClient
    .from("previews")
    .select("*")
    .eq("quote_id", quote.id)
    .order("created_at", { ascending: false });

  let previewData = previews ?? [];

  // Fallback: if no previews linked by quote_id, search by user_id + time window
  if (previewData.length === 0 && quote.user_id) {
    const quoteTime = new Date(quote.created_at).getTime();
    const windowStart = new Date(quoteTime - 15 * 60 * 1000).toISOString();
    const windowEnd = new Date(quoteTime + 5 * 60 * 1000).toISOString();

    const { data: fallbackPreviews } = await directClient
      .from("previews")
      .select("*")
      .eq("user_id", quote.user_id)
      .gte("created_at", windowStart)
      .lte("created_at", windowEnd)
      .order("created_at", { ascending: false });

    previewData = fallbackPreviews ?? [];

    // Auto-link found previews to this quote for future lookups
    if (previewData.length > 0) {
      await directClient
        .from("previews")
        .update({ quote_id: quote.id })
        .in("id", previewData.map((p) => p.id));
    }
  }

  // Generate signed URLs for previews
  const previewsWithUrls = await Promise.all(
    previewData.map(async (preview) => {
      const { data: urlData } = await directClient.storage
        .from("previews")
        .createSignedUrl(preview.storage_path, 3600);
      return { ...preview, signedUrl: urlData?.signedUrl ?? null };
    })
  );

  // Fetch profile for draft contact info
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const isDraft = quote.status === "draft";
  const addOns = (quote.add_ons as { name: string; price: string }[]) ?? [];
  const features = (quote.features as string[]) ?? [];
  const currentStatusIndex = statusTimeline.indexOf(
    quote.status as QuoteStatus
  );

  return (
    <>
      {/* Back link */}
      <Link
        href="/dashboard"
        className="text-xs text-muted hover:text-foreground transition-colors uppercase tracking-widest"
      >
        &larr; Torna ai preventivi
      </Link>

      {/* Header */}
      <div className="mt-6 mb-10 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight">
            {quote.service_name} — {quote.tier_name}
          </h1>
          <p className="text-sm text-muted mt-2">
            Richiesto il{" "}
            {new Date(quote.created_at).toLocaleDateString("it-IT", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl text-accent">
            {quote.tier_price > 0
              ? `€${quote.tier_price.toLocaleString("it-IT")}`
              : "Su preventivo"}
          </p>
          {quote.total_monthly > 0 && (
            <p className="text-xs text-muted mt-1">
              + €{quote.total_monthly}/mese
            </p>
          )}
        </div>
      </div>

      {/* Status timeline */}
      <div className="mb-10 border border-border p-6">
        <h2 className="text-xs uppercase tracking-widest text-muted mb-4">
          Stato
        </h2>
        <div className="flex items-center gap-2">
          {statusTimeline.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`flex-1 h-1.5 transition-all ${
                  i <= currentStatusIndex ? "bg-accent" : "bg-border"
                }`}
              />
              <span
                className={`text-[10px] uppercase tracking-wider whitespace-nowrap ${
                  s === quote.status
                    ? "text-accent font-medium"
                    : i <= currentStatusIndex
                    ? "text-foreground"
                    : "text-muted/40"
                }`}
              >
                {statusLabels[s]}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <span
            className={`inline-block text-[10px] uppercase tracking-widest px-3 py-1 border ${statusColors[quote.status as QuoteStatus]}`}
          >
            {statusLabels[quote.status as QuoteStatus]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Package details */}
        <div className="border border-border p-6">
          <h2 className="text-xs uppercase tracking-widest text-muted mb-4">
            Pacchetto
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Servizio</span>
              <span>{quote.service_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Piano</span>
              <span>{quote.tier_name}</span>
            </div>
            {features.length > 0 && (
              <div className="pt-3 border-t border-border/30">
                <p className="text-xs text-muted mb-2">Features incluse:</p>
                <div className="flex flex-wrap gap-1">
                  {features.map((f) => (
                    <span
                      key={f}
                      className="text-[10px] px-2 py-0.5 bg-accent/10 text-accent"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {addOns.length > 0 && (
              <div className="pt-3 border-t border-border/30">
                <p className="text-xs text-muted mb-2">Add-on:</p>
                {addOns.map((a) => (
                  <div
                    key={a.name}
                    className="flex justify-between text-sm py-1"
                  >
                    <span className="text-muted">{a.name}</span>
                    <span className="text-accent">{a.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Form data */}
        {quote.business_name && (
          <div className="border border-border p-6">
            <h2 className="text-xs uppercase tracking-widest text-muted mb-4">
              Dettagli progetto
            </h2>
            <div className="space-y-3">
              {quote.business_name && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Attivit&agrave;</span>
                  <span>{quote.business_name}</span>
                </div>
              )}
              {quote.sector && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Settore</span>
                  <span>{quote.sector}</span>
                </div>
              )}
              {quote.style && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Stile</span>
                  <span>{quote.style}</span>
                </div>
              )}
              {quote.color_palette && quote.color_palette.length > 0 && (
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted">Colori</span>
                  <div className="flex gap-1">
                    {quote.color_palette.map((c) => (
                      <div
                        key={c}
                        className="w-5 h-5 border border-border"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {quote.description && (
                <div className="pt-3 border-t border-border/30">
                  <p className="text-xs text-muted mb-1">Descrizione</p>
                  <p className="text-sm">{quote.description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact info / Draft lead info */}
        <div className="border border-border p-6">
          <h2 className="text-xs uppercase tracking-widest text-muted mb-4">
            {isDraft ? "Contatto lead" : "Contatto"}
          </h2>
          <div className="space-y-3">
            {isDraft && !quote.contact_name ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Nome</span>
                  <span>{profile?.full_name || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Email</span>
                  <span>{user.email}</span>
                </div>
                <div className="pt-3 border-t border-border/30">
                  <p className="text-[10px] uppercase tracking-wider text-orange-400">
                    Il cliente non ha ancora completato il form di contatto
                  </p>
                </div>
              </>
            ) : (
              <>
                {quote.contact_name && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Nome</span>
                    <span>{quote.contact_name}</span>
                  </div>
                )}
                {quote.contact_email && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Email</span>
                    <span>{quote.contact_email}</span>
                  </div>
                )}
                {quote.contact_phone && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Telefono</span>
                    <span>{quote.contact_phone}</span>
                  </div>
                )}
                {quote.contact_message && (
                  <div className="pt-3 border-t border-border/30">
                    <p className="text-xs text-muted mb-1">Messaggio</p>
                    <p className="text-sm">{quote.contact_message}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Previews */}
      {previewsWithUrls.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs uppercase tracking-widest text-muted mb-4">
            Preview generate
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {previewsWithUrls.map((preview) => (
              <div key={preview.id} className="border border-border flex flex-col">
                <InteractivePreview id={preview.id} signedUrl={preview.signedUrl} />
                <div className="p-3 border-t border-border mt-auto">
                  <p className="text-[10px] text-muted">
                    {new Date(preview.created_at).toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
