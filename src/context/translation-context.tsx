'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { translations } from '@/lib/translations';

type Language = 'en' | 'or'; // English and Odia

interface TranslationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (text: string, placeholders?: Record<string, string | number>) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = useCallback((text: string, placeholders?: Record<string, string | number>): string => {
    let translatedText: string;

    if (language === 'en') {
      translatedText = text;
    } else {
      // @ts-ignore
      translatedText = translations[language][text] || text;
    }
    
    if (placeholders) {
      Object.keys(placeholders).forEach(key => {
        translatedText = translatedText.replace(`{${key}}`, String(placeholders[key]));
      });
    }

    return translatedText;
  }, [language]);

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
