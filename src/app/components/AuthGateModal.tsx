"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/app/lib/supabase/client";
import { X } from "lucide-react";

type AuthGateModalProps = {
  onAuthenticated: () => void;
  onClose: () => void;
  onNeedRedirect: () => void;
};

export default function AuthGateModal({
  onAuthenticated,
  onClose,
  onNeedRedirect,
}: AuthGateModalProps) {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email o password non corretti"
          : error.message
      );
    } else {
      onAuthenticated();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Le password non coincidono");
      return;
    }

    if (password.length < 6) {
      setError("La password deve essere di almeno 6 caratteri");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent("/?restore=wizard#pricing")}`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      onNeedRedirect();
      setEmailSent(true);
    }
  };

  const handleGoogleOAuth = async () => {
    setError(null);
    onNeedRedirect();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent("/?restore=wizard#pricing")}`,
      },
    });
  };

  const handleVerifyAndContinue = async () => {
    setVerificationError(null);
    setVerificationLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        onAuthenticated();
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const lowerMsg = error.message.toLowerCase();
        if (lowerMsg.includes("email") && lowerMsg.includes("confirm")) {
          setVerificationError(
            "La verifica non risulta ancora completata. Dopo aver cliccato il link nella mail, premi di nuovo qui."
          );
          return;
        }

        setVerificationError(
          error.message === "Invalid login credentials"
            ? "Verifica completata, ma non riesco ad accedere automaticamente. Controlla password e riprova."
            : error.message
        );
        return;
      }

      onAuthenticated();
    } finally {
      setVerificationLoading(false);
    }
  };

  // Post-registration: email confirmation message
  if (emailSent) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="relative w-full max-w-sm mx-4 border border-border bg-background p-8 animate-fade-up">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors"
            aria-label="Chiudi"
          >
            <X size={16} />
          </button>

          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-5 border border-accent/30 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="font-display text-xl mb-2">
              Controlla la tua email
            </h3>
            <p className="text-sm text-muted mb-2">
              Abbiamo inviato un link di conferma a{" "}
              <span className="text-foreground">{email}</span>
            </p>
            <p className="text-xs text-muted mb-6">
              Dopo aver cliccato il link nella mail, torna qui e premi
              il pulsante per continuare. I tuoi dati restano salvati.
            </p>

            {verificationError && (
              <div className="mb-4 p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-left">
                {verificationError}
              </div>
            )}

            <button
              type="button"
              onClick={handleVerifyAndContinue}
              disabled={verificationLoading}
              className="w-full mb-4 py-2.5 bg-accent text-background text-xs font-medium uppercase tracking-widest hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {verificationLoading
                ? "Controllo verifica..."
                : "Ho verificato, continua"}
            </button>

            <div className="flex items-center gap-3 justify-center text-[10px] text-accent">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                Dati del form salvati
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                Configurazione preservata
              </span>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-sm mx-4 border border-border bg-background p-8 animate-fade-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors"
          aria-label="Chiudi"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 mx-auto mb-4 border border-accent/30 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="font-display text-xl mb-1">
            {mode === "login" ? "Accedi" : "Crea un account"}
          </h3>
          <p className="text-xs text-muted">
            per generare la preview del tuo sito
          </p>
        </div>

        {/* Reassurance */}
        <div className="mb-5 p-3 bg-accent/5 border border-accent/10">
          <p className="text-[11px] text-accent text-center leading-relaxed">
            I tuoi dati sono al sicuro — dopo l&apos;accesso la
            generazione partir&agrave; in automatico
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Google OAuth */}
        <button
          onClick={handleGoogleOAuth}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border border-border bg-surface text-foreground text-xs tracking-wide hover:border-accent/50 transition-colors duration-300"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {mode === "login" ? "Accedi con Google" : "Registrati con Google"}
        </button>

        {/* Divider */}
        <div className="my-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] text-muted uppercase tracking-widest">
            oppure
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Login form */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email"
              className="w-full px-3.5 py-2.5 bg-surface border border-border text-foreground text-xs placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="w-full px-3.5 py-2.5 bg-surface border border-border text-foreground text-xs placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent text-background text-xs font-medium uppercase tracking-widest hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Accesso..." : "Accedi"}
            </button>
          </form>
        )}

        {/* Register form */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="space-y-3">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Nome completo"
              className="w-full px-3.5 py-2.5 bg-surface border border-border text-foreground text-xs placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email"
              className="w-full px-3.5 py-2.5 bg-surface border border-border text-foreground text-xs placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Password (min 6 caratteri)"
              className="w-full px-3.5 py-2.5 bg-surface border border-border text-foreground text-xs placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Conferma password"
              className="w-full px-3.5 py-2.5 bg-surface border border-border text-foreground text-xs placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent text-background text-xs font-medium uppercase tracking-widest hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Registrazione..." : "Crea account"}
            </button>
          </form>
        )}

        {/* Toggle mode */}
        <p className="mt-4 text-center text-[11px] text-muted">
          {mode === "login" ? (
            <>
              Non hai un account?{" "}
              <button
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className="text-accent hover:text-foreground transition-colors"
              >
                Registrati
              </button>
            </>
          ) : (
            <>
              Hai gi&agrave; un account?{" "}
              <button
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="text-accent hover:text-foreground transition-colors"
              >
                Accedi
              </button>
            </>
          )}
        </p>
      </div>
    </div>,
    document.body
  );
}
