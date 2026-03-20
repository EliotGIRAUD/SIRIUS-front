import { GameTabBar } from '@/components/game-tab-bar';
import { ThemedText } from '@/components/themed-text';
import { useDogStore } from '@/hooks/useDogStore';
import { getFirebaseAuth } from '@/lib/firebase';
import { clearLocalSession, getUserSnapshot, type UserSnapshot } from '@/lib/local-session';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors: c, styles: s } = useThemedStyles();
  const [snapshot, setSnapshot] = useState<UserSnapshot | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const loadSnapshot = useCallback(() => {
    getUserSnapshot().then(setSnapshot);
  }, []);

  useEffect(() => {
    loadSnapshot();
  }, [loadSnapshot]);

  async function onSignOut() {
    setSigningOut(true);
    try {
      const auth = getFirebaseAuth();
      if (auth) {
        await signOut(auth);
      }
      await clearLocalSession();
      useDogStore.getState().resetAfterLogout();
      router.replace('/login');
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <View style={[s.tabScreen, { paddingTop: insets.top }]}>
      <View style={s.settingsContent}>
        <ThemedText type="title" style={s.settingsTitle}>
          Paramètres
        </ThemedText>
        <ThemedText style={s.settingsSubtitle}>Options du jeu à venir.</ThemedText>

        {snapshot?.email ? (
          <View style={s.settingsCard}>
            <Text style={s.settingsCardLabel}>Compte</Text>
            <Text style={s.settingsCardValue}>{snapshot.email}</Text>
            {snapshot.dogName ? (
              <>
                <Text style={[s.settingsCardLabel, s.settingsCardLabelSpaced]}>Chien</Text>
                <Text style={s.settingsCardValue}>{snapshot.dogName}</Text>
              </>
            ) : null}
          </View>
        ) : null}

        <Pressable
          style={[s.outlineButton, signingOut && s.disabled]}
          onPress={onSignOut}
          disabled={signingOut}>
          {signingOut ? (
            <ActivityIndicator color={c.buttonPrimaryBackground} />
          ) : (
            <Text style={s.outlineButtonLabel}>Se déconnecter</Text>
          )}
        </Pressable>
      </View>
      <GameTabBar />
    </View>
  );
}
