import { LinearGradient } from 'expo-linear-gradient';
import { Bell, X } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVybra } from '../context/VybraContext';
import { FONTS, RADII, SHADOWS } from '../theme/tokens';
import { PushNotificationData } from '../types/vybra';

export function PushBanner({
  push,
  reducedMotion,
  onPressOpen,
  onDismiss,
}: {
  push: PushNotificationData | null;
  reducedMotion: boolean;
  onPressOpen: () => void;
  onDismiss: () => void;
}) {
  const { theme } = useVybra();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-140);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (push) {
      if (reducedMotion) {
        translateY.value = 0;
        opacity.value = 1;
        return;
      }
      translateY.value = withTiming(0, {
        duration: 240,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(1, { duration: 190 });
    } else {
      translateY.value = withTiming(-140, {
        duration: 180,
        easing: Easing.in(Easing.cubic),
      });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [opacity, push, reducedMotion, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!push) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { top: Math.max(insets.top, 12) },
        animStyle,
      ]}
    >
      <Pressable
        onPress={onPressOpen}
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.isLight ? theme.colors.borderStrong : theme.colors.borderAccent,
          },
          theme.useNeonGlow ? SHADOWS.neonCard : SHADOWS.card,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${push.title}: ${push.body}. Tocar para abrir o chat.`}
      >
        <LinearGradient
          colors={theme.gradients.brandButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconCircle}
        >
          <Bell size={16} color={theme.colors.onPrimary} />
        </LinearGradient>
        <View style={styles.textCol}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]} numberOfLines={1}>
            {push.title}
          </Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {push.body}
          </Text>
        </View>
        <Pressable
          onPress={onDismiss}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Fechar notificação"
          style={styles.closeBtn}
        >
          <X size={16} color={theme.colors.textSecondary} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 14,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
  },
  body: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    marginTop: 2,
    lineHeight: 17,
  },
  closeBtn: {
    padding: 4,
  },
});
