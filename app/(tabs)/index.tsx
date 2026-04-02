import { GameTabBar } from '@/components/game-tab-bar';
import { LayeredDogStage } from '@/components/layered-dog-stage';
import { StatRing } from '@/components/stat-ring';
import { Layout } from '@/constants/layout';
import { useDogLiveStats } from '@/hooks/use-dog-live-stats';
import { useDogStore } from '@/hooks/useDogStore';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import { AppState, type AppStateStatus, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HEALTH_MAX = 100;
const MALADIE_MAX = 100;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors: c, styles: s } = useThemedStyles();

  const dogName = useDogStore((state) => state.dogName);
  const health = useDogStore((state) => state.health);
  const maladie = useDogStore((state) => state.maladie);
  const wallet_gold = useDogStore((state) => state.wallet_gold);
  const wallet_gems = useDogStore((state) => state.wallet_gems);
  const fetchDog = useDogStore((state) => state.fetchDog);

  useDogLiveStats(true);

  useFocusEffect(
    useCallback(() => {
      void fetchDog();
      const id = setInterval(() => {
        void fetchDog();
      }, Layout.dogDashboardPollMs);
      return () => clearInterval(id);
    }, [fetchDog]),
  );

  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state === 'active') void fetchDog();
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [fetchDog]);

  const healthRatio = useMemo(() => {
    const n = Number(health) || 0;
    return Math.min(1, Math.max(0, n / HEALTH_MAX));
  }, [health]);

  const maladieRatio = useMemo(() => {
    const n = Number(maladie) || 0;
    return Math.min(1, Math.max(0, n / MALADIE_MAX));
  }, [maladie]);

  const healthPct = useMemo(
    () => Math.min(100, Math.max(0, Math.round(Number(health) || 0))),
    [health],
  );
  const maladiePct = useMemo(
    () => Math.min(100, Math.max(0, Math.round(Number(maladie) || 0))),
    [maladie],
  );
  return (
    <View style={s.gameRoot}>
      <View style={s.gameBackgroundLayer} pointerEvents="none">
        <LayeredDogStage colors={c} />
      </View>

      <View style={[s.gameContentLayer, { paddingTop: insets.top }]}>
        <View style={s.gameTopHeaderRow}>
          <Pressable
            style={({ pressed }) => [s.profilePawButton, pressed && s.shopSegmentButtonPressed]}
            onPress={() => router.replace('/(tabs)/settings')}
            accessibilityRole="button"
            accessibilityLabel="Profil">
            <MaterialIcons name="pets" size={22} color={c.dogVectorSnout} />
          </Pressable>
          <View style={s.hudRowCurrencies}>
            <View style={s.hudPillShort}>
              <MaterialIcons name="monetization-on" size={Layout.hudIconSize} color={c.coinAccent} />
              <Text style={s.hudValueCompact}>{wallet_gold}</Text>
            </View>
            <View style={s.hudPillShort}>
              <MaterialIcons name="diamond" size={Layout.hudIconSize} color={c.gemAccent} />
              <Text style={s.hudValueCompact}>{wallet_gems}</Text>
              <Pressable
                style={({ pressed }) => [s.hudPillAddButton, pressed && s.shopSegmentButtonPressed]}
                onPress={() => router.replace('/(tabs)/shop')}
                accessibilityRole="button"
                accessibilityLabel="Acheter gemmes">
                <MaterialIcons name="add" size={14} color={c.tabBarLabel} />
              </Pressable>
            </View>
          </View>
        </View>

        <Text style={s.dogTitle}>{dogName || 'Chien'}</Text>

        <View style={s.gameMainBody}>
          <View style={s.statRingsColumn}>
            <View style={s.statRingItem}>
              <View style={s.statRingWrap}>
                <StatRing
                  size={Layout.statRingSize}
                  strokeWidth={Layout.statRingStroke}
                  ratio={healthRatio}
                  trackColor={c.statRingTrack}
                  fillColor={c.healthFill}
                />
                <Text style={s.statRingPercent}>{healthPct}%</Text>
              </View>
              <Text style={s.statRingLabel}>Santé</Text>
            </View>
            <View style={s.statRingItem}>
              {/* Maladie 0–100: green arc length = sickness %; rest is neutral track. */}
              <View style={s.statRingWrap}>
                <StatRing
                  size={Layout.statRingSize}
                  strokeWidth={Layout.statRingStroke}
                  ratio={maladieRatio}
                  trackColor={c.statRingTrack}
                  fillColor={c.healthFill}
                />
                <Text style={s.statRingPercent}>{maladiePct}%</Text>
              </View>
              <Text style={s.statRingLabel}>Maladie</Text>
            </View>
          </View>
        </View>
      </View>

      <GameTabBar />
    </View>
  );
}
