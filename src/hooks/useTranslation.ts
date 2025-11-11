import { useTranslationContext } from '../i18n/TranslationProvider';

export const useTranslation = () => {
  const { t, locale, setLocale, isLoading } = useTranslationContext();
  return { t, locale, setLocale, isLoading };
};

