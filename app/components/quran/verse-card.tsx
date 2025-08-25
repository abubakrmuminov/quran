'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, BookmarkCheck, Copy, Share, Volume2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Verse, TranslatedVerse } from '@/app/types/quran';
import { useQuranStore } from '@/app/lib/store';
import { t } from '@/app/i18n';
import { shouldShowBismillah } from '@/app/lib/quran';

interface VerseCardProps {
  verse: Verse;
  chapterId: number;
  translations?: TranslatedVerse[];
  index: number;
  onPlayAudio?: (verseKey: string) => void;
  isCurrentlyPlaying?: boolean;
}

export function VerseCard({ 
  verse, 
  chapterId, 
  translations = [], 
  index,
  onPlayAudio,
  isCurrentlyPlaying = false 
}: VerseCardProps) {
  const { settings, addBookmark, removeBookmark, isBookmarked } = useQuranStore();
  const [copied, setCopied] = useState(false);
  
  const isRTL = settings.language === 'ar';
  const bookmarked = isBookmarked(verse.verse_key);
  const showBismillah = verse.verse_number === 1 && shouldShowBismillah(chapterId);

  const handleBookmark = () => {
    if (bookmarked) {
      removeBookmark(verse.verse_key);
    } else {
      addBookmark({
        surahId: chapterId,
        verseNumber: verse.verse_number,
        verseKey: verse.verse_key,
        timestamp: Date.now(),
      });
    }
  };

  const handleCopy = async () => {
    const arabicText = verse.text_uthmani || '';
    const translationText = translations.length > 0 ? translations[0].text : '';
    const verseText = `${arabicText}\n\n${translationText}\n\n— ${t('chapter', settings.language)} ${chapterId}, ${t('verse', settings.language)} ${verse.verse_number}`;
    
    try {
      await navigator.clipboard.writeText(verseText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handlePlayAudio = () => {
    if (onPlayAudio) {
      onPlayAudio(verse.verse_key);
    }
  };

  const getFontSizeClass = () => {
    const size = settings.fontSize;
    if (size <= 16) return 'text-lg';
    if (size <= 20) return 'text-xl';
    if (size <= 24) return 'text-2xl';
    return 'text-3xl';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="scroll-mt-20"
      id={`verse-${verse.verse_key}`}
    >
      <Card className={`group hover:shadow-md transition-all duration-300 ${isCurrentlyPlaying ? 'ring-2 ring-primary/50 bg-primary/5' : ''}`}>
        <CardContent className="p-6">
          {/* Verse Header */}
          <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Badge variant="outline" className="font-mono">
                {verse.verse_number}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {verse.verse_key}
              </span>
              {verse.page_number && (
                <span className="text-xs text-muted-foreground">
                  Page {verse.page_number}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handlePlayAudio}
                className="h-8 w-8 p-0"
                title={t('play', settings.language)}
              >
                <Volume2 className={`h-4 w-4 ${isCurrentlyPlaying ? 'text-primary' : ''}`} />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBookmark}
                className="h-8 w-8 p-0"
                title={bookmarked ? t('removeBookmark', settings.language) : t('bookmark', settings.language)}
              >
                {bookmarked ? (
                  <BookmarkCheck className="h-4 w-4 text-primary" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCopy}
                className="h-8 w-8 p-0"
                title={t('copyLink', settings.language)}
              >
                <Copy className={`h-4 w-4 ${copied ? 'text-green-500' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Bismillah */}
          {showBismillah && (
            <div className="text-center mb-6">
              <p 
                className="font-arabic text-2xl text-muted-foreground leading-relaxed"
                style={{ lineHeight: settings.lineHeight }}
              >
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                In the name of Allah, the Beneficent, the Merciful
              </p>
            </div>
          )}

          {/* Arabic Text */}
          <div className={`mb-4 ${isRTL ? 'text-right' : 'text-center'}`}>
            <p 
              className={`font-arabic ${getFontSizeClass()} leading-relaxed text-foreground`}
              style={{ 
                lineHeight: settings.lineHeight,
                fontFamily: settings.arabicFont === 'uthmani' ? '"Noto Naskh Arabic", serif' : 
                           settings.arabicFont === 'indopak' ? '"Noto Naskh Arabic", serif' : 
                           '"Noto Naskh Arabic", serif'
              }}
              dir="rtl"
              lang="ar"
            >
              {settings.showTajweed && verse.text_uthmani_tajweed ? (
                <span dangerouslySetInnerHTML={{ __html: verse.text_uthmani_tajweed }} />
              ) : (
                verse.text_uthmani || verse.text_indopak || verse.text_imlaei
              )}
            </p>
          </div>

          {/* Translations */}
          {translations.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="space-y-3">
                {translations.map((translation, idx) => (
                  <div key={`${translation.resource_name}-${idx}`}>
                    <p 
                      className={`text-base leading-relaxed text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}
                      style={{ lineHeight: settings.lineHeight }}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    >
                      {translation.text}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 opacity-70">
                      — {translation.resource_name}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}