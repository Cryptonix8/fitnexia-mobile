import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '@/components/user-avatar';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { useAuth, type InstructorInvite } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function GymInviteInstructorScreen() {
  const { user, updateProfile } = useAuth();
  const { colors } = useAppTheme();
  const profile = user?.institutionProfile;
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const pending = profile?.pendingInvites ?? [];

  const sendInvite = () => {
    const trimmed = email.trim().toLowerCase();
    if (!isValidEmail(trimmed)) {
      Alert.alert('Invalid email', 'Enter a valid email address.');
      return;
    }
    if (pending.some((i) => i.email === trimmed && i.status === 'pending')) {
      Alert.alert('Already invited', 'An invite is already pending for this email.');
      return;
    }

    const invite: InstructorInvite = {
      id: `inv-${Date.now()}`,
      email: trimmed,
      sentAt: new Date().toISOString(),
      status: 'pending',
    };

    updateProfile({
      institutionProfile: {
        pendingInvites: [...pending, invite],
      },
    });

    setEmail('');
    setMessage('');
    Alert.alert(
      'Invite sent',
      `Mock invite sent to ${trimmed}. They will appear in your staff list once they accept.`,
    );
  };

  const cancelInvite = (invite: InstructorInvite) => {
    Alert.alert('Cancel invite', `Withdraw invite to ${invite.email}?`, [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Withdraw',
        style: 'destructive',
        onPress: () => {
          updateProfile({
            institutionProfile: {
              pendingInvites: pending.filter((i) => i.id !== invite.id),
            },
          });
        },
      },
    ]);
  };

  const resendInvite = (invite: InstructorInvite) => {
    Alert.alert('Invite resent', `Mock reminder sent to ${invite.email}.`);
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
        Send an email invite for an instructor to join your gym staff. This is a mock flow until
        the backend is connected.
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

      <Button title="Send invite" onPress={sendInvite} />

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
                <Pressable onPress={() => resendInvite(invite)} hitSlop={8}>
                  <Ionicons name="refresh-outline" size={20} color={colors.primary} />
                </Pressable>
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
