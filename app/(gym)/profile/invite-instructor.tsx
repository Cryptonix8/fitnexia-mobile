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
import { SCREEN_TITLES } from '@/constants/labels';
import { cancelInviteApi, inviteInstructorApi } from '@/services/api/institutions.api';
import { APP_LOCALE } from '@/utils/locale';
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
      Alert.alert('Email inválido', emailError.message);
      return;
    }

    const trimmed = email.trim().toLowerCase();
    if (pending.some((i) => i.email === trimmed && i.status === 'pending')) {
      Alert.alert('Ya invitado', 'Ya hay una invitación pendiente para este email.');
      return;
    }

    setSaving(true);
    try {
      const result = await inviteInstructorApi({
        email: trimmed,
        message: message.trim() || undefined,
      });
      await refreshUser();
      setEmail('');
      setMessage('');
      if (result.emailSent) {
        Alert.alert(
          'Invitación enviada',
          `Enviamos un email a ${trimmed} y guardamos la invitación. También pueden aceptarla en la app Fitnexia.`,
        );
      } else {
        Alert.alert(
          'Invitación guardada',
          `La invitación se guardó para ${trimmed}, pero no se envió email. Pedile a tu admin que configure SMTP en backend/.env, o el instructor puede aceptarla desde su panel en la app.`,
        );
      }
    } catch (err) {
      Alert.alert('No se pudo enviar la invitación', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const cancelInvite = (invite: InstructorInvite) => {
    Alert.alert('Cancelar invitación', `¿Retirar la invitación a ${invite.email}?`, [
      { text: 'Mantener', style: 'cancel' },
      {
        text: 'Retirar',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelInviteApi(invite.id);
            await refreshUser();
          } catch (err) {
            Alert.alert('No se pudo cancelar la invitación', getErrorMessage(err));
          }
        },
      },
    ]);
  };

  if (!profile) {
    return (
      <Screen>
        <Header title={SCREEN_TITLES.inviteInstructor} showBack />
        <Text style={{ color: colors.text }}>Perfil no disponible</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Header title={SCREEN_TITLES.inviteInstructor} showBack />
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Invitá a un instructor por email. Recibe un email y también puede aceptar la invitación en la
        app Fitnexia al iniciar sesión con esa dirección.
      </Text>

      <Input
        label="Email del instructor"
        value={email}
        onChangeText={setEmail}
        placeholder="coach@ejemplo.com"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Input
        label="Mensaje personal (opcional)"
        value={message}
        onChangeText={setMessage}
        placeholder="Unite a nuestro equipo en..."
        multiline
      />

      <Button title="Enviar invitación" onPress={sendInvite} loading={saving} />

      {pending.length > 0 ? (
        <>
          <Text style={[styles.section, { color: colors.text, marginTop: Spacing.lg }]}>
            Invitaciones pendientes ({pending.length})
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
                  Enviada {new Date(invite.sentAt).toLocaleDateString(APP_LOCALE)} · Pendiente
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
        title="Gestionar equipo vinculado"
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
