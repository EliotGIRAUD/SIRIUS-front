import { GameTabBar } from '@/components/game-tab-bar';
import { ThemedText } from '@/components/themed-text';
import { useDogStore } from '@/hooks/useDogStore';
import { getFirebaseAuth } from '@/lib/firebase';
import { clearLocalSession, getUserSnapshot, type UserSnapshot } from '@/lib/local-session';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SETTINGS_BACKGROUND_PATTERN_OPACITY = 0.7;

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
    <View style={[s.tabScreen, styles.screen, { paddingTop: insets.top }]}>
      <Image
        source={require('../../assets/images/pawbackground.svg')}
        style={[styles.backgroundPawPattern, { opacity: SETTINGS_BACKGROUND_PATTERN_OPACITY }]}
        contentFit="cover"
        transition={0}
      />
      <View style={[s.settingsContent, styles.content]}>
        <ThemedText type="title" style={[s.settingsTitle, styles.title]}>
          Paramètres
        </ThemedText>
        <ThemedText style={[s.settingsSubtitle, styles.subtitle]}>Options du jeu à venir.</ThemedText>

        {snapshot?.email ? (
          <View style={[s.settingsCard, styles.card]}>
            <Text style={s.settingsCardLabel}>Compte</Text>
            <Text style={[s.settingsCardValue, styles.cardValue]}>{snapshot.email}</Text>
            {snapshot.dogName ? (
              <>
                <Text style={[s.settingsCardLabel, s.settingsCardLabelSpaced]}>Chien</Text>
                <Text style={[s.settingsCardValue, styles.cardValue]}>{snapshot.dogName}</Text>
              </>
            ) : null}
          </View>
        ) : null}

        <View style={[s.settingsCard, styles.card, { gap: 10 }]}>
          <Text style={s.settingsCardLabel}>Difficulté</Text>
          <View style={[s.shopSegmentWrap, styles.segmentWrap]}>
            <Pressable
              style={({ pressed }) => [
                s.shopSegmentButton,
                styles.segmentButton,
                difficulty_mode === 'normal' && s.shopSegmentButtonActive,
                difficulty_mode === 'normal' && styles.segmentButtonActive,
                pressed && s.shopSegmentButtonPressed,
                saving && s.disabled,
              ]}
              disabled={saving}
              onPress={() => onChangeDifficulty('normal')}>
              <Text
                style={[
                  s.shopSegmentLabel,
                  styles.segmentLabel,
                  difficulty_mode === 'normal' && s.shopSegmentLabelActive,
                  difficulty_mode === 'normal' && styles.segmentLabelActive,
                ]}>
                Normal
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                s.shopSegmentButton,
                styles.segmentButton,
                difficulty_mode === 'hardcore' && s.shopSegmentButtonActive,
                difficulty_mode === 'hardcore' && styles.segmentButtonActive,
                pressed && s.shopSegmentButtonPressed,
                saving && s.disabled,
              ]}
              disabled={saving}
              onPress={() => onChangeDifficulty('hardcore')}>
              <Text
                style={[
                  s.shopSegmentLabel,
                  styles.segmentLabel,
                  difficulty_mode === 'hardcore' && s.shopSegmentLabelActive,
                  difficulty_mode === 'hardcore' && styles.segmentLabelActive,
                ]}>
                Hardcore
              </Text>
            </Pressable>
          </View>
          <Text style={s.settingsCardLabel}>Mode démo</Text>
          <Pressable
            style={({ pressed }) => [
              s.outlineButton,
              styles.demoButton,
              { borderColor: is_demo_mode ? c.buttonPrimaryBackground : c.inputBorder },
              is_demo_mode && { backgroundColor: c.hudPillBackground },
              pressed && s.shopSegmentButtonPressed,
              saving && s.disabled,
            ]}
            disabled={saving}
            onPress={onToggleDemo}>
            <Text style={[s.outlineButtonLabel, styles.demoButtonLabel]}>{is_demo_mode ? 'Activé' : 'Désactivé'}</Text>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            s.outlineButton,
            styles.logoutButton,
            pressed && s.shopSegmentButtonPressed,
            (signingOut || saving) && s.disabled,
          ]}
          onPress={onSignOut}
          disabled={signingOut || saving}>
          {signingOut ? (
            <ActivityIndicator color={c.buttonPrimaryBackground} />
          ) : (
            <Text style={[s.outlineButtonLabel, styles.logoutButtonLabel]}>Se déconnecter</Text>
          )}
        </Pressable>
      </View>
      <GameTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    overflow: 'hidden',
  },
  backgroundPawPattern: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    zIndex: 1,
    gap: 12,
  },
  title: {
    color: '#3B090C',
  },
  subtitle: {
    color: '#3B090C80',
  },
  card: {
    backgroundColor: '#FBE4CEEE',
    borderColor: '#3B090C0D',
    borderWidth: 1,
  },
  cardValue: {
    color: '#3B090C',
  },
  segmentWrap: {
    backgroundColor: '#F3E6D9',
    borderColor: '#3B090C1A',
  },
  segmentButton: {
    backgroundColor: 'transparent',
  },
  segmentButtonActive: {
    backgroundColor: '#3B090C',
  },
  segmentLabel: {
    color: '#3B090C',
  },
  segmentLabelActive: {
    color: '#FBE4CE',
  },
  demoButton: {
    backgroundColor: '#FBE4CE',
    borderColor: '#3B090C66',
  },
  demoButtonLabel: {
    color: '#3B090C',
  },
  logoutButton: {
    backgroundColor: '#FBE4CE',
    borderColor: '#3B090C66',
  },
  logoutButtonLabel: {
    color: '#3B090C',
  },
});
