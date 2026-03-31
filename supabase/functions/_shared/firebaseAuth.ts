import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts';

const FIREBASE_PROJECT_ID = Deno.env.get('FIREBASE_PROJECT_ID') ?? 'cinescope-c722f';
const JWKS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

const jwks = jose.createRemoteJWKSet(new URL(JWKS_URL));

export async function verifyFirebaseToken(token: string): Promise<string> {
  const { payload } = await jose.jwtVerify(token, jwks, {
    algorithms: ['RS256'],
    issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
    audience: FIREBASE_PROJECT_ID,
  });

  const uid = payload.sub;
  if (!uid) {
    throw new Error('Token has no sub claim');
  }

  return uid;
}
