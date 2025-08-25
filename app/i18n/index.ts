export const translations = {
  en: {
    // Navigation
    home: 'Home',
    search: 'Search',
    settings: 'Settings',
    bookmarks: 'Bookmarks',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    
    // Home page
    quranReader: 'Quran Reader',
    continueReading: 'Continue Reading',
    lastRead: 'Last Read',
    recentBookmarks: 'Recent Bookmarks',
    allChapters: 'All Chapters',
    searchChapters: 'Search chapters...',
    
    // Chapter info
    verses: 'verses',
    meccan: 'Meccan',
    medinan: 'Medinan',
    revelation: 'Revelation',
    
    // Verse page
    chapter: 'Chapter',
    verse: 'Verse',
    translation: 'Translation',
    recitation: 'Recitation',
    fontSize: 'Font Size',
    arabicScript: 'Arabic Script',
    
    // Audio controls
    play: 'Play',
    pause: 'Pause',
    previous: 'Previous',
    next: 'Next',
    
    // Settings
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    translations: 'Translations',
    reciter: 'Reciter',
    
    // Search
    searchQuran: 'Search Quran',
    searchPlaceholder: 'Search for verses, words, or topics...',
    searchResults: 'Search Results',
    noResults: 'No results found',
    
    // Accessibility
    nextChapter: 'Next Chapter',
    previousChapter: 'Previous Chapter',
    bookmark: 'Bookmark',
    removeBookmark: 'Remove Bookmark',
    copyLink: 'Copy Link',
  },
  
  ar: {
    // Navigation
    home: 'الرئيسية',
    search: 'البحث',
    settings: 'الإعدادات',
    bookmarks: 'المفضلة',
    
    // Common
    loading: 'جاري التحميل...',
    error: 'خطأ',
    retry: 'إعادة المحاولة',
    close: 'إغلاق',
    save: 'حفظ',
    cancel: 'إلغاء',
    
    // Home page
    quranReader: 'قارئ القرآن',
    continueReading: 'متابعة القراءة',
    lastRead: 'آخر قراءة',
    recentBookmarks: 'المفضلة الحديثة',
    allChapters: 'جميع السور',
    searchChapters: 'البحث في السور...',
    
    // Chapter info
    verses: 'آية',
    meccan: 'مكية',
    medinan: 'مدنية',
    revelation: 'النزول',
    
    // Verse page
    chapter: 'السورة',
    verse: 'الآية',
    translation: 'الترجمة',
    recitation: 'التلاوة',
    fontSize: 'حجم الخط',
    arabicScript: 'الخط العربي',
    
    // Audio controls
    play: 'تشغيل',
    pause: 'إيقاف',
    previous: 'السابق',
    next: 'التالي',
    
    // Settings
    language: 'اللغة',
    theme: 'المظهر',
    light: 'فاتح',
    dark: 'داكن',
    system: 'النظام',
    translations: 'الترجمات',
    reciter: 'القارئ',
    
    // Search
    searchQuran: 'البحث في القرآن',
    searchPlaceholder: 'البحث عن الآيات أو الكلمات أو المواضيع...',
    searchResults: 'نتائج البحث',
    noResults: 'لا توجد نتائج',
    
    // Accessibility
    nextChapter: 'السورة التالية',
    previousChapter: 'السورة السابقة',
    bookmark: 'إضافة للمفضلة',
    removeBookmark: 'إزالة من المفضلة',
    copyLink: 'نسخ الرابط',
  },
  
  ru: {
    // Navigation
    home: 'Главная',
    search: 'Поиск',
    settings: 'Настройки',
    bookmarks: 'Закладки',
    
    // Common
    loading: 'Загрузка...',
    error: 'Ошибка',
    retry: 'Повторить',
    close: 'Закрыть',
    save: 'Сохранить',
    cancel: 'Отменить',
    
    // Home page
    quranReader: 'Читатель Корана',
    continueReading: 'Продолжить чтение',
    lastRead: 'Последнее чтение',
    recentBookmarks: 'Последние закладки',
    allChapters: 'Все суры',
    searchChapters: 'Поиск сур...',
    
    // Chapter info
    verses: 'аятов',
    meccan: 'Мекканская',
    medinan: 'Мединская',
    revelation: 'Ниспослание',
    
    // Verse page
    chapter: 'Сура',
    verse: 'Аят',
    translation: 'Перевод',
    recitation: 'Чтение',
    fontSize: 'Размер шрифта',
    arabicScript: 'Арабский шрифт',
    
    // Audio controls
    play: 'Воспроизвести',
    pause: 'Пауза',
    previous: 'Предыдущий',
    next: 'Следующий',
    
    // Settings
    language: 'Язык',
    theme: 'Тема',
    light: 'Светлая',
    dark: 'Тёмная',
    system: 'Системная',
    translations: 'Переводы',
    reciter: 'Чтец',
    
    // Search
    searchQuran: 'Поиск в Коране',
    searchPlaceholder: 'Поиск аятов, слов или тем...',
    searchResults: 'Результаты поиска',
    noResults: 'Результаты не найдены',
    
    // Accessibility
    nextChapter: 'Следующая сура',
    previousChapter: 'Предыдущая сура',
    bookmark: 'Добавить в закладки',
    removeBookmark: 'Удалить из закладок',
    copyLink: 'Копировать ссылку',
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

export function t(key: TranslationKey, language: Language = 'en'): string {
  return translations[language][key] || translations.en[key] || key;
}