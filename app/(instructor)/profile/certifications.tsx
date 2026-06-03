import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import type { Certification } from '@/types/api';

export default function InstructorCertificationsScreen() {
  const { user, updateProfile } = useAuth();
  const { colors } = useAppTheme();
  const profile = user?.instructorProfile;

  const [certifications, setCertifications] = useState<Certification[]>(
    profile?.certifications ?? [],
  );
  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [year, setYear] = useState('');

  const addCertification = () => {
    if (!name.trim() || !issuer.trim() || !year.trim()) {
      Alert.alert('Missing info', 'Enter certification name, issuer, and year.');
      return;
    }
    const yearNum = parseInt(year, 10);
    if (Number.isNaN(yearNum) || yearNum < 1950 || yearNum > new Date().getFullYear()) {
      Alert.alert('Invalid year', 'Enter a valid year.');
      return;
    }

    const next = [
      ...certifications,
      { name: name.trim(), issuer: issuer.trim(), year: yearNum },
    ];
    setCertifications(next);
    setName('');
    setIssuer('');
    setYear('');
  };

  const removeCertification = (index: number) => {
    Alert.alert('Remove certification', 'Delete this certification?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => setCertifications((prev) => prev.filter((_, i) => i !== index)),
      },
    ]);
  };

  const save = () => {
    updateProfile({ instructorProfile: { certifications } });
    Alert.alert('Saved', 'Certifications updated.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <Screen scroll>
      <Header title="Certifications" showBack />
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
            style={[styles.certCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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

      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Add certification</Text>
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
      <Button title="Add to list" variant="outline" onPress={addCertification} />

      <Button title="Save" onPress={save} style={{ marginTop: Spacing.lg }} />
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
