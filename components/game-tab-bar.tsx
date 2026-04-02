import { IconSymbol } from '@/components/ui/icon-symbol';
import { Layout, Spacing } from '@/constants/layout';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { useDogStore } from '@/hooks/useDogStore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { Href, usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function GameTabBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { colors: c, styles: s } = useThemedStyles();
  const food = useDogStore((state) => state.food);
  const water = useDogStore((state) => state.water);
  const inventory = useDogStore((state) => state.inventory);
  const feedDog = useDogStore((state) => state.feedDog);
  const giveWater = useDogStore((state) => state.giveWater);
  const [panel, setPanel] = useState<null | 'food' | 'water'>(null);
  const [queuedPanel, setQueuedPanel] = useState<null | 'food' | 'water'>(null);
  const [pending, setPending] = useState(false);

  const isShop = pathname.includes('shop');
  const isHome = !pathname.includes('settings') && !isShop;
  const foodPct = Math.max(0, Math.min(100, Math.round(Number(food) || 0)));
  const waterPct = Math.max(0, Math.min(100, Math.round(Number(water) || 0)));
  const croquettes = Math.max(0, Number(inventory?.croquettes ?? 0));
  const waterBottles = Math.max(0, Number(inventory?.water_bottle ?? 0));

  const goHome = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.replace('/(tabs)' as Href);
  };

  const goShop = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.replace('/(tabs)/shop' as Href);
  };
  const onFoodPress = () => {
    if (!isHome) {
      setQueuedPanel('food');
      router.replace('/(tabs)' as Href);
      return;
    }
    setPanel('food');
  };
  const onWaterPress = () => {
    if (!isHome) {
      setQueuedPanel('water');
      router.replace('/(tabs)' as Href);
      return;
    }
    setPanel('water');
  };
  const goLeash = () => {};

  const isFoodPanel = panel === 'food';
  const isWaterPanel = panel === 'water';
  const currentPct = isFoodPanel ? foodPct : isWaterPanel ? waterPct : 0;
  const currentStock = isFoodPanel ? croquettes : isWaterPanel ? waterBottles : 0;
  const actionLabel = isFoodPanel ? 'Nourrir' : isWaterPanel ? 'Donner à boire' : '';
  const emptyLabel = isFoodPanel ? 'Acheter croquettes' : isWaterPanel ? 'Acheter eau' : '';

  async function onPanelAction() {
    if (currentStock < 1) {
      setPanel(null);
      goShop();
      return;
    }
    setPending(true);
    try {
      if (isFoodPanel) {
        const ok = await feedDog();
        if (!ok) Alert.alert('Nourrir', "Impossible de nourrir le chien pour l'instant.");
      } else {
        const out = await giveWater();
        if (!out.ok) Alert.alert('Eau', out.error || "Impossible de donner à boire pour l'instant.");
      }
      setPanel(null);
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    if (!isHome || !queuedPanel) return;
    setPanel(queuedPanel);
    setQueuedPanel(null);
  }, [isHome, queuedPanel]);

  return (
    <>
      <View style={[s.gameTabBar, { paddingBottom: Math.max(insets.bottom, Spacing.safeBottomMin) }]}>
        <Pressable
          style={({ pressed }) => [s.gameTabItem, isHome && s.gameTabItemActive, pressed && s.gameTabItemPressed]}
          onPress={goHome}
          accessibilityRole="button"
          accessibilityLabel="Accueil">
          <IconSymbol
            name="house.fill"
            size={Layout.tabBarIconSize}
            color={isHome ? c.buttonPrimaryText : c.tabBarLabel}
          />
        </Pressable>
        <Pressable
          style={({ pressed }) => [s.gameTabItem, isShop && s.gameTabItemActive, pressed && s.gameTabItemPressed]}
          onPress={goShop}
          accessibilityRole="button"
          accessibilityLabel="Boutique">
          <IconSymbol
            name="cart.fill"
            size={Layout.tabBarIconSize}
            color={isShop ? c.buttonPrimaryText : c.tabBarLabel}
          />
        </Pressable>
        <Pressable
          style={({ pressed }) => [s.gameTabGaugeItem, pressed && s.gameTabItemPressed]}
          onPress={onFoodPress}
          accessibilityRole="button">
          <View style={[s.gameTabGaugeFillFood, { height: `${foodPct}%` }]} />
          <MaterialIcons
            name="restaurant"
            size={Layout.tabBarIconSize}
            color={c.tabBarLabel}
            style={s.gameTabGaugeIcon}
          />
        </Pressable>
        <Pressable
          style={({ pressed }) => [s.gameTabGaugeItem, pressed && s.gameTabItemPressed]}
          onPress={onWaterPress}
          accessibilityRole="button">
          <View style={[s.gameTabGaugeFillWater, { height: `${waterPct}%` }]} />
          <MaterialIcons
            name="water-drop"
            size={Layout.tabBarIconSize}
            color={c.tabBarLabel}
            style={s.gameTabGaugeIcon}
          />
        </Pressable>
        <Pressable
          style={({ pressed }) => [s.gameTabItem, pressed && s.gameTabItemPressed]}
          onPress={goLeash}
          accessibilityRole="button">
          <MaterialIcons name="pets" size={Layout.tabBarIconSize} color={c.tabBarLabel} />
        </Pressable>
      </View>
      {panel ? (
        <Modal transparent visible animationType="fade" onRequestClose={() => setPanel(null)}>
          <Pressable style={s.gameQuickModalBackdrop} onPress={() => setPanel(null)}>
            <Pressable style={s.gameQuickModalCard} onPress={() => {}}>
              <View style={s.gameQuickModalHeaderRow}>
                <Text style={s.gameQuickModalTitle}>{isFoodPanel ? 'Nourrir' : 'Donner à boire'}</Text>
                <Pressable onPress={() => setPanel(null)}>
                  <MaterialIcons name="close" size={20} color={c.textMuted} />
                </Pressable>
              </View>
              <View style={s.gameQuickModalInfoRow}>
                <MaterialIcons
                  name={isFoodPanel ? 'restaurant' : 'water-drop'}
                  size={Layout.hudIconSize}
                  color={isFoodPanel ? c.foodBarFill : c.waterBarFill}
                />
                <Text style={s.gameQuickModalInfoValue}>{currentPct}%</Text>
              </View>
              <View style={s.gameQuickModalInfoRow}>
                <MaterialIcons
                  name={isFoodPanel ? 'restaurant' : 'water-drop'}
                  size={Layout.hudIconSize}
                  color={isFoodPanel ? c.foodBarFill : c.waterBarFill}
                />
                <Text style={s.gameQuickModalInfoValue}>{currentStock}</Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  s.primaryButton,
                  { backgroundColor: c.buttonPrimaryBackground },
                  pending && s.disabled,
                  pressed && s.shopSegmentButtonPressed,
                ]}
                onPress={onPanelAction}
                disabled={pending}>
                <Text style={[s.buttonLabel, { color: c.buttonPrimaryText }]}>
                  {currentStock > 0 ? actionLabel : emptyLabel}
                </Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </>
  );
}
