import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { FitnexiaColors, Spacing } from '@/constants/fitnexia';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    title: 'Encontrá tu próxima clase',
    body: 'Descubrí clases de deporte y fitness con los mejores instructores y gimnasios cerca tuyo.',
    emoji: '🏃',
  },
  {
    title: 'Reservá en un toque',
    body: 'Reservá sesiones presenciales o en línea. Recibí recordatorios antes de cada clase.',
    emoji: '📅',
  },
  {
    title: 'Entrená con los mejores',
    body: 'Instructores verificados, reseñas reales y un programa de fidelidad que te premia.',
    emoji: '⭐',
  },
];

export default function OnboardingScreen() {
  const { completeOnboarding } = useAuth();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(i);
  };

  const finish = () => {
    completeOnboarding();
    router.replace('/(auth)/login');
  };

  const next = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1 });
    } else {
      finish();
    }
  };

  return (
    <Screen edges={['top', 'bottom']} padded={false}>
      <View style={styles.logoRow}>
        <Text style={styles.logo}>Fitnexia</Text>
      </View>
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
      <View style={styles.actions}>
        <Button
          title={index === SLIDES.length - 1 ? 'Empezar' : 'Siguiente'}
          onPress={next}
        />
        {index < SLIDES.length - 1 ? (
          <Button title="Omitir" variant="ghost" onPress={finish} />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logoRow: { paddingTop: Spacing.xl, paddingHorizontal: Spacing.lg },
  logo: { fontSize: 28, fontWeight: '800', color: FitnexiaColors.primary },
  slide: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    alignItems: 'center',
  },
  emoji: { fontSize: 72, marginBottom: Spacing.lg },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: FitnexiaColors.gray900,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  body: {
    fontSize: 16,
    color: FitnexiaColors.gray500,
    textAlign: 'center',
    lineHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: FitnexiaColors.gray200,
  },
  dotActive: { backgroundColor: FitnexiaColors.primary, width: 24 },
  actions: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, gap: Spacing.sm },
});
