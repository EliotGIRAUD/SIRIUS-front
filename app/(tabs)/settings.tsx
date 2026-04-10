import { GameTabBar } from '@/components/game-tab-bar';
import { ThemedText } from '@/components/themed-text';
import { useDogStore } from '@/hooks/useDogStore';
import { clearLocalSession, getUserSnapshot, type UserSnapshot } from '@/lib/local-session';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { router } from 'expo-router';
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
          <View style={s.shopSegmentWrap}>
            <Pressable
              style={({ pressed }) => [
                s.shopSegmentButton,
                difficulty_mode === 'normal' && s.shopSegmentButtonActive,
                pressed && s.shopSegmentButtonPressed,
                saving && s.disabled,
              ]}
              disabled={saving}
              onPress={() => onChangeDifficulty('normal')}>
              <Text
                style={[
                  s.shopSegmentLabel,
                  difficulty_mode === 'normal' && s.shopSegmentLabelActive,
                ]}>
                Normal
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                s.shopSegmentButton,
                difficulty_mode === 'hardcore' && s.shopSegmentButtonActive,
                pressed && s.shopSegmentButtonPressed,
                saving && s.disabled,
              ]}
              disabled={saving}
              onPress={() => onChangeDifficulty('hardcore')}>
              <Text
                style={[
                  s.shopSegmentLabel,
                  difficulty_mode === 'hardcore' && s.shopSegmentLabelActive,
                ]}>
                Hardcore
              </Text>
            </Pressable>
          </View>
          <Text style={s.settingsCardLabel}>Mode démo</Text>
          <Pressable
            style={({ pressed }) => [
              s.outlineButton,
              { borderColor: is_demo_mode ? c.buttonPrimaryBackground : c.inputBorder },
              is_demo_mode && { backgroundColor: c.hudPillBackground },
              pressed && s.shopSegmentButtonPressed,
              saving && s.disabled,
            ]}
            disabled={saving}
            onPress={onToggleDemo}>
            <Text style={s.outlineButtonLabel}>{is_demo_mode ? 'Activé' : 'Désactivé'}</Text>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            s.outlineButton,
            pressed && s.shopSegmentButtonPressed,
            (signingOut || saving) && s.disabled,
          ]}
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
