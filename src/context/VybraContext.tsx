import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AccessibilityInfo } from 'react-native';
import {
  ACHIEVEMENTS_MOCK,
  ACTIVITIES_MOCK,
  INITIAL_CHAT_MESSAGES,
  MEMORY_FACTS_MOCK,
  PUSH_SAMPLES,
  SPORTS_META,
  TONE_PROFILES,
} from '../data/mockData';
import { VYBRA_THEMES, VybraTheme } from '../theme/themes';
import {
  Achievement,
  Activity,
  AgentTone,
  AuthScreen,
  ChatMessage,
  CheckInState,
  MemoryFact,
  NotificationSettings,
  PrivacySettings,
  PushNotificationData,
  SportType,
  TabKey,
  ThemeId,
  WorkoutReport,
} from '../types/vybra';

const TAB_ORDER: TabKey[] = ['overview', 'metrics', 'workout', 'chat', 'settings'];

interface VybraContextValue {
  userName: string;
  userEmail: string;
  favoriteSport: SportType;
  isAuthenticated: boolean;
  authScreen: AuthScreen;
  activeTab: TabKey;
  previousTab: TabKey;
  tabDirection: 1 | -1;
  themeId: ThemeId;
  theme: VybraTheme;
  agentTone: AgentTone;
  customToneNote: string;
  checkIn: CheckInState;
  activities: Activity[];
  selectedActivity: Activity | null;
  achievements: Achievement[];
  memories: MemoryFact[];
  memoryModalVisible: boolean;
  chatMessages: ChatMessage[];
  isAgentTyping: boolean;
  workoutReports: WorkoutReport[];
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  activePush: PushNotificationData | null;
  statusBanner: string | null;
  reducedMotion: boolean;
  setThemeId: (themeId: ThemeId) => void;
  setAuthScreen: (screen: AuthScreen) => void;
  loginUser: (email?: string, name?: string) => void;
  registerUser: (payload: {
    name: string;
    email: string;
    sport: SportType;
    tone: AgentTone;
  }) => void;
  logoutUser: () => void;
  navigateToTab: (tab: TabKey) => void;
  setAgentTone: (tone: AgentTone) => void;
  setCustomToneNote: (note: string) => void;
  updateCheckIn: (patch: Partial<CheckInState>) => void;
  selectActivity: (activity: Activity | null) => void;
  addCompletedWorkout: (workout: {
    sport: SportType;
    distanceKm: number;
    durationSec: number;
    paceLabel: string;
    elevationGainM: number;
    reportSummary?: string;
  }) => void;
  sendWorkoutReport: (sport: SportType, elapsedLabel: string, text: string) => void;
  clearWorkoutReports: () => void;
  toggleAiChallenge: (accepted: boolean) => void;
  setMemoryModalVisible: (visible: boolean) => void;
  removeMemoryFact: (id: string) => void;
  addMemoryFact: (text: string, layer: MemoryFact['layer']) => void;
  sendChatMessage: (text: string) => void;
  updateNotificationSetting: (key: keyof NotificationSettings, value: boolean) => void;
  updatePrivacySetting: (key: keyof PrivacySettings, value: boolean) => void;
  triggerSamplePush: () => void;
  dismissPush: () => void;
  showStatusBanner: (message: string) => void;
}

const VybraContext = createContext<VybraContextValue | null>(null);

function formatReplyForTone(tone: AgentTone, topic: string): ChatMessage {
  const now = new Date();
  const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;
  const lower = topic.toLowerCase();

  if (lower.includes('não consegui') || lower.includes('nao consegui') || lower.includes('difícil') || lower.includes('dificil') || lower.includes('cansad')) {
    return {
      id: `msg-${Date.now()}`,
      sender: 'agent',
      text: TONE_PROFILES[tone].difficultDayReply,
      timestamp,
    };
  }

  if (lower.includes('ontem') || lower.includes('menos')) {
    const textByTone: Record<AgentTone, string> = {
      motivador:
        'Ontem você fechou 7,52 km com o ritmo 14s/km mais rápido que sua média! Menos volume, mas com qualidade lá em cima — é assim que se ganha velocidade sem quebrar.',
      acolhedor:
        'Comparando com sexta (8,8 km), ontem foi um pouco mais curto (7,52 km), porém bem mais fluido. Você respeitou seu ritmo e terminou forte sem sobrecarregar o joelho.',
      direto:
        'Sexta: 8,8 km a 4:58/km. Sábado: 7,52 km a 4:52/km. Volume 14% menor, intensidade 6s/km mais rápida e FC média 4 bpm menor.',
      analitico:
        'Sua distância caiu de 8,8 km para 7,52 km, mas a eficiência aeróbica subiu: pace melhorou de 4:58 para 4:52/km com FC média menor (154 vs 158 bpm).',
      personalizado:
        'Foi estratégico: sexta você rodou mais longo (8,8 km) e sábado puxou um pouco mais rápido em 7,52 km. Equilíbrio perfeito para sua meta dos 10k.',
    };
    return {
      id: `msg-${Date.now()}`,
      sender: 'agent',
      text: textByTone[tone],
      timestamp,
      metricCard: {
        leftLabel: 'Sexta-feira',
        leftValue: '8,80 km · 4:58',
        rightLabel: 'Sábado',
        rightValue: '7,52 km · 4:52',
        deltaLabel: '-6s/km com menor FC',
        positive: true,
      },
    };
  }

  if (lower.includes('pace') || lower.includes('subiu') || lower.includes('quarta')) {
    const textByTone: Record<AgentTone, string> = {
      motivador:
        'Na quarta o pace subiu para 5:16/km porque você encarou +145m de subida com apenas 5h20 de sono. Mesmo assim você foi lá e fez! Hoje você já respondeu baixando para 4:52/km.',
      acolhedor:
        'Na quarta você tinha dormido pouco (5h20) e pegou um percurso bem mais inclinado. O pace mais alto mostra que você dosou o esforço em vez de desistir.',
      direto:
        'Causa do pace 5:16/km na quarta: sono 5h20 (-2h da sua média), altimetria +145m e calor de 28°C. Sem queda de condicionamento.',
      analitico:
        'Cruzando seu histórico: <6h de sono eleva sua FC em ~7 bpm e reduz seu ritmo em ~13s/km. Somado ao ganho de 145m na quarta, o 5:16/km foi esperado.',
      personalizado:
        'Lembra que quarta estava quente e você dormiu pouco? Aquele 5:16/km com subida valeu como treino de força mental. No sábado você já voou!',
    };
    return {
      id: `msg-${Date.now()}`,
      sender: 'agent',
      text: textByTone[tone],
      timestamp,
    };
  }

  if (lower.includes('semana') || lower.includes('evolução') || lower.includes('evolucao') || lower.includes('resumo')) {
    return {
      id: `msg-${Date.now()}`,
      sender: 'agent',
      text: `Você acumulou 32,4 km de 40 km planejados esta semana, com 4 treinos e 397m de ganho de elevação. Seu pace caiu de 5:24/km no início do mês para 4:52/km ontem!`,
      timestamp,
      metricCard: {
        leftLabel: 'Início do mês',
        leftValue: '5:24 /km',
        rightLabel: 'Último treino',
        rightValue: '4:52 /km',
        deltaLabel: '-32s /km no mês',
        positive: true,
      },
    };
  }

  const genericReplies: Record<AgentTone, string> = {
    motivador:
      'Tô acompanhando seus números de perto: 32,4 km na semana e ritmo em queda constante! Quer que eu monte um treino leve de 5 km para hoje?',
    acolhedor:
      'Estou aqui com você, no seu tempo. Pelos seus registros recentes, você está evoluindo com consistência e cuidando bem da recuperação.',
    direto:
      'Resumo atual: 32,4/40 km na semana, melhor pace recente 4:52/km, carga controlada. Próximo passo sugerido: 5 km leves em Z2.',
    analitico:
      'Baseado nas suas últimas 6 sessões, sua tendência de pace é de melhora de 5,3% e sua carga aguda/crônica está em zona segura (1,08).',
    personalizado:
      'Anotado! Tudo alinhado com sua meta dos 10k em março e proteção ao joelho direito. Como você quer encarar o treino de hoje?',
  };

  return {
    id: `msg-${Date.now()}`,
    sender: 'agent',
    text: genericReplies[tone],
    timestamp,
  };
}

export function VybraProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState('Erick Anderson');
  const [userEmail, setUserEmail] = useState('erick@vybra.run');
  const [favoriteSport, setFavoriteSport] = useState<SportType>('corrida');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [previousTab, setPreviousTab] = useState<TabKey>('overview');
  const [tabDirection, setTabDirection] = useState<1 | -1>(1);
  const [themeId, setThemeIdState] = useState<ThemeId>('vybra-neon');
  const [agentTone, setAgentTone] = useState<AgentTone>('motivador');
  const [customToneNote, setCustomToneNote] = useState(
    'Direto quando eu estiver empolgado, acolhedor nos dias cansados.'
  );
  const [checkIn, setCheckIn] = useState<CheckInState>({
    energy: 4,
    sleepHours: '7h30',
    mood: 'Ótimo',
    difficultDayActive: false,
  });
  const [activities, setActivities] = useState<Activity[]>(ACTIVITIES_MOCK);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS_MOCK);
  const [memories, setMemories] = useState<MemoryFact[]>(MEMORY_FACTS_MOCK);
  const [memoryModalVisible, setMemoryModalVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [workoutReports, setWorkoutReports] = useState<WorkoutReport[]>([]);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    trainingReminder: true,
    dailyEncouragement: true,
    recoveryAlert: true,
    quietHours: true,
    leaveMeAloneToday: false,
  });
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    hideHomeZone: true,
    hideWorkZone: false,
    biometricLock: true,
  });
  const [activePush, setActivePush] = useState<PushNotificationData | null>(null);
  const [pushIndex, setPushIndex] = useState(0);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReducedMotion(enabled);
      })
      .catch(() => {});

    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => setReducedMotion(enabled)
    );

    return () => {
      mounted = false;
      sub.remove();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
    };
  }, []);

  const showStatusBanner = useCallback((message: string) => {
    setStatusBanner(message);
    if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
    statusTimeoutRef.current = setTimeout(() => {
      setStatusBanner(null);
    }, 2600);
  }, []);

  const loginUser = useCallback((email?: string, name?: string) => {
    if (email?.trim()) setUserEmail(email.trim());
    if (name?.trim()) setUserName(name.trim());
    setActiveTab('overview');
    setPreviousTab('overview');
    setIsAuthenticated(true);
  }, []);

  const registerUser = useCallback(
    (payload: { name: string; email: string; sport: SportType; tone: AgentTone }) => {
      if (payload.name.trim()) setUserName(payload.name.trim());
      if (payload.email.trim()) setUserEmail(payload.email.trim());
      setFavoriteSport(payload.sport);
      setAgentTone(payload.tone);
      setActiveTab('overview');
      setPreviousTab('overview');
      setIsAuthenticated(true);
    },
    []
  );

  const logoutUser = useCallback(() => {
    setSelectedActivity(null);
    setMemoryModalVisible(false);
    setActivePush(null);
    setAuthScreen('login');
    setIsAuthenticated(false);
  }, []);

  const navigateToTab = useCallback(
    (nextTab: TabKey) => {
      if (nextTab === activeTab) return;
      const currentIdx = TAB_ORDER.indexOf(activeTab);
      const nextIdx = TAB_ORDER.indexOf(nextTab);
      setTabDirection(nextIdx > currentIdx ? 1 : -1);
      setPreviousTab(activeTab);
      setActiveTab(nextTab);
    },
    [activeTab]
  );

  const updateCheckIn = useCallback((patch: Partial<CheckInState>) => {
    setCheckIn((prev) => ({ ...prev, ...patch }));
  }, []);

  const selectActivity = useCallback((activity: Activity | null) => {
    setSelectedActivity(activity);
  }, []);

  const setThemeId = useCallback(
    (nextTheme: ThemeId) => {
      setThemeIdState(nextTheme);
      showStatusBanner(`Tema "${VYBRA_THEMES[nextTheme].name}" aplicado.`);
    },
    [showStatusBanner]
  );

  const addCompletedWorkout = useCallback(
    (workout: {
      sport: SportType;
      distanceKm: number;
      durationSec: number;
      paceLabel: string;
      elevationGainM: number;
      reportSummary?: string;
    }) => {
      const mins = Math.floor(workout.durationSec / 60);
      const secs = workout.durationSec % 60;
      const titleBySport: Record<SportType, string> = {
        corrida: 'Corrida Ao Vivo Registrada',
        ciclismo: 'Pedal Registrado no Vybra',
        treino: 'Treino de Força Concluído',
        caminhada: 'Caminhada de Recuperação',
        trilha: 'Trilha Técnica Registrada',
        natacao: 'Sessão de Natação Registrada',
      };
      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        title: titleBySport[workout.sport],
        sport: workout.sport,
        dateLabel: 'Hoje',
        timeLabel: 'Agora',
        distanceKm: Number(workout.distanceKm.toFixed(2)),
        durationLabel: `${mins}m ${String(secs).padStart(2, '0')}s`,
        paceLabel: workout.paceLabel,
        paceSeconds: 290,
        elevationGainM: workout.elevationGainM,
        avgHeartRate: 152,
        cadenceSpm: 172,
        calories: Math.max(45, Math.round(Math.max(0.8, workout.distanceKm) * 68)),
        routePath:
          'M 24 128 C 46 82, 82 56, 118 68 C 154 80, 166 36, 206 40 C 248 44, 278 90, 256 122 C 234 152, 164 134, 128 148 C 90 162, 52 152, 24 128',
        elevationSeries: [12, 16, 24, 30, 38, 42, 48, 56, 62, 70, 74, 82],
        paceSeries: [302, 298, 295, 294, 292, 290, 289, 287, 286, 285, 284, 282],
        splits: [
          { km: 1, pace: workout.paceLabel.replace(' /km', ''), elevationDelta: 12, heartRate: 148 },
        ],
        comparisonHeadline: 'Novo registro adicionado ao seu histórico pessoal',
        comparisonDeltaLabel: 'Ao vivo',
        isBetterThanYesterday: true,
        aiSummary: workout.reportSummary
          ? `Registro salvo com suas observações: "${workout.reportSummary}"`
          : 'Ótimo registro! Esse treino já entrou na sua linha do tempo para comparação nas próximas sessões.',
      };
      setActivities((prev) => [newActivity, ...prev]);
      showStatusBanner('Treino salvo no seu histórico local (simulado).');
    },
    [showStatusBanner]
  );

  const sendWorkoutReport = useCallback(
    (sport: SportType, elapsedLabel: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const now = new Date();
      const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;
      const sportMeta = SPORTS_META.find((item) => item.id === sport);
      const sportLabel = sportMeta?.label ?? sport;

      const entry: WorkoutReport = {
        id: `rep-${Date.now()}`,
        sport,
        elapsedLabel,
        timestamp,
        text: trimmed,
      };
      setWorkoutReports((prev) => [entry, ...prev]);

      const userMsg: ChatMessage = {
        id: `user-rep-${Date.now()}`,
        sender: 'user',
        text: `[${sportLabel} · ${elapsedLabel}] ${trimmed}`,
        timestamp,
      };

      const lower = trimmed.toLowerCase();
      let replyText = '';
      if (sport === 'treino') {
        replyText =
          'Anotado! Salvei os exercícios, carga e descanso desse treino na sua linha do tempo para acompanhar sua evolução de força na próxima sessão.';
      } else if (lower.includes('dor') || lower.includes('joelho') || lower.includes('desconforto')) {
        replyText =
          'Boa decisão registrar na hora. Se o incômodo continuar, reduza o ritmo ou encerre sem culpa — eu ajusto o volume de amanhã para preservar seu joelho.';
      } else if (lower.includes('par') || lower.includes('pausa') || lower.includes('água') || lower.includes('hidrat')) {
        replyText =
          'Pausa anotada no contexto da sessão! Eu desconsidero essa parada na leitura do seu esforço para manter o acompanhamento fiel ao seu ritmo real.';
      } else {
        replyText = `Reporte de ${sportLabel} (${elapsedLabel}) salvo! Vou cruzar essa percepção com suas métricas quando você encerrar a sessão.`;
      }

      const agentMsg: ChatMessage = {
        id: `agent-rep-${Date.now() + 1}`,
        sender: 'agent',
        text: replyText,
        timestamp,
      };

      setChatMessages((prev) => [...prev, userMsg, agentMsg]);
      showStatusBanner('Reporte enviado para o chat com o Vybra.');
    },
    [showStatusBanner]
  );

  const clearWorkoutReports = useCallback(() => {
    setWorkoutReports([]);
  }, []);

  const toggleAiChallenge = useCallback(
    (accepted: boolean) => {
      setAchievements((prev) =>
        prev.map((a) => (a.isAiSuggested ? { ...a, aiAccepted: accepted } : a))
      );
      showStatusBanner(
        accepted
          ? 'Desafio personalizado aceito! O Vybra vai acompanhar sua meta.'
          : 'Desafio dispensado sem pressão.'
      );
    },
    [showStatusBanner]
  );

  const removeMemoryFact = useCallback(
    (id: string) => {
      setMemories((prev) => prev.filter((item) => item.id !== id));
      showStatusBanner('Memória removida com transparência.');
    },
    [showStatusBanner]
  );

  const addMemoryFact = useCallback(
    (text: string, layer: MemoryFact['layer']) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const fact: MemoryFact = {
        id: `mem-${Date.now()}`,
        layer,
        text: trimmed,
        date: 'Agora mesmo',
      };
      setMemories((prev) => [fact, ...prev]);
      showStatusBanner('Fato salvo na memória do Vybra.');
    },
    [showStatusBanner]
  );

  const sendChatMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const now = new Date();
      const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: trimmed,
        timestamp,
      };
      setChatMessages((prev) => [...prev, userMsg]);
      setIsAgentTyping(true);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        const reply = formatReplyForTone(agentTone, trimmed);
        setChatMessages((prev) => [...prev, reply]);
        setIsAgentTyping(false);
      }, 650);
    },
    [agentTone]
  );

  const updateNotificationSetting = useCallback(
    (key: keyof NotificationSettings, value: boolean) => {
      setNotifications((prev) => ({ ...prev, [key]: value }));
      if (key === 'leaveMeAloneToday' && value) {
        setActivePush(null);
        showStatusBanner('Notificações pausadas por hoje. Bom descanso!');
      }
    },
    [showStatusBanner]
  );

  const updatePrivacySetting = useCallback(
    (key: keyof PrivacySettings, value: boolean) => {
      setPrivacy((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const triggerSamplePush = useCallback(() => {
    if (notifications.leaveMeAloneToday) {
      showStatusBanner('Modo "Me deixe em paz hoje" está ativo.');
      return;
    }
    const next = PUSH_SAMPLES[pushIndex % PUSH_SAMPLES.length];
    setPushIndex((prev) => prev + 1);
    setActivePush(next);
  }, [notifications.leaveMeAloneToday, pushIndex, showStatusBanner]);

  const dismissPush = useCallback(() => {
    setActivePush(null);
  }, []);

  const theme = useMemo(() => VYBRA_THEMES[themeId], [themeId]);

  const value = useMemo<VybraContextValue>(
    () => ({
      userName,
      userEmail,
      favoriteSport,
      isAuthenticated,
      authScreen,
      activeTab,
      previousTab,
      tabDirection,
      themeId,
      theme,
      agentTone,
      customToneNote,
      checkIn,
      activities,
      selectedActivity,
      achievements,
      memories,
      memoryModalVisible,
      chatMessages,
      isAgentTyping,
      workoutReports,
      notifications,
      privacy,
      activePush,
      statusBanner,
      reducedMotion,
      setThemeId,
      setAuthScreen,
      loginUser,
      registerUser,
      logoutUser,
      navigateToTab,
      setAgentTone,
      setCustomToneNote,
      updateCheckIn,
      selectActivity,
      addCompletedWorkout,
      sendWorkoutReport,
      clearWorkoutReports,
      toggleAiChallenge,
      setMemoryModalVisible,
      removeMemoryFact,
      addMemoryFact,
      sendChatMessage,
      updateNotificationSetting,
      updatePrivacySetting,
      triggerSamplePush,
      dismissPush,
      showStatusBanner,
    }),
    [
      userName,
      userEmail,
      favoriteSport,
      isAuthenticated,
      authScreen,
      activeTab,
      previousTab,
      tabDirection,
      themeId,
      theme,
      agentTone,
      customToneNote,
      checkIn,
      activities,
      selectedActivity,
      achievements,
      memories,
      memoryModalVisible,
      chatMessages,
      isAgentTyping,
      workoutReports,
      notifications,
      privacy,
      activePush,
      statusBanner,
      reducedMotion,
      setThemeId,
      loginUser,
      registerUser,
      logoutUser,
      navigateToTab,
      updateCheckIn,
      selectActivity,
      addCompletedWorkout,
      sendWorkoutReport,
      clearWorkoutReports,
      toggleAiChallenge,
      removeMemoryFact,
      addMemoryFact,
      sendChatMessage,
      updateNotificationSetting,
      updatePrivacySetting,
      triggerSamplePush,
      dismissPush,
      showStatusBanner,
    ]
  );

  return <VybraContext.Provider value={value}>{children}</VybraContext.Provider>;
}

export function useVybra() {
  const ctx = useContext(VybraContext);
  if (!ctx) throw new Error('useVybra must be used within VybraProvider');
  return ctx;
}
