import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoginForm } from '@/components/auth/login-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';

import AppTabs from '../app-tabs';

/**
 * Route middleware: while signed out, the sign-in screen replaces the entire
 * app — no tab, content, or profile route mounts, so a signed-out user (or a
 * stale deep link) can never reach the rest of the app.
 */
export function AuthGate() {
  const { status, signIn } = useAuth();

  if (status === 'loading') {
    // Keep the splash screen up while the persisted session is restored.
    return null;
  }

  if (status === 'signedOut') {
    return <SignInScreen onSubmit={signIn} />;
  }

  return <AppTabs />;
}

function SignInScreen({ onSubmit }: { onSubmit: (username: string, password: string) => Promise<void> }) {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.column}>
        <ThemedText type="title" style={styles.brand}>
          Full Stack Authentication
        </ThemedText>
        <ThemedView type="backgroundElement" style={styles.card}>
          <LoginForm onSubmit={onSubmit} />
        </ThemedView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
  },
  column: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
    gap: Spacing.four,
  },
  brand: {
    textAlign: 'center',
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.four,
  },
});