import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/app/lib/auth";

const QURAN_API_BASE = process.env.QURAN_API_BASE || "https://api.quran.com/api/v4";
const QURAN_API_TOKEN = process.env.QURAN_API_TOKEN || "";

async function fetchWithAuth(url: string, init?: RequestInit) {
  // Prefer OAuth token via Quran.Foundation if creds provided; otherwise try legacy token if set.
  let headers: Record<string, string> = { ...(init?.headers as Record<string, string> || {}) };

  try {
    if (process.env.QURAN_CLIENT_ID && process.env.QURAN_CLIENT_SECRET && (process.env.QURAN_OAUTH_TOKEN_BASE || process.env.QURAN_API_BASE)) {
      const { access_token } = await getAccessToken();
      headers["Authorization"] = `Bearer ${access_token}`;
    } else if (QURAN_API_TOKEN) {
      headers["Authorization"] = `Bearer ${QURAN_API_TOKEN}`;
    }
  } catch (e) {
    // If token retrieval fails, we still attempt unauthenticated (some endpoints may work), but log the error.
    console.error("Token retrieval failed:", e);
  }

  return fetch(url, { ...init, headers, cache: "no-store" });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") || "/chapters";

  // Pass through any additional query params
  const forwardParams = new URLSearchParams(searchParams);
  forwardParams.delete("path");

  const target = new URL(path, QURAN_API_BASE);
  for (const [k, v] of forwardParams.entries()) target.searchParams.append(k, v);

  const res = await fetchWithAuth(target.toString(), { method: "GET" });
  const data = await res.json().catch(() => ({}));

  return NextResponse.json(data, { status: res.status });
}
