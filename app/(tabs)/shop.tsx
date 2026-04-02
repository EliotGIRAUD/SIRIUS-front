import { GameTabBar } from '@/components/game-tab-bar';
import { ThemedText } from '@/components/themed-text';
import { useDogStore } from '@/hooks/useDogStore';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ITEMS = [
  { id: 'croquettes', label: 'Croquettes', priceGold: 20 },
  { id: 'water_bottle', label: 'Eau', priceGold: 25 },
];

const SKINS = [
  { id: 'skin_space', label: 'Skin Space', priceGems: 80 },
  { id: 'skin_neon', label: 'Skin Neon', priceGems: 120 },
];

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const { colors: c, styles: s } = useThemedStyles();
  const [tab, setTab] = useState<'items' | 'skins'>('items');
  const [activeEntryId, setActiveEntryId] = useState('');
  const [pendingActionId, setPendingActionId] = useState('');

  const wallet_gold = useDogStore((st) => st.wallet_gold);
  const wallet_gems = useDogStore((st) => st.wallet_gems);
  const buyConsumable = useDogStore((st) => st.buyConsumable);

  const unlocked_skins = useDogStore((st) => st.unlocked_skins);
  const buySkin = useDogStore((st) => st.buySkin);
  const equipSkin = useDogStore((st) => st.equipSkin);
  const active_skin_id = useDogStore((st) => st.active_skin_id);

  const isItems = tab === 'items';

  const header = useMemo(
    () =>
      isItems
        ? { title: 'Boutique', subtitle: "Acheter des consommables avec l'or." }
        : { title: 'Skins', subtitle: 'Acheter et équiper des skins avec les gemmes.' },
    [isItems],
  );

  return (
    <View style={[s.tabScreen, { paddingTop: insets.top }]}>
      <View style={s.settingsContent}>
        <ThemedText type="title" style={s.settingsTitle}>
          {header.title}
        </ThemedText>
        <ThemedText style={s.settingsSubtitle}>{header.subtitle}</ThemedText>

        <View style={s.shopSegmentWrap}>
          <Pressable
            style={({ pressed }) => [
              s.shopSegmentButton,
              isItems && s.shopSegmentButtonActive,
              pressed && s.shopSegmentButtonPressed,
            ]}
            onPress={() => setTab('items')}>
            <Text style={[s.shopSegmentLabel, isItems && s.shopSegmentLabelActive]}>Items</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              s.shopSegmentButton,
              !isItems && s.shopSegmentButtonActive,
              pressed && s.shopSegmentButtonPressed,
            ]}
            onPress={() => setTab('skins')}>
            <Text style={[s.shopSegmentLabel, !isItems && s.shopSegmentLabelActive]}>Skins</Text>
          </Pressable>
        </View>

        <View style={s.shopWalletRow}>
          <View style={s.shopWalletPill}>
            <Text style={s.shopWalletLabel}>Or</Text>
            <Text style={s.shopWalletValue}>{wallet_gold}</Text>
          </View>
          <View style={s.shopWalletPill}>
            <Text style={s.shopWalletLabel}>Gemmes</Text>
            <Text style={s.shopWalletValue}>{wallet_gems}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={s.shopList} showsVerticalScrollIndicator={false}>
          {isItems ? (
            ITEMS.map((it) => (
              <View key={it.id} style={[s.shopCard, activeEntryId === it.id && s.shopCardActive]}>
                <Text style={s.shopCardTitle}>{it.label}</Text>
                <Text style={s.shopCardPrice}>{it.priceGold} or</Text>
                <Pressable
                  style={({ pressed }) => [
                    s.primaryButton,
                    s.shopCardAction,
                    { backgroundColor: c.buttonPrimaryBackground },
                    (wallet_gold < it.priceGold || pendingActionId === it.id) && s.shopCardActionDisabled,
                    pressed && s.shopSegmentButtonPressed,
                  ]}
                  disabled={wallet_gold < it.priceGold || pendingActionId === it.id}
                  onPress={async () => {
                    setActiveEntryId(it.id);
                    setPendingActionId(it.id);
                    const out = await buyConsumable(it.id, 1);
                    setPendingActionId('');
                    if (!out.ok) Alert.alert('Achat', out.error || 'Achat impossible');
                  }}>
                  <Text style={[s.buttonLabel, { color: c.buttonPrimaryText }]}>Acheter ×1</Text>
                </Pressable>
              </View>
            ))
          ) : (
            SKINS.map((sk) => {
              const owned = unlocked_skins.includes(sk.id);
              const equipped = active_skin_id === sk.id;
              const pending = pendingActionId === sk.id;
              const cannotBuy = wallet_gems < sk.priceGems;
              return (
                <View key={sk.id} style={[s.shopCard, activeEntryId === sk.id && s.shopCardActive]}>
                  <Text style={s.shopCardTitle}>{sk.label}</Text>
                  <Text style={s.shopCardPrice}>{sk.priceGems} gemmes</Text>
                  {!owned ? (
                    <Pressable
                      style={({ pressed }) => [
                        s.primaryButton,
                        s.shopCardAction,
                        { backgroundColor: c.buttonPrimaryBackground },
                        (cannotBuy || pending) && s.shopCardActionDisabled,
                        pressed && s.shopSegmentButtonPressed,
                      ]}
                      disabled={cannotBuy || pending}
                      onPress={async () => {
                        setActiveEntryId(sk.id);
                        setPendingActionId(sk.id);
                        const out = await buySkin(sk.id);
                        setPendingActionId('');
                        if (!out.ok) Alert.alert('Achat', out.error || 'Achat impossible');
                      }}>
                      <Text style={[s.buttonLabel, { color: c.buttonPrimaryText }]}>Acheter</Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      style={({ pressed }) => [
                        s.outlineButton,
                        s.shopCardAction,
                        { borderColor: equipped ? c.buttonPrimaryBackground : c.inputBorder },
                        (equipped || pending) && s.shopCardActionDisabled,
                        pressed && s.shopSegmentButtonPressed,
                      ]}
                      disabled={equipped || pending}
                      onPress={async () => {
                        setActiveEntryId(sk.id);
                        setPendingActionId(sk.id);
                        const out = await equipSkin(sk.id);
                        setPendingActionId('');
                        if (!out.ok) Alert.alert('Skin', out.error || "Impossible d'équiper");
                      }}>
                      <Text style={s.outlineButtonLabel}>{equipped ? 'Équipé' : 'Équiper'}</Text>
                    </Pressable>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
      <GameTabBar />
    </View>
  );
}

