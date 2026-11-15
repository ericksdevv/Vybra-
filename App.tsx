import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect } from 'react';
import { ActivityIndicator, Image, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { VybraProvider } from './src/context/VybraContext';
import { AppShell } from './src/navigation/AppShell';
import { COLORS } from './src/theme/tokens';

const SPLASH_ICON = require('./assets/vybra-icon-official.png');

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(COLORS.background).catch(() => {});

    // No Web, injeta Plus Jakarta Sans oficial e remove outline azul padrão do navegador ao clicar
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'vybra-web-global-styles';
      if (!document.getElementById(styleId)) {
        const styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.textContent = `
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700;1,800&display=swap');
          * {
            -webkit-tap-highlight-color: transparent;
            box-sizing: border-box;
          }
          div:focus, button:focus, [role="button"]:focus, [role="tab"]:focus, [role="switch"]:focus, [role="radio"]:focus, input:focus, textarea:focus {
            outline: none !important;
          }
        `;
        document.head.appendChild(styleEl);
      }
    }
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.splashFallback}>
        <StatusBar style="light" />
        <Image
          source={SPLASH_ICON}
          style={{ width: 76, height: 76, borderRadius: 18 }}
          resizeMode="contain"
          accessibilityLabel="Ícone oficial do Vybra"
        />
        <ActivityIndicator
          color={COLORS.secondary}
          size="small"
          style={styles.loader}
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <VybraProvider>
        <AppShell />
      </VybraProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashFallback: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  loader: {
    marginTop: 6,
  },
});
