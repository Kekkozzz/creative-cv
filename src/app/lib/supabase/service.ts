import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Cookie-free Supabase service role client.
 * Use this in API routes and utilities where cookie context is unavailable.
 */
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
