'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
      className="text-sm"
    >
      {language === 'en' ? 'தமிழ்' : 'English'}
    </Button>
  );
}