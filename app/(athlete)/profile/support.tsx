import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';
import { SCREEN_TITLES } from '@/constants/labels';

const CATEGORIES = ['General', 'Booking', 'Payment', 'Account'] as const;

export default function SupportScreen() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('General');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const submit = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Missing info', 'Please enter a subject and message.');
      return;
    }
    Alert.alert(
      'Ticket submitted',
      'Our team will reply within 24 hours. (Mock — connects to POST /support/tickets later.)',
      [{ text: 'OK', onPress: () => router.back() }],
    );
  };

  return (
    <Screen scroll>
      <Header title={SCREEN_TITLES.helpSupport} showBack />
      <Text style={styles.hint}>Describe your issue and we will get back to you by email.</Text>

      <Text style={styles.label}>Category</Text>
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

      <Input label="Subject" value={subject} onChangeText={setSubject} placeholder="Brief summary" />
      <Input
        label="Message"
        value={message}
        onChangeText={setMessage}
        placeholder="Tell us what happened..."
        multiline
        style={styles.messageInput}
      />

      <View style={styles.faq}>
        <Text style={styles.faqTitle}>Quick answers</Text>
        <Text style={styles.faqItem}>• Cancel free up to 24h before class</Text>
        <Text style={styles.faqItem}>• Credits expire 12 months after last booking</Text>
        <Text style={styles.faqItem}>• Refunds process in 5–7 business days</Text>
      </View>

      <Button title="Submit ticket" onPress={submit} style={{ marginTop: Spacing.md }} />
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
