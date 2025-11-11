import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, ButtonProps } from 'react-native-paper';
import { colors, radii, shadows, spacing } from '../styles/tokens';

type Props = ButtonProps & {
  compact?: boolean;
};

const AppButton: React.FC<Props> = ({ style, labelStyle, mode = 'contained', compact = false, ...rest }) => {
  const modeStyle =
    mode === 'contained' ? styles.contained : mode === 'outlined' ? styles.outlined : styles.textMode;

  return (
    <Button
      mode={mode}
      style={[styles.base, modeStyle, compact && styles.compact, style]}
      labelStyle={[styles.label, labelStyle]}
      contentStyle={styles.content}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    minHeight: 52,
  },
  contained: {
    backgroundColor: colors.primary,
    ...shadows.soft,
  },
  textMode: {
    backgroundColor: 'transparent',
  },
  compact: {
    minHeight: 44,
  },
  content: {
    height: 52,
    paddingVertical: 0,
  },
  label: {
    fontFamily: 'OpenSauce-Bold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  outlined: {
    borderWidth: 2,
    backgroundColor: 'transparent',
    borderColor: colors.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default AppButton;

