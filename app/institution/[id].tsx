import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/ui/header';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { BADGE_LABELS, LOADING_LABELS } from '@/constants/labels';
import { fetchInstitutionById } from '@/services/api/institutions.api';
import { normalizeMediaUrl } from '@/services/api/media.api';
import type { Institution } from '@/types/api';

export default function InstitutionProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchInstitutionById(id)
      .then(setInstitution)
      .catch(() => setInstitution(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (!institution && !loading) {
    return (
      <Screen>
        <Header title="Club" showBack />
        <EmptyState icon="business-outline" title="Club no encontrado" />
      </Screen>
    );
  }

  const loc = institution?.location;
  const locationLabel = [loc?.address, loc?.city].filter(Boolean).join(', ');

  return (
    <Screen scroll loading={loading} loadingMessage={LOADING_LABELS.default}>
      <Header title="Club" showBack />
      {institution ? (
        <>
          <View style={styles.hero}>
            {institution.logoUrl ? (
              <Image
                source={{ uri: normalizeMediaUrl(institution.logoUrl) ?? institution.logoUrl }}
                style={styles.logo}
                contentFit="cover"
              />
            ) : null}
            <Text style={[styles.name, { color: colors.text }]}>{institution.name}</Text>
            {institution.verified ? (
              <Badge label={BADGE_LABELS.verified} variant="verified" />
            ) : null}
          </View>

          {institution.description ? (
            <Text style={[styles.desc, { color: colors.textSecondary }]}>{institution.description}</Text>
          ) : null}

          {locationLabel ? (
            <InfoRow label="Dirección" value={locationLabel} colors={colors} />
          ) : null}
          {institution.contactPhone ? (
            <InfoRow label="Teléfono" value={institution.contactPhone} colors={colors} />
          ) : null}
          {institution.contactEmail ? (
            <InfoRow label="Email" value={institution.contactEmail} colors={colors} />
          ) : null}
          {institution.website ? (
            <Pressable onPress={() => Linking.openURL(institution.website!)}>
              <InfoRow label="Web" value={institution.website} colors={colors} link />
            </Pressable>
          ) : null}

          {institution.instructors?.length ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Equipo</Text>
              {institution.instructors.map((i) => (
                <Text key={i.id} style={{ color: colors.textMuted, marginBottom: 4 }}>
                  {i.displayName}
                </Text>
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

function InfoRow({
  label,
  value,
  colors,
  link,
}: {
  label: string;
  value: string;
  colors: { text: string; textMuted: string; primary: string };
  link?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={{ color: link ? colors.primary : colors.text, fontWeight: link ? '600' : '400' }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: Spacing.lg },
  logo: { width: 88, height: 88, borderRadius: Radius.lg, marginBottom: Spacing.sm },
  name: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  desc: { fontSize: 15, lineHeight: 22, marginBottom: Spacing.md },
  infoRow: { marginBottom: Spacing.sm },
  infoLabel: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  section: { marginTop: Spacing.lg },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm },
});
