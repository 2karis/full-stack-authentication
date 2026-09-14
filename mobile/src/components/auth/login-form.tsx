import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-input';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type LoginFormProps = {
  onSubmit: (username: string, password: string) => Promise<void>;
};

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (submitting || username === '' || password === '') {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(username, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Sign in</ThemedText>
      <View style={styles.fields}>
        <ThemedTextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!submitting}
        />
        <ThemedTextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          editable={!submitting}
        />
      </View>
      {error && (
        <ThemedText type="small" style={styles.error}>
          {error}
        </ThemedText>
      )}
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        disabled={submitting}
        onPress={handleSubmit}>
        <ThemedView type="backgroundSelected" style={styles.buttonBackground}>
          <ThemedText type="smallBold" style={styles.buttonText}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </ThemedText>
        </ThemedView>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  fields: {
    gap: Spacing.two,
  },
  error: {
    color: '#d73a49',
  },
  button: {
    borderRadius: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
  buttonBackground: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
  buttonText: {
    textAlign: 'center',
  },
});