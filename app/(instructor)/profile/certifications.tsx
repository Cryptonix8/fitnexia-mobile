import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { updateMockInstructor } from '@/data/mock';
import { Radius, Spacing } from '@/constants/fitnexia';
import { ALERT_LABELS, PROFILE_MENU_LABELS } from '@/constants/labels';
import { getLinkedInstructorId } from '@/utils/instructor';
import type { Certification } from '@/types/api';

function parseCertificationFields(
  name: string,
  issuer: string,
  year: string,
): { ok: true; cert: Certification } | { ok: false; message: string } {
  if (!name.trim() || !issuer.trim() || !year.trim()) {
    return { ok: false, message: 'Ingresá nombre, emisor y año de la certificación.' };
  }
  const yearNum = parseInt(year, 10);
  if (Number.isNaN(yearNum) || yearNum < 1950 || yearNum > new Date().getFullYear()) {
    return { ok: false, message: 'Ingresá un año válido.' };
  }
  return {
    ok: true,
    cert: { name: name.trim(), issuer: issuer.trim(), year: yearNum },
  };
}

export default function InstructorCertificationsScreen() {
  const { user, updateProfile } = useAuth();
  const { colors } = useAppTheme();
  const profile = user?.instructorProfile;
  const instructorId = getLinkedInstructorId(user);

  const [certifications, setCertifications] = useState<Certification[]>(
    profile?.certifications ?? [],
  );
  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [year, setYear] = useState('');

  useEffect(() => {
    setCertifications(profile?.certifications ?? []);
  }, [profile?.certifications]);

  const persist = useCallback(
    (next: Certification[]) => {
      setCertifications(next);
      updateProfile({ instructorProfile: { certifications: next } });
      updateMockInstructor(instructorId, { certifications: next });
    },
    [instructorId, updateProfile],
  );

  const clearForm = () => {
    setName('');
    setIssuer('');
    setYear('');
  };

  const addCertification = () => {
    const parsed = parseCertificationFields(name, issuer, year);
    if (!parsed.ok) {
      Alert.alert(ALERT_LABELS.missingInfoTitle, parsed.message);
      return;
    }

    const duplicate = certifications.some(
      (c) =>
        c.name.toLowerCase() === parsed.cert.name.toLowerCase() &&
        c.issuer.toLowerCase() === parsed.cert.issuer.toLowerCase() &&
        c.year === parsed.cert.year,
    );
    if (duplicate) {
      Alert.alert('Ya agregada', 'Esta certificación ya está en tu lista.');
      return;
    }

    const next = [...certifications, parsed.cert];
    persist(next);
    clearForm();
  };

  const removeCertification = (index: number) => {
    Alert.alert('Eliminar certificación', '¿Eliminar esta certificación?', [
      { text: ALERT_LABELS.cancel, style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => persist(certifications.filter((_, i) => i !== index)),
      },
    ]);
  };

  const save = () => {
    let next = certifications;

    if (name.trim() || issuer.trim() || year.trim()) {
      const parsed = parseCertificationFields(name, issuer, year);
      if (!parsed.ok) {
        Alert.alert(ALERT_LABELS.missingInfoTitle, parsed.message);
        return;
      }
      const duplicate = certifications.some(
        (c) =>
          c.name.toLowerCase() === parsed.cert.name.toLowerCase() &&
          c.issuer.toLowerCase() === parsed.cert.issuer.toLowerCase() &&
          c.year === parsed.cert.year,
      );
      if (!duplicate) {
        next = [...certifications, parsed.cert];
      }
    }

    persist(next);
    clearForm();
    Alert.alert(ALERT_LABELS.savedTitle, 'Certificaciones actualizadas.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  if (!profile) {
    return (
      <Screen>
        <Header title={PROFILE_MENU_LABELS.certifications} showBack />
        <Text style={{ color: colors.text }}>Perfil no disponible</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll header={<Header title={PROFILE_MENU_LABELS.certifications} showBack />}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          Agregá credenciales profesionales que se muestran en tu perfil público.
        </Text>

        {certifications.length === 0 ? (
          <EmptyState
            compact
            icon="ribbon-outline"
            title="Sin certificaciones"
            description="Agregá credenciales profesionales que se muestran en tu perfil público."
          />
        ) : (
          certifications.map((cert, index) => (
            <View
              key={`${cert.name}-${cert.year}-${index}`}
              style={[
                styles.certCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <View style={styles.certBody}>
                <Text style={[styles.certName, { color: colors.text }]}>{cert.name}</Text>
                <Text style={[styles.certMeta, { color: colors.textMuted }]}>
                  {cert.issuer} · {cert.year}
                </Text>
              </View>
              <Pressable onPress={() => removeCertification(index)} hitSlop={8}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </Pressable>
            </View>
          ))
        )}

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          Agregar certificación
        </Text>
        <Input
          label="Nombre de la certificación"
          value={name}
          onChangeText={setName}
          placeholder="ej. RYT-500"
        />
        <Input
          label="Emisor"
          value={issuer}
          onChangeText={setIssuer}
          placeholder="ej. Yoga Alliance"
        />
        <Input
          label="Año"
          value={year}
          onChangeText={setYear}
          keyboardType="number-pad"
          placeholder="ej. 2022"
        />
        <Button title="Agregar certificación" onPress={addCertification} />
        <Button title="Listo" variant="outline" onPress={save} style={{ marginTop: Spacing.sm }} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 15, marginBottom: Spacing.lg, lineHeight: 22 },
  certCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  certBody: { flex: 1 },
  certName: { fontSize: 16, fontWeight: '600' },
  certMeta: { fontSize: 13, marginTop: 2 },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
});
