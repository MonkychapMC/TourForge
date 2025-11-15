import React, { createContext, useContext, ReactNode } from 'react';
import { useTour } from './TourDataProvider';
import { translations } from '../utils/translations';
import { Language, UserSettings } from '../types';

interface I18nContextType {
  language: Language;
  t: (key: string, params?: { [key: string]: string | number }) => string;
  settings: UserSettings;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { settings } = useTour();
  const { language } = settings;

  const t = (key: string, params?: { [key: string]: string | number }): string => {
    const langTranslations = translations[language] || translations.en;
    const translation = langTranslations[key];

    if (typeof translation === 'function') {
      return translation(params || {});
    }
    
    return (translation || key) as string;
  };

  return (
    <I18nContext.Provider value={{ language, t, settings }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
