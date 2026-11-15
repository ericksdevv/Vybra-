import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, Text, View } from 'react-native';
import { useVybra } from '../../context/VybraContext';
import { FONTS, SHADOWS } from '../../theme/tokens';

const OFFICIAL_ICON = require('../../../assets/vybra-icon-official.png');
const OFFICIAL_WORDMARK = require('../../../assets/vybra-wordmark-official.png');
const OFFICIAL_WORDMARK_DARK = require('../../../assets/vybra-wordmark-dark.png');
const OFFICIAL_RUNNER = require('../../../assets/vybra-runner-hero.png');

interface VybraMarkProps {
  size?: number;
  glow?: boolean;
}

/**
 * Ícone oficial do Vybra extraído diretamente da arte enviada pelo usuário.
 */
export function VybraIconMark({ size = 64, glow = true }: VybraMarkProps) {
  const { theme } = useVybra();
  const borderRadius = Math.round(size * 0.23);
  const showGlow = glow && theme.useNeonGlow;

  return (
    <View
      style={[
        styles.iconWrap,
        {
          width: size,
          height: size,
          borderRadius,
          borderColor: theme.isLight ? theme.colors.borderStrong : theme.colors.borderAccent,
        },
        showGlow ? SHADOWS.neonTile : SHADOWS.card,
      ]}
    >
      <Image
        source={OFFICIAL_ICON}
        style={{ width: size, height: size, borderRadius }}
        resizeMode="contain"
        accessibilityLabel="Ícone oficial do Vybra"
      />
    </View>
  );
}

interface VybraWordmarkProps {
  compact?: boolean;
  height?: number;
  variant?: 'light' | 'dark';
}

/**
 * Wordmark oficial "Vybra" adaptado ao contraste do tema ativo.
 */
export function VybraWordmark({ compact = false, height, variant }: VybraWordmarkProps) {
  const { theme } = useVybra();
  const resolvedVariant = variant ?? theme.wordmarkVariant;
  const targetH = height ?? (compact ? 29 : 44);
  const targetW = Math.round(targetH * (294 / 83));

  return (
    <View style={styles.wordmarkRow} accessibilityLabel="Vybra">
      <Image
        source={resolvedVariant === 'dark' ? OFFICIAL_WORDMARK_DARK : OFFICIAL_WORDMARK}
        style={{ width: targetW, height: targetH }}
        resizeMode="contain"
      />
    </View>
  );
}

/**
 * Arte oficial do corredor iluminado da prancha de marca.
 */
export function VybraRunnerArtwork({
  width = 210,
  height = 183,
  style,
}: {
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      source={OFFICIAL_RUNNER}
      style={[{ width, height }, style]}
      resizeMode="contain"
    />
  );
}

export function VybraBrandLockup({
  showSlogan = true,
  iconSize = 76,
  wordmarkHeight = 46,
}: {
  showSlogan?: boolean;
  iconSize?: number;
  wordmarkHeight?: number;
}) {
  const { theme } = useVybra();

  return (
    <View style={styles.lockupWrap}>
      <VybraIconMark size={iconSize} glow />
      <View
        style={[
          styles.lockupDivider,
          {
            height: Math.round(iconSize * 0.78),
            backgroundColor: theme.colors.borderStrong,
          },
        ]}
      />
      <View style={styles.lockupTextCol}>
        <VybraWordmark height={wordmarkHeight} />
        {showSlogan ? (
          <Text style={[styles.slogan, { color: theme.colors.textSecondary }]}>
            CORRA. EVOLUA. SUPERE-SE.
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    backgroundColor: '#0E0D16',
    borderWidth: 1,
    overflow: 'hidden',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockupWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  lockupDivider: {
    width: 1,
  },
  lockupTextCol: {
    justifyContent: 'center',
    gap: 5,
  },
  slogan: {
    fontFamily: FONTS.semiBold,
    fontSize: 9.5,
    letterSpacing: 2.3,
  },
});
