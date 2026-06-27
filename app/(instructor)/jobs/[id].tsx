import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { Header } from '@/components/ui/header';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { getErrorMessage, useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Spacing } from '@/constants/fitnexia';
import { applyToJobApi, fetchOpenJob } from '@/services/api/jobs.api';
import type { JobPosting } from '@/types/api';

export default function InstructorJobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchOpenJob(id)
      .then(setJob)
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [id]);

  const apply = async () => {
    if (!id || user?.role !== 'instructor') return;
    setApplying(true);
    try {
      await applyToJobApi(id);
      Alert.alert('Postulación enviada', 'El gimnasio verá tu solicitud.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('No se pudo postular', getErrorMessage(err));
    } finally {
      setApplying(false);
    }
  };

  if (!job && !loading) {
    return (
      <Screen>
        <Header title="Oferta" showBack />
        <Text style={{ color: colors.textMuted }}>Oferta no encontrada.</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll loading={loading} header={<Header title="Oferta" showBack />}>
      {job ? (
        <>
          <Text style={[styles.club, { color: colors.textMuted }]}>{job.institutionName}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{job.title}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>{job.roleType}</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>{job.description}</Text>
          {user?.role === 'instructor' ? (
            <Button title="Postularme" onPress={apply} disabled={applying} />
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  club: { fontSize: 13, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  meta: { fontSize: 14, marginTop: 4 },
  body: { fontSize: 15, lineHeight: 22, marginVertical: Spacing.lg },
});
