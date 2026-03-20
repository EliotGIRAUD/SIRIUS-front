import { setSetupComplete } from '@/lib/local-session';
import { useDogStore } from '@/hooks/useDogStore';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
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
  const { colors: c, styles: s } = useThemedStyles();

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
      await setSetupComplete(true);
      router.replace('/(tabs)');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={s.formFlowScreen}>
      <Text style={s.screenSectionTitle}>Ton compagnon</Text>
      <Image source={{ uri: GOLDEN_URL }} style={s.setupHeroImage} contentFit="cover" />
      <Text style={s.fieldLabel}>Nom du chien</Text>
      <TextInput
        style={s.textField}
        placeholder="ex. Sirius"
        placeholderTextColor={c.textMuted}
        value={name}
        onChangeText={setName}
      />
      <Pressable
        style={[s.primaryButton, { backgroundColor: c.buttonPrimaryBackground }, busy && s.disabled]}
        onPress={onStart}
        disabled={busy}>
        {busy ? (
          <ActivityIndicator color={c.buttonPrimaryText} />
        ) : (
          <Text style={[s.buttonLabel, { color: c.buttonPrimaryText }]}>Démarrer l&apos;aventure</Text>
        )}
      </Pressable>
    </View>
  );
}
