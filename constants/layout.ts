/**
 * Global spacing, type scale, and radii — change here to adjust layout app-wide.
 * Colors stay in `theme.ts` / `Palette`; pair with `useThemedStyles()` for full styles.
 */

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  buttonPaddingY: 14,
  tabBarPaddingTop: 10,
  gameScreenPaddingX: 20,
  modalPadding: 20,
  modalLinkMarginTop: 15,
  modalLinkPaddingY: 15,
  safeBottomMin: 12,
} as const;

export const Radius = {
  xs: 6,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  xxl: 20,
  pill: 999,
} as const;

export const FontSize = {
  caption: 13,
  label: 14,
  callout: 15,
  body: 16,
  md: 17,
  lg: 18,
  subtitle: 20,
  section: 22,
  title: 32,
  hero: 28,
} as const;

export const LineHeight = {
  body: 24,
  title: 32,
  link: 30,
} as const;

export const Opacity = {
  disabled: 0.7,
  ghostButton: 0.5,
  subtitle: 0.8,
} as const;

export const Layout = {
  gameStageMaxWidth: 320,
  setupImageHeight: 220,
  healthBarHeight: 14,
  healthBarRadius: 7,
  hudIconSize: 22,
  tabBarIconSize: 26,
  parallaxContentPadding: 32,
  parallaxContentGap: 16,
} as const;
