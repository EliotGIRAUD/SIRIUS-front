import type { ThemeColors } from '@/constants/theme';
import { FontSize, Layout, LineHeight, Opacity, Radius, Spacing } from '@/constants/layout';
import { StyleSheet } from 'react-native';

/**
 * All shared screen/component styles derived from the active color scheme.
 * Edit `layout.ts` for spacing/type; edit `Palette` in `theme.ts` for colors.
 */
export function createThemedStyles(c: ThemeColors) {
  return StyleSheet.create({
    /** Login, setup-dog, boot — same shell (padding, gap, background). */
    formFlowScreen: {
      flex: 1,
      padding: Spacing.xl,
      gap: Spacing.md,
      justifyContent: 'center',
      backgroundColor: c.background,
    },
    /** Centers spinner on boot without affecting full-width fields on other flow screens. */
    flowBootInner: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    flowBootCaption: {
      marginTop: Spacing.lg,
      fontSize: FontSize.callout,
      fontWeight: '600',
      textAlign: 'center',
      color: c.text,
      opacity: Opacity.subtitle,
    },
    screenSectionTitle: {
      fontSize: FontSize.section,
      fontWeight: '700',
      textAlign: 'center',
      color: c.text,
    },
    fieldLabel: {
      fontSize: FontSize.label,
      fontWeight: '600',
      color: c.text,
    },
    textField: {
      borderWidth: 1,
      borderColor: c.inputBorder,
      borderRadius: Radius.sm,
      padding: Spacing.md,
      fontSize: FontSize.body,
      color: c.text,
    },
    /** Universal filled CTA — colour from `buttonPrimaryBackground` / `buttonPrimaryText`. */
    primaryButton: {
      paddingVertical: Spacing.buttonPaddingY,
      paddingHorizontal: Spacing.md,
      borderRadius: Radius.md,
      alignItems: 'center',
    },
    ghostButtonOpacity: {
      opacity: Opacity.ghostButton,
    },
    buttonLabel: {
      fontSize: FontSize.body,
      fontWeight: '600',
    },
    ghostButtonLabel: {
      fontSize: FontSize.body,
      fontWeight: '600',
    },
    setupHeroImage: {
      width: '100%',
      height: Layout.setupImageHeight,
      borderRadius: Radius.lg,
      alignSelf: 'center',
    },
    disabled: {
      opacity: Opacity.disabled,
    },

    tabScreen: {
      flex: 1,
      backgroundColor: c.background,
    },
    settingsContent: {
      flex: 1,
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.xl,
      gap: Spacing.lg,
    },
    settingsTitle: {
      marginBottom: 0,
    },
    settingsSubtitle: {
      opacity: Opacity.subtitle,
    },
    settingsCard: {
      borderRadius: Radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.inputBorder,
      backgroundColor: c.background,
      padding: Spacing.lg,
      marginTop: Spacing.sm,
    },
    settingsCardLabel: {
      fontSize: FontSize.caption,
      fontWeight: '600',
      color: c.textMuted,
    },
    settingsCardLabelSpaced: {
      marginTop: Spacing.md,
    },
    settingsCardValue: {
      fontSize: FontSize.md,
      marginTop: Spacing.xs,
      color: c.text,
    },
    outlineButton: {
      marginTop: Spacing.sm,
      paddingVertical: Spacing.buttonPaddingY,
      borderRadius: Radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.buttonPrimaryBackground,
      backgroundColor: c.background,
      alignItems: 'center',
    },
    outlineButtonLabel: {
      fontSize: FontSize.body,
      fontWeight: '600',
      color: c.buttonPrimaryBackground,
    },

    gameRoot: {
      flex: 1,
      backgroundColor: c.background,
    },
    gameMain: {
      flex: 1,
      paddingHorizontal: Spacing.gameScreenPaddingX,
      paddingBottom: Spacing.lg,
    },
    hudRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.xl,
      gap: Spacing.md,
    },
    hudPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: Radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.hudPillBorder,
      backgroundColor: c.hudPillBackground,
      flex: 1,
      maxWidth: '48%',
    },
    hudValue: {
      fontSize: FontSize.lg,
      fontWeight: '700',
      color: c.text,
    },
    dogTitle: {
      fontSize: FontSize.section,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: Spacing.lg,
      color: c.text,
    },
    gameStage: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: Layout.gameStageMaxWidth,
      aspectRatio: 1,
      borderRadius: Radius.xxl,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: c.gameStageBorder,
      backgroundColor: c.gameStageBackground,
    },
    healthBlock: {
      width: '100%',
      maxWidth: Layout.gameStageMaxWidth,
      alignSelf: 'center',
      marginTop: Spacing.xl,
      gap: Spacing.sm,
    },
    healthBarLabel: {
      fontSize: FontSize.callout,
      fontWeight: '600',
      color: c.healthLabel,
    },
    healthTrack: {
      height: Layout.healthBarHeight,
      borderRadius: Layout.healthBarRadius,
      overflow: 'hidden',
      backgroundColor: c.healthTrack,
    },
    healthFill: {
      height: '100%',
      borderRadius: Layout.healthBarRadius,
      backgroundColor: c.healthFill,
    },

    gameTabBar: {
      flexDirection: 'row',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.tabBarBorder,
      paddingTop: Spacing.tabBarPaddingTop,
      backgroundColor: c.tabBarBackground,
    },
    gameTabItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: Spacing.sm,
      gap: Spacing.xs,
    },
    gameTabLabel: {
      fontSize: FontSize.caption,
      fontWeight: '600',
    },

    modalContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.modalPadding,
    },
    modalLink: {
      marginTop: Spacing.modalLinkMarginTop,
      paddingVertical: Spacing.modalLinkPaddingY,
    },
  });
}

export type ThemedStyles = ReturnType<typeof createThemedStyles>;
