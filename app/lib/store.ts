// app/lib/store.ts
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserSettings, BookmarkData, LastReadData, Verse } from '@/app/types/quran';
import quranData from '@/app/lib/quran-data.json';


interface QuranStore {
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;

  lastRead: LastReadData | null;
  updateLastRead: (data: LastReadData) => void;

  bookmarks: BookmarkData[];
  addBookmark: (bookmark: BookmarkData) => void;
  removeBookmark: (verseKey: string) => void;
  isBookmarked: (verseKey: string) => boolean;

  isPlaying: boolean;
  currentVerse: string | null;
  setPlaying: (playing: boolean) => void;
  setCurrentVerse: (verseKey: string | null) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  getVerse: (verseKey: string) => Verse | undefined;
}

const defaultSettings: UserSettings = {
  language: 'en',
  theme: 'system',
  fontSize: 18,
  lineHeight: 1.8,
  arabicFont: 'uthmani',
  showTajweed: false,
  translations: [131],
  reciter: 7,
  autoPlay: false,
  autoScroll: true,
};

export const useQuranStore = create<QuranStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      lastRead: null,
      updateLastRead: (data) => set({ lastRead: data }),

      bookmarks: [],
      addBookmark: (bookmark) =>
        set((state) => ({
          bookmarks: [
            ...state.bookmarks.filter((b) => b.verseKey !== bookmark.verseKey),
            bookmark,
          ],
        })),
      removeBookmark: (verseKey) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.verseKey !== verseKey),
        })),
      isBookmarked: (verseKey) =>
        get().bookmarks.some((b) => b.verseKey === verseKey),

      isPlaying: false,
      currentVerse: null,
      setPlaying: (playing) => set({ isPlaying: playing }),
      setCurrentVerse: (verseKey) => set({ currentVerse: verseKey }),

      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      getVerse: (verseKey: string): Verse | undefined => {
        const v = quranData.find((v: any) => v.verse_key === verseKey);
        if (!v) return undefined;
      
        return {
          id: v.id ?? 0,
          surah_id: v.chapter_id,
          verse_key: v.verse_key,
          chapter_id: v.chapter_id,
          verse_number: v.verse_number,
          hizb_number: v.hizb_number ?? 0,
          rub_number: v.rub_number ?? 0,
          rukus: (v.rukus ?? []) as number[],
          sajdah: v.sajdah ?? false,
          page_number: v.page_number ?? 1,
          text_uthmani: v.text_uthmani,
          text_indopak: v.text_indopak ?? '',
          text_imlaei: v.text_imlaei ?? '',
          text_uthmani_tajweed: v.text_uthmani_tajweed ?? '',
        };
      }
      
      
      
      
    }),
    {
      name: 'quran-store',
      partialize: (state) => ({
        settings: state.settings,
        lastRead: state.lastRead,
        bookmarks: state.bookmarks,
      }),
    }
  )
);
