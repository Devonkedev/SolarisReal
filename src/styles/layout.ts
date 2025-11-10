import { StyleSheet } from 'react-native';

export const layout = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 32,
  },
  formCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 28,
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#0B1120',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 32,
    elevation: 6,
    gap: 16,
  },
  sectionGap: {
    gap: 16,
  },
  horizontalGap: {
    gap: 12,
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

