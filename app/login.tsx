import { useThemedStyles } from '@/hooks/use-themed-styles';
import { useDogStore } from '@/hooks/useDogStore';
import { isSetupComplete, setSetupComplete } from '@/lib/local-session';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

type DogStoreState = {
  fetchDog: () => Promise<boolean | null>;
  authApiLogin: (p: { email: string; password: string }) => Promise<boolean>;
  authApiRegister: (p: { email: string; password: string; pseudo: string }) => Promise<boolean>;
};

function dogStore(): DogStoreState {
  return useDogStore.getState() as DogStoreState;
}

export default function LoginScreen() {
  const { mode: modeParam } = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors: c, styles: s } = useThemedStyles();

  useEffect(() => {
    if (modeParam === 'register') {
      setMode('register');
      return;
    }
    if (modeParam === 'login') {
      setMode('login');
    }
  }, [modeParam]);

  async function afterAuth() {
    const hasDog = await dogStore().fetchDog();
    if (hasDog === null) {
      router.replace((await isSetupComplete()) ? '/(tabs)' : '/checkup');
    } else {
      if (hasDog) {
        await setSetupComplete(true);
        router.replace('/(tabs)');
      } else {
        router.replace((await isSetupComplete()) ? '/setup-dog' : '/checkup');
      }
    }
  }

  async function onLogin() {
    setLoading(true);
    try {
      const apiOk = await dogStore().authApiLogin({ email: email.trim(), password });
      if (!apiOk) {
        Alert.alert(
          'Connexion',
          'E-mail ou mot de passe incorrect, ou impossible de joindre POST /auth/login (API et EXPO_PUBLIC_API_URL).',
        );
        return;
      }
      await afterAuth();
    } catch (e) {
      Alert.alert('Connexion', e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  async function onRegister() {
    const pseudoTrimmed = pseudo.trim();
    if (!pseudoTrimmed) {
      Alert.alert('Pseudo', 'Indiquer un pseudo (string non vide)');
      return;
    }
    setLoading(true);
    try {
      const apiOk = await dogStore().authApiRegister({
        email: email.trim(),
        password,
        pseudo: pseudoTrimmed,
      });
      if (!apiOk) {
        Alert.alert(
          'Inscription',
          'Compte déjà existant ou impossible de joindre POST /auth/register (API et EXPO_PUBLIC_API_URL).',
        );
        return;
      }
      await afterAuth();
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
