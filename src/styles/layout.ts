import { StyleSheet } from 'react-native';
import { colors, radii, shadows, spacing } from './tokens';

export const layout = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.xxl,
    width: '100%',
  },
  formCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    backgroundColor: colors.card,
    gap: spacing.lg,
    ...shadows.card,
  },
  sectionGap: {
    gap: spacing.lg,
  },
  horizontalGap: {
    gap: spacing.sm,
  },
  centered: {
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  inlineControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

