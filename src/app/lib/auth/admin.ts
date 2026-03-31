"use server";

import { createServerClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

/**
 * Verifica che l'utente corrente sia un admin.
 * Se non autenticato → redirect /login
 * Se non admin → redirect /dashboard
 * Ritorna l'utente autenticato.
 */
export async function requireAdmin(): Promise<User> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  return user;
}

/**
 * Verifica se l'utente corrente è admin (senza redirect).
 * Utile per check condizionali.
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role === "admin";
}
