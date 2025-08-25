// quran.ts — универсальный клиент для Quran API с fallback

import { Surah, Verse, Translation, Reciter, AudioFile, SearchResult, TranslatedVerse } from '@/app/types/quran';
import { getAccessToken } from '@/app/lib/auth';

const QURAN_API_BASE = process.env.QURAN_API_BASE || 'https://api.quran.com/api/v4';
const QURAN_API_TOKEN = process.env.QURAN_API_TOKEN;
const FALLBACK_API_BASE = process.env.FALLBACK_QURAN_API_BASE || 'https://api.alquran.cloud/v1';

let __oauthToken: string | null = null;
let __oauthExpires = 0;

// === TOKEN ===
async function ensureToken(): Promise<string | null> {
  const hasCreds = !!(
    process.env.QURAN_CLIENT_ID &&
    process.env.QURAN_CLIENT_SECRET &&
    (process.env.QURAN_OAUTH_TOKEN_BASE || process.env.QURAN_API_BASE)
  );
  if (!hasCreds && !QURAN_API_TOKEN) return null;
  if (!hasCreds && QURAN_API_TOKEN) return QURAN_API_TOKEN as string;

  const now = Math.floor(Date.now() / 1000);
  if (!__oauthToken || now >= __oauthExpires) {
    const { access_token, expires_in } = await getAccessToken();
    __oauthToken = access_token;
    __oauthExpires = now + (expires_in || 3600) - 30;
  }
  return __oauthToken;
}

// === MAP TO FALLBACK ===
function mapToFallbackPath(path: string, params?: Record<string, any>): string {
  if (path === '/chapters') return '/surah';
  if (path === '/quran/verses/uthmani') return `/surah/${params?.chapter_number || 1}`;
  if (path.startsWith('/quran/translations/')) {
    return `/surah/${params?.chapter_number || 1}/${params?.translationCode || 'en.asad'}`;
  }
  if (path === '/resources/translations') return '/edition?format=text&type=translation';
  if (path === '/resources/recitations') return '/edition?format=audio&type=versebyverse';
  if (path === '/search') return `/search/${encodeURIComponent(params?.q || '')}/all/${params?.language || 'en'}`;
  return path;
}

// === MAP FALLBACK RESPONSE ===
function mapFallbackResponse(path: string, data: any) {
  if (path === '/chapters') {
    return {
      chapters: (data.data || []).map((s: any) => ({
        id: s.number,
        name_simple: s.englishName,
        name_complex: s.englishName,
        name_arabic: s.name,
        verses_count: s.numberOfAyahs,
        revelation_place: s.revelationType,
        bismillah_pre: s.number !== 9,
        translated_name: { language_name: 'english', name: s.englishNameTranslation },
      })),
    };
  }

  if (path === '/quran/verses/uthmani') {
    const ayahs = data.data?.ayahs || [];
    const chapterNumber = data.data?.number || 0;
    return {
      verses: ayahs.map((a: any) => ({
        id: a.number,
        verse_key: `${chapterNumber}:${a.numberInSurah}`,
        text_uthmani: a.text,
        verse_number: a.numberInSurah,
      })),
    };
  }

  if (path.startsWith('/quran/translations/')) {
    const ayahs = data.data?.ayahs || [];
    const chapterNumber = data.data?.number || 0;
    return {
      translation: ayahs.map((a: any) => ({
        verse_key: `${chapterNumber}:${a.numberInSurah}`,
        text: a.text,
        verse_number: a.numberInSurah,
      })),
    };
  }

  if (path === '/resources/translations') {
    return {
      translations: (data.data || []).map((t: any, idx: number) => ({
        id: idx + 1,
        name: t.englishName,
        author_name: t.englishName,
        language_name: t.language,
        resource_id: idx + 1,
        translated_name: { name: t.englishName },
      })),
    };
  }

  if (path === '/resources/recitations') {
    return {
      recitations: (data.data || []).map((r: any, idx: number) => ({
        id: idx + 1,
        reciter_name: r.englishName,
        style: r.format,
      })),
    };
  }

  if (path === '/search') {
    return {
      results: (data.data?.matches || []).map((m: any) => ({
        verse_key: `${m.surah?.number || 'unknown'}:${m.numberInSurah}`,
        text: m.text,
        highlighted: m.text,
      })),
      total_matches: data.data?.count || 0,
    };
  }

  return data;
}

// === UNIVERSAL FETCH ===
export async function quranFetch(path: string, params?: Record<string, any>) {
  try {
    // client -> proxy
    if (typeof window !== 'undefined') {
      const url = new URL('/api/quran-proxy', window.location.origin);
      url.searchParams.set('path', path);
      if (params) Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, String(v)));
      const res = await fetch(url.toString(), { method: 'GET', cache: 'no-store' });
      if (!res.ok) throw new Error(`Proxy error ${res.status}`);
      return res.json();
    }

    // server -> API
    const url = new URL(path, QURAN_API_BASE);
    if (params) Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.append(k, String(v)));
    const headers: Record<string, string> = {};
    const token = await ensureToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url.toString(), { headers, cache: 'no-store' });

    if (!res.ok && FALLBACK_API_BASE) {
      const fbUrl = new URL(mapToFallbackPath(path, params), FALLBACK_API_BASE.replace(/\/$/, ''));
      const fbRes = await fetch(fbUrl.toString(), { cache: 'no-store' });
      const fbData = await fbRes.json();
      return mapFallbackResponse(path, fbData);
    }

    return res.json();
  } catch (err) {
    if (FALLBACK_API_BASE) {
      const fbUrl = new URL(mapToFallbackPath(path, params), FALLBACK_API_BASE.replace(/\/$/, ''));
      const fbRes = await fetch(fbUrl.toString(), { cache: 'no-store' });
      const fbData = await fbRes.json();
      return mapFallbackResponse(path, fbData);
    }
    throw err;
  }
}

// === HIGH-LEVEL HELPERS ===
export async function getChapters(): Promise<Surah[]> {
  const response = await quranFetch('/chapters');
  return response.chapters || [];
}

export async function getChapter(id: number): Promise<Surah | null> {
  const chapters = await getChapters();
  return chapters.find(c => c.id === id) || null;
}

export async function getVersesUthmani(chapterNumber: number): Promise<Verse[]> {
  const response = await quranFetch('/quran/verses/uthmani', { chapter_number: chapterNumber });
  return response.verses || [];
}

export async function getTranslationsList(): Promise<Translation[]> {
  const response = await quranFetch('/resources/translations');
  return response.translations || [];
}

// ключевая правка для переводов
export async function getTranslation(translationCode: string, chapterNumber: number): Promise<TranslatedVerse[]> {
  const response = await quranFetch(`/quran/translations/${translationCode}`, { chapter_number: chapterNumber, translationCode });
  if (!response?.translation || !Array.isArray(response.translation)) return [];
  return response.translation.map((t: any) => ({
    verse_key: t.verse_key,
    text: t.text,
    verse_number: t.verse_number,
  }));
}

export async function getReciters(): Promise<Reciter[]> {
  const response = await quranFetch('/resources/recitations');
  return response.recitations || [];
}

export async function getChapterAudio(chapterId: number, reciterId: number): Promise<AudioFile[]> {
  const response = await quranFetch(`/chapter_recitations/${reciterId}`, { chapter_number: chapterId });
  return response.audio_files || [];
}

export async function searchQuran(query: string, language: string, page: number = 1): Promise<{ results: SearchResult[]; totalCount: number }> {
  const response = await quranFetch('/search', { q: query, language, page });
  const results = response.results || response.matches || [];
  const totalCount = response.total_matches || response.count || 0;
  return { results, totalCount };
}

// === UTILS ===
export const getVerseKey = (chapterNumber: number, verseNumber: number) => `${chapterNumber}:${verseNumber}`;
export const parseVerseKey = (verseKey: string) => {
  const [chapter, verse] = verseKey.split(':').map(Number);
  return { chapter, verse };
};
export const shouldShowBismillah = (chapterId: number) => chapterId !== 9;
export const getNextChapter = (currentId: number) => (currentId < 114 ? currentId + 1 : null);
export const getPreviousChapter = (currentId: number) => (currentId > 1 ? currentId - 1 : null);

// === ALIASES ===
export const getVerses = getVersesUthmani;
export const getTranslations = getTranslationsList;
