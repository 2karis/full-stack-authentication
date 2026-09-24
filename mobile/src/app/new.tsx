import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ContentForm } from '@/components/content/content-form';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { createContent } from '@/services/content';

export default function NewContentScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom + BottomTabInset + Spacing.three,
        },
      ]}>
      <ContentForm
        submitLabel="Create"
        onSubmit={async (values) => {
          await createContent(values);
          // Head back to the list so the new item is visible.
          router.replace('/');
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});