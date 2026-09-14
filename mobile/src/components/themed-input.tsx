import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { Spacing, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextInputProps = TextInputProps & {
  type?: ThemeColor;
};

export function ThemedTextInput({ style, type = 'backgroundElement', ...rest }: ThemedTextInputProps) {
  const theme = useTheme();

  return (
    <TextInput
      placeholderTextColor={theme.textSecondary}
      style={[
        styles.input,
        { backgroundColor: theme[type], color: theme.text },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    fontSize: 16,
  },
});