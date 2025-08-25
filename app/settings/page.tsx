import { Metadata } from 'next';
import { SettingsPageWrapper } from '@/app/components/settings-page-wrapper';

export const metadata: Metadata = {
  title: 'Settings - Customize your Quran reading experience',
  description: 'Personalize your Quran reading experience with language, translations, reciters, and accessibility options.',
};

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SettingsPageWrapper />
    </div>
  );
}
