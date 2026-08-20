import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ChipRow } from '@/components/ui/chip-row';
import { Input } from '@/components/ui/input';
import { Radius, Spacing } from '@/constants/fitnexia';
import { ALERT_LABELS } from '@/constants/labels';
import { useAppTheme } from '@/contexts/theme-context';

const CATEGORIES = ['General', 'Reservas', 'Pagos', 'Cuenta'] as const;

export function SupportSettings() {
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
    <>
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
          • Freemium: gratis con 8% de comisión por clase
        </Text>
        <Text style={[styles.faqItem, { color: colors.textSecondary }]}>
          • Plan Pro: $29/mes sin comisión en cobros
        </Text>
        <Text style={[styles.faqItem, { color: colors.textSecondary }]}>
          • Los cobros llegan en 5–7 días hábiles
        </Text>
      </View>
      <Button title="Enviar ticket" onPress={submit} style={{ marginTop: Spacing.md }} />
    </>
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
