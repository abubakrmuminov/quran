'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuranStore } from '@/app/lib/store';
import { Reciter, Verse } from '@/app/types/quran';
import { t } from '@/app/i18n';

interface AudioPlayerProps {
  verses: Verse[];
  currentVerseKey: string | null;
  reciters: Reciter[];
  onVerseChange?: (verseKey: string) => void;
  chapterId: number;
}

export function AudioPlayer({ 
  verses, 
  currentVerseKey, 
  reciters, 
  onVerseChange,
  chapterId 
}: AudioPlayerProps) {
  const { 
    settings, 
    updateSettings, 
    isPlaying, 
    setPlaying, 
    currentVerse, 
    setCurrentVerse 
  } = useQuranStore();
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(100);
  const [muted, setMuted] = useState(false);
  const [repeat, setRepeat] = useState<'none' | 'one' | 'all'>('none');
  
  const currentVerseIndex = verses.findIndex(v => v.verse_key === currentVerseKey);
  const currentReciter = reciters.find(r => r.id === settings.reciter);

  // Audio URL construction (this would need to be implemented based on the API)
  const getAudioUrl = (verseKey: string, reciterId: number) => {
    // This is a placeholder - you'd need to construct the actual audio URL based on your API
    const [chapter, verse] = verseKey.split(':');
    return `https://audio.qurancdn.com/${reciterId.toString().padStart(3, '0')}${chapter.padStart(3, '0')}${verse.padStart(3, '0')}.mp3`;
  };

  // Update audio source when verse or reciter changes
  useEffect(() => {
    if (audioRef.current && currentVerseKey) {
      const audioUrl = getAudioUrl(currentVerseKey, settings.reciter);
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
  }, [currentVerseKey, settings.reciter]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedData = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      if (repeat === 'one') {
        audio.currentTime = 0;
        audio.play();
        return;
      }

      // Auto-play next verse
      if (settings.autoPlay && currentVerseIndex < verses.length - 1) {
        const nextVerse = verses[currentVerseIndex + 1];
        setCurrentVerse(nextVerse.verse_key);
        onVerseChange?.(nextVerse.verse_key);
      } else if (repeat === 'all' && currentVerseIndex === verses.length - 1) {
        // Repeat all - go back to first verse
        const firstVerse = verses[0];
        setCurrentVerse(firstVerse.verse_key);
        onVerseChange?.(firstVerse.verse_key);
      } else {
        setPlaying(false);
      }
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentVerseIndex, verses, repeat, settings.autoPlay, setPlaying, setCurrentVerse, onVerseChange]);

  // Play/Pause control
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Volume control
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = muted ? 0 : volume / 100;
  }, [volume, muted]);

  const handlePlayPause = () => {
    setPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    if (currentVerseIndex > 0) {
      const previousVerse = verses[currentVerseIndex - 1];
      setCurrentVerse(previousVerse.verse_key);
      onVerseChange?.(previousVerse.verse_key);
    }
  };

  const handleNext = () => {
    if (currentVerseIndex < verses.length - 1) {
      const nextVerse = verses[currentVerseIndex + 1];
      setCurrentVerse(nextVerse.verse_key);
      onVerseChange?.(nextVerse.verse_key);
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    
    const newTime = (value[0] / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (muted && value[0] > 0) {
      setMuted(false);
    }
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  const toggleRepeat = () => {
    const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(repeat);
    setRepeat(modes[(currentIndex + 1) % modes.length]);
  };

  const formatTime = (time: number) => {
    if (!isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentVerseKey) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 z-40"
      >
        <Card className="shadow-lg border-2">
          <CardContent className="p-4">
            <audio ref={audioRef} preload="metadata" />
            
            {/* Main Controls */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handlePrevious}
                  disabled={currentVerseIndex <= 0}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handlePlayPause}
                  className="h-10 w-10"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5 ml-0.5" />
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleNext}
                  disabled={currentVerseIndex >= verses.length - 1}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={toggleRepeat}
                  className={repeat !== 'none' ? 'text-primary' : ''}
                >
                  <Repeat className="h-4 w-4" />
                  {repeat === 'one' && (
                    <span className="absolute -top-1 -right-1 text-xs">1</span>
                  )}
                </Button>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={toggleMute}
                  >
                    {muted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <div className="w-20">
                    <Slider
                      value={[muted ? 0 : volume]}
                      onValueChange={handleVolumeChange}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <Slider
                value={[duration ? (currentTime / duration) * 100 : 0]}
                onValueChange={handleSeek}
                max={100}
                step={0.1}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Current Verse Info */}
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">
                  {t('verse', settings.language)} {currentVerseKey}
                </p>
                <p className="text-muted-foreground">
                  {currentReciter?.translated_name?.name || currentReciter?.reciter_name}
                </p>
              </div>

              {/* Reciter Selection */}
              <div className="w-48">
                <Select
                  value={settings.reciter.toString()}
                  onValueChange={(value) => updateSettings({ reciter: parseInt(value) })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reciters.map((reciter) => (
                      <SelectItem key={reciter.id} value={reciter.id.toString()}>
                        {reciter.translated_name?.name || reciter.reciter_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}