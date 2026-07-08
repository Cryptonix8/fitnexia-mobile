import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { FilterChip } from '@/components/ui/filter-chip';
import { FilterSelect } from '@/components/ui/filter-select';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { COURT_WEEKDAY_OPTIONS } from '@/constants/courts';
import { LOADING_LABELS } from '@/constants/labels';
import { DEFAULT_CURRENCY } from '@/constants/currency';
import {
  createPricingRuleApi,
  deletePricingRuleApi,
  fetchGymCourts,
  fetchGymPricingRules,
  type CourtPricingRule,
} from '@/services/api/courts.api';
import { formatMoney } from '@/data/mock';
import { getErrorMessage } from '@/services/api/errors';
import { DateTimeField } from '@/components/date-time-field';
import { timeStringToDate, dateToTimeString } from '@/utils/schedule';

export default function GymCourtPricingScreen() {
  const { colors } = useAppTheme();
  const [rules, setRules] = useState<CourtPricingRule[]>([]);
  const [courts, setCourts] = useState<Awaited<ReturnType<typeof fetchGymCourts>>>([]);
  const [label, setLabel] = useState('');
  const [courtId, setCourtId] = useState<string | null>(null);
  const [memberPrice, setMemberPrice] = useState('');
  const [nonMemberPrice, setNonMemberPrice] = useState('');
  const [startTime, setStartTime] = useState(timeStringToDate('08:00'));
  const [endTime, setEndTime] = useState(timeStringToDate('22:00'));
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [isPeak, setIsPeak] = useState(false);
  const [isWeekend, setIsWeekend] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rulesData, courtsData] = await Promise.all([
        fetchGymPricingRules(),
        fetchGymCourts(),
      ]);
      setRules(rulesData);
      setCourts(courtsData);
    } catch {
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  };

  const addRule = async () => {
    const member = Math.round(Number(memberPrice) * 100);
    const nonMember = Math.round(Number(nonMemberPrice) * 100);
    if (!label.trim() || !member || !nonMember || daysOfWeek.length === 0) {
      Alert.alert('Completá todos los campos');
      return;
    }
    try {
      await createPricingRuleApi({
        label: label.trim(),
        courtId: courtId || undefined,
        memberPrice: { amount: member, currency: DEFAULT_CURRENCY },
        nonMemberPrice: { amount: nonMember, currency: DEFAULT_CURRENCY },
        startTime: dateToTimeString(startTime),
        endTime: dateToTimeString(endTime),
        daysOfWeek,
        isPeak,
        isWeekend,
      });
      setLabel('');
      setMemberPrice('');
      setNonMemberPrice('');
      load();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    }
  };

  const removeRule = (id: string) => {
    Alert.alert('Eliminar tarifa', '¿Querés eliminar esta regla de precio?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePricingRuleApi(id);
            load();
          } catch (err) {
            Alert.alert('Error', getErrorMessage(err));
          }
        },
      },
    ]);
  };

  return (
    <Screen
      scroll
      loading={loading && rules.length === 0}
      loadingMessage={LOADING_LABELS.default}
      header={<Header title="Tarifas por horario" showBack />}>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Configurá precios diferenciados para socios y no socios. Podés definir horarios peak,
        fines de semana y reglas por cancha.
      </Text>

      {rules.map((rule) => (
        <View
          key={rule.id}
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{rule.label}</Text>
          <Text style={{ color: colors.textMuted }}>
            Socio: {formatMoney(rule.memberPrice)} · No socio: {formatMoney(rule.nonMemberPrice)}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            {rule.startTime}–{rule.endTime}
            {rule.isPeak ? ' · Horario peak' : ''}
            {rule.isWeekend ? ' · Fin de semana' : ''}
          </Text>
          <Button title="Eliminar" variant="ghost" size="sm" onPress={() => removeRule(rule.id)} />
        </View>
      ))}

      <Text style={[styles.section, { color: colors.text }]}>Nueva tarifa</Text>

      <Input label="Nombre" value={label} onChangeText={setLabel} placeholder="Ej. Peak nocturno" />

      <FilterSelect
        label="Cancha (opcional)"
        value={courtId}
        options={[
          { value: '', label: 'Todas las canchas' },
          ...courts.map((c) => ({ value: c.id, label: c.name })),
        ]}
        onChange={(v) => setCourtId(v || null)}
        placeholder="Todas"
      />

      <Text style={[styles.label, { color: colors.textSecondary }]}>Días</Text>
      <View style={styles.chips}>
        {COURT_WEEKDAY_OPTIONS.map((d) => (
          <FilterChip
            key={d.value}
            label={d.label}
            active={daysOfWeek.includes(d.value)}
            onPress={() => toggleDay(d.value)}
          />
        ))}
      </View>

      <DateTimeField label="Desde" mode="time" value={startTime} onChange={setStartTime} />
      <DateTimeField label="Hasta" mode="time" value={endTime} onChange={setEndTime} />

      <View style={styles.switchRow}>
        <Text style={{ color: colors.text }}>Horario peak</Text>
        <Switch value={isPeak} onValueChange={setIsPeak} />
      </View>
      <View style={styles.switchRow}>
        <Text style={{ color: colors.text }}>Solo fin de semana</Text>
        <Switch value={isWeekend} onValueChange={setIsWeekend} />
      </View>

      <Input
        label="Precio socio (UYU)"
        value={memberPrice}
        onChangeText={setMemberPrice}
        keyboardType="decimal-pad"
      />
      <Input
        label="Precio no socio (UYU)"
        value={nonMemberPrice}
        onChangeText={setNonMemberPrice}
        keyboardType="decimal-pad"
      />

      <Button title="Agregar tarifa" onPress={addRule} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { marginBottom: Spacing.md, fontSize: 14, lineHeight: 20 },
  card: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, gap: 4 },
  section: { fontWeight: '700', fontSize: 16, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  label: { fontSize: 14, fontWeight: '600', marginBottom: Spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
});
