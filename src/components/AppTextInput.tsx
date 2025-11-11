import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, TextInputProps } from 'react-native-paper';
import { colors, radii, spacing } from '../styles/tokens';

type Props = TextInputProps & {
  fullWidth?: boolean;
};

const AppTextInput: React.FC<Props> = ({ style, outlineStyle, contentStyle, fullWidth = true, ...rest }) => {
  const multilineStyles = rest.multiline ? styles.multiline : null;

  return (
    <TextInput
      mode="outlined"
      dense={false}
      style={[styles.input, fullWidth && styles.fullWidth, multilineStyles, style]}
      outlineStyle={[styles.outline, outlineStyle]}
      contentStyle={[styles.content, contentStyle]}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    minHeight: 56,
    borderRadius: radii.md,
    backgroundColor: colors.card,
  },
  fullWidth: {
    width: '100%',
  },
  outline: {
    borderWidth: 1.5,
    borderRadius: radii.md,
    borderColor: colors.border,
  },
  content: {
    fontSize: 16,
    paddingVertical: spacing.xs,
  },
  multiline: {
    minHeight: 120,
    paddingTop: spacing.md,
  },
});

export default AppTextInput;

