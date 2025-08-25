import { Metadata } from 'next';
import { getChapters } from '@/app/lib/quran';
import { HomePageContentWrapper } from '@/app/components/home-page-wrapper';

export const metadata: Metadata = {
  title: 'Quran Reader - Read, Listen, and Reflect on the Holy Quran',
  description: 'Access all 114 chapters of the Quran with beautiful Arabic text, multiple translations, and high-quality audio recitations. Continue your spiritual journey.',
};

export default async function Page() {
  const chapters = await getChapters();
  return (
    <div className="container mx-auto px-4 py-8">
      <HomePageContentWrapper chapters={chapters} />
    </div>
  );
}
