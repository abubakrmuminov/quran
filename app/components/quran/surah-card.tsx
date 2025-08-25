'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Surah } from '@/app/types/quran';
import { useQuranStore } from '@/app/lib/store';
import { t } from '@/app/i18n';

interface SurahCardProps {
  surah: Surah;
  index: number;
}

export function SurahCard({ surah, index }: SurahCardProps) {
  const { settings } = useQuranStore();
  const isRTL = settings.language === 'ar';

  const revelationType = surah.revelation_place === 'makkah' ? 'meccan' : 'medinan';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/surah/${surah.id}`}>
        <Card className="group hover:shadow-md transition-all duration-300 cursor-pointer hover:bg-muted/50">
          <CardContent className="p-6">
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {/* Surah Number */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                <span className="font-bold text-primary">{surah.id}</span>
              </div>

              {/* Surah Info */}
              <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
                <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="flex-1">
                    {/* Arabic Name */}
                    <h3 className="font-bold text-lg text-foreground mb-1 font-arabic leading-relaxed">
                      {surah.name_arabic}
                    </h3>
                    
                    {/* Transliteration */}
                    <p className="text-sm text-muted-foreground mb-2">
                      {surah.name_simple}
                    </p>
                    
                    {/* Translation */}
                    {surah.translated_name && (
                      <p className="text-sm text-muted-foreground">
                        {surah.translated_name.name}
                      </p>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col gap-2 items-end">
                    <Badge variant="secondary" className="text-xs">
                      {t(revelationType, settings.language)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {surah.verses_count} {t('verses', settings.language)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}