import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

import { ContentForm } from '@/components/content/content-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getContent, updateContent } from '@/services/content';

export default function EditContentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [item, setItem] = useState<Awaited<ReturnType<typeof getContent>> | null>(null);
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

  if (error) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText type="small" style={{ color: '#d73a49' }}>
          {error}
        </ThemedText>
      </ThemedView>
    );
  }

  if (!item) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText type="small" themeColor="textSecondary">
          Loading…
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ContentForm
        initialTitle={item.title}
        initialDescription={item.description}
        submitLabel="Save"
        onSubmit={async (values) => {
          await updateContent(Number(id), values);
          router.back();
        }}
      />
    </ThemedView>
  );
}