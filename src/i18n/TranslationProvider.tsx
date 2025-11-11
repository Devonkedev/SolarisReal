import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as Localization from 'expo-localization';
import { baseStrings, type TranslationKey } from './baseStrings';
import { translateStrings, translateText } from '../services/translationService';
import { builtInTranslations } from './locales';

type TranslationContextValue = {
  t: (key: TranslationKey) => string;
  translate: (text: string) => string;
  locale: string;
  setLocale: (code: string) => void;
  isLoading: boolean;
};

const TranslationContext = createContext<TranslationContextValue>({
  t: (key: TranslationKey) => baseStrings[key] ?? key,
  translate: (text: string) => text,
  locale: 'en',
  setLocale: () => {},
  isLoading: false,
});

const normalizeLocale = (code?: string | null) =>
  code ? code.replace('_', '-').toLowerCase() : undefined;

type Props = {
  children: React.ReactNode;
};

export const TranslationProvider: React.FC<Props> = ({ children }) => {
  const locales = Localization.getLocales ? Localization.getLocales() : [];
  const primaryLocale = locales.length > 0 ? locales[0] : undefined;
  const deviceLocaleTag = normalizeLocale(primaryLocale?.languageTag) ?? 'en';
  const deviceLanguageCode = normalizeLocale(primaryLocale?.languageCode) ?? deviceLocaleTag;

  const [locale, setLocale] = useState<string>(
    (deviceLanguageCode?.split('-')[0] || deviceLocaleTag.split('-')[0] || 'en')
  );
  const [messages, setMessages] = useState<Record<string, string>>(baseStrings);
  const [isLoading, setIsLoading] = useState(false);
  const [inlineMessages, setInlineMessages] = useState<Record<string, string>>({});
  const pendingInlineRequests = useRef<Set<string>>(new Set());

  const normalizedLocale = useMemo(() => normalizeLocale(locale) ?? 'en', [locale]);
  const candidateLocaleCodes = useMemo(() => {
    const codes = new Set<string>();
    codes.add(normalizedLocale);
    if (deviceLocaleTag) {
      codes.add(deviceLocaleTag);
    }
    if (normalizedLocale.includes('-')) {
      codes.add(normalizedLocale);
    }
    return Array.from(codes);
  }, [normalizedLocale, deviceLocaleTag]);

  const baseValueToKey = useMemo(() => {
    const map = new Map<string, TranslationKey>();
    (Object.entries(baseStrings) as Array<[TranslationKey, string]>).forEach(([key, value]) => {
      map.set(value, key);
    });
    return map;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const syncTranslations = async () => {
      setIsLoading(true);
      try {
        if (normalizedLocale === 'en') {
          setMessages(baseStrings);
          return;
        }

        const builtIn =
          candidateLocaleCodes
            .map(code => builtInTranslations[code])
            .find(Boolean) ?? builtInTranslations[normalizedLocale];

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
  }, [locale, candidateLocaleCodes, normalizedLocale]);

  useEffect(() => {
    setInlineMessages({});
    pendingInlineRequests.current.clear();
  }, [normalizedLocale]);

  const translate = useMemo(() => {
    return (text: string) => {
      if (!text) return text;
      if (normalizedLocale === 'en') return text;

      const trimmed = text.trim();

      const baseKey = baseValueToKey.get(trimmed);
      if (baseKey) {
        for (const code of candidateLocaleCodes) {
          const built = builtInTranslations[code];
          if (built?.[baseKey]) {
            return built[baseKey] as string;
          }
        }
        const translatedMessage = messages[baseKey];
        if (translatedMessage) {
          return translatedMessage;
        }
      }

      const cached = inlineMessages[trimmed];
      if (cached) {
        return cached;
      }

      if (!pendingInlineRequests.current.has(trimmed)) {
        pendingInlineRequests.current.add(trimmed);
        translateText(trimmed, normalizedLocale)
          .then(result => {
            setInlineMessages(prev => ({
              ...prev,
              [trimmed]: result || trimmed,
            }));
          })
          .catch(error => {
            console.warn(`Failed to translate "${trimmed}" inline:`, error);
          })
          .finally(() => {
            pendingInlineRequests.current.delete(trimmed);
          });
      }

      return text;
    };
  }, [
    normalizedLocale,
    baseValueToKey,
    inlineMessages,
    candidateLocaleCodes,
    messages,
  ]);

  const value = useMemo<TranslationContextValue>(
    () => ({
      t: (key: TranslationKey) => messages[key] ?? baseStrings[key] ?? key,
      translate,
      locale,
      setLocale,
      isLoading,
    }),
    [messages, translate, locale, isLoading]
  );

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
};

export const useTranslationContext = () => useContext(TranslationContext);

