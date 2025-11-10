import { useEffect, useState } from 'react';
import * as Font from 'expo-font';

const FONT_SOURCES: Record<string, Font.FontSource> = {
  'OpenSauce-Regular': require('../../assets/fonts/OpenSauceOne-Black.ttf'),
  'OpenSauce-Medium': require('../../assets/fonts/OpenSauceOne-Black.ttf'),
  'OpenSauce-Bold': require('../../assets/fonts/OpenSauceOne-Black.ttf'),
};

export const useAppFonts = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Font.loadAsync(FONT_SOURCES)
      .catch(err => {
        console.warn('Failed to load Open Sauce fonts, falling back to system fonts.', err);
      })
      .finally(() => {
        if (!cancelled) {
          setLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return loaded;
};

export const fontFamilies = {
  regular: 'OpenSauce-Regular',
  medium: 'OpenSauce-Medium',
  bold: 'OpenSauce-Bold',
};

