import { GameTabBar } from '@/components/game-tab-bar';
import { LayeredDogStage } from '@/components/layered-dog-stage';
import { StatRing } from '@/components/stat-ring';
import { Layout } from '@/constants/layout';
import { useDogLiveStats } from '@/hooks/use-dog-live-stats';
import { useDogStore } from '@/hooks/useDogStore';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo } from 'react';
import { AppState, type AppStateStatus, Alert, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HEALTH_MAX = 100;
/** Nourriture : 100 = plein, diminue avec le temps côté API. */
const FOOD_MAX = 100;
const WATER_MAX = 100;
const MALADIE_MAX = 100;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors: c, styles: s } = useThemedStyles();

  const dogName = useDogStore((state) => state.dogName);
  const food = useDogStore((state) => state.food);
  const water = useDogStore((state) => state.water);
  const health = useDogStore((state) => state.health);
  const maladie = useDogStore((state) => state.maladie);
  const wallet_gold = useDogStore((state) => state.wallet_gold);
  const wallet_gems = useDogStore((state) => state.wallet_gems);
  const inventory = useDogStore((state) => state.inventory);
  const fetchDog = useDogStore((state) => state.fetchDog);
  const feedDog = useDogStore((state) => state.feedDog);
  const giveWater = useDogStore((state) => state.giveWater);
  const buyConsumable = useDogStore((state) => state.buyConsumable);

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

  const foodRatio = useMemo(() => {
    const n = Number(food) || 0;
    return Math.min(1, Math.max(0, n / FOOD_MAX));
  }, [food]);

  const waterRatio = useMemo(() => {
    const n = Number(water) || 0;
    return Math.min(1, Math.max(0, n / WATER_MAX));
  }, [water]);

  const maladieRatio = useMemo(() => {
    const n = Number(maladie) || 0;
    return Math.min(1, Math.max(0, n / MALADIE_MAX));
  }, [maladie]);

  const healthPct = useMemo(
    () => Math.min(100, Math.max(0, Math.round(Number(health) || 0))),
    [health],
  );
  const foodPct = useMemo(
    () => Math.min(100, Math.max(0, Math.round(Number(food) || 0))),
    [food],
  );
  const waterPct = useMemo(
    () => Math.min(100, Math.max(0, Math.round(Number(water) || 0))),
    [water],
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
        <View style={s.hudRow}>
          <View style={s.hudPill}>
            <MaterialIcons name="monetization-on" size={Layout.hudIconSize} color={c.coinAccent} />
            <Text style={s.hudValue}>{wallet_gold}</Text>
          </View>
          <View style={s.hudPill}>
            <MaterialIcons name="diamond" size={Layout.hudIconSize} color={c.gemAccent} />
            <Text style={s.hudValue}>{wallet_gems}</Text>
          </View>
        </View>
        <View style={s.hudRow}>
          <View style={s.hudPill}>
            <MaterialIcons name="restaurant" size={Layout.hudIconSize} color={c.foodBarFill} />
            <Text style={s.hudValue}>{inventory?.croquettes ?? 0}</Text>
          </View>
          <View style={s.hudPill}>
            <MaterialIcons name="water-drop" size={Layout.hudIconSize} color={c.waterBarFill} />
            <Text style={s.hudValue}>{inventory?.water_bottle ?? 0}</Text>
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
              <View style={s.statRingWrap}>
                <StatRing
                  size={Layout.statRingSize}
                  strokeWidth={Layout.statRingStroke}
                  ratio={foodRatio}
                  trackColor={c.statRingTrack}
                  fillColor={c.foodBarFill}
                />
                <Text style={s.statRingPercent}>{foodPct}%</Text>
              </View>
              <Text style={s.statRingLabel}>Faim</Text>
            </View>
            <View style={s.statRingItem}>
              <View style={s.statRingWrap}>
                <StatRing
                  size={Layout.statRingSize}
                  strokeWidth={Layout.statRingStroke}
                  ratio={waterRatio}
                  trackColor={c.statRingTrack}
                  fillColor={c.waterBarFill}
                />
                <Text style={s.statRingPercent}>{waterPct}%</Text>
              </View>
              <Text style={s.statRingLabel}>Eau</Text>
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
        <View style={{ width: '100%', flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <Pressable
            style={[s.primaryButton, { flex: 1, backgroundColor: c.buttonPrimaryBackground }]}
            onPress={async () => {
              const ok = await feedDog();
              if (!ok) Alert.alert('Nourrir', "Impossible de nourrir le chien pour l'instant.");
            }}>
            <Text style={[s.buttonLabel, { color: c.buttonPrimaryText }]}>Nourrir</Text>
          </Pressable>
          <Pressable
            style={[s.outlineButton, { flex: 1 }]}
            onPress={async () => {
              const ok = await giveWater();
              if (!ok) Alert.alert('Eau', "Impossible de donner à boire pour l'instant.");
            }}>
            <Text style={s.outlineButtonLabel}>Donner à boire</Text>
          </Pressable>
        </View>
        <View style={{ width: '100%', flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <Pressable
            style={[s.outlineButton, { flex: 1 }]}
            onPress={async () => {
              const out = await buyConsumable('croquettes', 1);
              if (!out.ok) Alert.alert('Boutique', out.error || "Impossible d'acheter des croquettes.");
            }}>
            <Text style={s.outlineButtonLabel}>Acheter croquettes</Text>
          </Pressable>
          <Pressable
            style={[s.outlineButton, { flex: 1 }]}
            onPress={async () => {
              const out = await buyConsumable('water_bottle', 1);
              if (!out.ok) Alert.alert('Boutique', out.error || "Impossible d'acheter de l'eau.");
            }}>
            <Text style={s.outlineButtonLabel}>Acheter eau</Text>
          </Pressable>
        </View>
      </View>

      <GameTabBar />
    </View>
  );
}
