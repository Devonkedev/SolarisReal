const palette = {
  indigo900: '#0B1120',
  indigo700: '#1E3A8A',
  indigo600: '#1D4ED8',
  indigo500: '#2563EB',
  indigo100: '#E0E7FF',
  slate900: '#0F172A',
  slate800: '#1E293B',
  slate600: '#475569',
  slate500: '#64748B',
  slate300: '#CBD5F5',
  slate200: '#E2E8F6',
  slate100: '#F1F5FB',
  white: '#FFFFFF',
  mint100: '#E0F2F1',
  mint500: '#0F766E',
  amber400: '#F8AF3C',
  emerald400: '#34D399',
  rose400: '#FB7185',
};

export const colors = {
  palette,
  background: palette.slate100,
  card: palette.white,
  cardAlt: '#F8FAFF',
  primary: palette.indigo500,
  primaryText: palette.indigo900,
  secondaryText: palette.slate600,
  tertiaryText: palette.slate500,
  border: palette.slate200,
  borderMuted: 'rgba(148, 163, 184, 0.25)',
  success: palette.emerald400,
  warning: palette.amber400,
  info: palette.indigo600,
  subtle: 'rgba(30, 64, 175, 0.05)',
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 28,
  pill: 999,
};

export const shadows = {
  card: {
    shadowColor: 'rgba(15, 23, 42, 0.14)',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 8,
  },
  soft: {
    shadowColor: 'rgba(15, 23, 42, 0.08)',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 4,
  },
};

export const typography = {
  titleColor: colors.primaryText,
  bodyColor: colors.secondaryText,
  mutedColor: colors.tertiaryText,
};


