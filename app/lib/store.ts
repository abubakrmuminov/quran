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

      getVerse: () => undefined,

      
      
      
      
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
