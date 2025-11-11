import { frTranslations } from './fr';
import { hiTranslations } from './hi';
import type { TranslationKey } from '../baseStrings';

export const builtInTranslations: Record<
  string,
  Partial<Record<TranslationKey, string>>
> = {
  fr: frTranslations,
  hi: hiTranslations,
  'hi-in': hiTranslations,
  'fr-fr': frTranslations,
};

