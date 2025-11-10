import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

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
        <Text variant="titleMedium" style={styles.title} numberOfLines={1}>
          {label}
        </Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148, 163, 184, 0.4)',
    paddingHorizontal: 4,
    minHeight: 48,
  },
  title: {
    color: '#0F172A',
    flex: 1,
    marginRight: 12,
  },
  action: {
    color: '#1E3A8A',
    flexShrink: 0,
    fontWeight: '600',
  },
});

export default CustomJuniorHeader;
