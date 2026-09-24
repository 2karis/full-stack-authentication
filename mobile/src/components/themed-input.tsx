import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { Radius, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextInputProps = TextInputProps & {
  type?: ThemeColor;
};

/** shadcn-style input: bordered, rounded, transparent over the card surface. */
export function ThemedTextInput({ style, type = 'backgroundElement', ...rest }: ThemedTextInputProps) {
  const theme = useTheme();

  return (
    <TextInput
      placeholderTextColor={theme.textSecondary}
      style={[
        styles.input,
        { backgroundColor: theme[type], color: theme.text, borderColor: theme.border },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: Radius.md,
    fontSize: 14,
  },
});