export interface Surah {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: number[];
  translated_name: {
    language_name: string;
    name: string;
  };
}

export interface Verse {
  chapter_id: number;
  surah_id: number;
  id: number;
  verse_number: number;
  verse_key: string;
  hizb_number: number;
  rub_number: number;
  rukus: number;
  manzil_number: number;
  sajdah_number?: number;
  page_number: number;
  juz_number: number;
  text_uthmani?: string;
  text_uthmani_tajweed?: string;
  text_imlaei?: string;
  text_indopak?: string;
  words?: Word[];
}

export interface LocalVerse {
  verse_key: string;
  chapter_id: number;
  verse_number: number;
  text_uthmani: string;
}


export interface Word {
  id: number;
  position: number;
  audio_url?: string;
  char_type_name: string;
  text_uthmani: string;
  qpc_uthmani_hafs?: string;
  text_indopak?: string;
  text_imlaei?: string;
  translation?: {
    language_name: string;
    text: string;
  };
  transliteration?: {
    language_name: string;
    text: string;
  };
}

export interface Translation {
  resource_id: number;
  language_name: string;
  translated_name: {
    name: string;
    language_name: string;
  };
  author_name: string;
  slug: string;
  verses?: TranslatedVerse[];
}

export interface TranslatedVerse {
  verse_number: number;
  verse_key: string;
  text: string;
  resource_name: string;
  language_name: string;
}

export interface Reciter {
  id: number;
  reciter_name: string;
  translated_name: {
    name: string;
    language_name: string;
  };
  style: string;
  qirat: string;
}

export interface AudioFile {
  id: number;
  chapter_id: number;
  file_size: number;
  format: string;
  audio_url: string;
  duration?: number;
}

export interface SearchResult {
  verse_number: number;
  verse_key: string;
  text: string;
  highlighted: string;
  translation?: string;
  chapter: {
    id: number;
    name_simple: string;
    name_arabic: string;
    verses_count: number;
  };
}

export interface UserSettings {
  language: 'ar' | 'ru' | 'en';
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  lineHeight: number;
  arabicFont: 'uthmani' | 'indopak' | 'imlaei';
  showTajweed: boolean;
  translations: number[];
  reciter: number;
  autoPlay: boolean;
  autoScroll: boolean;
}

export interface BookmarkData {
  surahId: number;
  verseNumber: number;
  verseKey: string;
  timestamp: number;
  note?: string;
}

export interface LastReadData {
  surahId: number;
  verseNumber: number;
  verseKey: string;
  timestamp: number;
}