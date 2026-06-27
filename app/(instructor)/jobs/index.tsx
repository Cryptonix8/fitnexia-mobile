import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Header } from '@/components/ui/header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { fetchOpenJobs } from '@/services/api/jobs.api';
import type { JobPosting } from '@/types/api';

export default function InstructorJobsScreen() {
  const { colors } = useAppTheme();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setJobs(await fetchOpenJobs());
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

  return (
    <Screen scroll loading={loading && jobs.length === 0} loadingMessage="Cargando ofertas…" header={<Header title="Bolsa de trabajo" showBack />}>
      {jobs.length === 0 && !loading ? (
        <EmptyState
          icon="briefcase-outline"
          title="Sin ofertas"
          description="Los gimnasios publicarán búsquedas de instructores aquí."
        />
      ) : (
        jobs.map((job) => (
          <View
            key={job.id}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.club, { color: colors.textMuted }]}>{job.institutionName}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{job.title}</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>{job.roleType}</Text>
            <Button
              title="Ver detalle"
              variant="outline"
              size="sm"
              onPress={() => router.push(`/(instructor)/jobs/${job.id}`)}
              style={{ marginTop: Spacing.sm, alignSelf: 'flex-start' }}
            />
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
    marginBottom: Spacing.md,
  },
  club: { fontSize: 13, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  meta: { fontSize: 13, marginTop: 2 },
  body: { fontSize: 15, lineHeight: 22, marginVertical: Spacing.md },
});
