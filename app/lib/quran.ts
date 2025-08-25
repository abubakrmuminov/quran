// Safe client/server Quran API helpers with fallback to AlQuran Cloud.
import { Surah, Verse, Translation, Reciter, AudioFile, SearchResult } from '@/app/types/quran';
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

  // use legacy token if provided
  if (!hasCreds && QURAN_API_TOKEN) return QURAN_API_TOKEN as string;

  const now = Math.floor(Date.now() / 1000);
  if (!__oauthToken || now >= __oauthExpires) {
    const { access_token, expires_in } = await getAccessToken();
    __oauthToken = access_token;
    __oauthExpires = now + (expires_in || 3600) - 30;
  }
  return __oauthToken;
}

// === FALLBACK URL MAP ===
function mapToFallbackPath(originalPath: string, params?: Record<string, any>): string {
  if (originalPath === '/chapters') return '/surah';
  if (originalPath === '/quran/verses/uthmani') {
    const chapter = params?.chapter_number || params?.chapter || 1;
    return `/surah/${chapter}`;
  }
  if (originalPath.startsWith('/quran/translations/')) {
    const chapter = params?.chapter_number || params?.chapter || 1;
    const id = originalPath.split('/').pop();
    return `/surah/${chapter}/${id}`;
  }
  if (originalPath === '/resources/translations')
    return '/edition?format=text&type=translation';
  if (originalPath === '/resources/recitations')
    return '/edition?format=audio&type=versebyverse';
  if (originalPath === '/search') {
    const query = params?.q || '';
    const language = params?.language || 'en';
    return `/search/${encodeURIComponent(query)}/all/${language}`;
  }
  return originalPath;
}

// === FALLBACK RESPONSE MAP ===
function mapFallbackResponse(originalPath: string, fallbackData: any): any {
  if (originalPath === '/chapters') {
    return {
      chapters: fallbackData.data?.map((surah: any) => ({
        id: surah.number,
        name_simple: surah.englishName,
        name_complex: surah.englishName,
        name_arabic: surah.name,
        verses_count: surah.numberOfAyahs,
        revelation_place: surah.revelationType,
        bismillah_pre: surah.number !== 9,
        translated_name: {
          language_name: 'english',
          name: surah.englishNameTranslation,
        },
      })) || [],
    };
  }

  if (originalPath === '/quran/verses/uthmani') {
    const ayahs = fallbackData.data?.ayahs || [];
    const chapterNumber = fallbackData.data?.number || 0; // Fallback to 0 if undefined
    return {
      verses: ayahs.map((ayah: any) => ({
        id: ayah.number,
        verse_key: `${chapterNumber}:${ayah.numberInSurah}`,
        text_uthmani: ayah.text,
      })),
    };
  }

  if (originalPath.startsWith('/quran/translations/')) {
    const chapter = fallbackData?.data?.ayahs || [];
    return {
      translation: chapter.map((a: any) => ({
        id: a.number,
        verse_key: `${a.surah?.number || fallbackData.data?.number || 'unknown'}:${a.numberInSurah}`,
        text: a.text,
      })),
    };
  }

  if (originalPath === '/resources/translations') {
    return {
      translations: (fallbackData.data || []).map((e: any, idx: number) => ({
        id: idx + 1,
        name: e.englishName,
        author_name: e.englishName,
        language_name: e.language,
      })),
    };
  }

  if (originalPath === '/resources/recitations') {
    return {
      recitations: (fallbackData.data || []).map((e: any, idx: number) => ({
        id: idx + 1,
        reciter_name: e.englishName,
        style: e.format,
      })),
    };
  }

  if (originalPath === '/search') {
    return {
      results: (fallbackData.data?.matches || []).map((m: any) => ({
        verse_key: `${m.surah?.number || 'unknown'}:${m.numberInSurah}`,
        text: m.text,
        highlighted: m.text,
      })),
      total_matches: fallbackData.data?.count || 0,
    };
  }

  return fallbackData;
}

// === UNIVERSAL FETCH ===
export async function quranFetch(path: string, params?: Record<string, any>): Promise<any> {
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
    const baseUrl = QURAN_API_BASE.replace(/\/$/, '');
    const url = new URL(path, baseUrl);
    if (params) Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.append(k, String(v)));

    const headers: Record<string, string> = {};
    const token = await ensureToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url.toString(), { headers, cache: 'no-store' });

    if (res.status === 401 || res.status === 403 || (!res.ok && FALLBACK_API_BASE)) {
      // fallback
      const fbUrl = new URL(mapToFallbackPath(path, params), FALLBACK_API_BASE.replace(/\/$/, ''));
      const fbRes = await fetch(fbUrl.toString(), { cache: 'no-store' });
      const fbData = await fbRes.json();
      return mapFallbackResponse(path, fbData);
    }

    return res.json();
  } catch (err) {
    // last resort fallback
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
  const response = await quranFetch('/chapters');
  const chapters = response.chapters || [];
  return chapters.find((c: any) => c.id === id) || null;
}

export async function getVersesUthmani(chapterNumber: number): Promise<Verse[]> {
  const response = await quranFetch('/quran/verses/uthmani', { chapter_number: chapterNumber });
  return response.verses || [];
}

export async function getTranslationsList(): Promise<Translation[]> {
  const response = await quranFetch('/resources/translations');
  return response.translations || [];
}

export async function getTranslation(translationId: number, chapterNumber: number): Promise<Translation | null> {
  const response = await quranFetch(`/quran/translations/${translationId}`, { chapter_number: chapterNumber });
  return response.translation || null;
}

export async function getReciters(): Promise<Reciter[]> {
  const response = await quranFetch('/resources/recitations');
  return response.recitations || [];
}

export async function getChapterAudio(chapterId: number, reciterId: number): Promise<AudioFile[]> {
  const response = await quranFetch(`/chapter_recitations/${reciterId}`, { chapter_number: chapterId });
  return response.audio_files || [];
}

export async function searchQuran(
  query: string,
  language: string,
  page: number = 1
): Promise<{ results: SearchResult[]; totalCount: number }> {
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

// === ALIASES (чтобы не было "is not a function") ===
export const getVerses = getVersesUthmani;
export const getTranslations = getTranslationsList;