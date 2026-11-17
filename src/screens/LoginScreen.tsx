import { LinearGradient } from 'expo-linear-gradient';
import { Check, Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CyclingIcon,
  DumbbellIcon,
  ShoeRunIcon,
  StatsBarsIcon,
  TrailMountainIcon,
  TrophyIcon,
} from '../components/brand/SportIcons';
import {
  VybraBrandLockup,
  VybraIconMark,
  VybraRunnerArtwork,
} from '../components/brand/VybraLogo';
import { AmbientBackground } from '../components/ui/AmbientBackground';
import { PillButton } from '../components/ui/PillButton';
import { useVybra } from '../context/VybraContext';
import { BRAND_TEXT } from '../data/mockData';
import {
  COLORS,
  FONTS,
  GRADIENTS,
  MOTION,
  RADII,
  SHADOWS,
} from '../theme/tokens';
import { triggerSuccessHaptic } from '../utils/haptics';

const BRAND_PILLARS = [
  { key: 'corrida', label: 'Corrida', Icon: ShoeRunIcon },
  { key: 'ciclismo', label: 'Ciclismo', Icon: CyclingIcon },
  { key: 'treino', label: 'Treino', Icon: DumbbellIcon },
  { key: 'trilha', label: 'Trilha', Icon: TrailMountainIcon },
  { key: 'stats', label: 'Estatísticas', Icon: StatsBarsIcon },
  { key: 'conquistas', label: 'Conquistas', Icon: TrophyIcon },
] as const;

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { theme, loginUser, setAuthScreen, reducedMotion } = useVybra();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const heroOpacity = useSharedValue(reducedMotion ? 1 : 0);
  const heroY = useSharedValue(reducedMotion ? 0 : 16);
  const formOpacity = useSharedValue(reducedMotion ? 1 : 0);
  const formY = useSharedValue(reducedMotion ? 0 : 20);

  const overlayOpacity = useSharedValue(0);
  const burstScale = useSharedValue(0.84);
  const ringRotate = useSharedValue(0);

  useEffect(() => {
    if (!reducedMotion) {
      heroOpacity.value = withTiming(1, {
        duration: 420,
        easing: Easing.out(Easing.cubic),
      });
      heroY.value = withTiming(0, {
        duration: 420,
        easing: Easing.out(Easing.cubic),
      });

      formOpacity.value = withDelay(
        110,
        withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) })
      );
      formY.value = withDelay(
        110,
        withTiming(0, { duration: 420, easing: Easing.out(Easing.cubic) })
      );
    }

    return () => {
      if (authTimerRef.current) clearTimeout(authTimerRef.current);
    };
  }, [formOpacity, formY, heroOpacity, heroY, reducedMotion]);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
    transform: [{ translateY: heroY.value }],
  }));

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formY.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const burstStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: burstScale.value },
      { rotate: `${ringRotate.value}deg` },
    ],
  }));

  const handleLogin = async () => {
    if (isAuthenticating) return;
    if (!email.trim() || !password.trim()) {
      setErrorText('Informe e-mail e senha para entrar.');
      return;
    }
    setErrorText(null);
    setIsAuthenticating(true);

    // Confere e-mail e senha no banco do aparelho ANTES de qualquer animação.
    const result = await loginUser(email, password);
    if (!result.ok) {
      setIsAuthenticating(false);
      setErrorText(result.error);
      return;
    }

    triggerSuccessHaptic();

    if (reducedMotion) {
      result.enter();
      return;
    }

    overlayOpacity.value = withTiming(1, { duration: 200 });
    burstScale.value = withTiming(1, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
    ringRotate.value = withTiming(360, {
      duration: 720,
      easing: Easing.out(Easing.cubic),
    });

    authTimerRef.current = setTimeout(() => {
      result.enter();
    }, MOTION.celebrate + 150);
  };

  const accentTextColor = theme.isLight ? theme.colors.primary : theme.colors.secondary;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <AmbientBackground variant="login" reducedMotion={reducedMotion} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top + 18, 32),
              paddingBottom: Math.max(insets.bottom + 24, 34),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Bloco Hero com Ícone + Wordmark oficiais + Arte do Corredor da foto */}
          <Animated.View style={[styles.heroBlock, heroStyle]}>
            <VybraBrandLockup iconSize={74} wordmarkHeight={45} />

            <LinearGradient
              colors={['rgba(26, 20, 44, 0.94)', 'rgba(13, 12, 22, 0.98)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroShowcaseCard}
            >
              <VybraRunnerArtwork
                width={195}
                height={170}
                style={styles.runnerArt}
              />
              <View style={styles.quoteRow}>
                <LinearGradient
                  colors={theme.gradients.brandButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.quoteBar}
                />
                <Text style={styles.quoteText}>
                  {BRAND_TEXT.taglinePrefix}
                  <Text style={styles.quoteHighlight}>
                    {BRAND_TEXT.taglineHighlight}
                  </Text>
                </Text>
              </View>

              {/* Faixa dos 6 ícones oficiais da prancha */}
              <View style={styles.pillarsStrip}>
                {BRAND_PILLARS.map(({ key, label, Icon }, idx) => (
                  <React.Fragment key={key}>
                    {idx > 0 ? <View style={styles.pillarDivider} /> : null}
                    <View style={styles.pillarItem}>
                      <Icon size={17} color={COLORS.white} accentColor={COLORS.secondary} />
                      <Text style={styles.pillarLabel} numberOfLines={1}>
                        {label}
                      </Text>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Card de Login */}
          <Animated.View style={formStyle}>
            <LinearGradient
              colors={theme.gradients.cardDepth}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.formCard,
                { borderColor: theme.colors.border },
                theme.isLight ? SHADOWS.card : undefined,
              ]}
            >
              <View style={styles.formHeaderRow}>
                <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                  Entrar na sua jornada
                </Text>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                  E-mail
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      backgroundColor: theme.isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                      borderColor:
                        focusedField === 'email'
                          ? theme.colors.primary
                          : theme.colors.borderStrong,
                    },
                  ]}
                >
                  <Mail
                    size={18}
                    color={
                      focusedField === 'email' ? accentTextColor : theme.colors.textSecondary
                    }
                  />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="seu@email.com"
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[styles.input, { color: theme.colors.textPrimary }]}
                    accessibilityLabel="E-mail"
                    testID="login-email-input"
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                  Senha
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      backgroundColor: theme.isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                      borderColor:
                        focusedField === 'password'
                          ? theme.colors.primary
                          : theme.colors.borderStrong,
                    },
                  ]}
                >
                  <Lock
                    size={18}
                    color={
                      focusedField === 'password' ? accentTextColor : theme.colors.textSecondary
                    }
                  />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Sua senha"
                    placeholderTextColor={theme.colors.textMuted}
                    secureTextEntry={!showPassword}
                    style={[styles.input, { color: theme.colors.textPrimary }]}
                    accessibilityLabel="Senha"
                    testID="login-password-input"
                  />
                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color={theme.colors.textSecondary} />
                    ) : (
                      <Eye size={18} color={theme.colors.textSecondary} />
                    )}
                  </Pressable>
                </View>
              </View>

              {errorText ? (
                <Text
                  style={[styles.errorText, { color: theme.colors.danger }]}
                  accessibilityLiveRegion="polite"
                >
                  {errorText}
                </Text>
              ) : null}

              <View style={styles.actionsBlock}>
                <PillButton
                  label={isAuthenticating ? 'Entrando...' : 'Entrar'}
                  onPress={() => {
                    void handleLogin();
                  }}
                  loading={isAuthenticating}
                  testID="login-submit-btn"
                />
                <PillButton
                  label="Criar conta"
                  variant="secondary"
                  onPress={() => setAuthScreen('register')}
                  disabled={isAuthenticating}
                  testID="goto-register-btn"
                />
              </View>
            </LinearGradient>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Overlay animado ao concluir login */}
      {isAuthenticating ? (
        <Animated.View
          style={[
            styles.successOverlay,
            { backgroundColor: theme.colors.overlayBackdrop },
            overlayStyle,
          ]}
        >
          <Animated.View style={[styles.successRingOuter, burstStyle]}>
            <LinearGradient
              colors={theme.gradients.brandButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.successRing}
            >
              <View style={[styles.successInner, { backgroundColor: theme.colors.bg }]}>
                <VybraIconMark size={68} />
              </View>
            </LinearGradient>
          </Animated.View>
          <View
            style={[
              styles.successBadge,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.borderAccent,
              },
            ]}
          >
            <Check size={16} color={theme.colors.success} strokeWidth={2.8} />
            <Text style={[styles.successText, { color: theme.colors.textPrimary }]}>
              Ritmo sincronizado
            </Text>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    justifyContent: 'center',
    gap: 18,
  },
  heroBlock: {
    gap: 16,
  },
  heroShowcaseCard: {
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.borderSpecular,
    padding: 16,
    overflow: 'hidden',
    minHeight: 168,
    justifyContent: 'space-between',
    gap: 16,
    ...SHADOWS.neonCard,
  },
  runnerArt: {
    position: 'absolute',
    right: -8,
    top: -6,
    opacity: 0.92,
  },
  quoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    maxWidth: '68%',
    paddingTop: 4,
  },
  quoteBar: {
    width: 3.5,
    alignSelf: 'stretch',
    borderRadius: 2,
  },
  quoteText: {
    flex: 1,
    fontFamily: FONTS.extraBold,
    fontSize: 19,
    lineHeight: 25,
    letterSpacing: -0.4,
    color: COLORS.white,
  },
  quoteHighlight: {
    color: COLORS.secondary,
  },
  pillarsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(11, 11, 16, 0.78)',
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 9,
    paddingHorizontal: 6,
  },
  pillarDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
  },
  pillarItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  pillarLabel: {
    fontFamily: FONTS.medium,
    fontSize: 8.5,
    color: COLORS.grayLight,
  },
  formCard: {
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.borderSpecular,
    padding: 20,
    gap: 14,
    ...SHADOWS.neonCard,
  },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionCap: {
    fontFamily: FONTS.bold,
    fontSize: 10.5,
    letterSpacing: 1.5,
    color: COLORS.secondary,
  },
  cardTitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 20,
    color: COLORS.white,
    marginTop: 2,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.grayLight,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(14, 13, 24, 0.92)',
    borderRadius: RADII.md,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.11)',
    paddingHorizontal: 14,
    minHeight: 48,
  },
  inputFocused: {
    borderColor: COLORS.secondary,
    backgroundColor: '#1B162E',
  },
  input: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 14.5,
    color: COLORS.white,
    paddingVertical: 10,
  },
  errorText: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: COLORS.danger,
  },
  actionsBlock: {
    gap: 11,
    marginTop: 4,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 11, 15, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    zIndex: 50,
  },
  successRingOuter: {
    width: 118,
    height: 118,
    borderRadius: 59,
    padding: 4,
    ...SHADOWS.neonButton,
  },
  successRing: {
    flex: 1,
    borderRadius: 59,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successInner: {
    flex: 1,
    width: '100%',
    borderRadius: 55,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.borderPurple,
  },
  successText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.white,
  },
});
