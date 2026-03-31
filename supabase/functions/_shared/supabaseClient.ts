import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/** Creates a Supabase admin client using the service role key (bypasses RLS) */
export function createAdminClient() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
}
