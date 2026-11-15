import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell,
  BellOff,
  BrainCircuit,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  LogOut,
  Palette,
  Shield,
  Sliders,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { InteractivePressable } from '../components/ui/MotionPrimitives';
import { PillButton } from '../components/ui/PillButton';
import { useVybra } from '../context/VybraContext';
import { TONE_PROFILES } from '../data/mockData';
import { THEME_ORDER, VYBRA_THEMES, VybraTheme } from '../theme/themes';
import { FONTS, RADII, SHADOWS } from '../theme/tokens';
import { AgentTone } from '../types/vybra';
import { triggerLightHaptic, triggerSelectionHaptic } from '../utils/haptics';

type SettingsSection = 'root' | 'agent' | 'themes' | 'notifications' | 'privacy';

const ALL_TONES: AgentTone[] = [
  'motivador',
  'acolhedor',
  'direto',
  'analitico',
  'personalizado',
];

function AnimatedSwitch({
  value,
  onToggle,
  reducedMotion,
  accessibilityLabel,
  theme,
}: {
  value: boolean;
  onToggle: (next: boolean) => void;
  reducedMotion: boolean;
  accessibilityLabel: string;
  theme: VybraTheme;
}) {
  const thumbX = useSharedValue(value ? 20 : 2);

  useEffect(() => {
    const target = value ? 20 : 2;
    if (reducedMotion) {
      thumbX.value = target;
      return;
    }
    thumbX.value = withTiming(target, {
      duration: 190,
      easing: Easing.out(Easing.cubic),
    });
  }, [reducedMotion, thumbX, value]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }],
  }));

  return (
    <Pressable
      onPress={() => {
        triggerSelectionHaptic();
        onToggle(!value);
      }}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
      style={[
        styles.switchTrack,
        {
          backgroundColor: theme.colors.switchTrackIdle,
          borderColor: value ? theme.colors.primary : theme.colors.border,
        },
      ]}
    >
      {value ? (
        <LinearGradient
          colors={theme.gradients.brandButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <Animated.View
        style={[
          styles.switchThumb,
          { backgroundColor: theme.colors.switchThumb },
          thumbStyle,
        ]}
      />
    </Pressable>
  );
}

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const {
    theme,
    themeId,
    setThemeId,
    userName,
    userEmail,
    agentTone,
    customToneNote,
    notifications,
    privacy,
    memories,
    reducedMotion,
    setAgentTone,
    setCustomToneNote,
    updateNotificationSetting,
    updatePrivacySetting,
    setMemoryModalVisible,
    triggerSamplePush,
    showStatusBanner,
    logoutUser,
  } = useVybra();

  const [section, setSection] = useState<SettingsSection>('root');
  const sectionOpacity = useSharedValue(1);
  const sectionSlide = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;
    sectionOpacity.value = withSequence(
      withTiming(0.25, { duration: 0 }),
      withTiming(1, { duration: 190, easing: Easing.out(Easing.cubic) })
    );
    sectionSlide.value = withSequence(
      withTiming(10, { duration: 0 }),
      withTiming(0, { duration: 200, easing: Easing.out(Easing.cubic) })
    );
  }, [reducedMotion, section, sectionOpacity, sectionSlide]);

  const sectionAnimStyle = useAnimatedStyle(() => ({
    opacity: sectionOpacity.value,
    transform: [{ translateX: sectionSlide.value }],
  }));

  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  const accentTextColor = theme.isLight ? theme.colors.primary : theme.colors.secondary;
  const cardShadow = theme.isLight ? SHADOWS.card : undefined;

  const activeNotifCount = [
    notifications.trainingReminder,
    notifications.dailyEncouragement,
    notifications.recoveryAlert,
    notifications.quietHours,
  ].filter(Boolean).length;

  const menuItems: Array<{
    key: Exclude<SettingsSection, 'root'>;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
  }> = [
    {
      key: 'agent',
      title: 'Agente de IA',
      subtitle: `Tom ${TONE_PROFILES[agentTone].label}`,
      icon: <Sliders size={19} color={accentTextColor} />,
    },
    {
      key: 'themes',
      title: 'Aparência e Temas',
      subtitle: theme.name,
      icon: <Palette size={19} color={accentTextColor} />,
    },
    {
      key: 'notifications',
      title: 'Notificações Proativas',
      subtitle: notifications.leaveMeAloneToday
        ? 'Pausadas por hoje'
        : `${activeNotifCount} alertas ativos`,
      icon: <Bell size={19} color={accentTextColor} />,
    },
    {
      key: 'privacy',
      title: 'Privacidade e Memória',
      subtitle: `${memories.length} memórias · controles LGPD`,
      icon: <Shield size={19} color={accentTextColor} />,
    },
  ];

  const renderSubHeader = (title: string) => (
    <View style={styles.subHeader}>
      <InteractivePressable
        onPress={() => {
          triggerSelectionHaptic();
          setSection('root');
        }}
        style={[
          styles.backBtn,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Voltar para Configurações"
        testID="settings-back-root"
      >
        <ChevronLeft size={18} color={theme.colors.textPrimary} />
        <Text style={[styles.backBtnText, { color: theme.colors.textPrimary }]}>
          Configurações
        </Text>
      </InteractivePressable>
      <Text style={[styles.subTitle, { color: theme.colors.textPrimary }]}>
        {title}
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top + 14, 24) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[styles.sectionWrap, sectionAnimStyle]}>
        {section === 'root' ? (
          <>
            {/* Título único e limpo: Configurações (sem eyebrow e sem subtítulo anterior) */}
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              Configurações
            </Text>

            {/* Perfil */}
            <LinearGradient
              colors={theme.gradients.cardDepth}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.profileCard,
                { borderColor: theme.colors.border },
                cardShadow,
              ]}
            >
              <LinearGradient
                colors={theme.gradients.brandButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <Text style={[styles.avatarText, { color: theme.colors.onPrimary }]}>
                  {initials || 'VY'}
                </Text>
              </LinearGradient>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: theme.colors.textPrimary }]}>
                  {userName}
                </Text>
                <Text style={[styles.profileEmail, { color: theme.colors.textSecondary }]}>
                  {userEmail}
                </Text>
              </View>
            </LinearGradient>

            {/* Menu separado por categorias */}
            <View
              style={[
                styles.menuCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
                cardShadow,
              ]}
            >
              {menuItems.map((item, idx) => (
                <InteractivePressable
                  key={item.key}
                  onPress={() => {
                    triggerLightHaptic();
                    setSection(item.key);
                  }}
                  style={[
                    styles.menuRow,
                    idx > 0 ? { borderTopWidth: 1, borderTopColor: theme.colors.border } : undefined,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={item.title}
                  testID={`settings-menu-${item.key}`}
                  scaleDown={0.985}
                >
                  <View
                    style={[
                      styles.menuIconWrap,
                      {
                        backgroundColor: theme.colors.primarySoft,
                      },
                    ]}
                  >
                    {item.icon}
                  </View>
                  <View style={styles.menuTextCol}>
                    <Text style={[styles.menuTitle, { color: theme.colors.textPrimary }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.menuSub, { color: theme.colors.textSecondary }]}>
                      {item.subtitle}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={theme.colors.textMuted} />
                </InteractivePressable>
              ))}
            </View>

            {/* Sair da conta */}
            <InteractivePressable
              onPress={() => {
                triggerLightHaptic();
                logoutUser();
              }}
              style={[
                styles.logoutBtn,
                {
                  backgroundColor: theme.colors.dangerSoft,
                  borderColor: theme.colors.danger,
                },
              ]}
              accessibilityRole="button"
              testID="settings-logout-btn"
              scaleDown={0.97}
            >
              <LogOut size={17} color={theme.colors.danger} />
              <Text style={[styles.logoutText, { color: theme.colors.danger }]}>
                Sair da conta
              </Text>
            </InteractivePressable>
          </>
        ) : null}

        {/* SUBTELA 1: AGENTE DE IA */}
        {section === 'agent' ? (
          <>
            {renderSubHeader('Agente de IA')}
            <LinearGradient
              colors={theme.gradients.cardDepth}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.card, { borderColor: theme.colors.border }, cardShadow]}
            >
              <Text style={[styles.cardDesc, { color: theme.colors.textSecondary }]}>
                Define como o Vybra se comunica na Visão Geral e no Chat.
              </Text>

              <View style={styles.tonesList}>
                {ALL_TONES.map((key) => {
                  const active = agentTone === key;
                  const info = TONE_PROFILES[key];
                  return (
                    <InteractivePressable
                      key={key}
                      onPress={() => {
                        triggerSelectionHaptic();
                        setAgentTone(key);
                      }}
                      style={[
                        styles.toneRow,
                        {
                          backgroundColor: active
                            ? theme.colors.primarySoft
                            : theme.isLight
                              ? '#F8FAFC'
                              : 'rgba(255,255,255,0.03)',
                          borderColor: active
                            ? theme.colors.primary
                            : theme.colors.border,
                        },
                      ]}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                      testID={`tone-option-${key}`}
                      scaleDown={0.985}
                    >
                      <View style={styles.toneLeft}>
                        <Text style={[styles.toneTitle, { color: theme.colors.textPrimary }]}>
                          {info.label}
                        </Text>
                        <Text style={[styles.toneDesc, { color: theme.colors.textSecondary }]}>
                          {info.shortDesc}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.radioCircle,
                          {
                            borderColor: active
                              ? theme.colors.primary
                              : theme.colors.borderStrong,
                            backgroundColor: active ? theme.colors.primary : 'transparent',
                          },
                        ]}
                      >
                        {active ? (
                          <Check size={13} color={theme.colors.onPrimary} strokeWidth={3} />
                        ) : null}
                      </View>
                    </InteractivePressable>
                  );
                })}
              </View>

              {agentTone === 'personalizado' ? (
                <View style={styles.customBox}>
                  <Text style={[styles.customLabel, { color: theme.colors.textSecondary }]}>
                    Instrução do seu tom
                  </Text>
                  <TextInput
                    value={customToneNote}
                    onChangeText={setCustomToneNote}
                    style={[
                      styles.customInput,
                      {
                        backgroundColor: theme.isLight
                          ? '#F8FAFC'
                          : 'rgba(255,255,255,0.04)',
                        borderColor: theme.colors.borderStrong,
                        color: theme.colors.textPrimary,
                      },
                    ]}
                    multiline
                  />
                </View>
              ) : null}

              <View
                style={[
                  styles.previewBox,
                  {
                    backgroundColor: theme.isLight
                      ? '#F8FAFC'
                      : 'rgba(255,255,255,0.03)',
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text style={[styles.previewLabel, { color: accentTextColor }]}>
                  EXEMPLO NESTE TOM
                </Text>
                <Text style={[styles.previewQuote, { color: theme.colors.textPrimary }]}>
                  {TONE_PROFILES[agentTone].sampleQuote}
                </Text>
              </View>
            </LinearGradient>
          </>
        ) : null}

        {/* SUBTELA 2: APARÊNCIA E TEMAS */}
        {section === 'themes' ? (
          <>
            {renderSubHeader('Aparência e Temas')}
            <LinearGradient
              colors={theme.gradients.cardDepth}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.card, { borderColor: theme.colors.border }, cardShadow]}
            >
              <Text style={[styles.cardDesc, { color: theme.colors.textSecondary }]}>
                Escolha a paleta do aplicativo. O tema branco remove cores neon para leitura clara diurna.
              </Text>

              <View style={styles.themesGrid}>
                {THEME_ORDER.map((id) => {
                  const candidate = VYBRA_THEMES[id];
                  const active = themeId === id;
                  return (
                    <InteractivePressable
                      key={id}
                      onPress={() => {
                        triggerLightHaptic();
                        setThemeId(id);
                      }}
                      style={[
                        styles.themeOptionCard,
                        {
                          backgroundColor: candidate.colors.bgElevated,
                          borderColor: active
                            ? candidate.colors.primary
                            : theme.colors.borderStrong,
                          borderWidth: active ? 2 : 1,
                        },
                      ]}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                      accessibilityLabel={`Tema ${candidate.name}`}
                      testID={`theme-option-${id}`}
                      scaleDown={0.98}
                    >
                      <View style={styles.themeRow}>
                        <View style={styles.swatchRow}>
                          {candidate.previewSwatches.map((hex, idx) => (
                            <View
                              key={`${id}-${idx}`}
                              style={[
                                styles.swatchCircle,
                                {
                                  backgroundColor: hex,
                                  borderColor: candidate.isLight
                                    ? '#CBD5E1'
                                    : 'rgba(255,255,255,0.22)',
                                },
                              ]}
                            />
                          ))}
                        </View>
                        <View style={styles.themeTextCol}>
                          <Text
                            style={[
                              styles.themeName,
                              { color: candidate.colors.textPrimary },
                            ]}
                          >
                            {candidate.name}
                          </Text>
                          <Text
                            style={[
                              styles.themeSub,
                              { color: candidate.colors.textSecondary },
                            ]}
                          >
                            {candidate.subtitle}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.radioCircle,
                            {
                              borderColor: active
                                ? candidate.colors.primary
                                : candidate.colors.borderStrong,
                              backgroundColor: active
                                ? candidate.colors.primary
                                : 'transparent',
                            },
                          ]}
                        >
                          {active ? (
                            <Check
                              size={13}
                              color={candidate.colors.onPrimary}
                              strokeWidth={3}
                            />
                          ) : null}
                        </View>
                      </View>
                    </InteractivePressable>
                  );
                })}
              </View>
            </LinearGradient>
          </>
        ) : null}

        {/* SUBTELA 3: NOTIFICAÇÕES PROATIVAS */}
        {section === 'notifications' ? (
          <>
            {renderSubHeader('Notificações Proativas')}
            <LinearGradient
              colors={theme.gradients.cardDepth}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.card, { borderColor: theme.colors.border }, cardShadow]}
            >
              <View style={styles.settingRow}>
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingName, { color: theme.colors.textPrimary }]}>
                    Lembrete de treino
                  </Text>
                  <Text style={[styles.settingSub, { color: theme.colors.textSecondary }]}>
                    Chamadas inteligentes na sua janela
                  </Text>
                </View>
                <AnimatedSwitch
                  value={notifications.trainingReminder}
                  onToggle={(v) => updateNotificationSetting('trainingReminder', v)}
                  reducedMotion={reducedMotion}
                  accessibilityLabel="Lembrete de treino"
                  theme={theme}
                />
              </View>

              <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingName, { color: theme.colors.textPrimary }]}>
                    Incentivo diário
                  </Text>
                  <Text style={[styles.settingSub, { color: theme.colors.textSecondary }]}>
                    Comparações com seu histórico
                  </Text>
                </View>
                <AnimatedSwitch
                  value={notifications.dailyEncouragement}
                  onToggle={(v) => updateNotificationSetting('dailyEncouragement', v)}
                  reducedMotion={reducedMotion}
                  accessibilityLabel="Incentivo diário"
                  theme={theme}
                />
              </View>

              <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingName, { color: theme.colors.textPrimary }]}>
                    Aviso de recuperação
                  </Text>
                  <Text style={[styles.settingSub, { color: theme.colors.textSecondary }]}>
                    Alerta quando houver sobrecarga
                  </Text>
                </View>
                <AnimatedSwitch
                  value={notifications.recoveryAlert}
                  onToggle={(v) => updateNotificationSetting('recoveryAlert', v)}
                  reducedMotion={reducedMotion}
                  accessibilityLabel="Aviso de recuperação"
                  theme={theme}
                />
              </View>

              <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingName, { color: theme.colors.textPrimary }]}>
                    Horário de silêncio
                  </Text>
                  <Text style={[styles.settingSub, { color: theme.colors.textSecondary }]}>
                    Sem alertas entre 22h e 07h
                  </Text>
                </View>
                <AnimatedSwitch
                  value={notifications.quietHours}
                  onToggle={(v) => updateNotificationSetting('quietHours', v)}
                  reducedMotion={reducedMotion}
                  accessibilityLabel="Horário de silêncio"
                  theme={theme}
                />
              </View>

              <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
                <View style={styles.pauseLeft}>
                  <BellOff size={17} color={accentTextColor} />
                  <View style={styles.settingTextCol}>
                    <Text style={[styles.settingName, { color: theme.colors.textPrimary }]}>
                      Me deixe em paz hoje
                    </Text>
                    <Text style={[styles.settingSub, { color: theme.colors.textSecondary }]}>
                      Pausa toda cobrança até amanhã
                    </Text>
                  </View>
                </View>
                <AnimatedSwitch
                  value={notifications.leaveMeAloneToday}
                  onToggle={(v) => updateNotificationSetting('leaveMeAloneToday', v)}
                  reducedMotion={reducedMotion}
                  accessibilityLabel="Me deixe em paz hoje"
                  theme={theme}
                />
              </View>

              <PillButton
                label="Simular alerta agora"
                variant="secondary"
                onPress={triggerSamplePush}
                showArrow={false}
              />
            </LinearGradient>
          </>
        ) : null}

        {/* SUBTELA 4: PRIVACIDADE E MEMÓRIA */}
        {section === 'privacy' ? (
          <>
            {renderSubHeader('Privacidade e Memória')}
            <LinearGradient
              colors={theme.gradients.cardDepth}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.card, { borderColor: theme.colors.border }, cardShadow]}
            >
              <InteractivePressable
                onPress={() => {
                  triggerLightHaptic();
                  setMemoryModalVisible(true);
                }}
                style={[
                  styles.memoryLinkCard,
                  {
                    backgroundColor: theme.colors.primarySoft,
                    borderColor: theme.colors.borderAccent,
                  },
                ]}
                accessibilityRole="button"
                testID="settings-open-memory-btn"
                scaleDown={0.98}
              >
                <BrainCircuit size={19} color={accentTextColor} />
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingName, { color: theme.colors.textPrimary }]}>
                    O que o Vybra sabe sobre mim
                  </Text>
                  <Text style={[styles.settingSub, { color: theme.colors.textSecondary }]}>
                    {memories.length} memórias registradas · ver, editar ou apagar
                  </Text>
                </View>
                <ChevronRight size={17} color={accentTextColor} />
              </InteractivePressable>

              <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingName, { color: theme.colors.textPrimary }]}>
                    Ocultar zona de casa
                  </Text>
                  <Text style={[styles.settingSub, { color: theme.colors.textSecondary }]}>
                    Mascara início e fim nos mapas
                  </Text>
                </View>
                <AnimatedSwitch
                  value={privacy.hideHomeZone}
                  onToggle={(v) => updatePrivacySetting('hideHomeZone', v)}
                  reducedMotion={reducedMotion}
                  accessibilityLabel="Ocultar zona de casa"
                  theme={theme}
                />
              </View>

              <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingName, { color: theme.colors.textPrimary }]}>
                    Ocultar área de trabalho
                  </Text>
                  <Text style={[styles.settingSub, { color: theme.colors.textSecondary }]}>
                    Protege trajetos próximos ao trabalho
                  </Text>
                </View>
                <AnimatedSwitch
                  value={privacy.hideWorkZone}
                  onToggle={(v) => updatePrivacySetting('hideWorkZone', v)}
                  reducedMotion={reducedMotion}
                  accessibilityLabel="Ocultar área de trabalho"
                  theme={theme}
                />
              </View>

              <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingName, { color: theme.colors.textPrimary }]}>
                    Bloqueio por biometria ou PIN
                  </Text>
                  <Text style={[styles.settingSub, { color: theme.colors.textSecondary }]}>
                    Protege notas emocionais e histórico
                  </Text>
                </View>
                <AnimatedSwitch
                  value={privacy.biometricLock}
                  onToggle={(v) => updatePrivacySetting('biometricLock', v)}
                  reducedMotion={reducedMotion}
                  accessibilityLabel="Bloqueio por biometria"
                  theme={theme}
                />
              </View>

              <InteractivePressable
                onPress={() => {
                  triggerLightHaptic();
                  showStatusBanner('Exportação LGPD preparada em JSON e GPX.');
                }}
                style={[
                  styles.exportBtn,
                  {
                    backgroundColor: theme.colors.surfaceMuted,
                    borderColor: theme.colors.borderStrong,
                  },
                ]}
              >
                <Download size={16} color={accentTextColor} />
                <Text style={[styles.exportBtnText, { color: theme.colors.textPrimary }]}>
                  Exportar meus dados (LGPD)
                </Text>
              </InteractivePressable>
            </LinearGradient>
          </>
        ) : null}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 28,
  },
  sectionWrap: {
    gap: 16,
  },
  title: {
    fontFamily: FONTS.extraBold,
    fontSize: 27,
    letterSpacing: -0.5,
  },
  subHeader: {
    gap: 10,
    alignItems: 'flex-start',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  backBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
  },
  subTitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 24,
    letterSpacing: -0.4,
  },
  profileCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FONTS.extraBold,
    fontSize: 17,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  profileEmail: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
  },
  menuCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextCol: {
    flex: 1,
    gap: 2,
  },
  menuTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  menuSub: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
  },
  card: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  cardDesc: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  tonesList: {
    gap: 8,
  },
  toneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 13,
  },
  toneLeft: {
    flex: 1,
    gap: 2,
  },
  toneTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  toneDesc: {
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customBox: {
    gap: 6,
  },
  customLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
  },
  customInput: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 12,
    fontFamily: FONTS.regular,
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  previewBox: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  previewLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10.5,
    letterSpacing: 1.1,
  },
  previewQuote: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  themesGrid: {
    gap: 10,
  },
  themeOptionCard: {
    borderRadius: RADII.md,
    padding: 13,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  swatchCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
  },
  themeTextCol: {
    flex: 1,
    gap: 1,
  },
  themeName: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
  },
  themeSub: {
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 12,
  },
  settingTextCol: {
    flex: 1,
    gap: 2,
  },
  settingName: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
  },
  settingSub: {
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  pauseLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  switchTrack: {
    width: 46,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  memoryLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 13,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingVertical: 12,
    marginTop: 4,
  },
  exportBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: RADII.pill,
    borderWidth: 1,
    minHeight: 50,
    marginTop: 4,
  },
  logoutText: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
  },
});
