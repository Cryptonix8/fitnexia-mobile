import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { BookingsCalendar } from '@/components/bookings-calendar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { useBookings } from '@/contexts/bookings-context';
import { useClasses } from '@/contexts/classes-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { LOADING_LABELS } from '@/constants/labels';
import { formatClassDate, formatMoney } from '@/data/mock';
import { getErrorMessage } from '@/services/api/errors';
import { openPaymentCheckout } from '@/utils/booking-payment';
import type { Booking, ClassListItem } from '@/types/api';
import { startOfMonth, toDateKey } from '@/utils/calendar';
import { APP_LOCALE } from '@/utils/locale';
import { isSameCalendarDay } from '@/utils/schedule';

type BookingEntry = {
  booking: Booking;
  cls: ClassListItem;
  startAt: Date;
};

function buildEntries(
  bookings: Booking[],
  getClassById: (id: string) => ClassListItem | undefined,
): BookingEntry[] {
  return bookings
    .map((booking) => {
      const cls = getClassById(booking.classId);
      if (!cls) return null;
      return { booking, cls, startAt: new Date(cls.startAt) };
    })
    .filter((e): e is BookingEntry => e !== null)
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
}

export default function BookingsScreen() {
  const { getClassById, isLoading: classesLoading } = useClasses();
  const { bookings, isLoading, refreshBookings, cancelBooking } = useBookings();
  const pageLoading = (isLoading || classesLoading) && bookings.length === 0;
  const { colors } = useAppTheme();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const upcoming = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending_payment',
  );
  const past = bookings.filter((b) =>
    ['completed', 'cancelled', 'refunded', 'no_show'].includes(b.status),
  );
  const tabBookings = tab === 'upcoming' ? upcoming : past;

  const entries = useMemo(
    () => buildEntries(tabBookings, getClassById),
    [tabBookings, getClassById],
  );

  const markedDateKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const entry of entries) {
      keys.add(toDateKey(entry.startAt));
    }
    return keys;
  }, [entries]);

  const dayEntries = useMemo(
    () => entries.filter((e) => isSameCalendarDay(e.startAt, selectedDate)),
    [entries, selectedDate],
  );

  const selectedLabel = selectedDate.toLocaleDateString(APP_LOCALE, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const cancelReservation = (booking: Booking, cls: ClassListItem) => {
    const hoursUntilClass = (new Date(cls.startAt).getTime() - Date.now()) / (1000 * 60 * 60);
    const refundEligible = hoursUntilClass >= 24;

    const message =
      booking.status === 'pending_payment'
        ? '¿Cancelar esta reserva pendiente de pago?'
        : refundEligible
          ? 'Cancelar con más de 24 horas de anticipación. Recibirás un reembolso completo.'
          : 'Cancelar con menos de 24 horas de anticipación. No hay reembolso.';

    Alert.alert('Cancelar reserva', message, [
      { text: 'Volver', style: 'cancel' },
      {
        text: 'Cancelar reserva',
        style: 'destructive',
        onPress: async () => {
          try {
            const updated = await cancelBooking(booking.id);
            await refreshBookings();
            Alert.alert(
              updated.status === 'refunded' ? 'Reserva reembolsada' : 'Reserva cancelada',
              updated.status === 'refunded'
                ? 'Tu pago fue reembolsado.'
                : 'La reserva fue cancelada.',
            );
          } catch (err) {
            Alert.alert('No se pudo cancelar', getErrorMessage(err));
          }
        },
      },
    ]);
  };

  const completePayment = async (booking: Booking) => {
    if (!booking.checkoutUrl) {
      Alert.alert('Pago no disponible', 'Iniciá una nueva reserva para pagar esta clase.');
      return;
    }
    try {
      await openPaymentCheckout(booking.checkoutUrl, booking.id);
      await refreshBookings();
      Alert.alert('Pago confirmado', 'Tu reserva ya está confirmada.');
    } catch (err) {
      Alert.alert('Pago fallido', getErrorMessage(err));
    }
  };

  return (
    <Screen
      scroll
      loading={pageLoading}
      loadingMessage={LOADING_LABELS.bookings}>
      <Text style={[styles.title, { color: colors.text }]}>Mis reservas</Text>
      <View style={[styles.tabs, { backgroundColor: colors.surfaceMuted }]}>
        <Tab label="Próximas" active={tab === 'upcoming'} onPress={() => setTab('upcoming')} />
        <Tab label="Historial" active={tab === 'past'} onPress={() => setTab('past')} />
      </View>

      <BookingsCalendar
        month={month}
        onMonthChange={setMonth}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        markedDateKeys={markedDateKeys}
      />

      <Text style={[styles.sectionTitle, { color: colors.text }]}>{selectedLabel}</Text>

      {entries.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title={tab === 'upcoming' ? 'Sin reservas próximas' : 'Sin reservas anteriores'}
          description={
            tab === 'upcoming'
              ? 'Explorá clases y reservá tu próximo entrenamiento.'
              : 'Cuando completes clases, aparecerán acá tu historial.'
          }
        />
      ) : dayEntries.length === 0 ? (
        <EmptyState
          compact
          icon="today-outline"
          title="Nada este día"
          description="Seleccioná una fecha marcada en el calendario o cambiá de pestaña."
        />
      ) : (
        dayEntries.map(({ booking, cls }) => (
          <View
            key={booking.id}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{cls.title}</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>
              {formatClassDate(cls.startAt)}
            </Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>
              {cls.instructor.displayName}
            </Text>
            <View style={styles.row}>
              <Text style={[styles.price, { color: colors.primary }]}>{formatMoney(booking.price)}</Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: colors.primaryMuted },
                  booking.status === 'completed' && { backgroundColor: colors.surfaceMuted },
                ]}>
                <Text style={[styles.badgeText, { color: colors.primaryText }]}>
                  {booking.status === 'pending_payment'
                    ? 'Pago pendiente'
                    : booking.status === 'confirmed'
                      ? 'Confirmada'
                      : booking.status === 'completed'
                        ? 'Completada'
                        : booking.status === 'refunded'
                          ? 'Reembolsada'
                          : booking.status === 'cancelled'
                            ? 'Cancelada'
                            : booking.status}
                </Text>
              </View>
            </View>
            {booking.status === 'pending_payment' ? (
              <View style={styles.actionStack}>
                <Button
                  title="Completar pago"
                  size="sm"
                  onPress={() => completePayment(booking)}
                />
                <Button
                  title="Cancelar reserva"
                  size="sm"
                  variant="outline"
                  onPress={() => cancelReservation(booking, cls)}
                />
              </View>
            ) : booking.status === 'completed' ? (
              <Button
                title="Dejar una reseña"
                variant="outline"
                size="sm"
                onPress={() => router.push(`/review/${booking.id}`)}
              />
            ) : booking.status === 'confirmed' ? (
              <View style={styles.actions}>
                <Pressable onPress={() => router.push(`/class/${cls.id}`)}>
                  <Text style={[styles.link, { color: colors.primary }]}>Ver clase</Text>
                </Pressable>
                <Pressable onPress={() => cancelReservation(booking, cls)}>
                  <Text style={[styles.link, { color: colors.error }]}>Cancelar</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => router.push(`/class/${cls.id}`)}>
                <Text style={[styles.link, { color: colors.primary }]}>Ver clase</Text>
              </Pressable>
            )}
          </View>
        ))
      )}
    </Screen>
  );
}

function Tab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      style={[styles.tab, active && { backgroundColor: colors.surface }]}
      onPress={onPress}>
      <Text style={[styles.tabText, { color: colors.textMuted }, active && { color: colors.primary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: Spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.sm },
  tabText: { fontWeight: '600' },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  meta: { fontSize: 14, marginTop: 4 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  price: { fontSize: 16, fontWeight: '700' },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  link: { fontWeight: '600' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionStack: { gap: Spacing.sm },
});
