import { useDogStore } from '@/hooks/useDogStore';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const hunger = useDogStore((s) => s.hunger);
  const health = useDogStore((s) => s.health);
  const wallet_gold = useDogStore((s) => s.wallet_gold);
  const wallet_gems = useDogStore((s) => s.wallet_gems);
  const fetchDog = useDogStore((s) => s.fetchDog);

  useEffect(() => {
    fetchDog();
  }, [fetchDog]);

  return (
    <View style={styles.container}>
      <Text style={styles.line}>Faim : {hunger}</Text>
      <Text style={styles.line}>Santé : {health}</Text>
      <Text style={styles.line}>Or : {wallet_gold}</Text>
      <Text style={styles.line}>Gemmes : {wallet_gems}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  line: {
    fontSize: 16,
  },
});
