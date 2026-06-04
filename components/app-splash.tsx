import { Image, StyleSheet, View } from 'react-native';

const LOGO_ASPECT = 1144 / 866;
const WORDMARK_ASPECT = 1144 / 866;

type AppSplashProps = {
  onLayout?: () => void;
};

export function AppSplash({ onLayout }: AppSplashProps) {
  return (
    <View style={styles.container} onLayout={onLayout}>
      <Image
        source={require('@/assets/images/simbolo.png')}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Fitnexia logo"
      />
      <Image
        source={require('@/assets/images/primary.png')}
        style={styles.wordmark}
        resizeMode="contain"
        accessibilityLabel="Fitnexia"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 200,
    aspectRatio: LOGO_ASPECT,
  },
  wordmark: {
    width: 240,
    aspectRatio: WORDMARK_ASPECT,
    marginTop: 24,
  },
});
