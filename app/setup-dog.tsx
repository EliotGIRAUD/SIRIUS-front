import { useDogStore } from '@/hooks/useDogStore';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const GOLDEN_URL =
  'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&q=80';

export default function SetupDogScreen() {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const initDog = useDogStore((s) => s.initDog);

  async function onStart() {
    const nom = name.trim();
    if (!nom) {
      Alert.alert('Nom', 'Indiquer un nom pour le chien');
      return;
    }
    setBusy(true);
    try {
      const ok = await initDog(nom, 'Golden Retriever');
      if (!ok) {
        Alert.alert('Erreur', 'POST /init-dog a échoué');
        return;
      }
      router.replace('/(tabs)');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.outer}>
      <Text style={styles.heading}>Ton compagnon</Text>
      <Image source={{ uri: GOLDEN_URL }} style={styles.photo} contentFit="cover" />
      <Text style={styles.label}>Nom du chien</Text>
      <TextInput
        style={styles.input}
        placeholder="ex. Sirius"
        value={name}
        onChangeText={setName}
      />
      <Pressable style={[styles.btn, busy && styles.btnDisabled]} onPress={onStart} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Démarrer l&apos;aventure</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    padding: 24,
    gap: 12,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  photo: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    alignSelf: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  btn: {
    backgroundColor: '#16a34a',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
