import { adminGetStats } from "@/app/actions/admin";
import Link from "next/link";

export default async function AdminPage() {
  const stats = await adminGetStats();

  return (
    <>
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[0.35em] text-accent mb-4 font-mono">
          Admin
        </p>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight">
          Overview
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        <div className="border border-border p-6">
          <p className="font-display text-2xl text-accent">{stats.totalQuotes}</p>
          <p className="text-xs text-muted mt-1">Preventivi</p>
        </div>
        <div className="border border-border p-6">
          <p className="font-display text-2xl text-orange-400">{stats.totalDrafts}</p>
          <p className="text-xs text-muted mt-1">Lead (draft)</p>
        </div>
        <div className="border border-border p-6">
          <p className="font-display text-2xl text-blue-400">{stats.newQuotes}</p>
          <p className="text-xs text-muted mt-1">Nuovi</p>
        </div>
        <div className="border border-border p-6">
          <p className="font-display text-2xl text-green-400">{stats.acceptedQuotes}</p>
          <p className="text-xs text-muted mt-1">Accettati</p>
        </div>
        <div className="border border-border p-6">
          <p className="font-display text-2xl text-accent">{stats.totalUsers}</p>
          <p className="text-xs text-muted mt-1">Utenti</p>
        </div>
        <div className="border border-border p-6">
          <p className="font-display text-2xl text-accent">{stats.totalPreviews}</p>
          <p className="text-xs text-muted mt-1">Preview AI</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/quotes"
          className="group border border-border p-8 hover:border-accent/30 transition-all duration-300"
        >
          <h2 className="font-display text-xl mb-2 group-hover:text-accent transition-colors">
            Gestione Quote
          </h2>
          <p className="text-sm text-muted">
            Visualizza tutti i preventivi e lead, cambia status, filtra per servizio
          </p>
        </Link>
        <Link
          href="/admin/previews"
          className="group border border-border p-8 hover:border-accent/30 transition-all duration-300"
        >
          <h2 className="font-display text-xl mb-2 group-hover:text-accent transition-colors">
            Preview AI
          </h2>
          <p className="text-sm text-muted">
            Galleria di tutte le preview generate dagli utenti
          </p>
        </Link>
      </div>
    </>
  );
}
