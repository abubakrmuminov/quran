'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { searchQuran } from '@/app/lib/quran';
import { SearchResult } from '@/app/types/quran';
import { useQuranStore } from '@/app/lib/store';
import { t } from '@/app/i18n';
import Link from 'next/link';

interface SearchPageContentProps {
  searchParams: { q?: string; page?: string };
}

export function SearchPageContent({ searchParams }: SearchPageContentProps) {
  const router = useRouter();
  const { settings } = useQuranStore();
  const [query, setQuery] = useState(searchParams.q || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isRTL = settings.language === 'ar';
  const currentPage = parseInt(searchParams.page || '1');

  // Perform search when query or page changes
  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        setTotalCount(0);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { results: searchResults, totalCount: total } = await searchQuran(
          query,
          settings.language,
          currentPage
        );
        setResults(searchResults);
        setTotalCount(total);
      } catch (err) {
        console.error('Search failed:', err);
        setError('Failed to search. Please try again.');
        setResults([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, settings.language, currentPage]);

  // Update URL when searching
  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    if (newQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(newQuery.trim())}`);
    } else {
      router.push('/search');
    }
  };

  // Group results by chapter
  const groupedResults = useMemo(() => {
    const groups: Record<number, SearchResult[]> = {};
    results.forEach(result => {
      const chapterId = result.chapter.id;
      if (!groups[chapterId]) {
        groups[chapterId] = [];
      }
      groups[chapterId].push(result);
    });
    return groups;
  }, [results]);

  const totalPages = Math.ceil(totalCount / 20); // Assuming 20 results per page

  return (
    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className={`text-center space-y-4 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {t('searchQuran', settings.language)}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {settings.language === 'ar' 
              ? 'ابحث في آيات القرآن الكريم عن الكلمات والمفاهيم والمواضيع'
              : settings.language === 'ru'
              ? 'Ищите в аятах Священного Корана слова, концепции и темы'
              : 'Search through verses of the Holy Quran for words, concepts, and topics'
            }
          </p>
        </div>

        {/* Search Input */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className={`absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground ${isRTL ? 'right-4' : 'left-4'}`} />
            <Input
              type="search"
              placeholder={t('searchPlaceholder', settings.language)}
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className={`${isRTL ? 'pr-12 text-right' : 'pl-12'} h-14 text-lg`}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>
        </div>

        {/* Search Stats */}
        {query.trim() && (
          <div className={`text-center text-sm text-muted-foreground ${isRTL ? 'text-right' : ''}`}>
            {loading ? (
              <span>{t('loading', settings.language)}...</span>
            ) : totalCount > 0 ? (
              <span>
                {totalCount} {t('searchResults', settings.language)} for "{query}"
              </span>
            ) : query.trim() && !loading ? (
              <span>{t('noResults', settings.language)}</span>
            ) : null}
          </div>
        )}
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <div className="text-destructive mb-4">{error}</div>
          <Button 
            variant="outline" 
            onClick={() => handleSearch(query)}
          >
            {t('retry', settings.language)}
          </Button>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">{t('loading', settings.language)}</p>
        </div>
      )}

      {/* Search Results */}
      {!loading && results.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {Object.entries(groupedResults).map(([chapterId, chapterResults]) => {
            const chapter = chapterResults[0].chapter;
            return (
              <div key={chapterId} className="space-y-4">
                {/* Chapter Header */}
                <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Badge variant="outline" className="text-sm">
                    {t('chapter', settings.language)} {chapter.id}
                  </Badge>
                  <h2 className="text-xl font-semibold text-foreground">
                    {chapter.name_simple} ({chapter.name_arabic})
                  </h2>
                  <div className="flex-1">
                    <Separator />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {chapterResults.length} {chapterResults.length === 1 ? 'result' : 'results'}
                  </span>
                </div>

                {/* Chapter Results */}
                <div className="space-y-4">
                  {chapterResults.map((result, index) => (
                    <motion.div
                      key={`${result.verse_key}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                          <Link href={`/surah/${chapter.id}?verse=${result.verse_number}`}>
                            <div className="space-y-4">
                              {/* Verse Header */}
                              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <Badge variant="secondary">
                                  {result.verse_key}
                                </Badge>
                                <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                                  <FileText className="h-4 w-4" />
                                  <span>
                                    {t('verse', settings.language)} {result.verse_number}
                                  </span>
                                  <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                                </div>
                              </div>

                              {/* Arabic Text with Highlighting */}
                              <div className={`${isRTL ? 'text-right' : 'text-center'}`}>
                                <p 
                                  className="font-arabic text-xl leading-relaxed text-foreground"
                                  dir="rtl"
                                  dangerouslySetInnerHTML={{ 
                                    __html: result.highlighted || result.text 
                                  }}
                                />
                              </div>

                              {/* Translation */}
                              {result.translation && (
                                <>
                                  <Separator />
                                  <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                                    <p 
                                      className="text-muted-foreground leading-relaxed"
                                      dir={isRTL ? 'rtl' : 'ltr'}
                                    >
                                      {result.translation}
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => {
              const newPage = Math.max(1, currentPage - 1);
              router.push(`/search?q=${encodeURIComponent(query)}&page=${newPage}`);
            }}
          >
            {t('previous', settings.language)}
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              const isCurrentPage = page === currentPage;
              
              return (
                <Button
                  key={page}
                  variant={isCurrentPage ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    router.push(`/search?q=${encodeURIComponent(query)}&page=${page}`);
                  }}
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => {
              const newPage = Math.min(totalPages, currentPage + 1);
              router.push(`/search?q=${encodeURIComponent(query)}&page=${newPage}`);
            }}
          >
            {t('next', settings.language)}
          </Button>
        </div>
      )}

      {/* No Results */}
      {!loading && query.trim() && results.length === 0 && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <Search className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-foreground mb-4">
            {t('noResults', settings.language)}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {settings.language === 'ar' 
              ? 'لم نجد أي نتائج لبحثك. جرب كلمات مختلفة أو تحقق من الإملاء.'
              : settings.language === 'ru'
              ? 'Мы не нашли результатов для вашего запроса. Попробуйте другие слова или проверьте правописание.'
              : 'We couldn\'t find any results for your search. Try different keywords or check your spelling.'
            }
          </p>
        </motion.div>
      )}

      {/* Popular Searches / Suggestions */}
      {!query.trim() && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className={`text-center ${isRTL ? 'text-right' : ''}`}>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {settings.language === 'ar' 
                ? 'اقتراحات للبحث'
                : settings.language === 'ru'
                ? 'Популярные поиски'
                : 'Popular Searches'
              }
            </h2>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'paradise', 'patience', 'prayer', 'forgiveness', 'mercy', 
                'guidance', 'faith', 'charity', 'knowledge', 'peace'
              ].map((term) => (
                <Button
                  key={term}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch(term)}
                  className="capitalize"
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}