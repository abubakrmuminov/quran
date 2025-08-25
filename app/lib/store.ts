'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserSettings, BookmarkData, LastReadData } from '@/app/types/quran';

interface QuranStore {
  // Settings
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  
  // Last read position
  lastRead: LastReadData | null;
  updateLastRead: (data: LastReadData) => void;
  
  // Bookmarks
  bookmarks: BookmarkData[];
  addBookmark: (bookmark: BookmarkData) => void;
  removeBookmark: (verseKey: string) => void;
  isBookmarked: (verseKey: string) => boolean;
  
  // Audio state
  isPlaying: boolean;
  currentVerse: string | null;
  setPlaying: (playing: boolean) => void;
  setCurrentVerse: (verseKey: string | null) => void;
  
  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const defaultSettings: UserSettings = {
  language: 'en',
  theme: 'system',
  fontSize: 18,
  lineHeight: 1.8,
  arabicFont: 'uthmani',
  showTajweed: false,
  translations: [131], // Default to Saheeh International
  reciter: 7, // Default to Mishary Rashid Alafasy
  autoPlay: false,
  autoScroll: true,
};

export const useQuranStore = create<QuranStore>()(
  persist(
    (set, get) => ({
      // Settings
      settings: defaultSettings,
      updateSettings: (newSettings) => 
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        })),
      
      // Last read
      lastRead: null,
      updateLastRead: (data) => set({ lastRead: data }),
      
      // Bookmarks
      bookmarks: [],
      addBookmark: (bookmark) => 
        set((state) => ({
          bookmarks: [...state.bookmarks.filter(b => b.verseKey !== bookmark.verseKey), bookmark]
        })),
      removeBookmark: (verseKey) => 
        set((state) => ({
          bookmarks: state.bookmarks.filter(b => b.verseKey !== verseKey)
        })),
      isBookmarked: (verseKey) => 
        get().bookmarks.some(b => b.verseKey === verseKey),
      
      // Audio state
      isPlaying: false,
      currentVerse: null,
      setPlaying: (playing) => set({ isPlaying: playing }),
      setCurrentVerse: (verseKey) => set({ currentVerse: verseKey }),
      
      // UI state
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
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