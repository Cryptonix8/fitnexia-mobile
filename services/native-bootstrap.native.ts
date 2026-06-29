// Eagerly load native modules in the main bundle so Metro/Hermes never evals
// them from async split chunks (fetchThenEvalJs SyntaxError).
import 'expo-notifications';
import '@react-native-firebase/app';
import '@react-native-firebase/analytics';
import '@react-native-firebase/installations';
import '@react-native-firebase/in-app-messaging';
