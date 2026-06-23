import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Header } from '@/components/ui/header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { getErrorMessage } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { deleteGymJobApi, fetchGymJobs } from '@/services/api/institutions.api';
import type { JobPosting } from '@/types/api';

export default function GymJobsScreen() {
  const { colors } = useAppTheme();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setJobs(await fetchGymJobs());
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const closeJob = (job: JobPosting) => {
    Alert.alert('Cerrar oferta', `¿Cerrar "${job.title}"?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Cerrar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteGymJobApi(job.id);
            await load();
          } catch (err) {
            Alert.alert('Error', getErrorMessage(err));
          }
        },
      },
    ]);
  };

  return (
    <Screen scroll loading={loading && jobs.length === 0} loadingMessage="Cargando ofertas…">
      <Header title="Ofertas de trabajo" showBack />
      <Button title="+ Nueva oferta" onPress={() => router.push('/(gym)/jobs/create')} />

      {jobs.length === 0 && !loading ? (
        <EmptyState
          icon="briefcase-outline"
          title="Sin ofertas publicadas"
          description="Publicá búsquedas de instructores, entrenadores o staff."
        />
      ) : (
        jobs.map((job) => (
          <View
            key={job.id}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>{job.title}</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>
              {job.roleType} · {job.status}
              {job.applicationCount != null ? ` · ${job.applicationCount} postulaciones` : ''}
            </Text>
            {job.description ? (
              <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={3}>
                {job.description}
              </Text>
            ) : null}
            {job.status === 'open' ? (
              <Pressable onPress={() => closeJob(job)} style={styles.closeLink}>
                <Text style={{ color: colors.warning, fontWeight: '600' }}>Cerrar oferta</Text>
              </Pressable>
            ) : null}
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  title: { fontSize: 17, fontWeight: '700' },
  meta: { fontSize: 13, marginTop: 4 },
  desc: { fontSize: 14, marginTop: Spacing.sm },
  closeLink: { marginTop: Spacing.sm },
});
