import { requireAdmin } from "@/app/lib/auth/admin";
import Link from "next/link";
import LogoutButton from "@/app/dashboard/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen">
      {/* Admin nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-8 h-16">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="font-display text-lg tracking-tight text-foreground hover:text-accent transition-colors"
            >
              edizioniduepuntozero
            </Link>
            <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 bg-accent/20 text-accent border border-accent/30">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-8">
            <Link
              href="/admin"
              className="text-xs uppercase tracking-[0.2em] text-muted hover:text-foreground transition-colors duration-300"
            >
              Overview
            </Link>
            <Link
              href="/admin/quotes"
              className="text-xs uppercase tracking-[0.2em] text-muted hover:text-foreground transition-colors duration-300"
            >
              Quote
            </Link>
            <Link
              href="/admin/previews"
              className="text-xs uppercase tracking-[0.2em] text-muted hover:text-foreground transition-colors duration-300"
            >
              Preview
            </Link>
            <Link
              href="/dashboard"
              className="text-xs uppercase tracking-[0.2em] text-muted/50 hover:text-foreground transition-colors duration-300"
            >
              Dashboard Utente
            </Link>
            <LogoutButton />
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
