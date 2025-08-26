'use client';

import { useEffect, useState, useMemo } from 'react';
import { VerseCard } from '@/app/components/quran/verse-card';
import { useQuranStore } from '@/app/lib/store';
import { Verse, BookmarkData, Surah } from '@/app/types/quran';
import { getChapters, getVersesUthmani } from '@/app/lib/quran';
import { Bookmark, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { t } from '@/app/i18n';

export default function BookmarksPage() {
  const { bookmarks, settings } = useQuranStore();
  const [verses, setVerses] = useState<Verse[]>([]);
  const [chapters, setChapters] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isRTL = settings.language === 'ar';

  useEffect(() => {
    const loadBookmarkedVerses = async () => {
      if (!bookmarks.length) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading bookmarks:', bookmarks);
        
        // Получаем все главы
        const allChapters = await getChapters();
        console.log('Loaded chapters:', allChapters.length);
        setChapters(allChapters);

        // Группируем закладки по главам
        const chapterGroups = bookmarks.reduce((acc, bookmark) => {
          const chapterId = bookmark.surahId;
          if (!acc[chapterId]) {
            acc[chapterId] = [];
          }
          acc[chapterId].push(bookmark);
          return acc;
        }, {} as Record<number, BookmarkData[]>);

        console.log('Chapter groups:', chapterGroups);

        // Загружаем аяты для каждой главы
        const allVerses: Verse[] = [];
        for (const [chapterIdStr, chapterBookmarks] of Object.entries(chapterGroups)) {
          const chapterId = parseInt(chapterIdStr);
          console.log(`Loading verses for chapter ${chapterId}`);
          
          try {
            const chapterVerses = await getVersesUthmani(chapterId);
            console.log(`Loaded ${chapterVerses.length} verses for chapter ${chapterId}`);
            
            // Фильтруем только те аяты, которые есть в закладках
            const bookmarkedVerses = chapterVerses.filter(verse => {
              const isBookmarked = chapterBookmarks.some(bookmark => 
                bookmark.verseKey === verse.verse_key
              );
              if (isBookmarked) {
                console.log(`Found bookmarked verse: ${verse.verse_key}`);
              }
              return isBookmarked;
            });
            
            console.log(`Found ${bookmarkedVerses.length} bookmarked verses in chapter ${chapterId}`);
            allVerses.push(...bookmarkedVerses);
          } catch (chapterError) {
            console.error(`Failed to load verses for chapter ${chapterId}:`, chapterError);
          }
        }

        console.log('Total loaded verses:', allVerses.length);

        // Сортируем по времени добавления закладки (новые сначала)
        const sortedVerses = allVerses.sort((a, b) => {
          const bookmarkA = bookmarks.find(bm => bm.verseKey === a.verse_key);
          const bookmarkB = bookmarks.find(bm => bm.verseKey === b.verse_key);
          return (bookmarkB?.timestamp || 0) - (bookmarkA?.timestamp || 0);
        });

        setVerses(sortedVerses);
      } catch (error) {
        console.error('Failed to load bookmarked verses:', error);
        setError('Failed to load bookmarked verses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadBookmarkedVerses();
  }, [bookmarks]);

  const groupedBookmarks = useMemo(() => {
    const groups: Record<number, { chapter: Surah; verses: Verse[] }> = {};
    
    verses.forEach(verse => {
      const chapterId = verse.chapter_id || verse.surah_id;
      const chapter = chapters.find(c => c.id === chapterId);
      
      if (chapter) {
        if (!groups[chapterId]) {
          groups[chapterId] = { chapter, verses: [] };
        }
        groups[chapterId].verses.push(verse);
      }
    });
    
    return groups;
  }, [verses, chapters]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading', settings.language)}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            {t('retry', settings.language)}
          </Button>
        </div>
      </div>
    );
  }

  if (!bookmarks.length) {
    return (
      <div className="container mx-auto px-4 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center py-20">
          <Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {t('bookmarks', settings.language)}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            {settings.language === 'ar' 
              ? 'لم تقم بحفظ أي آيات بعد. ابدأ بقراءة القرآن وأضف الآيات المفضلة لديك.'
              : settings.language === 'ru'
              ? 'У вас пока нет сохраненных аятов. Начните читать Коран и добавляйте понравившиеся аяты в закладки.'
              : 'You haven\'t saved any verses yet. Start reading the Quran and bookmark your favorite verses.'
            }
          </p>
          <Button asChild>
            <Link href="/">
              <BookOpen className="h-4 w-4 mr-2" />
              {settings.language === 'ar' ? 'ابدأ القراءة' : 
               settings.language === 'ru' ? 'Начать чтение' : 'Start Reading'}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="space-y-8">
        {/* Header */}
        <div className={`space-y-4 ${isRTL ? 'text-right' : ''}`}>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Bookmark className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {t('bookmarks', settings.language)}
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            {bookmarks.length} {settings.language === 'ar' ? 'آية محفوظة' : 
             settings.language === 'ru' ? 'сохраненных аятов' : 'saved verses'}
          </p>
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-muted p-4 rounded-lg text-sm">
            <p>Bookmarks: {bookmarks.length}</p>
            <p>Loaded verses: {verses.length}</p>
            <p>Chapters: {chapters.length}</p>
            <p>Groups: {Object.keys(groupedBookmarks).length}</p>
          </div>
        )}

        {/* Bookmarked Verses by Chapter */}
        {Object.keys(groupedBookmarks).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedBookmarks).map(([chapterId, { chapter, verses: chapterVerses }]) => (
              <div key={chapterId} className="space-y-4">
                {/* Chapter Header */}
                <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`space-y-1 ${isRTL ? 'text-right' : ''}`}>
                        <h2 className="text-xl font-bold text-foreground font-arabic">
                          {chapter.name_arabic}
                        </h2>
                        <p className="text-muted-foreground">
                          {chapter.name_simple} • {chapterVerses.length} {chapterVerses.length === 1 ? 'verse' : 'verses'}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {t('chapter', settings.language)} {chapter.id}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Chapter Verses */}
                <div className="space-y-4">
                  {chapterVerses.map((verse, idx) => (
                    <VerseCard
                      key={verse.verse_key}
                      verse={verse}
                      chapterId={parseInt(chapterId)}
                      index={idx}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {settings.language === 'ar' 
                ? 'لا يمكن تحميل الآيات المحفوظة'
                : settings.language === 'ru'
                ? 'Не удается загрузить сохраненные аяты'
                : 'Unable to load saved verses'
              }
            </p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              {t('retry', settings.language)}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}