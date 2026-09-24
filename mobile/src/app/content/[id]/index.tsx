import { useCallback, useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { deleteContent, getContent, type ContentItem } from '@/services/content';

export default function ContentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAdmin } = useAuth();

  const [item, setItem] = useState<ContentItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setItem(await getContent(Number(id)));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Loading failed');
      }
    })();
  }, [id]);

  function confirmDelete() {
    Alert.alert('Delete content', `Delete "${item?.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteContent(Number(id));
          router.back();
        },
      },
    ]);
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="small" themeColor="danger">
          {error}
        </ThemedText>
      </ThemedView>
    );
  }

  if (!item) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="small" themeColor="textSecondary">
          Loading…
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">{item.title}</ThemedText>
      <ThemedText>{item.description}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Created by {item.createdBy} · {new Date(item.createdAt).toLocaleString()}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Updated {new Date(item.updatedAt).toLocaleString()}
      </ThemedText>
      {isAdmin && (
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            onPress={() => router.push({ pathname: '/content/[id]/edit', params: { id } })}>
            <ThemedText type="linkPrimary">Edit</ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            onPress={confirmDelete}>
            <ThemedText type="link">Delete</ThemedText>
          </Pressable>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacing.three,
    padding: Spacing.four,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.four,
    paddingTop: Spacing.two,
  },
  actionButton: {
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});