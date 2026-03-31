"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/lib/supabase/client";

export default function ProfilePage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password change
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        setEmail(user.email ?? "");

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          setFullName(profile.full_name ?? "");
          setPhone(profile.phone ?? "");
          setCompanyName(profile.company_name ?? "");
        }
      } catch {
        setError("Errore nel caricamento del profilo");
      }
    }
    load();
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone,
        company_name: companyName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    setSaving(false);
    if (updateError) {
      setError(updateError.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg("Le password non coincidono");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg("La password deve essere di almeno 6 caratteri");
      return;
    }

    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setPasswordSaving(false);
    if (error) {
      setPasswordMsg(error.message);
    } else {
      setPasswordMsg("Password aggiornata con successo");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <>
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.35em] text-accent mb-4 font-mono">
          Profilo
        </p>
        <h1 className="font-display text-3xl tracking-tight">
          Il tuo profilo
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile form */}
        <div className="border border-border p-8">
          <h2 className="text-xs uppercase tracking-widest text-muted mb-6">
            Informazioni personali
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 bg-surface/50 border border-border text-muted text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-muted mb-2">
                Nome completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-border text-foreground text-sm placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                placeholder="Mario Rossi"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-muted mb-2">
                Telefono
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-border text-foreground text-sm placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                placeholder="+39 123 456 7890"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-muted mb-2">
                Azienda
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-border text-foreground text-sm placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                placeholder="Nome azienda"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-accent text-background px-8 py-3 text-sm font-medium uppercase tracking-widest hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {saving ? "Salvataggio..." : saved ? "Salvato!" : "Salva"}
            </button>
          </form>
        </div>

        {/* Password change */}
        <div className="border border-border p-8 h-fit">
          <h2 className="text-xs uppercase tracking-widest text-muted mb-6">
            Cambia password
          </h2>

          {passwordMsg && (
            <div
              className={`mb-4 p-3 text-sm border ${
                passwordMsg.includes("successo")
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              {passwordMsg}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted mb-2">
                Nuova password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-border text-foreground text-sm placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                placeholder="Minimo 6 caratteri"
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-muted mb-2">
                Conferma nuova password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-border text-foreground text-sm placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                placeholder="Ripeti la password"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={passwordSaving || !newPassword}
              className="bg-foreground text-background px-8 py-3 text-sm font-medium uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-50"
            >
              {passwordSaving ? "Aggiornamento..." : "Aggiorna password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
