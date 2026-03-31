import { adminGetAllPreviews } from "@/app/actions/admin";
import Link from "next/link";
import { InteractivePreview } from "@/app/components/InteractivePreview";

export default async function AdminPreviewsPage() {
  const { previews } = await adminGetAllPreviews();

  return (
    <>
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.35em] text-accent mb-4 font-mono">
          Admin
        </p>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight">
          Preview AI
        </h1>
        <p className="text-sm text-muted mt-2">{previews.length} preview generate</p>
      </div>

      {previews.length === 0 ? (
        <div className="border border-border p-12 text-center">
          <p className="text-muted text-sm">Nessuna preview generata</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {previews.map((preview) => {
            return (
              <div key={preview.id} className="border border-border group hover:border-accent/30 transition-all duration-300 flex flex-col">
                <InteractivePreview id={preview.id} signedUrl={preview.signedUrl} />
                <div className="p-4 space-y-2 border-t border-border mt-auto relative z-10 bg-background">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium">
                      {preview.quoteName || "Senza quote"}
                    </p>
                    <p className="text-[10px] text-muted">
                      {new Date(preview.created_at).toLocaleDateString("it-IT", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <p className="text-[11px] text-muted">
                    {preview.profileName || "Utente anonimo"}
                  </p>
                  {preview.quote_id && (
                    <Link
                      href={`/admin/quotes/${preview.quote_id}`}
                      className="text-[10px] text-accent hover:text-foreground transition-colors uppercase tracking-widest"
                    >
                      Vedi quote &rarr;
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
