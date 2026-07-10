// Eagerly load native modules in the main bundle so Metro/Hermes never evals
// them from async split chunks (fetchThenEvalJs SyntaxError).
import 'expo-notifications';
import '@react-native-firebase/app';
import '@react-native-firebase/analytics';
import '@react-native-firebase/installations';
import '@react-native-firebase/in-app-messaging';

try {
  // LiveKit WebRTC globals (dev client / native build only).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { registerGlobals } = require('@livekit/react-native') as {
    registerGlobals: () => void;
  };
  registerGlobals();
} catch {
  // Expo Go / web without native LiveKit modules.
}
