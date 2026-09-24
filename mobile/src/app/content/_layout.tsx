import { Stack } from 'expo-router';

export default function ContentLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]/index" options={{ title: 'Detail' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit' }} />
    </Stack>
  );
}