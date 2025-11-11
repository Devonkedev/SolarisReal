import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, radii, spacing } from '../styles/tokens';

type Props = {
  label?: string;
  actionSlot?: React.ReactNode;
  action?: () => void;
  actionLabel?: string;
};

const CustomJuniorHeader: React.FC<Props> = ({ label, actionSlot, action, actionLabel }) => {
  if (!label && !actionSlot && !action) return null;

  return (
    <View style={styles.container}>
      {label ? (
        <View style={styles.titleWrap}>
          <Text variant="titleMedium" style={styles.title} numberOfLines={1}>
            {label}
          </Text>
          <View style={styles.underline} />
        </View>
      ) : (
        <View />
      )}
      {actionSlot
        ? actionSlot
        : action
        ? (
          <Text variant="labelLarge" style={styles.action} onPress={action}>
            {actionLabel || 'See all'}
          </Text>
        )
        : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  titleWrap: {
    flex: 1,
    paddingRight: spacing.md,
    gap: spacing.xs / 2,
  },
  title: {
    color: colors.primaryText,
    flex: 1,
    fontWeight: '700',
  },
  action: {
    color: colors.primary,
    flexShrink: 0,
    fontWeight: '600',
  },
  underline: {
    width: 48,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
});

export default CustomJuniorHeader;
