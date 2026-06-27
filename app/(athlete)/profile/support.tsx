import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';
import { ALERT_LABELS, SCREEN_TITLES } from '@/constants/labels';

const CATEGORIES = ['General', 'Reservas', 'Pagos', 'Cuenta'] as const;

export default function SupportScreen() {
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
      <Text style={styles.hint}>Describí tu problema y te responderemos por email.</Text>

      <Text style={styles.label}>Categoría</Text>
      <View style={styles.chips}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c}
            style={[styles.chip, category === c && styles.chipActive]}
            onPress={() => setCategory(c)}>
            <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
          </Pressable>
        ))}
      </View>

      <Input label="Asunto" value={subject} onChangeText={setSubject} placeholder="Resumen breve" />
      <Input
        label="Mensaje"
        value={message}
        onChangeText={setMessage}
        placeholder="Contanos qué pasó..."
        multiline
        style={styles.messageInput}
      />

      <View style={styles.faq}>
        <Text style={styles.faqTitle}>Respuestas rápidas</Text>
        <Text style={styles.faqItem}>• Cancelá gratis hasta 24 h antes de la clase</Text>
        <Text style={styles.faqItem}>• Los créditos vencen 12 meses después de la última reserva</Text>
        <Text style={styles.faqItem}>• Los reembolsos se procesan en 5–7 días hábiles</Text>
      </View>

      <Button title="Enviar ticket" onPress={submit} style={{ marginTop: Spacing.md }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 15, color: FitnexiaColors.gray500, marginBottom: Spacing.lg },
  label: { fontSize: 14, fontWeight: '600', color: FitnexiaColors.gray700, marginBottom: Spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: FitnexiaColors.white,
    borderWidth: 1,
    borderColor: FitnexiaColors.gray200,
  },
  chipActive: { backgroundColor: FitnexiaColors.primary, borderColor: FitnexiaColors.primary },
  chipText: { fontSize: 14, color: FitnexiaColors.gray700 },
  chipTextActive: { color: FitnexiaColors.white, fontWeight: '600' },
  messageInput: { minHeight: 120, textAlignVertical: 'top' },
  faq: {
    backgroundColor: FitnexiaColors.primaryLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  faqTitle: { fontWeight: '700', color: FitnexiaColors.primaryDark, marginBottom: Spacing.sm },
  faqItem: { fontSize: 14, color: FitnexiaColors.gray700, marginBottom: 4 },
});
