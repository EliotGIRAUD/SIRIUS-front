import { createThemedStyles } from '@/constants/theme-styles';
import { Colors, type ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMemo } from 'react';

export function useThemedStyles(): { colors: ThemeColors; styles: ReturnType<typeof createThemedStyles> } {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const styles = useMemo(() => createThemedStyles(colors), [colors]);
  return { colors, styles };
}
