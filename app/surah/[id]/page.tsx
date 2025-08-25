import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SurahPageWrapper } from '@/app/components/surah-page-wrapper';
import { getChapter, getVerses, getTranslations, getReciters } from '@/app/lib/quran';

interface SurahPageProps {
  params: { id: string };
  searchParams: { verse?: string; translation?: string };
}

export async function generateMetadata({ params }: SurahPageProps): Promise<Metadata> {
  try {
    const surahId = parseInt(params.id);
    if (isNaN(surahId) || surahId < 1 || surahId > 114) {
      return { title: 'Chapter Not Found' };
    }
    const chapter = await getChapter(surahId);
    return {
      title: chapter?.name_simple ? `${chapter.name_simple} — Quran Reader` : 'Quran Reader',
    };
  } catch {
    return { title: 'Quran Reader' };
  }
}

export default async function SurahPage({ params, searchParams }: SurahPageProps) {
  const surahId = parseInt(params.id);
  if (isNaN(surahId) || surahId < 1 || surahId > 114) return notFound();

  const chapter = await getChapter(surahId);
  if (!chapter) return notFound();

  const [verses, translations, reciters] = await Promise.all([
    getVerses(surahId),
    getTranslations(),
    getReciters(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <SurahPageWrapper
        chapter={chapter}
        verses={verses}
        translationData={translations}
        reciters={reciters}
        searchParams={searchParams}
      />
    </div>
  );
}
