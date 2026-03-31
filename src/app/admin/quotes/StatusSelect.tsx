"use client";

import { useState, useTransition } from "react";
import { adminUpdateQuoteStatus } from "@/app/actions/admin";
import type { QuoteStatus } from "@/app/lib/supabase/types";
import { useRouter } from "next/navigation";

const ALL_STATUSES: QuoteStatus[] = [
  "draft", "new", "contacted", "in_progress", "quoted", "accepted", "rejected", "archived",
];

type StatusSelectProps = {
  quoteId: string;
  currentStatus: QuoteStatus;
  statusLabels: Record<QuoteStatus, string>;
  statusColors: Record<QuoteStatus, string>;
};

export function StatusSelect({ quoteId, currentStatus, statusLabels, statusColors }: StatusSelectProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange(newStatus: QuoteStatus) {
    const oldStatus = status;
    setStatus(newStatus);
    startTransition(async () => {
      const result = await adminUpdateQuoteStatus(quoteId, newStatus);
      if (!result.success) setStatus(oldStatus);
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value as QuoteStatus)}
        disabled={isPending}
        className={`appearance-none text-[10px] uppercase tracking-widest px-3 py-1 border-0 cursor-pointer transition-all duration-300 ${
          isPending ? "opacity-50" : ""
        } ${statusColors[status]}`}
      >
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {statusLabels[s]}
          </option>
        ))}
      </select>
    </div>
  );
}
