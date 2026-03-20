import { GameTabBar } from '@/components/game-tab-bar';
import { LayeredDogStage } from '@/components/layered-dog-stage';
import { Layout } from '@/constants/layout';
import { useDogStore } from '@/hooks/useDogStore';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useMemo } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HEALTH_MAX = 100;
const HUNGER_MAX = 100;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors: c, styles: s } = useThemedStyles();

  const dogName = useDogStore((state) => state.dogName);
  const hunger = useDogStore((state) => state.hunger);
  const health = useDogStore((state) => state.health);
  const wallet_gold = useDogStore((state) => state.wallet_gold);
  const wallet_gems = useDogStore((state) => state.wallet_gems);
  const fetchDog = useDogStore((state) => state.fetchDog);

  useEffect(() => {
    fetchDog();
  }, [fetchDog]);

  const healthRatio = useMemo(() => {
    const n = Number(health) || 0;
    return Math.min(1, Math.max(0, n / HEALTH_MAX));
  }, [health]);

  const foodRatio = useMemo(() => {
    const n = Number(hunger) || 0;
    return Math.min(1, Math.max(0, n / HUNGER_MAX));
  }, [hunger]);

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

        <Text style={s.dogTitle}>{dogName || 'Chien'}</Text>

        <View style={s.healthBlock}>
          <View style={s.statBarGroup}>
            <Text style={s.healthBarLabel}>Santé</Text>
            <View style={s.healthTrack}>
              <View style={[s.healthFill, { width: `${healthRatio * 100}%` }]} />
            </View>
          </View>
          <View style={s.statBarGroup}>
            <Text style={s.healthBarLabel}>Faim</Text>
            <View style={s.healthTrack}>
              <View style={[s.foodFill, { width: `${foodRatio * 100}%` }]} />
            </View>
          </View>
        </View>
      </View>

      <GameTabBar />
    </View>
  );
}
