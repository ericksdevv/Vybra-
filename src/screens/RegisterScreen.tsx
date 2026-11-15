import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check, Lock, Mail, User } from 'lucide-react-native';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SportIcon } from '../components/brand/SportIcons';
import { VybraWordmark } from '../components/brand/VybraLogo';
import { AmbientBackground } from '../components/ui/AmbientBackground';
import {
  AnimatedProgressBar,
  InteractivePressable,
} from '../components/ui/MotionPrimitives';
import { PillButton } from '../components/ui/PillButton';
import { useVybra } from '../context/VybraContext';
import { SPORTS_META, TONE_PROFILES } from '../data/mockData';
import {
  COLORS,
  FONTS,
  GRADIENTS,
  RADII,
  SHADOWS,
} from '../theme/tokens';
import { AgentTone, SportType } from '../types/vybra';
import { triggerSuccessHaptic } from '../utils/haptics';

const REGISTER_TONES: AgentTone[] = ['motivador', 'acolhedor', 'direto', 'analitico'];

export function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { theme, registerUser, setAuthScreen, reducedMotion } = useVybra();

  const [name, setName] = useState('Erick Anderson');
  const [email, setEmail] = useState('erick@vybra.run');
  const [password, setPassword] = useState('vybra2026');
  const [sport, setSport] = useState<SportType>('corrida');
  const [tone, setTone] = useState<AgentTone>('motivador');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const filledSteps =
    (name.trim() ? 0.25 : 0) +
    (email.trim() ? 0.25 : 0) +
    (password.trim() ? 0.25 : 0) +
    0.25;

  const handleSubmit = () => {
    if (creating) return;
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorText('Preencha nome, e-mail e senha para continuar.');
      return;
    }
    setErrorText(null);
    setCreating(true);
    triggerSuccessHaptic();

    if (reducedMotion) {
      registerUser({ name, email, sport, tone });
      return;
    }

    timerRef.current = setTimeout(() => {
      registerUser({ name, email, sport, tone });
    }, 480);
  };

  const accentTextColor = theme.isLight ? theme.colors.primary : theme.colors.secondary;
  const cardShadow = theme.isLight ? SHADOWS.card : undefined;
  const inputSurface = theme.isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)';

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
              paddingTop: Math.max(insets.top + 16, 28),
              paddingBottom: Math.max(insets.bottom + 24, 36),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <Pressable
              onPress={() => setAuthScreen('login')}
              style={[
                styles.backBtn,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Voltar para login"
              testID="register-back-btn"
            >
              <ArrowLeft size={18} color={theme.colors.textPrimary} />
            </Pressable>
            <VybraWordmark compact />
            <View style={styles.spacer} />
          </View>

          <View style={styles.progressBlock}>
            <View style={styles.progressHeader}>
              <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                Criar sua conta
              </Text>
              <Text style={[styles.stepLabel, { color: accentTextColor }]}>
                {Math.round(filledSteps * 100)}%
              </Text>
            </View>
            <AnimatedProgressBar
              progress={filledSteps}
              height={6}
              reducedMotion={reducedMotion}
            />
          </View>

          <LinearGradient
            colors={theme.gradients.cardDepth}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, { borderColor: theme.colors.border }, cardShadow]}
          >
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                Como quer ser chamado
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  { backgroundColor: inputSurface, borderColor: theme.colors.borderStrong },
                ]}
              >
                <User size={17} color={theme.colors.textSecondary} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Seu nome"
                  placeholderTextColor={theme.colors.textMuted}
                  style={[styles.input, { color: theme.colors.textPrimary }]}
                  testID="register-name-input"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                E-mail
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  { backgroundColor: inputSurface, borderColor: theme.colors.borderStrong },
                ]}
              >
                <Mail size={17} color={theme.colors.textSecondary} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seu@email.com"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.input, { color: theme.colors.textPrimary }]}
                  testID="register-email-input"
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
                  { backgroundColor: inputSurface, borderColor: theme.colors.borderStrong },
                ]}
              >
                <Lock size={17} color={theme.colors.textSecondary} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Crie uma senha"
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry
                  style={[styles.input, { color: theme.colors.textPrimary }]}
                  testID="register-password-input"
                />
              </View>
            </View>
          </LinearGradient>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
              MODALIDADE PRINCIPAL
            </Text>
            <View style={styles.sportsGrid}>
              {SPORTS_META.map((item) => {
                const active = sport === item.id;
                return (
                  <InteractivePressable
                    key={item.id}
                    onPress={() => setSport(item.id)}
                    style={[
                      styles.sportTile,
                      {
                        backgroundColor: active
                          ? theme.colors.primarySoft
                          : theme.colors.surface,
                        borderColor: active ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    accessibilityState={{ selected: active }}
                  >
                    {active ? (
                      <LinearGradient
                        colors={theme.gradients.brandButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.sportIconBox}
                      >
                        <SportIcon
                          sport={item.id}
                          size={20}
                          color={theme.colors.onPrimary}
                          accentColor={theme.colors.onPrimary}
                        />
                      </LinearGradient>
                    ) : (
                      <View
                        style={[
                          styles.sportIconBoxIdle,
                          {
                            backgroundColor: theme.colors.surfaceMuted,
                            borderColor: theme.colors.border,
                          },
                        ]}
                      >
                        <SportIcon
                          sport={item.id}
                          size={20}
                          color={theme.colors.textPrimary}
                          accentColor={accentTextColor}
                        />
                      </View>
                    )}
                    <Text
                      style={[
                        styles.sportLabel,
                        {
                          color: active ? theme.colors.textPrimary : theme.colors.textSecondary,
                          fontFamily: active ? FONTS.bold : FONTS.medium,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </InteractivePressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
              TOM INICIAL DO AGENTE
            </Text>
            <View style={styles.tonesGrid}>
              {REGISTER_TONES.map((key) => {
                const active = tone === key;
                const info = TONE_PROFILES[key];
                return (
                  <InteractivePressable
                    key={key}
                    onPress={() => setTone(key)}
                    style={[
                      styles.toneCard,
                      {
                        backgroundColor: active
                          ? theme.colors.primarySoft
                          : theme.colors.surface,
                        borderColor: active ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    accessibilityState={{ selected: active }}
                  >
                    <View style={styles.toneHeader}>
                      <Text style={[styles.toneName, { color: theme.colors.textPrimary }]}>
                        {info.label}
                      </Text>
                      {active ? <Check size={15} color={accentTextColor} /> : null}
                    </View>
                    <Text
                      style={[styles.toneDesc, { color: theme.colors.textSecondary }]}
                      numberOfLines={2}
                    >
                      {info.shortDesc}
                    </Text>
                  </InteractivePressable>
                );
              })}
            </View>
          </View>

          {errorText ? (
            <Text style={[styles.errorText, { color: theme.colors.danger }]}>
              {errorText}
            </Text>
          ) : null}

          <PillButton
            label={creating ? 'Preparando seu painel...' : 'Começar jornada'}
            onPress={handleSubmit}
            loading={creating}
            testID="register-submit-btn"
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    gap: 18,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSpecular,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    width: 40,
  },
  progressBlock: {
    gap: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  title: {
    fontFamily: FONTS.extraBold,
    fontSize: 22,
    color: COLORS.white,
  },
  stepLabel: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.secondary,
  },
  card: {
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.borderSpecular,
    padding: 18,
    gap: 14,
    ...SHADOWS.card,
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
    backgroundColor: COLORS.surfaceInput,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 14.5,
    color: COLORS.white,
    paddingVertical: 10,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 1.2,
    color: COLORS.white,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sportTile: {
    width: '30%',
    minWidth: 92,
    flexGrow: 1,
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(19, 18, 28, 0.9)',
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  sportTileActive: {
    borderColor: COLORS.borderPurple,
    backgroundColor: '#1E1733',
    ...SHADOWS.neonCard,
  },
  sportIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.neonTile,
  },
  sportIconBoxIdle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportLabel: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.gray,
  },
  sportLabelActive: {
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  tonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  toneCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: 'rgba(19, 18, 28, 0.9)',
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    gap: 4,
  },
  toneCardActive: {
    borderColor: COLORS.borderPurple,
    backgroundColor: '#1E1733',
    ...SHADOWS.neonCard,
  },
  toneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toneName: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
    color: COLORS.white,
  },
  toneDesc: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
    lineHeight: 16,
    color: COLORS.gray,
  },
  errorText: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: COLORS.danger,
  },
});
