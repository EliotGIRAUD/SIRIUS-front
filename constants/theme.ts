/**
 * Global palette — single place to define brand and base colors.
 * `Colors.light` / `Colors.dark` are derived from these for screens and components.
 */

import { Platform } from "react-native";

export const Palette = {
  /** Brand accent — all filled/outline CTAs derive from this via `buttonPrimary*`. */
  primary: "#3B090C",
  onPrimary: "#FFEFDF",
  /** Main app shell background (non-onboarding). */
  appBackground: "#FBE4CE",
  /** Brand dark text / button tone. */
  brandInk: "#3B090C",
  /** Input fill in auth forms. */
  fieldTint: "#3B090C0D",
  /** Input text / placeholder muted tone. */
  fieldTextMuted: "#3B090C80",
  /** Onboarding dedicated palette. */
  onboardingBackground: "#3B090C",
  onboardingText: "#FBE4CE",
  onboardingGlow: "rgba(251,228,206,0.08)",
  secondary: "#6366f1",
  onSecondary: "#ffffff",
  success: "#16a34a",
  onSuccess: "#ffffff",

  background: "#FBE4CE",
  surface: "#3B090C0D",
  surfaceElevated: "#FFEFDF",
  text: "#3B090C",
  textMuted: "#3B090C80",
  textSubtle: "#64748b",
  border: "#3B090C0D",
  borderStrong: "#cbd5e1",

  icon: "#687076",
  health: "#22c55e",
  healthTrack: "#e2e8f0",
  /** Circular HUD track — readable on pastel sky / hills (not flat UI). */
  statRingTrack: "rgba(30, 41, 59, 0.55)",
  healthLabel: "#334155",
  coin: "#ca8a04",
  gem: "#a855f7",
  /** Food / faim bar fill on dashboard. */
  foodBarFill: "#ea580c",
  /** Water / eau ring on dashboard. */
  waterBarFill: "#0369a1",
  buttonGhostBg: "#e5e7eb",
  buttonGhostText: "#6b7280",

  templateParallaxLight: "#D0D0D0",
  templateParallaxIconMuted: "#808080",

  /** Layered dashboard scene (SVG) — light mode. */
  sceneSkyTop: "#38bdf8",
  sceneSkyBottom: "#e0f2fe",
  sceneHillFar: "#94a3b8",
  sceneHillMid: "#78716c",
  sceneGround: "#86efac",
  sceneGroundShadow: "#4ade80",
  /** Simple vector dog silhouette. */
  dogVectorBody: "#a16207",
  dogVectorBodyLight: "#ca8a04",
  dogVectorSnout: "#fdba74",
  dogVectorNose: "#451a03",
  dogVectorTongue: "#fdba74",
  dark: {
    primaryAsTint: "#ffffff",
    background: "#FBE4CE",
    surface: "#0f172a",
    surfaceElevated: "#1e293b",
    text: "#ECEDEE",
    textMuted: "#9BA1A6",
    textSubtle: "#94a3b8",
    border: "#334155",
    borderStrong: "#475569",
    icon: "#9BA1A6",
    health: "#4ade80",
    healthTrack: "#334155",
    statRingTrack: "rgba(248, 250, 252, 0.4)",
    healthLabel: "#cbd5e1",
    coin: "#facc15",
    gem: "#c084fc",
    foodBarFill: "#fb923c",
    waterBarFill: "#7dd3fc",
    buttonGhostBg: "#374151",
    buttonGhostText: "#9ca3af",
    link: "#6ec5e0",
    templateParallaxDark: "#353636",

    sceneSkyTop: "#0e7490",
    sceneSkyBottom: "#164e63",
    sceneHillFar: "#475569",
    sceneHillMid: "#334155",
    sceneGround: "#166534",
    sceneGroundShadow: "#14532d",
    dogVectorBody: "#ca8a04",
    dogVectorBodyLight: "#eab308",
    dogVectorSnout: "#fde68a",
    dogVectorNose: "#1c1917",
    dogVectorTongue: "#fd8ae8",
  },
} as const;

function lightColors() {
  const p = Palette;
  return {
    text: p.brandInk,
    textMuted: p.fieldTextMuted,
    background: p.appBackground,
    tint: p.primary,
    link: p.primary,
    icon: p.icon,
    tabIconDefault: p.icon,
    tabIconSelected: p.primary,

    buttonPrimaryBackground: p.primary,
    buttonPrimaryText: p.onPrimary,
    buttonSecondaryBackground: p.primary,
    buttonSecondaryText: p.onPrimary,
    buttonPositiveBackground: p.primary,
    buttonPositiveText: p.onPrimary,
    buttonGhostBackground: p.buttonGhostBg,
    buttonGhostText: p.buttonGhostText,
    inputBorder: p.fieldTint,
    inputBackground: p.fieldTint,
    onboardingBackground: p.onboardingBackground,
    onboardingText: p.onboardingText,
    onboardingGlow: p.onboardingGlow,

    /** Same as `background` — full-screen canvas (dashboard, settings, etc.). */
    gameSurface: p.background,
    gameStageBorder: p.borderStrong,
    gameStageBackground: p.border,
    hudPillBackground: p.surfaceElevated,
    hudPillBorder: p.border,
    healthTrack: p.healthTrack,
    statRingTrack: p.statRingTrack,
    healthFill: p.health,
    healthLabel: p.healthLabel,
    coinAccent: p.coin,
    gemAccent: p.gem,
    foodBarFill: p.foodBarFill,
    waterBarFill: p.waterBarFill,
    tabBarBackground: p.surfaceElevated,
    tabBarBorder: p.border,
    tabBarLabel: p.textSubtle,

    parallaxHeaderBackground: p.templateParallaxLight,
    parallaxIconMuted: p.templateParallaxIconMuted,

    sceneSkyTop: p.sceneSkyTop,
    sceneSkyBottom: p.sceneSkyBottom,
    sceneHillFar: p.sceneHillFar,
    sceneHillMid: p.sceneHillMid,
    sceneGround: p.sceneGround,
    sceneGroundShadow: p.sceneGroundShadow,
    dogVectorBody: p.dogVectorBody,
    dogVectorBodyLight: p.dogVectorBodyLight,
    dogVectorSnout: p.dogVectorSnout,
    dogVectorNose: p.dogVectorNose,
    dogVectorTongue: p.dogVectorTongue,
  } as const;
}

function darkColors() {
  const p = Palette;
  const d = p.dark;
  return {
    text: d.text,
    textMuted: d.textMuted,
    background: d.background,
    tint: d.primaryAsTint,
    link: d.link,
    icon: d.icon,
    tabIconDefault: d.icon,
    tabIconSelected: d.primaryAsTint,

    buttonPrimaryBackground: p.primary,
    buttonPrimaryText: p.onPrimary,
    buttonSecondaryBackground: p.primary,
    buttonSecondaryText: p.onPrimary,
    buttonPositiveBackground: p.primary,
    buttonPositiveText: p.onPrimary,
    buttonGhostBackground: d.buttonGhostBg,
    buttonGhostText: d.buttonGhostText,
    inputBorder: d.border,
    inputBackground: d.surface,
    onboardingBackground: p.onboardingBackground,
    onboardingText: p.onboardingText,
    onboardingGlow: p.onboardingGlow,

    gameSurface: d.background,
    gameStageBorder: d.borderStrong,
    gameStageBackground: d.surfaceElevated,
    hudPillBackground: d.surfaceElevated,
    hudPillBorder: d.border,
    healthTrack: d.healthTrack,
    statRingTrack: d.statRingTrack,
    healthFill: d.health,
    healthLabel: d.healthLabel,
    coinAccent: d.coin,
    gemAccent: d.gem,
    foodBarFill: d.foodBarFill,
    waterBarFill: d.waterBarFill,
    tabBarBackground: d.surfaceElevated,
    tabBarBorder: d.border,
    tabBarLabel: d.textSubtle,

    parallaxHeaderBackground: d.templateParallaxDark,
    parallaxIconMuted: p.templateParallaxIconMuted,

    sceneSkyTop: d.sceneSkyTop,
    sceneSkyBottom: d.sceneSkyBottom,
    sceneHillFar: d.sceneHillFar,
    sceneHillMid: d.sceneHillMid,
    sceneGround: d.sceneGround,
    sceneGroundShadow: d.sceneGroundShadow,
    dogVectorBody: d.dogVectorBody,
    dogVectorBodyLight: d.dogVectorBodyLight,
    dogVectorSnout: d.dogVectorSnout,
    dogVectorNose: d.dogVectorNose,
    dogVectorTongue: d.dogVectorTongue,
  } as const;
}

export const Colors = {
  light: lightColors(),
  dark: darkColors(),
};

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = (typeof Colors)[ColorScheme];

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
