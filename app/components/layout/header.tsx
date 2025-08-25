'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Settings, Moon, Sun, Menu, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useQuranStore } from '@/app/lib/store';
import { useTheme } from 'next-themes';
import { t, Language } from '@/app/i18n';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, setSidebarOpen } = useQuranStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const toggleLanguage = () => {
    const languages: Language[] = ['en', 'ar', 'ru'];
    const currentIndex = languages.indexOf(settings.language);
    const nextLanguage = languages[(currentIndex + 1) % languages.length];
    updateSettings({ language: nextLanguage });
  };

  const isRTL = settings.language === 'ar';

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Mobile Menu */}
        <div className="flex items-center gap-2 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? 'right' : 'left'}>
              <nav className="flex flex-col gap-4 mt-8">
                <Link 
                  href="/" 
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  {t('home', settings.language)}
                </Link>
                <Link 
                  href="/search" 
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  {t('search', settings.language)}
                </Link>
                <Link 
                  href="/bookmarks" 
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  {t('bookmarks', settings.language)}
                </Link>
                <Link 
                  href="/settings" 
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  {t('settings', settings.language)}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            ق
          </div>
          <span className="font-bold text-xl hidden sm:inline">
            {t('quranReader', settings.language)}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {t('home', settings.language)}
          </Link>
          <Link 
            href="/search" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {t('search', settings.language)}
          </Link>
          <Link 
            href="/bookmarks" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {t('bookmarks', settings.language)}
          </Link>
        </nav>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-sm mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('searchPlaceholder', settings.language)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
        </form>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Search Button (Mobile) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/search')}
            className="lg:hidden"
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">{t('search', settings.language)}</span>
          </Button>

          {/* Bookmarks */}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/bookmarks">
              <Bookmark className="h-5 w-5" />
              <span className="sr-only">{t('bookmarks', settings.language)}</span>
            </Link>
          </Button>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                {t('light', settings.language)}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                {t('dark', settings.language)}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                {t('system', settings.language)}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleLanguage}>
            <span className="text-sm font-medium">
              {settings.language.toUpperCase()}
            </span>
            <span className="sr-only">{t('language', settings.language)}</span>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings">
              <Settings className="h-5 w-5" />
              <span className="sr-only">{t('settings', settings.language)}</span>
            </Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}