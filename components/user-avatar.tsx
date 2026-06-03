import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/contexts/theme-context';

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
  const { colors } = useAppTheme();
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
            backgroundColor: colors.surfaceMuted,
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
          backgroundColor: colors.primaryMuted,
        },
        style,
      ]}>
      <Ionicons name={ICONS[kind]} size={iconSize} color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
