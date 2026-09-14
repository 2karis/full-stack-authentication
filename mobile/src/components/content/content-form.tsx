import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-input';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { ContentInput } from '@/services/content';

type ContentFormProps = {
  initialTitle?: string;
  initialDescription?: string;
  submitLabel: string;
  onSubmit: (values: ContentInput) => Promise<void>;
};

export function ContentForm({
  initialTitle = '',
  initialDescription = '',
  submitLabel,
  onSubmit,
}: ContentFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (submitting || title.trim() === '') {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ title: title.trim(), description: description.trim() });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Saving failed');
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.fields}>
        <ThemedTextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          editable={!submitting}
        />
        <ThemedTextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          multiline
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
            {submitting ? 'Saving…' : submitLabel}
          </ThemedText>
        </ThemedView>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
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