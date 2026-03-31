"use server";

import { createServerClient } from "@/app/lib/supabase/server";
import { createServiceClient } from "@/app/lib/supabase/service";
import type { QuoteStatus } from "@/app/lib/supabase/types";

async function verifyAdmin() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autenticato");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") throw new Error("Non autorizzato");
  return { user, supabase };
}

export async function adminGetStats() {
  const { supabase } = await verifyAdmin();

  const [
    { count: totalQuotes },
    { count: totalDrafts },
    { count: newQuotes },
    { count: acceptedQuotes },
    { count: userCount },
    { count: previewCount },
  ] = await Promise.all([
    supabase.from("quotes").select("id", { count: "exact", head: true }).neq("status", "draft"),
    supabase.from("quotes").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("quotes").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("quotes").select("id", { count: "exact", head: true }).eq("status", "accepted"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("previews").select("id", { count: "exact", head: true }),
  ]);

  return {
    totalQuotes: totalQuotes ?? 0,
    totalDrafts: totalDrafts ?? 0,
    newQuotes: newQuotes ?? 0,
    acceptedQuotes: acceptedQuotes ?? 0,
    totalUsers: userCount ?? 0,
    totalPreviews: previewCount ?? 0,
  };
}

export async function adminGetAllQuotes(filters?: { status?: QuoteStatus | string; service?: string }) {
  const { supabase } = await verifyAdmin();

  let query = supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (filters?.status) {
    query = query.eq("status", filters.status as QuoteStatus);
  }
  if (filters?.service) {
    query = query.eq("service_id", filters.service);
  }

  const { data, error } = await query;
  if (error) return { quotes: [], error: error.message };
  return { quotes: data ?? [] };
}

export async function adminUpdateQuoteStatus(quoteId: string, status: QuoteStatus) {
  await verifyAdmin();
  const serviceClient = createServiceClient();

  const { error } = await serviceClient
    .from("quotes")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", quoteId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function adminGetAllPreviews() {
  const { supabase } = await verifyAdmin();

  const { data, error } = await supabase
    .from("previews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return { previews: [], error: error.message };

  // Fetch profiles for each preview's user_id
  const userIds = [...new Set((data ?? []).map((p) => p.user_id).filter(Boolean))] as string[];
  const { data: profiles } = userIds.length > 0
    ? await supabase.from("profiles").select("id, full_name").in("id", userIds)
    : { data: [] };
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  // Fetch quote info for each preview's quote_id
  const quoteIds = [...new Set((data ?? []).map((p) => p.quote_id).filter(Boolean))] as string[];
  const { data: quotes } = quoteIds.length > 0
    ? await supabase.from("quotes").select("id, business_name, service_name").in("id", quoteIds)
    : { data: [] };
  const quoteMap = new Map((quotes ?? []).map((q) => [q.id, q]));

  const storageClient = createServiceClient();
  const previewsWithUrls = await Promise.all(
    (data ?? []).map(async (preview) => {
      const { data: urlData } = await storageClient.storage
        .from("previews")
        .createSignedUrl(preview.storage_path, 3600);
      const profile = preview.user_id ? profileMap.get(preview.user_id) : null;
      const quote = preview.quote_id ? quoteMap.get(preview.quote_id) : null;
      return {
        ...preview,
        signedUrl: urlData?.signedUrl ?? null,
        profileName: profile?.full_name ?? null,
        quoteName: quote?.business_name ?? quote?.service_name ?? null,
      };
    })
  );

  return { previews: previewsWithUrls };
}
