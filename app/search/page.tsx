import { Metadata } from 'next';
import { SearchPageWrapper } from '@/app/components/search-page-wrapper';

export const metadata: Metadata = {
  title: 'Search Quran - Find verses, topics, and words',
  description: 'Search through the Holy Quran to find specific verses, topics, or words.',
};

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SearchPageWrapper />
    </div>
  );
}
