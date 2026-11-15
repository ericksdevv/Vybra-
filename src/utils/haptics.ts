import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function triggerLightHaptic() {
  if (Platform.OS === 'web') return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function triggerSelectionHaptic() {
  if (Platform.OS === 'web') return;
  void Haptics.selectionAsync().catch(() => {});
}

export function triggerSuccessHaptic() {
  if (Platform.OS === 'web') return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
