import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { listContent, type ContentItem } from '@/services/content';

export default function HomeScreen() {
  const { status, username } = useAuth();
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

  if (status !== 'signedIn') {
    return null;
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
          <ThemedText type="small" themeColor="danger" style={styles.error}>
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
    // Vertical column — no flexDirection, so cards stack one per row.
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
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
  pressed: {
    opacity: 0.7,
  },
  card: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  cardBackground: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Radius.lg,
  },
  cardTitle: {
    fontSize: 18,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.four,
  },
  error: {
    textAlign: 'center',
    paddingVertical: Spacing.two,
  },
});