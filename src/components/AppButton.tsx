import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, ButtonProps } from 'react-native-paper';

type Props = ButtonProps & {
  compact?: boolean;
};

const AppButton: React.FC<Props> = ({ style, labelStyle, mode = 'contained', compact = false, ...rest }) => {
  return (
    <Button
      mode={mode}
      style={[styles.button, compact && styles.compact, mode === 'outlined' && styles.outlined, style]}
      labelStyle={[styles.label, labelStyle]}
      contentStyle={styles.content}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    minHeight: 52,
  },
  compact: {
    minHeight: 44,
  },
  content: {
    height: 52,
  },
  label: {
    fontFamily: 'OpenSauce-Bold',
    fontSize: 16,
  },
  outlined: {
    borderWidth: 2,
  },
});

export default AppButton;

