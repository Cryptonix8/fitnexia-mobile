import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { FitnexiaColors } from '@/constants/fitnexia';

export type AvatarKind = 'user' | 'instructor' | 'institution';

const ICONS: Record<AvatarKind, keyof typeof Ionicons.glyphMap> = {
  user: 'person',
  instructor: 'school',
  institution: 'business',
};

type UserAvatarProps = {
  size?: number;
  kind?: AvatarKind;
  uri?: string | null;
  style?: ViewStyle;
};

export function UserAvatar({ size = 48, kind = 'user', uri, style }: UserAvatarProps) {
  const iconSize = Math.round(size * 0.48);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: FitnexiaColors.gray100,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}>
      <Ionicons name={ICONS[kind]} size={iconSize} color={FitnexiaColors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: FitnexiaColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
