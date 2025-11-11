import React, { useMemo, useState } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { Modal, Portal, Surface, Text } from 'react-native-paper';
import { colors, radii, shadows, spacing } from '../styles/tokens';

type Option = {
  label: string;
  value: string;
};

type Props = {
  label: string;
  value?: string;
  onSelect: (value: string) => void;
  options: (Option | string)[];
  placeholder?: string;
};

const AppSelect: React.FC<Props> = ({ label, value, onSelect, options, placeholder }) => {
  const [visible, setVisible] = useState(false);

  const parsedOptions = useMemo<Option[]>(
    () =>
      options.map(option =>
        typeof option === 'string'
          ? {
              label: option,
              value: option,
            }
          : option
      ),
    [options]
  );

  const selectedLabel = useMemo(() => {
    return parsedOptions.find(option => option.value === value)?.label;
  }, [parsedOptions, value]);

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity activeOpacity={0.85} onPress={() => setVisible(true)} style={selectStyles.root}>
        <Text variant="labelLarge" style={selectStyles.label}>
          {label}
        </Text>
        <Surface style={selectStyles.input} elevation={0}>
          <Text variant="bodyLarge" style={[selectStyles.value, !selectedLabel && selectStyles.placeholder]}>
            {selectedLabel || placeholder || 'Select'}
          </Text>
        </Surface>
      </TouchableOpacity>

      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={selectStyles.modalContainer}>
          <Surface style={selectStyles.modalSurface} elevation={2}>
            <Text variant="titleMedium" style={selectStyles.modalTitle}>
              {label}
            </Text>
            <FlatList
              data={parsedOptions}
              keyExtractor={item => item.value}
              ItemSeparatorComponent={() => <View style={selectStyles.separator} />}
              renderItem={({ item }) => (
                <TouchableOpacity style={selectStyles.option} onPress={() => handleSelect(item.value)}>
                  <Text variant="bodyLarge" style={selectStyles.optionLabel}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </Surface>
        </Modal>
      </Portal>
    </>
  );
};

const selectStyles = {
  root: {
    width: '100%',
    gap: spacing.xs,
  },
  label: {
    color: colors.secondaryText,
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  value: {
    color: colors.primaryText,
  },
  placeholder: {
    color: colors.tertiaryText,
  },
  modalContainer: {
    marginHorizontal: spacing.xl,
  },
  modalSurface: {
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    padding: spacing.lg,
    maxHeight: '70%',
    ...shadows.card,
  },
  modalTitle: {
    marginBottom: spacing.md,
    color: colors.primaryText,
  },
  option: {
    paddingVertical: spacing.sm,
  },
  optionLabel: {
    color: colors.primaryText,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderMuted,
  },
};

export default AppSelect;

