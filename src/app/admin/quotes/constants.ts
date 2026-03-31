import type { QuoteStatus } from "@/app/lib/supabase/types";

export const statusLabels: Record<QuoteStatus, string> = {
  draft: "Lead",
  new: "Nuovo",
  contacted: "Contattato",
  in_progress: "In lavorazione",
  quoted: "Preventivato",
  accepted: "Accettato",
  rejected: "Rifiutato",
  archived: "Archiviato",
};

export const statusColors: Record<QuoteStatus, string> = {
  draft: "bg-orange-500/20 text-orange-400",
  new: "bg-blue-500/20 text-blue-400",
  contacted: "bg-yellow-500/20 text-yellow-400",
  in_progress: "bg-purple-500/20 text-purple-400",
  quoted: "bg-accent/20 text-accent",
  accepted: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
  archived: "bg-muted/20 text-muted",
};
