/** Standard CORS headers for all Edge Functions */
const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') ?? '*'

export const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
}

/** Returns a CORS preflight response for OPTIONS requests */
export function handleCors(): Response {
  return new Response(null, { status: 204, headers: corsHeaders })
}
