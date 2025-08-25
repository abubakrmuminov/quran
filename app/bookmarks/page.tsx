// app/bookmarks/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { VerseCard } from '@/app/components/quran/verse-card';
import { useQuranStore } from '@/app/lib/store';
import { Verse, BookmarkData } from '@/app/types/quran';

export default function BookmarksPage() {
  const { bookmarks, getVerse } = useQuranStore();
  const [verses, setVerses] = useState<Verse[]>([]);

  useEffect(() => {
    const fetchedVerses = bookmarks
      .map((b: BookmarkData) => getVerse(b.verseKey))
      .filter(Boolean) as Verse[];
    setVerses(fetchedVerses);
  }, [bookmarks, getVerse]);

  if (!verses.length) {
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
