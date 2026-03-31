import { useThemedStyles } from '@/hooks/use-themed-styles';
import { useDogStore } from '@/hooks/useDogStore';
import { getFirebaseAuth } from '@/lib/firebase';
import { cacheFirebaseUser, isSetupComplete, setSetupComplete } from '@/lib/local-session';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors: c, styles: s } = useThemedStyles();

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      await cacheFirebaseUser(user);
      await useDogStore.getState().hydrateUserIdFromStorage();
      if (!useDogStore.getState().userId) {
        const idToken = await user.getIdToken();
        await useDogStore.getState().authApiLogin({ idToken });
      }
      const hasDog = await useDogStore.getState().fetchDog();
      if (hasDog === null) {
        router.replace((await isSetupComplete()) ? '/(tabs)' : '/checkup');
      } else {
        await setSetupComplete(hasDog);
        router.replace(hasDog ? '/(tabs)' : '/checkup');
      }
    });
    return unsub;
  }, []);

  async function onLogin() {
    const auth = getFirebaseAuth();
    if (!auth) {
      Alert.alert('Configuration', 'Définir les variables EXPO_PUBLIC_FIREBASE_* dans .env');
      return;
    }
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      await cacheFirebaseUser(cred.user);
      const idToken = await cred.user.getIdToken();
      const apiOk = await useDogStore.getState().authApiLogin({ idToken });
      if (!apiOk) {
        Alert.alert(
          'Serveur',
          'Impossible de joindre POST /auth/login. Vérifie que l’API tourne et EXPO_PUBLIC_API_URL.',
        );
        return;
      }
      const hasDog = await useDogStore.getState().fetchDog();
      if (hasDog === null) {
        router.replace((await isSetupComplete()) ? '/(tabs)' : '/checkup');
      } else {
        await setSetupComplete(hasDog);
        router.replace(hasDog ? '/(tabs)' : '/checkup');
      }
    } catch (e) {
      Alert.alert('Connexion', e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  async function onRegister() {
    const auth = getFirebaseAuth();
    if (!auth) {
      Alert.alert('Configuration', 'Définir les variables EXPO_PUBLIC_FIREBASE_* dans .env');
      return;
    }
    const pseudoTrimmed = pseudo.trim();
    if (!pseudoTrimmed) {
      Alert.alert('Pseudo', 'Indiquer un pseudo (string non vide)');
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await cacheFirebaseUser(cred.user);
      const idToken = await cred.user.getIdToken();
      const apiOk = await useDogStore.getState().authApiRegister({ idToken, pseudo: pseudoTrimmed });
      if (!apiOk) {
        Alert.alert(
          'Serveur',
          'Impossible de joindre POST /auth/register. Vérifie que l’API tourne et EXPO_PUBLIC_API_URL.',
        );
        return;
      }
      const hasDog = await useDogStore.getState().fetchDog();
      if (hasDog === null) {
        router.replace((await isSetupComplete()) ? '/(tabs)' : '/setup-dog');
      } else {
        await setSetupComplete(hasDog);
        router.replace(hasDog ? '/(tabs)' : '/setup-dog');
      }
    } catch (e) {
      Alert.alert('Inscription', e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={s.formFlowScreen}>
      <Text style={s.screenSectionTitle}>SIRIUS</Text>
      <Text style={s.fieldLabel}>E-mail</Text>
      <TextInput
        style={s.textField}
        placeholder="Email"
        placeholderTextColor={c.textMuted}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <Text style={s.fieldLabel}>Mot de passe</Text>
      <TextInput
        style={s.textField}
        placeholder="Mot de passe"
        placeholderTextColor={c.textMuted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {mode === 'register' && (
        <>
          <Text style={s.fieldLabel}>Pseudo</Text>
          <TextInput
            style={s.textField}
            placeholder="ex. Joueur1"
            placeholderTextColor={c.textMuted}
            autoCapitalize="none"
            value={pseudo}
            onChangeText={setPseudo}
          />
        </>
      )}
      <Pressable
        style={[s.primaryButton, { backgroundColor: c.buttonPrimaryBackground }, loading && s.disabled]}
        onPress={mode === 'login' ? onLogin : onRegister}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color={c.buttonPrimaryText} />
        ) : (
          <Text style={[s.buttonLabel, { color: c.buttonPrimaryText }]}>
            {mode === 'login' ? 'Se connecter' : "S'inscrire"}
          </Text>
        )}
      </Pressable>
      <Pressable
        style={[s.outlineButton, loading && s.disabled]}
        disabled={loading}
        onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
        <Text style={s.outlineButtonLabel}>{mode === 'login' ? "S'inscrire" : 'Se connecter'}</Text>
      </Pressable>
    </View>
  );
}
