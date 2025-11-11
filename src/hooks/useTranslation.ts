import { useTranslationContext } from '../i18n/TranslationProvider';

export const useTranslation = () => {
  const { t, translate, locale, setLocale, isLoading } = useTranslationContext();
  return { t, translate, locale, setLocale, isLoading };
};

