import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { UserAvatar, type AvatarKind } from '@/components/user-avatar';
import { FitnexiaColors, Spacing } from '@/constants/fitnexia';

type AvatarPickerProps = {
  uri?: string | null;
  onChange: (uri: string | null) => void;
  size?: number;
  kind?: AvatarKind;
  label?: string;
};

export function AvatarPicker({
  uri,
  onChange,
  size = 96,
  kind = 'user',
  label = 'Profile photo',
}: AvatarPickerProps) {
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to upload an avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onChange(result.assets[0].uri);
    }
  };

  const removePhoto = () => {
    Alert.alert('Remove photo', 'Use the default avatar instead?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onChange(null) },
    ]);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={pickImage} style={styles.avatarBtn}>
        {uri ? (
          <Image
            source={{ uri }}
            style={{ width: size, height: size, borderRadius: size / 2 }}
          />
        ) : (
          <UserAvatar size={size} kind={kind} />
        )}
        <View style={styles.badge}>
          <Ionicons name="camera" size={16} color={FitnexiaColors.white} />
        </View>
      </Pressable>
      <View style={styles.actions}>
        <Pressable onPress={pickImage}>
          <Text style={styles.actionText}>{uri ? 'Change photo' : 'Upload photo'}</Text>
        </Pressable>
        {uri ? (
          <Pressable onPress={removePhoto}>
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: Spacing.lg },
  label: {
    alignSelf: 'flex-start',
    fontSize: 14,
    fontWeight: '600',
    color: FitnexiaColors.gray700,
    marginBottom: Spacing.sm,
  },
  avatarBtn: { position: 'relative' },
  badge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: FitnexiaColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: FitnexiaColors.white,
  },
  actions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  actionText: { color: FitnexiaColors.primary, fontWeight: '600', fontSize: 14 },
  removeText: { color: FitnexiaColors.error, fontWeight: '600', fontSize: 14 },
});
