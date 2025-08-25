export async function getAccessToken() {
  const base = process.env.QURAN_OAUTH_TOKEN_BASE || process.env.QURAN_API_BASE || '';
  const clientId = process.env.QURAN_CLIENT_ID;
  const clientSecret = process.env.QURAN_CLIENT_SECRET;

  if (!base || !clientId || !clientSecret) {
    throw new Error("OAuth base / client id / secret are missing. Set QURAN_OAUTH_TOKEN_BASE, QURAN_CLIENT_ID, QURAN_CLIENT_SECRET");
  }

  const res = await fetch(`${base.replace(/\/$/, '')}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to get access token (${res.status}): ${body}`);
  }
  return res.json() as Promise<{ access_token: string; expires_in: number }>;
}
