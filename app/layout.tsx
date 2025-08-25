import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Noto_Naskh_Arabic } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Header } from '@/app/components/layout/header';
import { IslamicPattern } from '@/app/components/ui/islamic-pattern';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoNaskh = Noto_Naskh_Arabic({ 
  subsets: ['arabic'], 
  weight: ['400', '500', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Quran Reader - Read, Listen, and Reflect',
    template: '%s | Quran Reader',
  },
  description: 'A beautiful, modern Quran reader with multiple translations, audio recitations, and advanced features for studying the Holy Quran.',
  keywords: [
    'Quran',
    'Quran Reader',
    'Islamic',
    'Arabic',
    'Recitation',
    'Translation',
    'Muslim',
    'Holy Quran',
    'Surah',
    'Ayah'
  ],
  authors: [{ name: 'Quran Reader Team' }],
  creator: 'Quran Reader',
  publisher: 'Quran Reader',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Quran Reader',
    title: 'Quran Reader - Read, Listen, and Reflect',
    description: 'A beautiful, modern Quran reader with multiple translations, audio recitations, and advanced features for studying the Holy Quran.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Quran Reader',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quran Reader - Read, Listen, and Reflect',
    description: 'A beautiful, modern Quran reader with multiple translations, audio recitations, and advanced features for studying the Holy Quran.',
    images: ['/og-image.png'],
    creator: '@quranreader',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${notoNaskh.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative min-h-screen bg-background">
            {/* Background Pattern */}
            <IslamicPattern className="fixed inset-0 w-full h-full pointer-events-none text-foreground" />
            
            {/* Main Layout */}
            <div className="relative z-10">
              <Header />
              <main className="pb-20">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}