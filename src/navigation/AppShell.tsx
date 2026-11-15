import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { BottomNavBar } from '../components/BottomNavBar';
import { PushBanner } from '../components/PushBanner';
import { AmbientBackground } from '../components/ui/AmbientBackground';
import { useVybra } from '../context/VybraContext';
import { ActivityDetailModal } from '../screens/ActivityDetailModal';
import { ChatScreen } from '../screens/ChatScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { MemoryModal } from '../screens/MemoryModal';
import { MetricsScreen } from '../screens/MetricsScreen';
import { OverviewScreen } from '../screens/OverviewScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { WorkoutScreen } from '../screens/WorkoutScreen';
import { FONTS, MOTION, RADII, SHADOWS } from '../theme/tokens';
import { TabKey } from '../types/vybra';

const TAB_INDEX: Record<TabKey, number> = {
  overview: 0,
  metrics: 1,
  workout: 2,
  chat: 3,
  settings: 4,
};

function renderTabContent(tab: TabKey) {
  switch (tab) {
    case 'overview':
      return <OverviewScreen />;
    case 'metrics':
      return <MetricsScreen />;
    case 'workout':
      return <WorkoutScreen />;
    case 'chat':
      return <ChatScreen />;
    case 'settings':
      return <SettingsScreen />;
  }
}

export function AppShell() {
  const {
    theme,
    isAuthenticated,
    authScreen,
    activeTab,
    tabDirection,
    selectedActivity,
    memoryModalVisible,
    activePush,
    statusBanner,
    reducedMotion,
    setAuthScreen,
    navigateToTab,
    selectActivity,
    setMemoryModalVisible,
    dismissPush,
  } = useVybra();

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.colors.bg).catch(() => {});
  }, [theme.colors.bg]);

  const [viewportWidth, setViewportWidth] = useState(390);
  const slideX = useSharedValue(0);
  const screenOpacity = useSharedValue(1);
  const authSlideX = useSharedValue(0);

  // Hardware Back no Android respeita modais e navegação
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (memoryModalVisible) {
        setMemoryModalVisible(false);
        return true;
      }
      if (selectedActivity) {
        selectActivity(null);
        return true;
      }
      if (!isAuthenticated && authScreen === 'register') {
        setAuthScreen('login');
        return true;
      }
      if (isAuthenticated && activeTab !== 'overview') {
        navigateToTab('overview');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [
    activeTab,
    authScreen,
    isAuthenticated,
    memoryModalVisible,
    navigateToTab,
    selectActivity,
    selectedActivity,
    setAuthScreen,
    setMemoryModalVisible,
  ]);

  // Transição deslizante horizontal (esquerda/direita) ao trocar de aba no rodapé
  useEffect(() => {
    if (reducedMotion) {
      slideX.value = 0;
      screenOpacity.value = 1;
      return;
    }
    const distance = Math.min(viewportWidth * 0.08, 28);
    slideX.value = withSequence(
      withTiming(tabDirection * distance, { duration: 0 }),
      withTiming(0, {
        duration: MOTION.tabSlide,
        easing: Easing.out(Easing.cubic),
      })
    );
    screenOpacity.value = withSequence(
      withTiming(0.82, { duration: 0 }),
      withTiming(1, {
        duration: MOTION.normal,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [activeTab, reducedMotion, screenOpacity, slideX, tabDirection, viewportWidth]);

  // Transição deslizante entre Login <-> Cadastro
  useEffect(() => {
    if (reducedMotion) {
      authSlideX.value = 0;
      return;
    }
    const startOffset = authScreen === 'register' ? 32 : -32;
    authSlideX.value = withSequence(
      withTiming(startOffset, { duration: 0 }),
      withTiming(0, {
        duration: MOTION.panel,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [authScreen, authSlideX, reducedMotion]);

  const tabAnimStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
    transform: [{ translateX: slideX.value }],
  }));

  const authAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: authSlideX.value }],
  }));

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setViewportWidth(w);
  };

  const shellContent = !isAuthenticated ? (
    <Animated.View style={[styles.flex, authAnimStyle]}>
      {authScreen === 'login' ? <LoginScreen /> : <RegisterScreen />}
    </Animated.View>
  ) : (
    <View style={[styles.appColumn, { backgroundColor: theme.colors.bg }]} onLayout={handleLayout}>
      <AmbientBackground reducedMotion={reducedMotion} />

      <PushBanner
        push={activePush}
        reducedMotion={reducedMotion}
        onPressOpen={() => {
          dismissPush();
          navigateToTab('chat');
        }}
        onDismiss={dismissPush}
      />

      {statusBanner ? (
        <View
          style={[
            styles.toastWrap,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.isLight ? theme.colors.borderStrong : theme.colors.borderAccent,
            },
            theme.useNeonGlow ? SHADOWS.neonCard : SHADOWS.card,
          ]}
          pointerEvents="none"
        >
          <Text style={[styles.toastText, { color: theme.colors.textPrimary }]}>
            {statusBanner}
          </Text>
        </View>
      ) : null}

      <View style={styles.screenViewport}>
        <Animated.View style={[styles.flex, tabAnimStyle]}>
          <View key={`tab-view-${TAB_INDEX[activeTab]}`} style={styles.flex}>
            {renderTabContent(activeTab)}
          </View>
        </Animated.View>
      </View>

      <BottomNavBar
        activeTab={activeTab}
        onSelect={navigateToTab}
        reducedMotion={reducedMotion}
      />

      <ActivityDetailModal />
      <MemoryModal />
    </View>
  );

  return (
    <View
      style={[
        styles.outerFrame,
        { backgroundColor: theme.isLight ? '#E2E8F0' : '#050508' },
      ]}
    >
      <StatusBar style={theme.statusBarStyle} />
      <View
        style={[
          styles.deviceFrame,
          { backgroundColor: theme.colors.bg },
          Platform.OS === 'web'
            ? [
                styles.webPhoneConstraint,
                { borderColor: theme.colors.border },
              ]
            : undefined,
        ]}
      >
        {shellContent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerFrame: {
    flex: 1,
    alignItems: 'center',
  },
  deviceFrame: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  webPhoneConstraint: {
    maxWidth: 440,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  flex: {
    flex: 1,
  },
  appColumn: {
    flex: 1,
  },
  screenViewport: {
    flex: 1,
    overflow: 'hidden',
  },
  toastWrap: {
    position: 'absolute',
    bottom: 84,
    alignSelf: 'center',
    zIndex: 35,
    borderWidth: 1,
    borderRadius: RADII.pill,
    paddingHorizontal: 16,
    paddingVertical: 9,
    maxWidth: '90%',
  },
  toastText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12.5,
    textAlign: 'center',
  },
});
