import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVybra } from '../context/VybraContext';
import { VybraTheme } from '../theme/themes';
import { FONTS } from '../theme/tokens';
import { TabKey } from '../types/vybra';
import { triggerSelectionHaptic } from '../utils/haptics';
import {
  GearIcon,
  OverviewIcon,
  PulseChatIcon,
  RunnerActionIcon,
  StatsBarsIcon,
} from './brand/SportIcons';

interface NavItem {
  key: TabKey;
  label: string;
  a11yLabel: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Geral', a11yLabel: 'Visão Geral' },
  { key: 'metrics', label: 'Métricas', a11yLabel: 'Métricas e Conquistas' },
  { key: 'workout', label: 'Treinar', a11yLabel: 'Treinar agora' },
  { key: 'chat', label: 'Chat', a11yLabel: 'Chat com o agente Vybra' },
  { key: 'settings', label: 'Ajustes', a11yLabel: 'Configurações' },
];

const INDICATOR_WIDTH = 28;

function NavIcon({
  tab,
  active,
  theme,
}: {
  tab: TabKey;
  active: boolean;
  theme: VybraTheme;
}) {
  const activeColor = theme.isLight ? theme.colors.primary : theme.colors.textPrimary;
  const idleColor = theme.colors.textSecondary;
  const color = active ? activeColor : idleColor;
  const accent = active
    ? theme.isLight
      ? theme.colors.primary
      : theme.colors.secondary
    : theme.colors.textMuted;
  const size = 21;

  switch (tab) {
    case 'overview':
      return <OverviewIcon size={size} color={color} accentColor={accent} />;
    case 'metrics':
      return <StatsBarsIcon size={size} color={color} accentColor={accent} />;
    case 'workout':
      return <RunnerActionIcon size={size + 1} color={color} accentColor={accent} />;
    case 'chat':
      return <PulseChatIcon size={size} color={color} accentColor={accent} />;
    case 'settings':
      return <GearIcon size={size} color={color} />;
  }
}

export function BottomNavBar({
  activeTab,
  onSelect,
  reducedMotion,
}: {
  activeTab: TabKey;
  onSelect: (tab: TabKey) => void;
  reducedMotion: boolean;
}) {
  const { theme } = useVybra();
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const activeIndex = Math.max(
    0,
    NAV_ITEMS.findIndex((item) => item.key === activeTab)
  );
  const tabWidth = barWidth > 0 ? barWidth / NAV_ITEMS.length : 0;

  const indicatorX = useSharedValue(0);

  useEffect(() => {
    if (tabWidth <= 0) return;
    const targetX = activeIndex * tabWidth + (tabWidth - INDICATOR_WIDTH) / 2;
    if (reducedMotion) {
      indicatorX.value = targetX;
      return;
    }
    indicatorX.value = withTiming(targetX, {
      duration: 210,
      easing: Easing.out(Easing.cubic),
    });
  }, [activeIndex, indicatorX, reducedMotion, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    const w = event.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - barWidth) > 0.5) {
      setBarWidth(w);
    }
  };

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: theme.colors.footerBg,
          borderTopColor: theme.colors.footerBorder,
        },
        theme.isLight ? styles.lightShadow : undefined,
      ]}
    >
      <View style={styles.barInner} onLayout={handleLayout}>
        {tabWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.topIndicatorSlot, indicatorStyle]}
          >
            <LinearGradient
              colors={theme.gradients.brandButton}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.topIndicatorBar}
            />
          </Animated.View>
        ) : null}

        {NAV_ITEMS.map((item) => (
          <NavBarButton
            key={item.key}
            item={item}
            active={item.key === activeTab}
            theme={theme}
            onPress={() => {
              triggerSelectionHaptic();
              onSelect(item.key);
            }}
          />
        ))}
      </View>
    </View>
  );
}

function NavBarButton({
  item,
  active,
  theme,
  onPress,
}: {
  item: NavItem;
  active: boolean;
  theme: VybraTheme;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const activeTextColor = theme.isLight ? theme.colors.primary : theme.colors.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.92, { duration: 85, easing: Easing.out(Easing.quad) });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) });
      }}
      accessibilityRole="tab"
      accessibilityLabel={item.a11yLabel}
      accessibilityState={{ selected: active }}
      style={styles.tabBtn}
    >
      <Animated.View style={[styles.tabContent, animStyle]}>
        <NavIcon tab={item.key} active={active} theme={theme} />
        <Text
          style={[
            styles.tabLabel,
            {
              color: active ? activeTextColor : theme.colors.textSecondary,
              fontFamily: active ? FONTS.bold : FONTS.medium,
            },
          ]}
          numberOfLines={1}
        >
          {item.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    paddingHorizontal: 6,
  },
  lightShadow: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 6,
  },
  barInner: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    paddingTop: 10,
    paddingBottom: 4,
  },
  topIndicatorSlot: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: INDICATOR_WIDTH,
    height: 3,
  },
  topIndicatorBar: {
    width: INDICATOR_WIDTH,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  tabBtn: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 10.5,
    letterSpacing: 0.15,
  },
});
