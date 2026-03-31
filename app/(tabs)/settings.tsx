import { GameTabBar } from '@/components/game-tab-bar';
import { ThemedText } from '@/components/themed-text';
import { useDogStore } from '@/hooks/useDogStore';
import { getFirebaseAuth } from '@/lib/firebase';
import { clearLocalSession, getUserSnapshot, type UserSnapshot } from '@/lib/local-session';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors: c, styles: s } = useThemedStyles();
  const [snapshot, setSnapshot] = useState<UserSnapshot | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [saving, setSaving] = useState(false);
  const difficulty_mode = useDogStore((state) => state.difficulty_mode);
  const is_demo_mode = useDogStore((state) => state.is_demo_mode);
  const updateSettings = useDogStore((state) => state.updateSettings);

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

  async function onToggleDemo() {
    setSaving(true);
    try {
      const out = await updateSettings({ is_demo_mode: !is_demo_mode });
      if (!out.ok) {
        Alert.alert('Profil', out.error || 'Impossible de sauvegarder');
      }
    } finally {
      setSaving(false);
    }
  }

  async function onChangeDifficulty(mode: 'normal' | 'hardcore') {
    if (mode === difficulty_mode) return;
    setSaving(true);
    try {
      const out = await updateSettings({ difficulty_mode: mode });
      if (!out.ok) {
        Alert.alert('Profil', out.error || 'Impossible de sauvegarder');
      }
    } finally {
      setSaving(false);
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

        <View style={[s.settingsCard, { gap: 10 }]}>
          <Text style={s.settingsCardLabel}>Difficulté</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              style={[
                s.outlineButton,
                {
                  flex: 1,
                  borderColor: difficulty_mode === 'normal' ? c.buttonPrimaryBackground : c.inputBorder,
                },
                saving && s.disabled,
              ]}
              disabled={saving}
              onPress={() => onChangeDifficulty('normal')}>
              <Text style={s.outlineButtonLabel}>Normal</Text>
            </Pressable>
            <Pressable
              style={[
                s.outlineButton,
                {
                  flex: 1,
                  borderColor: difficulty_mode === 'hardcore' ? c.buttonPrimaryBackground : c.inputBorder,
                },
                saving && s.disabled,
              ]}
              disabled={saving}
              onPress={() => onChangeDifficulty('hardcore')}>
              <Text style={s.outlineButtonLabel}>Hardcore</Text>
            </Pressable>
          </View>
          <Text style={s.settingsCardLabel}>Mode démo</Text>
          <Pressable
            style={[s.outlineButton, saving && s.disabled]}
            disabled={saving}
            onPress={onToggleDemo}>
            <Text style={s.outlineButtonLabel}>{is_demo_mode ? 'Activé' : 'Désactivé'}</Text>
          </Pressable>
        </View>

        <Pressable
          style={[s.outlineButton, (signingOut || saving) && s.disabled]}
          onPress={onSignOut}
          disabled={signingOut || saving}>
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
