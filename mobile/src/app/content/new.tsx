import { router } from 'expo-router';

import { ContentForm } from '@/components/content/content-form';
import { ThemedView } from '@/components/themed-view';
import { createContent } from '@/services/content';

export default function NewContentScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <ContentForm
        submitLabel="Create"
        onSubmit={async (values) => {
          await createContent(values);
          router.back();
        }}
      />
    </ThemedView>
  );
}