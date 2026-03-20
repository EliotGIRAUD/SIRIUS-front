import { useDogStore } from '@/hooks/useDogStore';
import { Image } from 'expo-image';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DOG_URL =
  'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&q=80';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const dogName = useDogStore((s) => s.dogName);
  const hunger = useDogStore((s) => s.hunger);
  const health = useDogStore((s) => s.health);
  const maladie = useDogStore((s) => s.maladie);
  const wallet_gold = useDogStore((s) => s.wallet_gold);
  const wallet_gems = useDogStore((s) => s.wallet_gems);
  const fetchDog = useDogStore((s) => s.fetchDog);

  useEffect(() => {
    fetchDog();
  }, [fetchDog]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.dogTitle}>{dogName || 'Chien'}</Text>
        <Image source={{ uri: DOG_URL }} style={styles.photo} contentFit="cover" />
        <View style={styles.card}>
          <Text style={styles.row}>Santé : {health}</Text>
          <Text style={styles.row}>Maladie : {maladie}</Text>
          <Text style={styles.row}>Faim : {hunger}</Text>
          <View style={styles.divider} />
          <Text style={styles.row}>Portefeuille or : {wallet_gold}</Text>
          <Text style={styles.row}>Portefeuille gemmes : {wallet_gems}</Text>
        </View>
      </ScrollView>
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable style={styles.navItem} onPress={() => {}}>
          <Text style={styles.navText}>Accueil</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => {}}>
          <Text style={styles.navText}>Budget</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => {}}>
          <Text style={styles.navText}>Paramètres</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  dogTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 16,
    alignSelf: 'center',
  },
  photo: {
    width: '100%',
    maxWidth: 320,
    height: 240,
    borderRadius: 16,
    marginBottom: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  row: {
    fontSize: 17,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  navText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
});
