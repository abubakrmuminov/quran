'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Settings, Play, Pause, Type, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { VerseCard } from '@/app/components/quran/verse-card';
import { AudioPlayer } from '@/app/components/quran/audio-player';
import { Surah, Verse, Translation, Reciter, TranslatedVerse } from '@/app/types/quran';
import { useQuranStore } from '@/app/lib/store';
import { t } from '@/app/i18n';
import { getNextChapter, getPreviousChapter, getTranslation } from '@/app/lib/quran';
import Link from 'next/link';

interface SurahPageContentProps {
  chapter: Surah;
  verses: Verse[];
  translations: Translation[];
  reciters: Reciter[];
  initialVerse?: string;
  initialTranslation?: string;
}

export function SurahPageContent({
  chapter,
  verses,
  translations,
  reciters,
  initialVerse,
  initialTranslation,
}: SurahPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    settings, 
    updateSettings, 
    updateLastRead, 
    currentVerse, 
    setCurrentVerse, 
    isPlaying 
  } = useQuranStore();

  const [selectedTranslations, setSelectedTranslations] = useState<number[]>(
    settings.translations.length > 0 ? settings.translations : [131] // Default to Saheeh International
  );
  const [translationData, setTranslationData] = useState<Record<number, TranslatedVerse[]>>({});
  const [loading, setLoading] = useState(false);

  const isRTL = settings.language === 'ar';
  const nextChapter = getNextChapter(chapter.id);
  const previousChapter = getPreviousChapter(chapter.id);

  // Load translations for selected translation IDs
  useEffect(() => {
    const loadTranslations = async () => {
      setLoading(true);
      const newTranslationData: Record<number, TranslatedVerse[]> = { ...translationData };

      for (const translationId of selectedTranslations) {
        if (!newTranslationData[translationId]) {
          try {
            const translation = await getTranslation(translationId, chapter.id);
            if (translation?.verses) {
              newTranslationData[translationId] = translation.verses;
            }
          } catch (error) {
            console.error(`Failed to load translation ${translationId}:`, error);
          }
        }
      }

      setTranslationData(newTranslationData);
      setLoading(false);
    };

    loadTranslations();
  }, [selectedTranslations, chapter.id]);

  // Handle initial verse scroll
  useEffect(() => {
    if (initialVerse) {
      const verseNumber = parseInt(initialVerse);
      const verseKey = `${chapter.id}:${verseNumber}`;
      
      // Scroll to verse after a short delay
      setTimeout(() => {
        const verseElement = document.getElementById(`verse-${verseKey}`);
        if (verseElement) {
          verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
      
      // Update last read
      updateLastRead({
        surahId: chapter.id,
        verseNumber,
        verseKey,
        timestamp: Date.now(),
      });
    }
  }, [initialVerse, chapter.id, updateLastRead]);

  // Memoized verse translations
  const versesWithTranslations = useMemo(() => {
    return verses.map(verse => {
      const verseTranslations: TranslatedVerse[] = [];
      
      selectedTranslations.forEach(translationId => {
        const translation = translationData[translationId];
        if (translation) {
          const verseTranslation = translation.find(t => t.verse_number === verse.verse_number);
          if (verseTranslation) {
            verseTranslations.push(verseTranslation);
          }
        }
      });

      return {
        verse,
        translations: verseTranslations,
      };
    });
  }, [verses, selectedTranslations, translationData]);

  const handleVersePlay = (verseKey: string) => {
    setCurrentVerse(verseKey);
    
    // Update last read
    const [chapterStr, verseStr] = verseKey.split(':');
    updateLastRead({
      surahId: parseInt(chapterStr),
      verseNumber: parseInt(verseStr),
      verseKey,
      timestamp: Date.now(),
    });

    // Auto-scroll to verse if enabled
    if (settings.autoScroll) {
      setTimeout(() => {
        const verseElement = document.getElementById(`verse-${verseKey}`);
        if (verseElement) {
          verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  };

  const handleTranslationToggle = (translationId: number, checked: boolean) => {
    let newTranslations: number[];
    
    if (checked) {
      newTranslations = [...selectedTranslations, translationId];
    } else {
      newTranslations = selectedTranslations.filter(id => id !== translationId);
    }
    
    // Ensure at least one translation is selected
    if (newTranslations.length === 0) {
      newTranslations = [131]; // Default to Saheeh International
    }
    
    setSelectedTranslations(newTranslations);
    updateSettings({ translations: newTranslations });
  };

  const handleFontSizeChange = (value: number[]) => {
    updateSettings({ fontSize: value[0] });
  };

  const handleLineHeightChange = (value: number[]) => {
    updateSettings({ lineHeight: value[0] / 10 });
  };

  const availableTranslations = (translations ?? []).filter(t =>
    ['english', 'russian', 'arabic'].includes(t.language_name?.toLowerCase()) ||
    t.author_name?.toLowerCase().includes('saheeh') ||
    t.author_name?.toLowerCase().includes('kuliev') ||
    t.author_name?.toLowerCase().includes('порохова')
  ).slice(0, 20);
  

  return (
    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Chapter Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Navigation Breadcrumb */}
        <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Link href="/" className="hover:text-foreground transition-colors">
            {t('home', settings.language)}
          </Link>
          <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
          <span>{t('chapter', settings.language)} {chapter.id}</span>
        </div>

        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`space-y-3 ${isRTL ? 'text-right' : ''}`}>
                {/* Arabic Name */}
                <CardTitle className="text-3xl md:text-4xl font-arabic leading-relaxed">
                  {chapter.name_arabic}
                </CardTitle>
                
                {/* Transliteration */}
                <h2 className="text-xl md:text-2xl font-semibold text-muted-foreground">
                  {chapter.name_simple}
                </h2>
                
                {/* Translation */}
                {chapter.translated_name && (
                  <p className="text-lg text-muted-foreground">
                    {chapter.translated_name.name}
                  </p>
                )}

                {/* Chapter Info */}
                <div className={`flex flex-wrap items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Badge variant="secondary">
                    {t('chapter', settings.language)} {chapter.id}
                  </Badge>
                  <Badge variant="outline">
                    {chapter.verses_count} {t('verses', settings.language)}
                  </Badge>
                  <Badge variant="outline">
                    {t(chapter.revelation_place === 'makkah' ? 'meccan' : 'medinan', settings.language)}
                  </Badge>
                </div>
              </div>

              {/* Chapter Number Circle */}
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">{chapter.id}</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Controls */}
        <div className={`flex flex-wrap items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Reading Settings */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                {t('settings', settings.language)}
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? 'left' : 'right'} className="w-80">
              <SheetHeader>
                <SheetTitle>{t('settings', settings.language)}</SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                {/* Font Size */}
                <div className="space-y-3">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <label className="text-sm font-medium">
                      {t('fontSize', settings.language)}
                    </label>
                    <span className="text-sm text-muted-foreground">
                      {settings.fontSize}px
                    </span>
                  </div>
                  <Slider
                    value={[settings.fontSize]}
                    onValueChange={handleFontSizeChange}
                    max={32}
                    min={12}
                    step={2}
                    className="cursor-pointer"
                  />
                </div>

                {/* Line Height */}
                <div className="space-y-3">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <label className="text-sm font-medium">Line Height</label>
                    <span className="text-sm text-muted-foreground">
                      {settings.lineHeight}
                    </span>
                  </div>
                  <Slider
                    value={[settings.lineHeight * 10]}
                    onValueChange={handleLineHeightChange}
                    max={25}
                    min={12}
                    step={1}
                    className="cursor-pointer"
                  />
                </div>

                {/* Arabic Font */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    {t('arabicScript', settings.language)}
                  </label>
                  <Select
                    value={settings.arabicFont}
                    onValueChange={(value: 'uthmani' | 'indopak' | 'imlaei') => 
                      updateSettings({ arabicFont: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uthmani">Uthmani</SelectItem>
                      <SelectItem value="indopak">IndoPak</SelectItem>
                      <SelectItem value="imlaei">Imlaei</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tajweed */}
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <label className="text-sm font-medium">Show Tajweed</label>
                  <Switch
                    checked={settings.showTajweed}
                    onCheckedChange={(checked) => updateSettings({ showTajweed: checked })}
                  />
                </div>

                {/* Translations */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    {t('translations', settings.language)}
                  </label>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {availableTranslations.map((translation) => (
                      <div key={translation.resource_id} className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <Checkbox
                          id={`translation-${translation.resource_id}`}
                          checked={selectedTranslations.includes(translation.resource_id)}
                          onCheckedChange={(checked) =>
                            handleTranslationToggle(translation.resource_id, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`translation-${translation.resource_id}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {translation.translated_name?.name || translation.author_name}
                          <span className="text-muted-foreground block text-xs">
                            {translation.language_name} - {translation.author_name}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {previousChapter && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/surah/${previousChapter}`}>
                  <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                  {t('previousChapter', settings.language)}
                </Link>
              </Button>
            )}
            
            {nextChapter && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/surah/${nextChapter}`}>
                  {t('nextChapter', settings.language)}
                  <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">{t('loading', settings.language)}</p>
        </div>
      )}

      {/* Verses */}
      <div className="space-y-6">
        {versesWithTranslations.map(({ verse, translations: verseTranslations }, index) => (
          <VerseCard
            key={verse.verse_key}
            verse={verse}
            chapterId={chapter.id}
            translations={verseTranslations}
            index={index}
            onPlayAudio={handleVersePlay}
            isCurrentlyPlaying={currentVerse === verse.verse_key && isPlaying}
          />
        ))}
      </div>

      {/* Audio Player */}
      {verses.length > 0 && reciters.length > 0 && (
        <AudioPlayer
          verses={verses}
          currentVerseKey={currentVerse}
          reciters={reciters}
          onVerseChange={handleVersePlay}
          chapterId={chapter.id}
        />
      )}
    </div>
  );
}