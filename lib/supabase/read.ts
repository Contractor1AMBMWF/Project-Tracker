import { createClient } from "@supabase/supabase-js";

// Anon-key client for Server Component data fetches. Read-only by RLS policy.
export function createReadClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
