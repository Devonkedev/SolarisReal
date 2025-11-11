const GOOGLE_TRANSLATE_ENDPOINT =
  'https://translate.googleapis.com/translate_a/single?client=gtx&dt=t';

const cache = new Map<string, string>();

async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage = 'en'
): Promise<string> {
  if (!text) return text;
  const key = `${sourceLanguage}-${targetLanguage}-${text}`;
  if (cache.has(key)) {
    return cache.get(key)!;
  }

  const url = `${GOOGLE_TRANSLATE_ENDPOINT}&sl=${encodeURIComponent(
    sourceLanguage
  )}&tl=${encodeURIComponent(targetLanguage)}&q=${encodeURIComponent(text)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Translation request failed with status ${response.status}`);
  }

  const data = await response.json();
  const translated =
    Array.isArray(data) && Array.isArray(data[0]) && Array.isArray(data[0][0])
      ? data[0][0][0]
      : text;

  cache.set(key, translated);
  return translated;
}

export async function translateStrings(
  strings: Record<string, string>,
  targetLanguage: string,
  sourceLanguage = 'en'
): Promise<Record<string, string>> {
  const entries = await Promise.all(
    Object.entries(strings).map(async ([key, value]) => {
      try {
        const translatedValue = await translateText(value, targetLanguage, sourceLanguage);
        return [key, translatedValue] as const;
      } catch (error) {
        console.warn(`Failed to translate key "${key}":`, error);
        return [key, value] as const;
      }
    })
  );

  return Object.fromEntries(entries);
}

