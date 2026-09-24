import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-input';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { changePassword, getProfile, updateProfile, type Profile } from '@/services/profile';

export default function ProfileScreen() {
  const { status, username, isAdmin, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  useEffect(() => {
    (async () => {
      if (status !== 'signedIn') {
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const fetched = await getProfile();
        setProfile(fetched);
        setFirstName(fetched.firstName ?? '');
        setLastName(fetched.lastName ?? '');
        setEmail(fetched.email ?? '');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Loading failed');
      } finally {
        setLoading(false);
      }
    })();
  }, [status]);

  const saveProfile = useCallback(async () => {
    if (!profile || saving) {
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateProfile({ ...profile, firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Saving failed');
    } finally {
      setSaving(false);
    }
  }, [profile, saving, firstName, lastName, email]);

  const updatePassword = useCallback(async () => {
    if (passwordUpdating) {
      return;
    }
    setPasswordMessage(null);
    if (currentPassword === '' || newPassword === '' || confirmPassword === '') {
      setPasswordMessage('Fill in all three password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage('The new password and confirmation do not match.');
      return;
    }
    setPasswordUpdating(true);
    try {
      await changePassword(currentPassword, newPassword);
      // The password was changed — current tokens are stale, so drop them
      // and ask the user to sign in again.
      await signOut();
    } catch (e) {
      setPasswordMessage(e instanceof Error ? e.message : 'Could not update password');
    } finally {
      setPasswordUpdating(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [passwordUpdating, currentPassword, newPassword, confirmPassword, signOut]);

  if (status !== 'signedIn') {
    return null;
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom + BottomTabInset + Spacing.three,
        },
      ]}>
      <View style={styles.column}>
        <View style={styles.header}>
          <ThemedText type="title">Profile</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Signed in as {username}
            {isAdmin ? ' · admin' : ''}
          </ThemedText>
        </View>

        {loading || !profile ? (
          <ActivityIndicator style={styles.loader} />
        ) : (
          <>
            <ThemedView type="backgroundElement" style={styles.card}>
              <View style={styles.cardHeader}>
                <ThemedText type="subtitle">Profile Information</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Update your account&apos;s profile information and email address.
                </ThemedText>
              </View>
              <View style={styles.form}>
                <View style={styles.field}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Name
                  </ThemedText>
                  <ThemedTextInput value={firstName} onChangeText={setFirstName} placeholder="First name" editable={!saving} />
                </View>
                <View style={styles.field}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Last name
                  </ThemedText>
                  <ThemedTextInput value={lastName} onChangeText={setLastName} placeholder="Last name" editable={!saving} />
                </View>
                <View style={styles.field}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Email
                  </ThemedText>
                  <ThemedTextInput value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" editable={!saving} />
                </View>
                {saved && (
                  <ThemedText type="small" themeColor="success">
                    Saved.
                  </ThemedText>
                )}
                {error && (
                  <ThemedText type="small" themeColor="danger">
                    {error}
                  </ThemedText>
                )}
                <Pressable
                  style={({ pressed }) => [styles.button, pressed && styles.pressed]}
                  disabled={saving}
                  onPress={saveProfile}>
                  <ThemedView type="backgroundSelected" style={styles.buttonBackground}>
                    <ThemedText type="smallBold" themeColor="onPrimary" style={styles.buttonText}>
                      {saving ? 'Saving…' : 'Save'}
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              </View>
            </ThemedView>

            <ThemedView type="backgroundElement" style={styles.card}>
              <View style={styles.cardHeader}>
                <ThemedText type="subtitle">Update Password</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Ensure your account is using a long, random password to stay secure. Your
                  current password is required to change it.
                </ThemedText>
              </View>
              <View style={styles.form}>
                <ThemedTextInput
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Current password"
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!passwordUpdating}
                />
                <ThemedTextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="New password"
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!passwordUpdating}
                />
                <ThemedTextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!passwordUpdating}
                />
                {passwordMessage && (
                  <ThemedText type="small" themeColor="danger">
                    {passwordMessage}
                  </ThemedText>
                )}
                <Pressable
                  style={({ pressed }) => [styles.button, pressed && styles.pressed]}
                  disabled={passwordUpdating}
                  onPress={updatePassword}>
                  <ThemedView type="backgroundSelected" style={styles.buttonBackground}>
                    <ThemedText type="smallBold" themeColor="onPrimary" style={styles.buttonText}>
                      {passwordUpdating ? 'Updating…' : 'Update password'}
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              </View>
            </ThemedView>

            <Pressable
              style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}
              disabled={passwordUpdating}
              onPress={signOut}>
              <ThemedView type="backgroundElement" style={styles.signOutBackground}>
                <ThemedText type="smallBold" themeColor="danger" style={styles.buttonText}>
                  Sign out
                </ThemedText>
              </ThemedView>
            </Pressable>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
  },
  column: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  header: {
    gap: Spacing.one,
    paddingVertical: Spacing.three,
  },
  loader: {
    paddingVertical: Spacing.six,
  },
  card: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Radius.lg,
  },
  cardHeader: {
    gap: Spacing.one,
  },
  form: {
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.one,
  },
  button: {
    borderRadius: Radius.md,
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.7,
  },
  buttonBackground: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.md,
  },
  buttonText: {
    textAlign: 'center',
  },
  signOutButton: {
    borderRadius: Radius.md,
    alignSelf: 'stretch',
    marginTop: Spacing.two,
  },
  signOutBackground: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
  },
});