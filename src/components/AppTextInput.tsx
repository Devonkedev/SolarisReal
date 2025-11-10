import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, TextInputProps } from 'react-native-paper';

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
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  fullWidth: {
    width: '100%',
  },
  outline: {
    borderWidth: 2,
    borderRadius: 18,
  },
  content: {
    fontSize: 16,
  },
  multiline: {
    minHeight: 120,
    paddingTop: 16,
  },
});

export default AppTextInput;

