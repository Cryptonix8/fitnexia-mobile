import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '@/components/user-avatar';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { useAuth, getErrorMessage, type InstructorInvite } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { cancelInviteApi, inviteInstructorApi } from '@/services/api/institutions.api';
import { validateEmail } from '@/utils/validation';

export default function GymInviteInstructorScreen() {
  const { user, refreshUser } = useAuth();
  const { colors } = useAppTheme();
  const profile = user?.institutionProfile;
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const pending = profile?.pendingInvites ?? [];

  const sendInvite = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      Alert.alert('Invalid email', emailError.message);
      return;
    }

    const trimmed = email.trim().toLowerCase();
    if (pending.some((i) => i.email === trimmed && i.status === 'pending')) {
      Alert.alert('Already invited', 'An invite is already pending for this email.');
      return;
    }

    setSaving(true);
    try {
      const result = await inviteInstructorApi(trimmed, message.trim() || undefined);
      await refreshUser();
      setEmail('');
      setMessage('');
      if (result.emailSent) {
        Alert.alert(
          'Invite sent',
          `We emailed ${trimmed} and saved the invite. They can also accept it in the Fitnexia app.`,
        );
      } else {
        Alert.alert(
          'Invite saved',
          `The invite was saved for ${trimmed}, but no email was sent. Ask your admin to configure SMTP in backend/.env, or the instructor can accept from their app dashboard.`,
        );
      }
    } catch (err) {
      Alert.alert('Could not send invite', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const cancelInvite = (invite: InstructorInvite) => {
    Alert.alert('Cancel invite', `Withdraw invite to ${invite.email}?`, [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Withdraw',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelInviteApi(invite.id);
            await refreshUser();
          } catch (err) {
            Alert.alert('Could not cancel invite', getErrorMessage(err));
          }
        },
      },
    ]);
  };

  if (!profile) {
    return (
      <Screen>
        <Header title="Invite instructor" showBack />
        <Text style={{ color: colors.text }}>Profile not available</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Header title="Invite instructor" showBack />
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Invite an instructor by email. They receive an email and can also accept the invite in the
        Fitnexia app when they log in with that address.
      </Text>

      <Input
        label="Instructor email"
        value={email}
        onChangeText={setEmail}
        placeholder="coach@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Input
        label="Personal message (optional)"
        value={message}
        onChangeText={setMessage}
        placeholder="Join our team at..."
        multiline
      />

      <Button title="Send invite" onPress={sendInvite} loading={saving} />

      {pending.length > 0 ? (
        <>
          <Text style={[styles.section, { color: colors.text, marginTop: Spacing.lg }]}>
            Pending invites ({pending.length})
          </Text>
          {pending.map((invite) => (
            <View
              key={invite.id}
              style={[
                styles.inviteCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <UserAvatar size={40} kind="instructor" />
              <View style={styles.inviteBody}>
                <Text style={[styles.inviteEmail, { color: colors.text }]}>{invite.email}</Text>
                <Text style={[styles.inviteMeta, { color: colors.textMuted }]}>
                  Sent {new Date(invite.sentAt).toLocaleDateString()} · Pending
                </Text>
              </View>
              <View style={styles.inviteActions}>
                <Pressable onPress={() => cancelInvite(invite)} hitSlop={8}>
                  <Ionicons name="close-circle-outline" size={20} color={colors.error} />
                </Pressable>
              </View>
            </View>
          ))}
        </>
      ) : null}

      <Button
        title="Manage linked staff"
        variant="outline"
        onPress={() => router.push('/(gym)/profile/instructors')}
        style={{ marginTop: Spacing.lg }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 15, lineHeight: 22, marginBottom: Spacing.lg },
  section: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.sm },
  inviteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  inviteBody: { flex: 1 },
  inviteEmail: { fontSize: 15, fontWeight: '600' },
  inviteMeta: { fontSize: 12, marginTop: 2 },
  inviteActions: { flexDirection: 'row', gap: Spacing.md },
});
