import { useDogStore } from '@/hooks/useDogStore';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { getFirebaseAuth } from '@/lib/firebase';
import { cacheFirebaseUser, isSetupComplete, setSetupComplete } from '@/lib/local-session';
import { Redirect } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

type Gate = 'boot' | 'login' | 'setup' | 'tabs';

export default function Index() {
  const [gate, setGate] = useState<Gate>('boot');
  const { colors: c, styles: s } = useThemedStyles();

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setGate('login');
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setGate('login');
        return;
      }
      await cacheFirebaseUser(user);
      await useDogStore.getState().hydrateUserIdFromStorage();
      if (!useDogStore.getState().userId) {
        const pseudo = user.email?.trim() || user.uid;
        if (pseudo) {
          await useDogStore.getState().authApiLogin(pseudo);
        }
      }
      const hasDog = await useDogStore.getState().fetchDog();
      let next: Gate;
      if (hasDog === null) {
        next = (await isSetupComplete()) ? 'tabs' : 'setup';
      } else {
        await setSetupComplete(hasDog);
        next = hasDog ? 'tabs' : 'setup';
      }
      setGate(next);
    });

    return unsub;
  }, []);

  if (gate === 'boot') {
    return (
      <View style={s.formFlowScreen}>
        <View style={s.flowBootInner}>
          <ActivityIndicator size="large" color={c.buttonPrimaryBackground} />
          <Text style={s.flowBootCaption}>Chargement…</Text>
        </View>
      </View>
    );
  }

  if (gate === 'login') {
    return <Redirect href="/login" />;
  }

  if (gate === 'setup') {
    return <Redirect href="/setup-dog" />;
  }

  return <Redirect href="/(tabs)" />;
}
