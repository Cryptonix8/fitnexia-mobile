import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { UserAvatar, type AvatarKind } from '@/components/user-avatar';
import { Spacing } from '@/constants/fitnexia';
import { ALERT_LABELS, AUTH_LABELS } from '@/constants/labels';
import { useAppTheme } from '@/contexts/theme-context';

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
  label = AUTH_LABELS.profilePhoto,
}: AvatarPickerProps) {
  const { colors } = useAppTheme();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso necesario', 'Permití acceso a la galería para subir una foto.');
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
    Alert.alert('Eliminar foto', '¿Usar el avatar predeterminado?', [
      { text: ALERT_LABELS.cancel, style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => onChange(null) },
    ]);
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Pressable onPress={pickImage} style={styles.avatarBtn}>
        <UserAvatar size={size} kind={kind} uri={uri} />
        <View style={[styles.badge, { backgroundColor: colors.primary, borderColor: colors.surface }]}>
          <Ionicons name="camera" size={16} color={colors.onPrimary} />
        </View>
      </Pressable>
      <View style={styles.actions}>
        <Pressable onPress={pickImage}>
          <Text style={[styles.actionText, { color: colors.primary }]}>
            {uri ? 'Cambiar foto' : 'Subir foto'}
          </Text>
        </Pressable>
        {uri ? (
          <Pressable onPress={removePhoto}>
            <Text style={[styles.removeText, { color: colors.error }]}>Eliminar</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  actions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  actionText: { fontWeight: '600', fontSize: 14 },
  removeText: { fontWeight: '600', fontSize: 14 },
});
