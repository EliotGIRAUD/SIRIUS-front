import { useThemedStyles } from '@/hooks/use-themed-styles';
import { useDogStore } from '@/hooks/useDogStore';
import { getFirebaseAuth } from '@/lib/firebase';
import { cacheFirebaseUser, isSetupComplete, setSetupComplete } from '@/lib/local-session';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        const pseudo = user.email?.trim() || user.uid;
        if (pseudo) await useDogStore.getState().authApiLogin(pseudo);
      }
      const hasDog = await useDogStore.getState().fetchDog();
      if (hasDog === null) {
        router.replace((await isSetupComplete()) ? '/(tabs)' : '/setup-dog');
      } else {
        await setSetupComplete(hasDog);
        router.replace(hasDog ? '/(tabs)' : '/setup-dog');
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
      const apiOk = await useDogStore.getState().authApiLogin(email.trim());
      if (!apiOk) {
        Alert.alert(
          'Serveur',
          'Impossible de joindre POST /auth/login. Vérifie que l’API tourne et EXPO_PUBLIC_API_URL.',
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
      Alert.alert('Connexion', e instanceof Error ? e.message : 'Erreur');
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
      <Pressable
        style={[s.primaryButton, { backgroundColor: c.buttonPrimaryBackground }, loading && s.disabled]}
        onPress={onLogin}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color={c.buttonPrimaryText} />
        ) : (
          <Text style={[s.buttonLabel, { color: c.buttonPrimaryText }]}>Se connecter</Text>
        )}
      </Pressable>
      <Pressable style={[s.outlineButton, s.disabled]} disabled>
        <Text style={s.outlineButtonLabel}>S&apos;inscrire</Text>
      </Pressable>
    </View>
  );
}
