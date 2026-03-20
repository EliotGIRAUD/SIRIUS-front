import { IconSymbol } from '@/components/ui/icon-symbol';
import { Layout, Spacing } from '@/constants/layout';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import * as Haptics from 'expo-haptics';
import { Href, usePathname, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function GameTabBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { colors: c, styles: s } = useThemedStyles();

  const isSettings = pathname.includes('settings');
  const isHome = !isSettings;

  const goHome = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.replace('/(tabs)' as Href);
  };

  const goSettings = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.replace('/(tabs)/settings' as Href);
  };

  return (
    <View style={[s.gameTabBar, { paddingBottom: Math.max(insets.bottom, Spacing.safeBottomMin) }]}>
      <Pressable style={s.gameTabItem} onPress={goHome} accessibilityRole="button" accessibilityLabel="Accueil">
        <IconSymbol
          name="house.fill"
          size={Layout.tabBarIconSize}
          color={isHome ? c.buttonPrimaryBackground : c.tabBarLabel}
        />
        <Text style={[s.gameTabLabel, { color: isHome ? c.buttonPrimaryBackground : c.tabBarLabel }]}>Accueil</Text>
      </Pressable>
      <Pressable
        style={s.gameTabItem}
        onPress={goSettings}
        accessibilityRole="button"
        accessibilityLabel="Paramètres">
        <IconSymbol
          name="gearshape.fill"
          size={Layout.tabBarIconSize}
          color={isSettings ? c.buttonPrimaryBackground : c.tabBarLabel}
        />
        <Text style={[s.gameTabLabel, { color: isSettings ? c.buttonPrimaryBackground : c.tabBarLabel }]}>
          Paramètres
        </Text>
      </Pressable>
    </View>
  );
}
