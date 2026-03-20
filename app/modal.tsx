import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { Link } from 'expo-router';

export default function ModalScreen() {
  const { styles: s } = useThemedStyles();

  return (
    <ThemedView style={s.modalContainer}>
      <ThemedText type="title">This is a modal</ThemedText>
      <Link href="/" dismissTo style={s.modalLink}>
        <ThemedText type="link">Go to home screen</ThemedText>
      </Link>
    </ThemedView>
  );
}
