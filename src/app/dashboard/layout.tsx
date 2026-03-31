import { redirect } from "next/navigation";
import { createServerClient } from "@/app/lib/supabase/server";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen">
      {/* Dashboard nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-8 h-16">
          <Link
            href="/"
            className="font-display text-lg tracking-tight text-foreground hover:text-accent transition-colors"
          >
            edizioniduepuntozero
          </Link>

          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-xs uppercase tracking-[0.2em] text-muted hover:text-foreground transition-colors duration-300"
            >
              Preventivi
            </Link>
            <Link
              href="/dashboard/profile"
              className="text-xs uppercase tracking-[0.2em] text-muted hover:text-foreground transition-colors duration-300"
            >
              Profilo
            </Link>
            {profile?.role === "admin" && (
              <Link
                href="/admin"
                className="text-xs uppercase tracking-[0.2em] text-accent hover:text-foreground transition-colors duration-300"
              >
                Admin
              </Link>
            )}
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
