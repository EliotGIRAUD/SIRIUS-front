import { useThemedStyles } from '@/hooks/use-themed-styles';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

const STEPS = [
  {
    title: 'Engagement quotidien',
    text: 'Ton chien a besoin de toi chaque jour pour manger, boire et rester en bonne santé.',
  },
  {
    title: 'Impact de tes choix',
    text: 'Le mode difficile et le mode démo changent la vitesse de perte des besoins.',
  },
  {
    title: 'Ressources limitées',
    text: 'Tu dois gérer ton or, tes objets et tes actions pour garder ton compagnon en forme.',
  },
  {
    title: 'Prêt pour le choix',
    text: 'Tu vas maintenant choisir la race et le nom de ton chien pour démarrer l’aventure.',
  },
];

export default function CheckupScreen() {
  const [step, setStep] = useState(0);
  const { colors: c, styles: s } = useThemedStyles();

  const isLast = step >= STEPS.length - 1;
  const current = STEPS[step];
  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

  function onNext() {
    if (isLast) {
      router.replace('/setup-dog');
      return;
    }
    setStep((v) => Math.min(STEPS.length - 1, v + 1));
  }

  return (
    <View style={s.formFlowScreen}>
      <Text style={s.screenSectionTitle}>Check-up avant adoption</Text>
      <Text style={s.fieldLabel}>
        Étape {step + 1}/{STEPS.length}
      </Text>
      <View
        style={{
          height: 10,
          width: '100%',
          borderRadius: 999,
          backgroundColor: c.inputBorder,
          overflow: 'hidden',
          marginBottom: 18,
        }}>
        <View
          style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: c.buttonPrimaryBackground,
          }}
        />
      </View>

      <View
        style={{
          width: '100%',
          borderRadius: 18,
          borderWidth: 1,
          borderColor: c.inputBorder,
          backgroundColor: c.background,
          padding: 16,
          marginBottom: 18,
        }}>
        <Text style={[s.fieldLabel, { marginBottom: 8 }]}>{current.title}</Text>
        <Text style={{ color: c.text, fontSize: 15, lineHeight: 22 }}>{current.text}</Text>
      </View>

      <Pressable style={[s.primaryButton, { backgroundColor: c.buttonPrimaryBackground }]} onPress={onNext}>
        <Text style={[s.buttonLabel, { color: c.buttonPrimaryText }]}>
          {isLast ? 'Passer au choix du chien' : 'Suivant'}
        </Text>
      </Pressable>
    </View>
  );
}
