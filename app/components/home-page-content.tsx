'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SurahCard } from '@/app/components/quran/surah-card';
import { Surah } from '@/app/types/quran';
import { useQuranStore } from '@/app/lib/store';
import { t } from '@/app/i18n';
import Link from 'next/link';

interface HomePageContentProps {
  chapters: Surah[];
}

export function HomePageContent({ chapters }: HomePageContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { settings, lastRead, bookmarks } = useQuranStore();
  const isRTL = settings.language === 'ar';

  // Filter chapters based on search query
  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return chapters;

    const query = searchQuery.toLowerCase();
    return chapters.filter(chapter =>
      chapter.name_simple.toLowerCase().includes(query) ||
      chapter.name_arabic.includes(query) ||
      (chapter.translated_name?.name || '').toLowerCase().includes(query) ||
      chapter.id.toString().includes(query)
    );
  }, [chapters, searchQuery]);

  // Get recent bookmarks for display
  const recentBookmarks = bookmarks
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 3)
    .map(bookmark => ({
      ...bookmark,
      chapterName: chapters.find(c => c.id === bookmark.surahId)?.name_simple || `Chapter ${bookmark.surahId}`
    }));

  return (
    <div className="space-y-12" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            {t('quranReader', settings.language)}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {settings.language === 'ar' 
              ? 'اقرأ واستمع وتدبر القرآن الكريم بتصميم جميل وحديث مع ترجمات متعددة وتلاوات عالية الجودة'
              : settings.language === 'ru'
              ? 'Читайте, слушайте и размышляйте над Священным Кораном в красивом современном дизайне с множественными переводами и качественными чтениями'
              : 'Read, listen, and reflect on the Holy Quran with beautiful modern design, multiple translations, and high-quality audio recitations'
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className={`flex flex-wrap justify-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {lastRead && (
            <Button asChild size="lg" className="gap-2">
              <Link href={`/surah/${lastRead.surahId}?verse=${lastRead.verseNumber}`}>
                <Clock className="h-4 w-4" />
                {t('continueReading', settings.language)}
              </Link>
            </Button>
          )}
          <Button variant="outline" size="lg" asChild className="gap-2">
            <Link href="/search">
              <Search className="h-4 w-4" />
              {t('searchQuran', settings.language)}
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="gap-2">
            <Link href="/bookmarks">
              <BookOpen className="h-4 w-4" />
              {t('bookmarks', settings.language)}
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Last Read Section */}
      {lastRead && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`space-y-2 ${isRTL ? 'text-right' : ''}`}>
                  <h2 className="text-xl font-semibold text-foreground">
                    {t('lastRead', settings.language)}
                  </h2>
                  <p className="text-muted-foreground">
                    {t('chapter', settings.language)} {lastRead.surahId}, {t('verse', settings.language)} {lastRead.verseNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(lastRead.timestamp).toLocaleDateString(
                      settings.language === 'ar' ? 'ar-SA' : 
                      settings.language === 'ru' ? 'ru-RU' : 'en-US'
                    )}
                  </p>
                </div>
                <Button asChild>
                  <Link href={`/surah/${lastRead.surahId}?verse=${lastRead.verseNumber}`}>
                    {t('continueReading', settings.language)}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Bookmarks */}
      {recentBookmarks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground">
            {t('recentBookmarks', settings.language)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentBookmarks.map((bookmark) => (
              <Card key={bookmark.verseKey} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className={`space-y-2 ${isRTL ? 'text-right' : ''}`}>
                    <Badge variant="outline">{bookmark.verseKey}</Badge>
                    <Link 
                      href={`/surah/${bookmark.surahId}?verse=${bookmark.verseNumber}`}
                      className="block hover:text-foreground transition-colors"
                    >
                      <p className="font-medium text-foreground">{bookmark.chapterName}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('verse', settings.language)} {bookmark.verseNumber}
                      </p>
                    </Link>
                    {bookmark.note && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {bookmark.note}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(bookmark.timestamp).toLocaleDateString(
                        settings.language === 'ar' ? 'ar-SA' : 
                        settings.language === 'ru' ? 'ru-RU' : 'en-US'
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold text-foreground">
          {t('allChapters', settings.language)}
        </h2>
        
        <div className="relative">
          <Search className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
          <Input
            type="search"
            placeholder={t('searchChapters', settings.language)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${isRTL ? 'pr-10 text-right' : 'pl-10'} h-12 text-lg`}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Results Count */}
        <div className={`text-sm text-muted-foreground ${isRTL ? 'text-right' : ''}`}>
          {searchQuery.trim() ? (
            <>
              {filteredChapters.length} {t('searchResults', settings.language).toLowerCase()}
            </>
          ) : (
            <>
              {chapters.length} {settings.language === 'ar' ? 'سور' : settings.language === 'ru' ? 'сур' : 'chapters'}
            </>
          )}
        </div>
      </motion.div>

      {/* Chapters Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredChapters.map((chapter, index) => (
          <SurahCard
            key={chapter.id}
            surah={chapter}
            index={index}
          />
        ))}
      </motion.div>

      {/* No Results */}
      {searchQuery.trim() && filteredChapters.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {t('noResults', settings.language)}
          </h3>
          <p className="text-muted-foreground">
            {settings.language === 'ar' 
              ? 'جرب البحث بكلمات مختلفة أو رقم السورة'
              : settings.language === 'ru'
              ? 'Попробуйте поискать другими словами или номером суры'
              : 'Try searching with different keywords or chapter number'
            }
          </p>
        </motion.div>
      )}
    </div>
  );
}