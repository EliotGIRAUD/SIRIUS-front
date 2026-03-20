import { getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

/**
 * Auth with durable persistence (AsyncStorage on native, local storage on web)
 * so users stay signed in across app restarts.
 */
export function getFirebaseAuth() {
  if (!firebaseConfig.apiKey) return null;

  const hadApps = getApps().length > 0;
  const app = hadApps ? getApps()[0] : initializeApp(firebaseConfig);

  if (!hadApps) {
    try {
      return Platform.OS === 'web'
        ? initializeAuth(app, { persistence: browserLocalPersistence })
        : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
    } catch (e) {
      if (e && typeof e === 'object' && e.code === 'auth/already-initialized') {
        return getAuth(app);
      }
      throw e;
    }
  }

  return getAuth(app);
}
