// app/bookmarks/BookmarksClient.tsx (клиентский компонент)
"use client";

import { VerseCard } from '@/app/components/quran/verse-card';
import { useQuranStore } from '@/app/lib/store';

interface Bookmark {
  verseKey: string;
  verseNumber: number;
  surahId: number;
}

interface Verse {
  verse_key: string;
  verse_number: number;
  text_uthmani: string;
  chapter_id: number;
}

interface BookmarksClientProps {
  bookmarks: Bookmark[];
}

export default function BookmarksClient({ bookmarks }: BookmarksClientProps) {
  const verses: Verse[] = bookmarks.map((b) => ({
    verse_key: b.verseKey,
    verse_number: b.verseNumber,
    text_uthmani: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
    chapter_id: b.surahId,
  }));

  if (!bookmarks.length) {
    return <div className="p-4 text-center">No bookmarks yet!</div>;
  }

  return (
    <div className="space-y-4 p-4">
      {verses.map((verse, idx) => (
        <VerseCard
          key={verse.verse_key}
          verse={verse}
          chapterId={verse.chapter_id}
          index={idx}
        />
      ))}
    </div>
  );
}
