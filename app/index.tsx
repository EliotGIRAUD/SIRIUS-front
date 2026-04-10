import { useDogStore } from '@/hooks/useDogStore';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { isSetupComplete, setSetupComplete } from '@/lib/local-session';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

type Gate = 'boot' | 'login' | 'checkup' | 'setupDog' | 'tabs';

type DogStoreState = {
  hydrateUserIdFromStorage: () => Promise<void>;
  userId: string;
  fetchDog: () => Promise<boolean | null>;
};

function dogStore(): DogStoreState {
  return useDogStore.getState() as DogStoreState;
}

export default function Index() {
  const [gate, setGate] = useState<Gate>('boot');
  const { colors: c, styles: s } = useThemedStyles();

  useEffect(() => {
    (async () => {
      await dogStore().hydrateUserIdFromStorage();
      const userId = dogStore().userId;
      if (!userId) {
        setGate('login');
        return;
      }
      const hasDog = await dogStore().fetchDog();
      let next: Gate;
      if (hasDog === null) {
        next = (await isSetupComplete()) ? 'tabs' : 'checkup';
      } else {
        if (hasDog) {
          await setSetupComplete(true);
          next = 'tabs';
        } else {
          next = (await isSetupComplete()) ? 'setupDog' : 'checkup';
        }
      }
      setGate(next);
    })();
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

  if (gate === 'checkup') {
    return <Redirect href="/checkup" />;
  }

  if (gate === 'setupDog') {
    return <Redirect href="/setup-dog" />;
  }

  return <Redirect href="/(tabs)" />;
}
