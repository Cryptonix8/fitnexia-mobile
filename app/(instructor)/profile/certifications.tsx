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
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { updateMockInstructor } from '@/data/mock';
import { Radius, Spacing } from '@/constants/fitnexia';
import { PROFILE_MENU_LABELS } from '@/constants/labels';
import { getLinkedInstructorId } from '@/utils/instructor';
import type { Certification } from '@/types/api';

function parseCertificationFields(
  name: string,
  issuer: string,
  year: string,
): { ok: true; cert: Certification } | { ok: false; message: string } {
  if (!name.trim() || !issuer.trim() || !year.trim()) {
    return { ok: false, message: 'Enter certification name, issuer, and year.' };
  }
  const yearNum = parseInt(year, 10);
  if (Number.isNaN(yearNum) || yearNum < 1950 || yearNum > new Date().getFullYear()) {
    return { ok: false, message: 'Enter a valid year.' };
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
      Alert.alert('Missing info', parsed.message);
      return;
    }

    const duplicate = certifications.some(
      (c) =>
        c.name.toLowerCase() === parsed.cert.name.toLowerCase() &&
        c.issuer.toLowerCase() === parsed.cert.issuer.toLowerCase() &&
        c.year === parsed.cert.year,
    );
    if (duplicate) {
      Alert.alert('Already added', 'This certification is already on your list.');
      return;
    }

    const next = [...certifications, parsed.cert];
    persist(next);
    clearForm();
  };

  const removeCertification = (index: number) => {
    Alert.alert('Remove certification', 'Delete this certification?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
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
        Alert.alert('Missing info', parsed.message);
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
    Alert.alert('Saved', 'Certifications updated.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  if (!profile) {
    return (
      <Screen>
        <Header title={PROFILE_MENU_LABELS.certifications} showBack />
        <Text style={{ color: colors.text }}>Profile not available</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Header title={PROFILE_MENU_LABELS.certifications} showBack />
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          Add professional credentials shown on your public profile.
        </Text>

        {certifications.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.surface }]}>
            <Ionicons name="ribbon-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No certifications yet
            </Text>
          </View>
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
          Add certification
        </Text>
        <Input
          label="Certification name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. RYT-500"
        />
        <Input
          label="Issuer"
          value={issuer}
          onChangeText={setIssuer}
          placeholder="e.g. Yoga Alliance"
        />
        <Input
          label="Year"
          value={year}
          onChangeText={setYear}
          keyboardType="number-pad"
          placeholder="e.g. 2022"
        />
        <Button title="Add certification" onPress={addCertification} />
        <Button title="Done" variant="outline" onPress={save} style={{ marginTop: Spacing.sm }} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 15, marginBottom: Spacing.lg, lineHeight: 22 },
  empty: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
  },
  emptyText: { marginTop: Spacing.sm, fontSize: 14 },
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
