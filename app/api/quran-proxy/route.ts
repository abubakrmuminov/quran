// app/api/quran-proxy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/app/lib/auth";

const QURAN_API_BASE = process.env.QURAN_API_BASE || "https://api.quran.com/api/v4";
const QURAN_API_TOKEN = process.env.QURAN_API_TOKEN || "";
const FALLBACK_API_BASE = "https://api.alquran.cloud/v1";

// Получаем токен для quran.com
async function getAuthHeaders() {
  try {
    if (process.env.QURAN_CLIENT_ID && process.env.QURAN_CLIENT_SECRET) {
      const { access_token } = await getAccessToken();
      return { Authorization: `Bearer ${access_token}` };
    } else if (QURAN_API_TOKEN) {
      return { Authorization: `Bearer ${QURAN_API_TOKEN}` };
    }
  } catch (e) {
    console.error("Token retrieval failed:", e);
  }
  return {};
}

// Маппинг пути для fallback AlQuran Cloud
function mapToFallbackPath(path: string, params: URLSearchParams) {
  if (path === "/chapters") return "/surah";
  if (path.startsWith("/quran/verses/uthmani")) {
    const chapter = params.get("chapter_number") || "1";
    return `/surah/${chapter}`;
  }
  if (path.startsWith("/quran/translations/")) {
    const chapter = params.get("chapter_number") || "1";
    const edition = path.split("/").pop() || "131"; // или default edition
    return `/surah/${chapter}/${edition}`;
  }
  if (path === "/resources/translations") return "/edition?format=text&type=translation";
  if (path === "/resources/recitations") return "/edition?format=audio&type=versebyverse";
  if (path === "/search") {
    const q = params.get("q") || "";
    const language = params.get("language") || "en";
    return `/search/${encodeURIComponent(q)}/all/${language}`;
  }
  return path;
}

// Универсальный fetch с fallback
async function fetchWithFallback(path: string, params: URLSearchParams) {
  // quran.com
  const headers = await getAuthHeaders();
  const urlQuranCom = new URL(path, QURAN_API_BASE);
  params.forEach((v, k) => urlQuranCom.searchParams.append(k, v));

  let res = await fetch(urlQuranCom.toString(), { cache: "no-store" });
  if (res.ok) return res.json();

  // fallback AlQuran Cloud
  const fallbackPath = mapToFallbackPath(path, params);
  const urlFallback = new URL(fallbackPath, FALLBACK_API_BASE);
  const fbRes = await fetch(urlFallback.toString(), { cache: "no-store" });
  return fbRes.json();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") || "/chapters";

  const forwardParams = new URLSearchParams(searchParams);
  forwardParams.delete("path");

  try {
    const data = await fetchWithFallback(path, forwardParams);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Quran proxy failed:", err);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
