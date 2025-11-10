import { configureFonts, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import type { MD3TypescaleKey } from 'react-native-paper/lib/typescript/types';
import { fontFamilies } from './fonts';

type FontLevel =
  | 'displayLarge'
  | 'displayMedium'
  | 'displaySmall'
  | 'headlineLarge'
  | 'headlineMedium'
  | 'headlineSmall'
  | 'titleLarge'
  | 'titleMedium'
  | 'titleSmall'
  | 'labelLarge'
  | 'labelMedium'
  | 'labelSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall';

const makeFontConfig = (weightOverrides: Partial<Record<FontLevel, { fontWeight: string }>>) => {
  const base: Record<MD3TypescaleKey, { fontFamily: string; fontWeight: string }> = {
    displayLarge: { fontFamily: fontFamilies.bold, fontWeight: '700' },
    displayMedium: { fontFamily: fontFamilies.bold, fontWeight: '700' },
    displaySmall: { fontFamily: fontFamilies.medium, fontWeight: '600' },
    headlineLarge: { fontFamily: fontFamilies.bold, fontWeight: '700' },
    headlineMedium: { fontFamily: fontFamilies.medium, fontWeight: '600' },
    headlineSmall: { fontFamily: fontFamilies.medium, fontWeight: '600' },
    titleLarge: { fontFamily: fontFamilies.medium, fontWeight: '600' },
    titleMedium: { fontFamily: fontFamilies.medium, fontWeight: '600' },
    titleSmall: { fontFamily: fontFamilies.medium, fontWeight: '600' },
    labelLarge: { fontFamily: fontFamilies.medium, fontWeight: '600' },
    labelMedium: { fontFamily: fontFamilies.medium, fontWeight: '600' },
    labelSmall: { fontFamily: fontFamilies.medium, fontWeight: '600' },
    bodyLarge: { fontFamily: fontFamilies.regular, fontWeight: '400' },
    bodyMedium: { fontFamily: fontFamilies.regular, fontWeight: '400' },
    bodySmall: { fontFamily: fontFamilies.regular, fontWeight: '400' },
  };

  Object.entries(weightOverrides).forEach(([key, value]) => {
    if (key in base) {
      base[key as MD3TypescaleKey] = {
        ...base[key as MD3TypescaleKey],
        ...value,
      };
    }
  });

  return configureFonts({ config: base as any });
};

const lightColors = {
  ...MD3LightTheme.colors,
  primary: '#2C8CFF',
  onPrimary: '#FFFFFF',
  secondary: '#FDBA74',
  onSecondary: '#3B1700',
  tertiary: '#7C3AED',
  surface: '#FFFFFF',
  surfaceVariant: '#E4ECFF',
  background: '#F5F7FB',
  outline: '#C1CCE7',
  outlineVariant: '#E2E8F6',
  shadow: 'rgba(15, 23, 42, 0.14)',
  elevation: {
    level0: 'transparent',
    level1: 'rgba(12, 74, 110, 0.06)',
    level2: 'rgba(12, 74, 110, 0.08)',
    level3: 'rgba(12, 74, 110, 0.10)',
    level4: 'rgba(12, 74, 110, 0.12)',
    level5: 'rgba(12, 74, 110, 0.14)',
  },
};

const darkColors = {
  ...MD3DarkTheme.colors,
  primary: '#6EA8FF',
  onPrimary: '#001C3B',
  background: '#0B1120',
  surface: '#111D33',
  surfaceVariant: '#1E2A40',
  outline: '#334155',
  outlineVariant: '#1E293B',
};

const fonts = makeFontConfig({});

export const appLightTheme = {
  ...MD3LightTheme,
  fonts,
  roundness: 18,
  colors: lightColors,
};

export const appDarkTheme = {
  ...MD3DarkTheme,
  fonts,
  roundness: 18,
  colors: darkColors,
};

