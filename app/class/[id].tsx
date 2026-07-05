import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '@/components/user-avatar';
import { RecurringClassBadge } from '@/components/recurring-class-badge';
import { ClassMetaBadges } from '@/components/class-meta-badges';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import {
  formatClassDate,
  formatMoney,
} from '@/data/mock';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { useFeature } from '@/hooks/use-feature';
import { canManageGymClass, resolveInstitutionId } from '@/utils/gym-classes';
import { getLinkedInstructorId } from '@/utils/instructor';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';
import {
  BADGE_LABELS,
  BUTTON_LABELS,
  CLASS_DETAIL_LABELS,
  LOADING_LABELS,
  SCREEN_TITLES,
  classFormatBadgeLabel,
  classFormatDescription,
  classSpotsLabel,
  classLanguageLabel,
  classLevelLabel,
  instructorGenderLabel,
  modalityBadgeLabel,
  modalityLocationLabel,
  resolveClassFormat,
  translateDisciplineLabel,
} from '@/constants/labels';

export default function ClassDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { getClassById, isLoading } = useClasses();
  const waitlistEnabled = useFeature('waitlist');
  const liveStreaming = useFeature('liveStreaming');
  const cls = getClassById(id ?? '');
  const instructorId = getLinkedInstructorId(user);
  const institutionId = resolveInstitutionId(user);

  if (!cls) {
    return (
      <Screen
        loading={isLoading}
        loadingMessage={LOADING_LABELS.classes}>
        <Header title={SCREEN_TITLES.class} showBack />
        {!isLoading ? <Text>{SCREEN_TITLES.classNotFound}</Text> : null}
      </Screen>
    );
  }

  const full = cls.spotsLeft === 0;
  const canManage =
    (user?.role === 'instructor' && cls.instructor.id === instructorId) ||
    (user?.role === 'institution' && canManageGymClass(cls, institutionId));
  const canBook = user?.role === 'athlete';
  const classFormat = resolveClassFormat(cls.classFormat, {
    capacity: cls.capacity,
    hasInstitution: Boolean(cls.institution),
  });
  const onlineLabel = liveStreaming
    ? CLASS_DETAIL_LABELS.liveStream
    : CLASS_DETAIL_LABELS.onlineSessionLink;

  return (
    <Screen scroll header={<Header title={SCREEN_TITLES.classDetails} showBack />}>
      <View style={styles.hero}>
        <Text style={styles.title}>{cls.title}</Text>
        <View style={styles.tags}>
          <Badge label={translateDisciplineLabel(cls.discipline)} />
          <RecurringClassBadge item={cls} />
          <Badge label={classFormatBadgeLabel(cls.classFormat, {
            capacity: cls.capacity,
            hasInstitution: Boolean(cls.institution),
          })} />
          <Badge
            label={modalityBadgeLabel(cls.modality)}
            variant="success"
          />
          <ClassMetaBadges item={cls} />
        </View>
      </View>

      <View style={styles.card}>
        <Row icon="calendar-outline" label={CLASS_DETAIL_LABELS.when} value={formatClassDate(cls.startAt)} />
        <Row icon="time-outline" label={CLASS_DETAIL_LABELS.duration} value={`${cls.durationMinutes} min`} />
        <Row
          icon="location-outline"
          label={CLASS_DETAIL_LABELS.where}
          value={
            cls.modality === 'online'
              ? onlineLabel
              : modalityLocationLabel(cls.modality, cls.location?.label) || CLASS_DETAIL_LABELS.locationTbd
          }
        />
        <Row icon="cash-outline" label={CLASS_DETAIL_LABELS.price} value={formatMoney(cls.price)} />
        {cls.level ? (
          <Row icon="trending-up-outline" label={CLASS_DETAIL_LABELS.level} value={classLevelLabel(cls.level)!} />
        ) : null}
        {cls.language ? (
          <Row icon="language-outline" label={CLASS_DETAIL_LABELS.language} value={classLanguageLabel(cls.language)!} />
        ) : null}
        {cls.instructor.gender ? (
          <Row
            icon="person-outline"
            label={CLASS_DETAIL_LABELS.instructorGender}
            value={instructorGenderLabel(cls.instructor.gender)!}
          />
        ) : null}
        <Row
          icon="people-circle-outline"
          label={CLASS_DETAIL_LABELS.format}
          value={classFormatDescription(cls.classFormat, {
            capacity: cls.capacity,
            hasInstitution: Boolean(cls.institution),
          })}
        />
        {cls.capacity ? (
          <Row
            icon="people-outline"
            label={CLASS_DETAIL_LABELS.spots}
            value={classSpotsLabel(cls.spotsLeft ?? 0, cls.capacity ?? 0, { waitlistEnabled })}
          />
        ) : null}
      </View>

      <PressableInstructor
        name={cls.instructor.displayName}
        photoUrl={cls.instructor.photoUrl}
        rating={cls.averageRating}
        onPress={() => router.push(`/instructor/${cls.instructor.id}`)}
      />

      <Text style={styles.section}>{CLASS_DETAIL_LABELS.about}</Text>
      <Text style={styles.desc}>
        {classFormat === 'individual'
          ? `Reservá una sesión privada 1 a 1 de ${translateDisciplineLabel(cls.discipline).toLowerCase()} con ${cls.instructor.displayName}.`
          : `Unite a ${cls.instructor.displayName} en una sesión grupal de ${translateDisciplineLabel(cls.discipline).toLowerCase()}.`}{' '}
        Apto para todos los niveles. Traé agua y ropa cómoda.
      </Text>

      {canManage ? (
        <Button
          title={BUTTON_LABELS.editClass}
          variant="secondary"
          onPress={() => router.push({ pathname: '/edit-class/[id]', params: { id: cls.id } })}
        />
      ) : canBook ? (
        full ? (
          waitlistEnabled ? (
            <Button
              title={BUTTON_LABELS.joinWaitlist}
              variant="secondary"
              onPress={() => router.push(`/book/${cls.id}?waitlist=1`)}
            />
          ) : (
            <Button title={BUTTON_LABELS.classFull} disabled />
          )
        ) : (
          <Button title={BUTTON_LABELS.bookNow} onPress={() => router.push(`/book/${cls.id}`)} />
        )
      ) : null}
    </Screen>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color={FitnexiaColors.primary} />
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

function PressableInstructor({
  name,
  photoUrl,
  verified,
  rating,
  onPress,
}: {
  name: string;
  photoUrl?: string;
  verified?: boolean;
  rating?: number;
  onPress: () => void;
}) {
  return (
    <View style={styles.instructorCard}>
      <UserAvatar size={56} kind="instructor" uri={photoUrl} />
      <View style={{ flex: 1 }}>
        <Text style={styles.instructorName}>{name}</Text>
        {verified ? <Badge label={BADGE_LABELS.verified} variant="verified" /> : null}
        {rating ? (
          <Text style={styles.rating}>★ {rating.toFixed(1)}</Text>
        ) : null}
      </View>
      <Button title={BUTTON_LABELS.viewProfile} variant="ghost" size="sm" onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { marginBottom: Spacing.md },
  title: { fontSize: 26, fontWeight: '800', color: FitnexiaColors.gray900 },
  tags: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  card: {
    backgroundColor: FitnexiaColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 12, color: FitnexiaColors.gray500 },
  rowValue: { fontSize: 15, fontWeight: '600', color: FitnexiaColors.gray900, marginTop: 2 },
  instructorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FitnexiaColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  instructorName: { fontSize: 17, fontWeight: '700', color: FitnexiaColors.gray900 },
  rating: { fontSize: 14, color: FitnexiaColors.gray500, marginTop: 4 },
  section: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm },
  desc: { fontSize: 15, color: FitnexiaColors.gray500, lineHeight: 22, marginBottom: Spacing.lg },
});
