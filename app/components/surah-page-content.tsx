'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
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

// Динамический импорт иконок
const ChevronLeft = dynamic(() => import('lucide-react').then(mod => mod.ChevronLeft), { ssr: false });
const ChevronRight = dynamic(() => import('lucide-react').then(mod => mod.ChevronRight), { ssr: false });
const Settings = dynamic(() => import('lucide-react').then(mod => mod.Settings), { ssr: false });
const Play = dynamic(() => import('lucide-react').then(mod => mod.Play), { ssr: false });
const Pause = dynamic(() => import('lucide-react').then(mod => mod.Pause), { ssr: false });
const Type = dynamic(() => import('lucide-react').then(mod => mod.Type), { ssr: false });
const Languages = dynamic(() => import('lucide-react').then(mod => mod.Languages), { ssr: false });

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
  const { settings, updateSettings, updateLastRead, currentVerse, setCurrentVerse, isPlaying } = useQuranStore();

  const [selectedTranslations, setSelectedTranslations] = useState<number[]>(
    settings.translations.length > 0 ? settings.translations : [131]
  );
  const [translationData, setTranslationData] = useState<Record<number, TranslatedVerse[]>>({});
  const [loading, setLoading] = useState(false);

  const isRTL = settings.language === 'ar';
  const nextChapter = getNextChapter(chapter.id);
  const previousChapter = getPreviousChapter(chapter.id);

  // Загрузка переводов
  useEffect(() => {
    const loadTranslations = async () => {
      setLoading(true);
      const newTranslationData: Record<number, TranslatedVerse[]> = { ...translationData };
      for (const translationId of selectedTranslations) {
        if (!newTranslationData[translationId]) {
          try {
            const translation = await getTranslation(String(translationId), chapter.id);
            if (translation) {
              newTranslationData[translationId] = translation; // getTranslation теперь возвращает TranslatedVerse[]
            }
          } catch (err) {
            console.error(err);
          }
        }
      }
      setTranslationData(newTranslationData);
      setLoading(false);
    };
    loadTranslations();
  }, [selectedTranslations, chapter.id]);

  // Мемоизация
  const versesWithTranslations = useMemo(() => {
    return verses.map(verse => {
      const verseTranslations: TranslatedVerse[] = [];
      selectedTranslations.forEach(id => {
        const tData = translationData[id];
        if (tData) {
          const found = tData.find(v => v.verse_number === verse.verse_number);
          if (found) verseTranslations.push(found);
        }
      });
      return { verse, translations: verseTranslations };
    });
  }, [verses, selectedTranslations, translationData]);

  const handleVersePlay = (verseKey: string) => {
    setCurrentVerse(verseKey);
    const [chapterStr, verseStr] = verseKey.split(':');
    updateLastRead({ surahId: parseInt(chapterStr), verseNumber: parseInt(verseStr), verseKey, timestamp: Date.now() });
    if (settings.autoScroll) {
      setTimeout(() => {
        const el = document.getElementById(`verse-${verseKey}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  };

  const handleTranslationToggle = (id: number, checked: boolean) => {
    let newSelected = checked ? [...selectedTranslations, id] : selectedTranslations.filter(x => x !== id);
    if (!newSelected.length) newSelected = [131];
    setSelectedTranslations(newSelected);
    updateSettings({ translations: newSelected });
  };

  const handleFontSizeChange = (value: number[]) => updateSettings({ fontSize: value[0] });
  const handleLineHeightChange = (value: number[]) => updateSettings({ lineHeight: value[0] / 10 });

  const availableTranslations = (translations ?? []).filter(t =>
    ['english', 'russian', 'arabic'].includes(t.language_name?.toLowerCase())
  ).slice(0, 20);

  return (
    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`space-y-3 ${isRTL ? 'text-right' : ''}`}>
              <CardTitle className="text-3xl md:text-4xl font-arabic leading-relaxed">{chapter.name_arabic}</CardTitle>
              <h2 className="text-xl md:text-2xl font-semibold text-muted-foreground">{chapter.name_simple}</h2>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Controls */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            {t('settings', settings.language)}
          </Button>
        </SheetTrigger>
        <SheetContent side={isRTL ? 'left' : 'right'} className="w-80">
          <SheetHeader><SheetTitle>{t('settings', settings.language)}</SheetTitle></SheetHeader>
          <div className="space-y-6 mt-6">
            {/* Font Size */}
            <div className="space-y-3">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <label className="text-sm font-medium">{t('fontSize', settings.language)}</label>
                <span className="text-sm text-muted-foreground">{settings.fontSize}px</span>
              </div>
              <Slider value={[settings.fontSize]} onValueChange={handleFontSizeChange} max={32} min={12} step={2} />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Verses */}
      <div className="space-y-6">
        {versesWithTranslations.map(({ verse, translations: verseTranslations }, idx) => (
          <VerseCard
            key={verse.verse_key}
            verse={verse}
            chapterId={chapter.id}
            translations={verseTranslations}
            index={idx}
            onPlayAudio={handleVersePlay}
            isCurrentlyPlaying={currentVerse === verse.verse_key && isPlaying}
          />
        ))}
      </div>

      {/* Audio Player */}
      {verses.length > 0 && reciters.length > 0 && (
        <AudioPlayer verses={verses} currentVerseKey={currentVerse} reciters={reciters} onVerseChange={handleVersePlay} chapterId={chapter.id} />
      )}
    </div>
  );
}
