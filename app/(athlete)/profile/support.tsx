import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ChipRow } from '@/components/ui/chip-row';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Radius, Spacing } from '@/constants/fitnexia';
import { ALERT_LABELS, SCREEN_TITLES } from '@/constants/labels';
import { useAppTheme } from '@/contexts/theme-context';

const CATEGORIES = ['General', 'Reservas', 'Pagos', 'Cuenta'] as const;

export default function SupportScreen() {
  const { colors } = useAppTheme();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('General');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const submit = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert(ALERT_LABELS.missingInfoTitle, 'Ingresá un asunto y un mensaje.');
      return;
    }
    Alert.alert(
      'Ticket enviado',
      'Nuestro equipo responderá en 24 horas. (Simulación — se conectará a POST /support/tickets más adelante.)',
      [{ text: 'OK', onPress: () => router.back() }],
    );
  };

  return (
    <Screen scroll header={<Header title={SCREEN_TITLES.helpSupport} showBack />}>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Describí tu problema y te responderemos por email.
      </Text>

      <Text style={[styles.label, { color: colors.textSecondary }]}>Categoría</Text>
      <ChipRow
        options={CATEGORIES}
        value={category}
        onChange={(value) => setCategory(value as (typeof CATEGORIES)[number])}
        style={styles.chips}
      />

      <Input label="Asunto" value={subject} onChangeText={setSubject} placeholder="Resumen breve" />
      <Input
        label="Mensaje"
        value={message}
        onChangeText={setMessage}
        placeholder="Contanos qué pasó..."
        multiline
        style={styles.messageInput}
      />

      <View style={[styles.faq, { backgroundColor: colors.primaryMuted }]}>
        <Text style={[styles.faqTitle, { color: colors.primaryText }]}>Respuestas rápidas</Text>
        <Text style={[styles.faqItem, { color: colors.textSecondary }]}>
          • Cancelá gratis hasta 24 h antes de la clase
        </Text>
        <Text style={[styles.faqItem, { color: colors.textSecondary }]}>
          • Los créditos vencen 12 meses después de la última reserva
        </Text>
        <Text style={[styles.faqItem, { color: colors.textSecondary }]}>
          • Los reembolsos se procesan en 5–7 días hábiles
        </Text>
      </View>

      <Button title="Enviar ticket" onPress={submit} style={{ marginTop: Spacing.md }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 15, marginBottom: Spacing.lg },
  label: { fontSize: 14, fontWeight: '600', marginBottom: Spacing.sm },
  chips: { marginBottom: Spacing.md },
  messageInput: { minHeight: 120, textAlignVertical: 'top' },
  faq: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  faqTitle: { fontWeight: '700', marginBottom: Spacing.sm },
  faqItem: { fontSize: 14, marginBottom: 4 },
});
