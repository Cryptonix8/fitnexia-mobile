import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { Spacing } from '@/constants/fitnexia';
import { LOADING_LABELS } from '@/constants/labels';
import {
  createPricingRuleApi,
  fetchGymPricingRules,
  type CourtPricingRule,
} from '@/services/api/courts.api';
import { formatMoney } from '@/data/mock';
import { DEFAULT_CURRENCY } from '@/constants/currency';
import { getErrorMessage } from '@/services/api/errors';

export default function GymCourtPricingScreen() {
  const { colors } = useAppTheme();
  const [rules, setRules] = useState<CourtPricingRule[]>([]);
  const [label, setLabel] = useState('');
  const [memberPrice, setMemberPrice] = useState('');
  const [nonMemberPrice, setNonMemberPrice] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRules(await fetchGymPricingRules());
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

  const addRule = async () => {
    const member = Math.round(Number(memberPrice) * 100);
    const nonMember = Math.round(Number(nonMemberPrice) * 100);
    if (!label.trim() || !member || !nonMember) {
      Alert.alert('Completá todos los campos');
      return;
    }
    try {
      await createPricingRuleApi({
        label: label.trim(),
        memberPrice: { amount: member, currency: DEFAULT_CURRENCY },
        nonMemberPrice: { amount: nonMember, currency: DEFAULT_CURRENCY },
        startTime: '08:00',
        endTime: '22:00',
        isPeak: false,
        isWeekend: false,
      });
      setLabel('');
      setMemberPrice('');
      setNonMemberPrice('');
      load();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    }
  };

  return (
    <Screen
      scroll
      loading={loading && rules.length === 0}
      loadingMessage={LOADING_LABELS.default}
      header={<Header title="Tarifas por horario" showBack />}>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Precios diferenciados para socios y no socios. Podés agregar reglas peak/weekend desde el backend.
      </Text>

      {rules.map((rule) => (
        <View
          key={rule.id}
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{rule.label || 'Tarifa'}</Text>
          <Text style={{ color: colors.textMuted }}>
            Socio: {formatMoney(rule.memberPrice)} · No socio: {formatMoney(rule.nonMemberPrice)}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            {rule.startTime}–{rule.endTime}
            {rule.isPeak ? ' · Peak' : ''}
            {rule.isWeekend ? ' · Fin de semana' : ''}
          </Text>
        </View>
      ))}

      <Text style={[styles.section, { color: colors.text }]}>Nueva tarifa</Text>
      <TextInput
        value={label}
        onChangeText={setLabel}
        placeholder="Ej. Horario peak"
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
      />
      <TextInput
        value={memberPrice}
        onChangeText={setMemberPrice}
        placeholder="Precio socio (UYU)"
        keyboardType="numeric"
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
      />
      <TextInput
        value={nonMemberPrice}
        onChangeText={setNonMemberPrice}
        placeholder="Precio no socio (UYU)"
        keyboardType="numeric"
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
      />
      <Button title="Agregar tarifa" onPress={addRule} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { marginBottom: Spacing.md, fontSize: 14 },
  card: { borderWidth: 1, borderRadius: 8, padding: Spacing.md, marginBottom: Spacing.sm },
  section: { fontWeight: '700', fontSize: 16, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  input: { borderWidth: 1, borderRadius: 8, padding: Spacing.md, marginBottom: Spacing.sm },
});
