'use client';

import { VerseCard } from '@/app/components/quran/verse-card';
import { useQuranStore } from '@/app/lib/store';

export default function BookmarksPage() {
  const { bookmarks, getVerse } = useQuranStore();

  if (!bookmarks.length) return <div className="p-4 text-center">No bookmarks yet!</div>;

  return (
    <div className="space-y-4 p-4">
      {bookmarks.map((b, idx) => {
        const verse = getVerse(b.verseKey);
        if (!verse) return null;

        return (
          <VerseCard
            key={verse.verse_key}
            verse={verse}
            chapterId={verse.chapter_id}
            index={idx}
          />
        );
      })}
    </div>
  );
}
