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
  accountsRepo,
  ActivitySampleInput,
  activitiesRepo,
  chatRepo,
  checkinsRepo,
  LocalAccount,
  loadSessionAccount,
  loadUserData,
  memoriesRepo,
  newClientId,
  reportsRepo,
  sessionRepo,
  settingsRepo,
  SETTINGS_KEYS,
  todayIsoDate,
  UserDataSnapshot,
  userSettingKey,
} from '../db/database';
import { clearTokens } from '../services/authStorage';
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

/**
 * Resultado do login/cadastro.
 * ok → chame enter() para abrir o app (permite tocar a animação antes).
 */
export type AuthResult = { ok: true; enter: () => void } | { ok: false; error: string };

const DEFAULT_CHECK_IN: CheckInState = {
  energy: 4,
  sleepHours: '7h30',
  mood: 'Ótimo',
  difficultDayActive: false,
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  trainingReminder: true,
  dailyEncouragement: true,
  recoveryAlert: true,
  quietHours: true,
  leaveMeAloneToday: false,
};

const DEFAULT_PRIVACY: PrivacySettings = {
  hideHomeZone: true,
  hideWorkZone: false,
  biometricLock: true,
};

const DEFAULT_TONE_NOTE = 'Direto quando eu estiver empolgado, acolhedor nos dias cansados.';

interface VybraContextValue {
  /** Id da conta logada neste aparelho (null = ninguém logado). */
  userId: string | null;
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
  /** true quando o banco local (SQLite) abriu e os dados salvos foram carregados. */
  isDbReady: boolean;
  /** Mensagem quando o banco local não abriu (o app segue funcionando só em memória). */
  dbError: string | null;
  setThemeId: (themeId: ThemeId) => void;
  setAuthScreen: (screen: AuthScreen) => void;
  /** Confere e-mail + senha no banco local. */
  loginUser: (email: string, password: string) => Promise<AuthResult>;
  /** Cria a conta local (e-mail único) e prepara os dados dela. */
  registerUser: (payload: {
    name: string;
    email: string;
    password: string;
    sport: SportType;
    tone: AgentTone;
  }) => Promise<AuthResult>;
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
    /** Opcional: amostras GPS da sessão (Passo 4). */
    samples?: ActivitySampleInput[];
    /** Opcional: início real do treino em ISO. Padrão: agora − duração. */
    startedAtIso?: string;
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

export function VybraProvider({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  /** Exibido enquanto o banco local abre e os dados salvos são carregados. */
  fallback?: React.ReactNode;
}) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [favoriteSport, setFavoriteSport] = useState<SportType>('corrida');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [previousTab, setPreviousTab] = useState<TabKey>('overview');
  const [tabDirection, setTabDirection] = useState<1 | -1>(1);
  const [themeId, setThemeIdState] = useState<ThemeId>('vybra-neon');
  const [agentTone, setAgentTone] = useState<AgentTone>('motivador');
  const [customToneNote, setCustomToneNote] = useState(DEFAULT_TONE_NOTE);
  const [checkIn, setCheckIn] = useState<CheckInState>(DEFAULT_CHECK_IN);
  const [activities, setActivities] = useState<Activity[]>(ACTIVITIES_MOCK);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS_MOCK);
  const [memories, setMemories] = useState<MemoryFact[]>(MEMORY_FACTS_MOCK);
  const [memoryModalVisible, setMemoryModalVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [workoutReports, setWorkoutReports] = useState<WorkoutReport[]>([]);
  const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
  const [privacy, setPrivacy] = useState<PrivacySettings>(DEFAULT_PRIVACY);
  const [activePush, setActivePush] = useState<PushNotificationData | null>(null);
  const [pushIndex, setPushIndex] = useState(0);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const [isHydrated, setIsHydrated] = useState(false);
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs para ler o valor mais recente dentro de callbacks sem recriá-los.
  const dbAvailableRef = useRef(false);
  const userIdRef = useRef<string | null>(null);
  /** Só usado se o banco do aparelho não abrir: contas guardadas em memória até fechar o app. */
  const memoryAccountsRef = useRef(
    new Map<string, { name: string; password: string; sport: SportType; tone: AgentTone }>()
  );
  const checkInRef = useRef(checkIn);
  const workoutReportsRef = useRef<WorkoutReport[]>([]);
  const lastSavedProfileRef = useRef('');
  const lastSavedNotificationsRef = useRef('');
  const lastSavedPrivacyRef = useRef('');

  useEffect(() => {
    checkInRef.current = checkIn;
  }, [checkIn]);

  useEffect(() => {
    workoutReportsRef.current = workoutReports;
  }, [workoutReports]);

  /** Coloca a conta no estado (perfil, tom, tema). */
  const applyAccount = useCallback((account: LocalAccount) => {
    userIdRef.current = account.id;
    setUserId(account.id);
    setUserName(account.name);
    setUserEmail(account.email);
    setFavoriteSport(account.favoriteSport);
    setAgentTone(account.agentTone);
    setCustomToneNote(account.customToneNote);
    if (VYBRA_THEMES[account.themeId]) setThemeIdState(account.themeId);
    lastSavedProfileRef.current = JSON.stringify({
      name: account.name,
      email: account.email,
      favoriteSport: account.favoriteSport,
      agentTone: account.agentTone,
      customToneNote: account.customToneNote,
      themeId: VYBRA_THEMES[account.themeId] ? account.themeId : 'vybra-neon',
    });
  }, []);

  /** Substitui TODOS os dados da tela pelos da conta (nada da conta anterior fica). */
  const applyUserData = useCallback((data: UserDataSnapshot) => {
    const nextCheckIn = data.todayCheckIn ?? DEFAULT_CHECK_IN;
    const nextNotifications = data.notifications ?? DEFAULT_NOTIFICATIONS;
    const nextPrivacy = data.privacy ?? DEFAULT_PRIVACY;
    const accepted = data.aiChallengeAccepted;

    setActivities(data.activities);
    setMemories(data.memories);
    setChatMessages(data.chatMessages);
    setCheckIn(nextCheckIn);
    checkInRef.current = nextCheckIn;
    setNotifications(nextNotifications);
    lastSavedNotificationsRef.current = JSON.stringify(nextNotifications);
    setPrivacy(nextPrivacy);
    lastSavedPrivacyRef.current = JSON.stringify(nextPrivacy);
    setAchievements(
      ACHIEVEMENTS_MOCK.map((a) =>
        a.isAiSuggested && accepted && accepted[a.id] !== undefined
          ? { ...a, aiAccepted: accepted[a.id] }
          : a
      )
    );
    setWorkoutReports([]);
    workoutReportsRef.current = [];
    setSelectedActivity(null);
    setActiveTab('overview');
    setPreviousTab('overview');
  }, []);

  // ---------------------------------------------------------------------------
  // Carga inicial do SQLite local (offline-first)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const account = await loadSessionAccount();
        const data = account ? await loadUserData(account.id) : null;
        if (cancelled) return;

        dbAvailableRef.current = true;
        if (account && data) {
          applyAccount(account);
          applyUserData(data);
          setIsAuthenticated(true);
        }
        setIsDbReady(true);
      } catch (error) {
        console.warn('[Vybra DB] Falha ao abrir o banco local:', error);
        if (cancelled) return;
        dbAvailableRef.current = false;
        setDbError('Banco local indisponível. Os dados desta sessão não serão salvos no aparelho.');
      } finally {
        if (!cancelled) setIsHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applyAccount, applyUserData]);

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

  /** Grava no SQLite em segundo plano, sempre na conta logada. A UI já foi atualizada (otimista). */
  const persist = useCallback(
    (label: string, task: (userId: string) => Promise<unknown>) => {
      const currentUserId = userIdRef.current;
      if (!dbAvailableRef.current || !currentUserId) return;
      task(currentUserId).catch((error: unknown) => {
        console.warn(`[Vybra DB] ${label}:`, error);
        showStatusBanner('Não consegui salvar no aparelho. Tente de novo.');
      });
    },
    [showStatusBanner]
  );

  useEffect(() => {
    if (dbError) showStatusBanner(dbError);
  }, [dbError, showStatusBanner]);

  // Perfil (nome, esporte, tom, nota do tom e tema) → accounts (com debounce).
  useEffect(() => {
    if (!isDbReady || !userId) return;
    const profile = {
      name: userName,
      email: userEmail,
      favoriteSport,
      agentTone,
      customToneNote,
      themeId,
    };
    const json = JSON.stringify(profile);
    if (json === lastSavedProfileRef.current) return;
    const handle = setTimeout(() => {
      lastSavedProfileRef.current = json;
      persist('Salvar perfil', (uid) => accountsRepo.updateProfile(uid, profile));
    }, 400);
    return () => clearTimeout(handle);
  }, [isDbReady, userId, userName, userEmail, favoriteSport, agentTone, customToneNote, themeId, persist]);

  // Preferências de notificação → app_settings + fila de sync (regras de silêncio do push).
  useEffect(() => {
    if (!isDbReady || !userId) return;
    const json = JSON.stringify(notifications);
    if (json === lastSavedNotificationsRef.current) return;
    lastSavedNotificationsRef.current = json;
    persist('Salvar notificações', (uid) =>
      settingsRepo.set(
        userSettingKey(uid, SETTINGS_KEYS.notifications),
        {
          ...notifications,
          leaveMeAloneDateIso: notifications.leaveMeAloneToday ? todayIsoDate() : null,
        },
        { syncForUserId: uid, syncKey: SETTINGS_KEYS.notifications }
      )
    );
  }, [isDbReady, userId, notifications, persist]);

  // Privacidade (inclui bloqueio biométrico) → app_settings + fila de sync.
  useEffect(() => {
    if (!isDbReady || !userId) return;
    const json = JSON.stringify(privacy);
    if (json === lastSavedPrivacyRef.current) return;
    lastSavedPrivacyRef.current = json;
    persist('Salvar privacidade', (uid) =>
      settingsRepo.set(userSettingKey(uid, SETTINGS_KEYS.privacy), privacy, {
        syncForUserId: uid,
        syncKey: SETTINGS_KEYS.privacy,
      })
    );
  }, [isDbReady, userId, privacy, persist]);

  const loginUser = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!email.trim() || !password) {
        return { ok: false, error: 'Informe e-mail e senha para entrar.' };
      }

      // Sem banco (ex.: navegador sem suporte): confere as contas criadas nesta sessão.
      if (!dbAvailableRef.current) {
        const key = email.trim().toLowerCase();
        const memoryAccount = memoryAccountsRef.current.get(key);
        if (!memoryAccount || memoryAccount.password !== password) {
          return { ok: false, error: 'E-mail ou senha incorretos.' };
        }
        return {
          ok: true,
          enter: () => {
            setUserName(memoryAccount.name);
            setUserEmail(key);
            setFavoriteSport(memoryAccount.sport);
            setAgentTone(memoryAccount.tone);
            setActiveTab('overview');
            setPreviousTab('overview');
            setIsAuthenticated(true);
          },
        };
      }

      try {
        const result = await accountsRepo.login(email, password);
        if (!result.ok) return result;
        const data = await loadUserData(result.account.id);
        // Quando a API existir: POST /auth/login → saveTokens() no SecureStore.
        return {
          ok: true,
          enter: () => {
            applyAccount(result.account);
            applyUserData(data);
            setIsAuthenticated(true);
          },
        };
      } catch (error) {
        console.warn('[Vybra DB] Login:', error);
        return { ok: false, error: 'Não consegui acessar os dados do aparelho. Tente de novo.' };
      }
    },
    [applyAccount, applyUserData]
  );

  const registerUser = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
      sport: SportType;
      tone: AgentTone;
    }): Promise<AuthResult> => {
      if (!dbAvailableRef.current) {
        const key = payload.email.trim().toLowerCase();
        if (!payload.name.trim() || !key) return { ok: false, error: 'Preencha nome e e-mail.' };
        if (payload.password.length < 6) {
          return { ok: false, error: 'A senha precisa ter pelo menos 6 caracteres.' };
        }
        if (memoryAccountsRef.current.has(key)) {
          return { ok: false, error: 'Já existe uma conta com este e-mail. Faça login.' };
        }
        memoryAccountsRef.current.set(key, {
          name: payload.name.trim(),
          password: payload.password,
          sport: payload.sport,
          tone: payload.tone,
        });
        return {
          ok: true,
          enter: () => {
            setUserName(payload.name.trim());
            setUserEmail(payload.email.trim());
            setFavoriteSport(payload.sport);
            setAgentTone(payload.tone);
            setActiveTab('overview');
            setPreviousTab('overview');
            setIsAuthenticated(true);
          },
        };
      }

      try {
        const result = await accountsRepo.register({
          name: payload.name,
          email: payload.email,
          password: payload.password,
          favoriteSport: payload.sport,
          agentTone: payload.tone,
          customToneNote: DEFAULT_TONE_NOTE,
          themeId,
        });
        if (!result.ok) return result;
        const data = await loadUserData(result.account.id);
        // Quando a API existir: POST /auth/register → saveTokens() no SecureStore.
        return {
          ok: true,
          enter: () => {
            applyAccount(result.account);
            applyUserData(data);
            setIsAuthenticated(true);
          },
        };
      } catch (error) {
        console.warn('[Vybra DB] Cadastro:', error);
        return { ok: false, error: 'Não consegui criar a conta no aparelho. Tente de novo.' };
      }
    },
    [applyAccount, applyUserData, themeId]
  );

  const logoutUser = useCallback(() => {
    setSelectedActivity(null);
    setMemoryModalVisible(false);
    setActivePush(null);
    setAuthScreen('login');
    setIsAuthenticated(false);
    // Os dados na tela são todos substituídos no próximo login (applyUserData).
    userIdRef.current = null;
    setUserId(null);
    if (dbAvailableRef.current) {
      sessionRepo.setUserId(null).catch((error: unknown) => {
        console.warn('[Vybra DB] Encerrar sessão:', error);
      });
    }
    clearTokens().catch(() => {});
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

  const updateCheckIn = useCallback(
    (patch: Partial<CheckInState>) => {
      const next: CheckInState = { ...checkInRef.current, ...patch };
      checkInRef.current = next;
      setCheckIn(next);
      // daily_checkins (chave = data de hoje) + fila → PUT /checkins/today
      persist('Salvar check-in', (uid) => checkinsRepo.upsertToday(uid, next));
    },
    [persist]
  );

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
      samples?: ActivitySampleInput[];
      startedAtIso?: string;
    }) => {
      const clientId = newClientId();
      const startedAtIso =
        workout.startedAtIso ?? new Date(Date.now() - workout.durationSec * 1000).toISOString();
      // Cálculo é código: pace médio (s/km) = duração / distância.
      const paceSeconds =
        workout.distanceKm > 0 ? Math.round(workout.durationSec / workout.distanceKm) : 0;
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
        id: clientId,
        title: titleBySport[workout.sport],
        sport: workout.sport,
        dateLabel: 'Hoje',
        timeLabel: 'Agora',
        distanceKm: Number(workout.distanceKm.toFixed(2)),
        durationLabel: `${mins}m ${String(secs).padStart(2, '0')}s`,
        paceLabel: workout.paceLabel,
        paceSeconds,
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

      const reportIds = workoutReportsRef.current
        .filter((r) => r.sport === workout.sport)
        .map((r) => r.id);

      if (dbAvailableRef.current) {
        persist('Salvar treino', (uid) =>
          activitiesRepo.saveCompleted(uid, {
            activity: newActivity,
            clientId,
            startedAtIso,
            durationSec: workout.durationSec,
            samples: workout.samples,
            reportIds,
          })
        );
        showStatusBanner('Treino salvo no seu aparelho. Sincroniza quando houver internet.');
      } else {
        showStatusBanner('Treino adicionado (banco local indisponível nesta sessão).');
      }
    },
    [persist, showStatusBanner]
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
        id: newClientId(),
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
      persist('Salvar reporte', async (uid) => {
        await reportsRepo.insert(uid, entry);
        await chatRepo.insertMany(uid, [userMsg, agentMsg]);
      });
      showStatusBanner('Reporte enviado para o chat com o Vybra.');
    },
    [persist, showStatusBanner]
  );

  const clearWorkoutReports = useCallback(() => {
    setWorkoutReports([]);
  }, []);

  const toggleAiChallenge = useCallback(
    (accepted: boolean) => {
      setAchievements((prev) =>
        prev.map((a) => (a.isAiSuggested ? { ...a, aiAccepted: accepted } : a))
      );
      const acceptedById: Record<string, boolean> = {};
      ACHIEVEMENTS_MOCK.forEach((a) => {
        if (a.isAiSuggested) acceptedById[a.id] = accepted;
      });
      persist('Salvar desafio', (uid) =>
        settingsRepo.set(userSettingKey(uid, SETTINGS_KEYS.aiChallenge), acceptedById, {
          syncForUserId: uid,
          syncKey: SETTINGS_KEYS.aiChallenge,
        })
      );
      showStatusBanner(
        accepted
          ? 'Desafio personalizado aceito! O Vybra vai acompanhar sua meta.'
          : 'Desafio dispensado sem pressão.'
      );
    },
    [persist, showStatusBanner]
  );

  const removeMemoryFact = useCallback(
    (id: string) => {
      setMemories((prev) => prev.filter((item) => item.id !== id));
      // Apaga local + fila → DELETE /memories/:id (fato e embedding no servidor)
      persist('Remover memória', (uid) => memoriesRepo.remove(uid, id));
      showStatusBanner('Memória removida com transparência.');
    },
    [persist, showStatusBanner]
  );

  const addMemoryFact = useCallback(
    (text: string, layer: MemoryFact['layer']) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const fact: MemoryFact = {
        id: newClientId(),
        layer,
        text: trimmed,
        date: 'Agora mesmo',
      };
      setMemories((prev) => [fact, ...prev]);
      persist('Salvar memória', (uid) => memoriesRepo.insert(uid, fact));
      showStatusBanner('Fato salvo na memória do Vybra.');
    },
    [persist, showStatusBanner]
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
        id: `user-${newClientId()}`,
        sender: 'user',
        text: trimmed,
        timestamp,
      };
      setChatMessages((prev) => [...prev, userMsg]);
      persist('Salvar mensagem', (uid) => chatRepo.insert(uid, userMsg));
      setIsAgentTyping(true);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        // Quando a API existir: POST /chat/message (Gemini + ferramentas) substitui esta resposta local.
        const reply = { ...formatReplyForTone(agentTone, trimmed), id: `agent-${newClientId()}` };
        setChatMessages((prev) => [...prev, reply]);
        persist('Salvar resposta', (uid) => chatRepo.insert(uid, reply));
        setIsAgentTyping(false);
      }, 650);
    },
    [agentTone, persist]
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
      userId,
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
      isDbReady,
      dbError,
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
      userId,
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
      isDbReady,
      dbError,
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

  if (!isHydrated) return <>{fallback}</>;

  return <VybraContext.Provider value={value}>{children}</VybraContext.Provider>;
}

export function useVybra() {
  const ctx = useContext(VybraContext);
  if (!ctx) throw new Error('useVybra must be used within VybraProvider');
  return ctx;
}
