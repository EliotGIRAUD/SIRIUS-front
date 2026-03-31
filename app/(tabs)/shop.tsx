import { GameTabBar } from '@/components/game-tab-bar';
import { ThemedText } from '@/components/themed-text';
import { useDogStore } from '@/hooks/useDogStore';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
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

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            style={[
              s.outlineButton,
              { flex: 1, borderColor: isItems ? c.buttonPrimaryBackground : c.inputBorder },
            ]}
            onPress={() => setTab('items')}>
            <Text style={s.outlineButtonLabel}>Items</Text>
          </Pressable>
          <Pressable
            style={[
              s.outlineButton,
              { flex: 1, borderColor: !isItems ? c.buttonPrimaryBackground : c.inputBorder },
            ]}
            onPress={() => setTab('skins')}>
            <Text style={s.outlineButtonLabel}>Skins</Text>
          </Pressable>
        </View>

        <View style={s.settingsCard}>
          <Text style={s.settingsCardLabel}>Solde</Text>
          <Text style={s.settingsCardValue}>
            Or : {wallet_gold} — Gemmes : {wallet_gems}
          </Text>
        </View>

        {isItems ? (
          <View style={{ gap: 10 }}>
            {ITEMS.map((it) => (
              <View key={it.id} style={s.settingsCard}>
                <Text style={s.settingsCardLabel}>{it.label}</Text>
                <Text style={s.settingsCardValue}>{it.priceGold} or</Text>
                <Pressable
                  style={[s.primaryButton, { backgroundColor: c.buttonPrimaryBackground, marginTop: 10 }]}
                  onPress={async () => {
                    const out = await buyConsumable(it.id, 1);
                    if (!out.ok) Alert.alert('Achat', out.error || 'Achat impossible');
                  }}>
                  <Text style={[s.buttonLabel, { color: c.buttonPrimaryText }]}>Acheter ×1</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {SKINS.map((sk) => {
              const owned = unlocked_skins.includes(sk.id);
              const equipped = active_skin_id === sk.id;
              return (
                <View key={sk.id} style={s.settingsCard}>
                  <Text style={s.settingsCardLabel}>{sk.label}</Text>
                  <Text style={s.settingsCardValue}>{sk.priceGems} gemmes</Text>
                  {!owned ? (
                    <Pressable
                      style={[s.primaryButton, { backgroundColor: c.buttonPrimaryBackground, marginTop: 10 }]}
                      onPress={async () => {
                        const out = await buySkin(sk.id);
                        if (!out.ok) Alert.alert('Achat', out.error || 'Achat impossible');
                      }}>
                      <Text style={[s.buttonLabel, { color: c.buttonPrimaryText }]}>Acheter</Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      style={[
                        s.outlineButton,
                        { marginTop: 10, borderColor: equipped ? c.buttonPrimaryBackground : c.inputBorder },
                      ]}
                      onPress={async () => {
                        const out = await equipSkin(sk.id);
                        if (!out.ok) Alert.alert('Skin', out.error || "Impossible d'équiper");
                      }}>
                      <Text style={s.outlineButtonLabel}>{equipped ? 'Équipé' : 'Équiper'}</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
      <GameTabBar />
    </View>
  );
}

