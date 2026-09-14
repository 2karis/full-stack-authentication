import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoginForm } from '@/components/auth/login-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { listContent, type ContentItem } from '@/services/content';

export default function ContentListScreen() {
  const { status, username, isAdmin, signIn, signOut } = useAuth();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (status !== 'signedIn') {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setItems(await listContent());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Loading failed');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (status === 'loading') {
    return null;
  }

  if (status === 'signedOut') {
    return (
      <ThemedView style={[styles.centered, { paddingTop: insets.top }]}>
        <LoginForm onSubmit={signIn} />
      </ThemedView>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top, paddingBottom: insets.bottom + BottomTabInset + Spacing.three },
      ]}
      data={items}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          onPress={() => router.push({ pathname: '/content/[id]', params: { id: String(item.id) } })}>
          <ThemedView type="backgroundElement" style={styles.cardBackground}>
            <ThemedText type="smallBold" style={styles.cardTitle}>
              {item.title}
            </ThemedText>
            {item.description !== '' && (
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
                {item.description}
              </ThemedText>
            )}
            <ThemedText type="small" themeColor="textSecondary">
              {new Date(item.updatedAt).toLocaleString()}
            </ThemedText>
          </ThemedView>
        </Pressable>
      )}
      ListHeaderComponent={
        <View style={styles.header}>
          <View>
            <ThemedText type="subtitle">Content</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Signed in as {username}
            </ThemedText>
          </View>
          <View style={styles.headerActions}>
            {isAdmin && (
              <Pressable style={({ pressed }) => pressed && styles.pressed} onPress={() => router.push('/content/new')}>
                <ThemedText type="linkPrimary">+ New</ThemedText>
              </Pressable>
            )}
            <Pressable style={({ pressed }) => pressed && styles.pressed} onPress={signOut}>
              <ThemedText type="link">Sign out</ThemedText>
            </Pressable>
          </View>
        </View>
      }
      ListEmptyComponent={
        !error && !loading ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
            Nothing here yet.
          </ThemedText>
        ) : null
      }
      ListFooterComponent={
        error ? (
          <ThemedText type="small" style={styles.error}>
            {error}
          </ThemedText>
        ) : null
      }
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={load} tintColor={theme.textSecondary} />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  header: {
    width: '100%',
    maxWidth: MaxContentWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  card: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  pressed: {
    opacity: 0.7,
  },
  cardBackground: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  cardTitle: {
    fontSize: 18,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.four,
  },
  error: {
    color: '#d73a49',
    textAlign: 'center',
    paddingVertical: Spacing.two,
  },
});