"use server";

import { createServiceClient } from "@/app/lib/supabase/service";

// In-memory fallback when DB is unreachable
const fallbackCounts = new Map<string, { count: number; resetAt: number }>();

function checkFallbackLimit(key: string, action: string, maxCount: number): boolean {
  const compositeKey = `${key}:${action}`;
  const now = Date.now();
  const entry = fallbackCounts.get(compositeKey);

  if (!entry || now > entry.resetAt) {
    fallbackCounts.set(compositeKey, { count: 1, resetAt: now + 3600_000 });
    return true;
  }
  if (entry.count >= maxCount) return false;
  entry.count++;
  return true;
}

export async function checkRateLimit(
  key: string,
  action: string,
  maxCount: number
): Promise<{ allowed: boolean }> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase.rpc(
      "check_and_increment_rate_limit",
      {
        p_key: key,
        p_action: action,
        p_max_count: maxCount,
        p_window_interval: "1 hour",
      }
    );

    if (error) {
      console.error("Rate limit check failed, using in-memory fallback:", error);
      return { allowed: checkFallbackLimit(key, action, maxCount) };
    }

    return { allowed: data as boolean };
  } catch (err) {
    console.error("Rate limit error, using in-memory fallback:", err);
    return { allowed: checkFallbackLimit(key, action, maxCount) };
  }
}
