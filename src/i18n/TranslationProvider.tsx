import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as Localization from 'expo-localization';
import { baseStrings, type TranslationKey } from './baseStrings';
import { translateStrings } from '../services/translationService';
import { builtInTranslations } from './locales';

type TranslationContextValue = {
  t: (key: TranslationKey) => string;
  locale: string;
  setLocale: (code: string) => void;
  isLoading: boolean;
};

const TranslationContext = createContext<TranslationContextValue>({
  t: (key: TranslationKey) => baseStrings[key] ?? key,
  locale: 'en',
  setLocale: () => {},
  isLoading: false,
});

type Props = {
  children: React.ReactNode;
};

export const TranslationProvider: React.FC<Props> = ({ children }) => {
  const locales = Localization.getLocales ? Localization.getLocales() : [];
  const primaryLocale = locales.length > 0 ? locales[0] : undefined;
  const normalizeLocale = (code?: string | null) =>
    code ? code.replace('_', '-').toLowerCase() : undefined;
  const deviceLocaleTag = normalizeLocale(primaryLocale?.languageTag) ?? 'en';
  const deviceLanguageCode = normalizeLocale(primaryLocale?.languageCode) ?? deviceLocaleTag;

  const [locale, setLocale] = useState<string>(
    (deviceLanguageCode?.split('-')[0] || deviceLocaleTag.split('-')[0] || 'en')
  );
  const [messages, setMessages] = useState<Record<string, string>>(baseStrings);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const syncTranslations = async () => {
      const normalized = normalizeLocale(locale) ?? 'en';
      const localeWithRegion = deviceLocaleTag;
      const candidateKeys = [
        normalized,
        localeWithRegion,
        normalized.includes('-') ? normalized : undefined,
      ].filter(Boolean) as string[];

      setIsLoading(true);
      try {
        if (normalized === 'en') {
          setMessages(baseStrings);
          return;
        }

        const builtIn =
          candidateKeys
            .map(code => builtInTranslations[code])
            .find(Boolean) ?? builtInTranslations[normalized];

        if (builtIn) {
          setMessages({ ...baseStrings, ...builtIn });
          return;
        }

        const translated = await translateStrings(baseStrings, locale);
        if (!cancelled) {
          setMessages(translated);
        }
      } catch (error) {
        console.warn('Falling back to English strings due to translation error:', error);
        if (!cancelled) {
          setMessages(baseStrings);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    syncTranslations();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const value = useMemo<TranslationContextValue>(
    () => ({
      t: (key: TranslationKey) => messages[key] ?? baseStrings[key] ?? key,
      locale,
      setLocale,
      isLoading,
    }),
    [messages, locale, isLoading]
  );

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
};

export const useTranslationContext = () => useContext(TranslationContext);

