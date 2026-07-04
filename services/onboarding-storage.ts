import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'fitnexia_onboarding_complete';

export async function getOnboardingComplete(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ONBOARDING_KEY);
  return value === '1';
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, '1');
}
