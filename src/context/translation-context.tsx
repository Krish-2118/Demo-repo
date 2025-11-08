'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useTransition } from 'react';
import { translateText } from '@/ai/flows/translate-text';

type Language = 'en' | 'or'; // English and Odia

interface TranslationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (text: string, placeholders?: Record<string, string | number>) => string;
  isTranslating: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, startTransition] = useTransition();

  const handleSetLanguage = (lang: Language) => {
    if (lang === 'en') {
      // No need to translate if switching back to English
      setLanguage('en');
      return;
    }
    setLanguage(lang);
  };
  
  const t = useCallback((text: string, placeholders?: Record<string, string | number>): string => {
    if (language === 'en') {
        let result = text;
        if(placeholders) {
            Object.keys(placeholders).forEach(key => {
                result = result.replace(`{${key}}`, String(placeholders[key]));
            });
        }
        return result;
    }

    const key = text; // The original English text is the key
    const translated = translations[key];

    if (translated) {
        let result = translated;
        if(placeholders) {
            Object.keys(placeholders).forEach(key => {
                // This placeholder replacement on translated text might not be perfect for all languages
                result = result.replace(`{${key}}`, String(placeholders[key]));
            });
        }
        return result;
    }

    // If not found, translate and cache it.
    startTransition(() => {
        translateText({ text, targetLanguage: 'Odia' })
        .then(result => {
            setTranslations(prev => ({ ...prev, [key]: result.translatedText }));
        })
        .catch(error => {
            console.error("Translation error:", error);
            // Store original text on error to prevent re-fetching
            setTranslations(prev => ({ ...prev, [key]: text }));
        });
    });

    let result = text;
    if(placeholders) {
        Object.keys(placeholders).forEach(key => {
            result = result.replace(`{${key}}`, String(placeholders[key]));
        });
    }
    return result; // Return original text immediately
  }, [language, translations]);

  return (
    <TranslationContext.Provider value={{ language, setLanguage: handleSetLanguage, t, isTranslating }}>
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
