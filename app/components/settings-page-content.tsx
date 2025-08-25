'use client';

import { motion } from 'framer-motion';
import { Settings, Globe, Type, Languages, Volume2, Accessibility, Palette, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useQuranStore } from '@/app/lib/store';
import { useTheme } from 'next-themes';
import { t, Language } from '@/app/i18n';
import { useState, useEffect } from 'react';

export function SettingsPageContent() {
  const { settings, updateSettings } = useQuranStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);

  const isRTL = settings.language === 'ar';

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const availableTranslations = [
    { id: 131, name: 'Saheeh International', language: 'English', author: 'Saheeh International' },
    { id: 84, name: 'Pickthall', language: 'English', author: 'Mohammed Marmaduke William Pickthall' },
    { id: 85, name: 'Yusuf Ali', language: 'English', author: 'Abdullah Yusuf Ali' },
    { id: 171, name: 'Кулиев', language: 'Russian', author: 'Эльмир Кулиев' },
    { id: 79, name: 'Порохова', language: 'Russian', author: 'В. М. Порохова' },
    { id: 78, name: 'Корачкова', language: 'Russian', author: 'М.-Н.О. Османов' },
  ];

  const availableReciters = [
    { id: 1, name: 'Abdul Basit Abdul Samad', style: 'Murattal' },
    { id: 7, name: 'Mishary Rashid Alafasy', style: 'Murattal' },
    { id: 2, name: 'Abdul Rahman Al-Sudais', style: 'Murattal' },
    { id: 3, name: 'Saad Al-Ghamdi', style: 'Murattal' },
    { id: 4, name: 'Saud Al-Shuraim', style: 'Murattal' },
    { id: 5, name: 'Ahmed Al-Ajamy', style: 'Murattal' },
  ];

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`space-y-4 ${isRTL ? 'text-right' : ''}`}
      >
        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {t('settings', settings.language)}
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">
          {settings.language === 'ar' 
            ? 'قم بتخصيص تجربة قراءة القرآن الكريم وفقاً لتفضيلاتك الشخصية'
            : settings.language === 'ru'
            ? 'Настройте ваше персональное восприятие чтения Корана согласно вашим предпочтениям'
            : 'Customize your Quran reading experience according to your personal preferences'
          }
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Language & Display Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Globe className="h-5 w-5" />
                {settings.language === 'ar' ? 'اللغة والعرض' : settings.language === 'ru' ? 'Язык и отображение' : 'Language & Display'}
              </CardTitle>
              <CardDescription>
                {settings.language === 'ar' 
                  ? 'اختر لغة الواجهة والمظهر المفضل'
                  : settings.language === 'ru'
                  ? 'Выберите язык интерфейса и предпочтительную тему'
                  : 'Choose your interface language and preferred theme'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Interface Language */}
              <div className="space-y-2">
                <Label>{t('language', settings.language)}</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value: Language) => updateSettings({ language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="ru">Русский</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Theme */}
              <div className="space-y-2">
                <Label>{t('theme', settings.language)}</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t('light', settings.language)}</SelectItem>
                    <SelectItem value="dark">{t('dark', settings.language)}</SelectItem>
                    <SelectItem value="system">{t('system', settings.language)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Arabic Font */}
              <div className="space-y-2">
                <Label>{t('arabicScript', settings.language)}</Label>
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
                    <SelectItem value="uthmani">Uthmani Script</SelectItem>
                    <SelectItem value="indopak">IndoPak Script</SelectItem>
                    <SelectItem value="imlaei">Imlaei Script</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tajweed Colors */}
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="space-y-1">
                  <Label>
                    {settings.language === 'ar' ? 'ألوان التجويد' : 
                     settings.language === 'ru' ? 'Цвета таджвида' : 'Tajweed Colors'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {settings.language === 'ar' ? 'عرض قواعد التجويد بالألوان' : 
                     settings.language === 'ru' ? 'Показать правила таджвида цветом' : 'Show Tajweed rules with colors'}
                  </p>
                </div>
                <Switch
                  checked={settings.showTajweed}
                  onCheckedChange={(checked) => updateSettings({ showTajweed: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Typography Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Type className="h-5 w-5" />
                {settings.language === 'ar' ? 'إعدادات النص' : 
                 settings.language === 'ru' ? 'Настройки текста' : 'Typography Settings'}
              </CardTitle>
              <CardDescription>
                {settings.language === 'ar' ? 'اضبط حجم الخط وتباعد الأسطر' : 
                 settings.language === 'ru' ? 'Настройте размер шрифта и межстрочный интервал' : 
                 'Adjust font size and line spacing for comfortable reading'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Font Size */}
              <div className="space-y-3">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Label>{t('fontSize', settings.language)}</Label>
                  <Badge variant="secondary">{settings.fontSize}px</Badge>
                </div>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={(value) => updateSettings({ fontSize: value[0] })}
                  max={36}
                  min={12}
                  step={2}
                  className="cursor-pointer"
                />
                <div className={`flex justify-between text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>12px</span>
                  <span>36px</span>
                </div>
              </div>

              {/* Line Height */}
              <div className="space-y-3">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Label>
                    {settings.language === 'ar' ? 'تباعد الأسطر' : 
                     settings.language === 'ru' ? 'Межстрочный интервал' : 'Line Height'}
                  </Label>
                  <Badge variant="secondary">{settings.lineHeight}</Badge>
                </div>
                <Slider
                  value={[settings.lineHeight * 10]}
                  onValueChange={(value) => updateSettings({ lineHeight: value[0] / 10 })}
                  max={30}
                  min={12}
                  step={1}
                  className="cursor-pointer"
                />
                <div className={`flex justify-between text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>1.2</span>
                  <span>3.0</span>
                </div>
              </div>

              {/* Preview Text */}
              <div className="space-y-2">
                <Label>
                  {settings.language === 'ar' ? 'معاينة' : 
                   settings.language === 'ru' ? 'Предварительный просмотр' : 'Preview'}
                </Label>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p 
                    className="font-arabic text-center"
                    style={{ 
                      fontSize: `${settings.fontSize}px`,
                      lineHeight: settings.lineHeight,
                      fontFamily: '"Noto Naskh Arabic", serif'
                    }}
                    dir="rtl"
                  >
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                  </p>
                  <p 
                    className="text-sm text-muted-foreground text-center mt-2"
                    style={{ lineHeight: settings.lineHeight }}
                  >
                    In the name of Allah, the Beneficent, the Merciful
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Translation Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Languages className="h-5 w-5" />
                {t('translations', settings.language)}
              </CardTitle>
              <CardDescription>
                {settings.language === 'ar' ? 'اختر الترجمات التي تريد عرضها' : 
                 settings.language === 'ru' ? 'Выберите переводы для отображения' : 
                 'Select which translations to display'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableTranslations.map((translation) => (
                <div key={translation.id} className={`flex items-start space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <Checkbox
                    id={`translation-${translation.id}`}
                    checked={settings.translations.includes(translation.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateSettings({
                          translations: [...settings.translations, translation.id]
                        });
                      } else {
                        updateSettings({
                          translations: settings.translations.filter(id => id !== translation.id)
                        });
                      }
                    }}
                  />
                  <div className="space-y-1 leading-none">
                    <Label 
                      htmlFor={`translation-${translation.id}`}
                      className="cursor-pointer font-medium"
                    >
                      {translation.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {translation.language} - {translation.author}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Audio Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Volume2 className="h-5 w-5" />
                {settings.language === 'ar' ? 'إعدادات الصوت' : 
                 settings.language === 'ru' ? 'Настройки аудио' : 'Audio Settings'}
              </CardTitle>
              <CardDescription>
                {settings.language === 'ar' ? 'اختر القارئ المفضل وإعدادات التشغيل' : 
                 settings.language === 'ru' ? 'Выберите предпочитаемого чтеца и настройки воспроизведения' : 
                 'Choose your preferred reciter and playback settings'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Reciter Selection */}
              <div className="space-y-2">
                <Label>{t('reciter', settings.language)}</Label>
                <Select
                  value={settings.reciter.toString()}
                  onValueChange={(value) => updateSettings({ reciter: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableReciters.map((reciter) => (
                      <SelectItem key={reciter.id} value={reciter.id.toString()}>
                        {reciter.name} ({reciter.style})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Auto Play */}
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="space-y-1">
                  <Label>
                    {settings.language === 'ar' ? 'التشغيل التلقائي' : 
                     settings.language === 'ru' ? 'Автовоспроизведение' : 'Auto Play'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {settings.language === 'ar' ? 'تشغيل الآية التالية تلقائياً' : 
                     settings.language === 'ru' ? 'Автоматически воспроизводить следующий аят' : 
                     'Automatically play the next verse'}
                  </p>
                </div>
                <Switch
                  checked={settings.autoPlay}
                  onCheckedChange={(checked) => updateSettings({ autoPlay: checked })}
                />
              </div>

              {/* Auto Scroll */}
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="space-y-1">
                  <Label>
                    {settings.language === 'ar' ? 'التمرير التلقائي' : 
                     settings.language === 'ru' ? 'Автоскролл' : 'Auto Scroll'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {settings.language === 'ar' ? 'التمرير للآية أثناء التشغيل' : 
                     settings.language === 'ru' ? 'Прокручивать к аяту при воспроизведении' : 
                     'Scroll to verse during playback'}
                  </p>
                </div>
                <Switch
                  checked={settings.autoScroll}
                  onCheckedChange={(checked) => updateSettings({ autoScroll: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center"
      >
        <Button 
          size="lg" 
          onClick={handleSave}
          className="gap-2 min-w-32"
          disabled={saved}
        >
          <Save className="h-4 w-4" />
          {saved 
            ? (settings.language === 'ar' ? 'تم الحفظ!' : settings.language === 'ru' ? 'Сохранено!' : 'Saved!') 
            : t('save', settings.language)
          }
        </Button>
      </motion.div>
    </div>
  );
}