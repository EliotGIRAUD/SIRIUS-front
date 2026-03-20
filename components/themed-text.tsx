import { FontSize, LineHeight } from '@/constants/layout';
import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, Text, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const colorName = type === 'link' ? 'link' : 'text';
  const color = useThemeColor({ light: lightColor, dark: darkColor }, colorName);

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: FontSize.body,
    lineHeight: LineHeight.body,
  },
  defaultSemiBold: {
    fontSize: FontSize.body,
    lineHeight: LineHeight.body,
    fontWeight: '600',
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: 'bold',
    lineHeight: LineHeight.title,
  },
  subtitle: {
    fontSize: FontSize.subtitle,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: LineHeight.link,
    fontSize: FontSize.body,
  },
});
