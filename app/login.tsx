import { useThemedStyles } from '@/hooks/use-themed-styles';
import { useDogStore } from '@/hooks/useDogStore';
import { getFirebaseAuth } from '@/lib/firebase';
import { cacheFirebaseUser, isSetupComplete, setSetupComplete } from '@/lib/local-session';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { mode: modeParam } = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      await cacheFirebaseUser(user);
      await useDogStore.getState().hydrateUserIdFromStorage();
      const idToken = await user.getIdToken();
      await useDogStore.getState().authApiLogin({ idToken });
      const hasDog = await useDogStore.getState().fetchDog();
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
        if (hasDog) {
          await setSetupComplete(true);
          router.replace('/(tabs)');
        } else {
          router.replace((await isSetupComplete()) ? '/setup-dog' : '/checkup');
        }
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
    if (!acceptedTerms) {
      Alert.alert('Conditions', "Tu dois accepter les conditions d'utilisation.");
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
        router.replace((await isSetupComplete()) ? '/(tabs)' : '/checkup');
      } else {
        if (hasDog) {
          await setSetupComplete(true);
          router.replace('/(tabs)');
        } else {
          router.replace((await isSetupComplete()) ? '/setup-dog' : '/checkup');
        }
      }
    } catch (e) {
      Alert.alert('Inscription', e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[s.formFlowScreen, styles.authScreen]}>
      <View style={styles.authCard}>
        <Text style={[s.screenSectionTitle, styles.authTitle]}>Ton aventure commence ici</Text>
        <Text style={styles.authSubtitle}>Crée ton compte et prépare-toi à accueillir ton futur compagnon.</Text>

        <View style={styles.socialRow}>
          <Pressable style={styles.socialButton}>
            <FontAwesome name="facebook-square" size={30} color="#1877F2" />
            <Text style={styles.socialLabel}>Facebook</Text>
          </Pressable>
          <Pressable style={styles.socialButton}>
            <AntDesign name="google" size={28} color="#DB4437" />
            <Text style={styles.socialLabel}>Google</Text>
          </Pressable>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Or</Text>
          <View style={styles.dividerLine} />
        </View>

        {mode === 'register' && (
          <TextInput
            style={[s.textField, styles.authField]}
            placeholder="Pseudo"
            placeholderTextColor={c.textMuted}
            autoCapitalize="none"
            value={pseudo}
            onChangeText={setPseudo}
          />
        )}

        <TextInput
          style={[s.textField, styles.authField]}
          placeholder={mode === 'register' ? 'E-mail ou numéro de téléphone' : 'Email'}
          placeholderTextColor={c.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.passwordWrap}>
          <TextInput
            style={[s.textField, styles.authField, styles.passwordField]}
            placeholder="Mot de passe"
            placeholderTextColor={c.textMuted}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable style={styles.passwordToggle} onPress={() => setShowPassword((v) => !v)}>
            <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={24} color="#3B090C" />
          </Pressable>
        </View>

        {mode === 'register' && (
          <Pressable style={styles.termsRow} onPress={() => setAcceptedTerms((v) => !v)}>
            <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]} />
            <Text style={styles.termsText}>
              <Text style={styles.termsAccent}>J&apos;accepte</Text> les conditions d&apos;utilisation et politiques de confidentialité
            </Text>
          </Pressable>
        )}

        <Pressable
          style={[s.primaryButton, styles.authPrimaryButton, { backgroundColor: c.buttonPrimaryBackground }, loading && s.disabled]}
          onPress={mode === 'login' ? onLogin : onRegister}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color={c.buttonPrimaryText} />
          ) : (
            <Text style={[s.buttonLabel, styles.authPrimaryLabel, { color: c.buttonPrimaryText }]}>
              {mode === 'login' ? 'Se connecter' : 'Créer votre compte'}
            </Text>
          )}
        </Pressable>
        <Pressable
          style={[styles.authSwitchButton, loading && s.disabled]}
          disabled={loading}
          onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
          <Text style={styles.authSwitchLabel}>
            {mode === 'login' ? (
              <>
                Pas encore de compte ? <Text style={styles.authSwitchAccent}>Inscrivez-vous</Text>
              </>
            ) : (
              <>
                Vous avez déjà un compte ? <Text style={styles.authSwitchAccent}>Connectez-vous</Text>
              </>
            )}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  authScreen: {
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 72,
  },
  authCard: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    gap: 14,
  },
  authTitle: {
    color: '#3B090C',
    fontFamily: 'Modak',
    fontWeight: '400',
    fontSize: 50,
    lineHeight: 50,
    textAlign: 'center',
  },
  authSubtitle: {
    color: '#3B090C',
    opacity: 0.55,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
  hiddenLabel: {
    display: 'none',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  socialButton: {
    flex: 1,
    minHeight: 62,
    borderRadius: 30,
    backgroundColor: '#3B090C0D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  socialLabel: {
    color: '#3B090C',
    fontSize: 33 / 2,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 2,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#3B090C1A',
  },
  dividerText: {
    color: '#3B090C',
    fontSize: 18 / 2 + 9,
  },
  authField: {
    borderRadius: 22,
    minHeight: 60,
    paddingHorizontal: 20,
    fontSize: 18,
    color: '#3B090C80',
    backgroundColor: '#3B090C0D',
  },
  passwordWrap: {
    position: 'relative',
  },
  passwordField: {
    paddingRight: 54,
  },
  passwordToggle: {
    position: 'absolute',
    right: 18,
    top: 18,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 2,
    marginBottom: 4,
  },
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#3B090C0D',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#3B090C',
  },
  termsText: {
    flex: 1,
    color: '#3B090C',
    fontSize: 16 / 1.1,
    lineHeight: 28,
  },
  termsAccent: {
    color: '#E4C75A',
  },
  authPrimaryButton: {
    marginTop: 8,
    minHeight: 68,
    borderRadius: 40,
    justifyContent: 'center',
  },
  authPrimaryLabel: {
    fontSize: 36 / 2,
    fontWeight: '700',
  },
  authSwitchButton: {
    marginTop: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  authSwitchLabel: {
    color: '#3B090C',
    opacity: 0.9,
    fontSize: 18 / 1.1,
  },
  authSwitchAccent: {
    color: '#E4C75A',
    fontWeight: '600',
  },
});
