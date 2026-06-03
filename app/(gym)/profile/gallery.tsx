import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { updateMockInstitution } from '@/data/mock';
import { Radius, Spacing } from '@/constants/fitnexia';
import { getLinkedInstitutionId } from '@/utils/institution';

export default function GymGalleryScreen() {
  const { user, updateProfile } = useAuth();
  const { colors } = useAppTheme();
  const profile = user?.institutionProfile;
  const institutionId = getLinkedInstitutionId(user);

  const [gallery, setGallery] = useState<string[]>(profile?.gallery ?? []);

  useEffect(() => {
    setGallery(profile?.gallery ?? []);
  }, [profile?.gallery]);

  const persist = useCallback(
    (next: string[]) => {
      setGallery(next);
      updateProfile({ institutionProfile: { gallery: next } });
      updateMockInstitution(institutionId, { gallery: next });
    },
    [institutionId, updateProfile],
  );

  const addPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to upload gallery photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      persist([...gallery, result.assets[0].uri]);
    }
  };

  const removePhoto = (index: number) => {
    Alert.alert('Remove photo', 'Delete this photo from your gallery?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => persist(gallery.filter((_, i) => i !== index)),
      },
    ]);
  };

  if (!profile) {
    return (
      <Screen>
        <Header title="Photo gallery" showBack />
        <Text style={{ color: colors.text }}>Profile not available</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Header title="Photo gallery" showBack />
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          Showcase your facility on your public gym profile.
        </Text>

        {gallery.length === 0 ? (
          <Pressable
            style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={addPhoto}>
            <Ionicons name="images-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No photos yet — tap to add
            </Text>
          </Pressable>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
            {gallery.map((uri, index) => (
              <View key={`${uri}-${index}`} style={styles.thumbWrap}>
                <Image source={{ uri }} style={styles.thumb} contentFit="cover" />
                <Pressable
                  style={[styles.removeBtn, { backgroundColor: colors.error }]}
                  onPress={() => removePhoto(index)}>
                  <Ionicons name="close" size={16} color="#fff" />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}

        <Button title="Add photo" onPress={addPhoto} style={{ marginTop: Spacing.md }} />
        <Button
          title="Done"
          variant="outline"
          onPress={() => router.back()}
          style={{ marginTop: Spacing.sm }}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const THUMB = 140;

const styles = StyleSheet.create({
  hint: { fontSize: 15, marginBottom: Spacing.lg, lineHeight: 22 },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    minHeight: 160,
  },
  emptyText: { marginTop: Spacing.sm, fontSize: 14, textAlign: 'center' },
  row: { marginBottom: Spacing.md },
  thumbWrap: { marginRight: Spacing.sm, position: 'relative' },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: Radius.md,
  },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
