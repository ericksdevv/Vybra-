import {
  Achievement,
  Activity,
  AgentTone,
  ChatMessage,
  CheckInState,
  MemoryFact,
  PersonalRecord,
  PushNotificationData,
  SportType,
  WeeklyVolumeDay,
} from '../types/vybra';

export const BRAND_TEXT = {
  name: 'Vybra',
  slogan: 'CORRA. EVOLUA. SUPERE-SE.',
  taglinePrefix: 'Mais que um app,\num parceiro na sua ',
  taglineHighlight: 'jornada.',
} as const;

export const TONE_PROFILES: Record<
  AgentTone,
  {
    label: string;
    shortDesc: string;
    overviewPrompt: string;
    overviewSubtext: string;
    difficultDayReply: string;
    sampleQuote: string;
  }
> = {
  motivador: {
    label: 'Motivador',
    shortDesc: 'Energético e desafiador, sem culpar você.',
    overviewPrompt: 'Você ainda não foi correr hoje — bora destravar 25 min leves?',
    overviewSubtext:
      'Ontem você baixou seu pace em 14s/km nos 7,5 km. Um trote curto hoje mantém seu embalo vivo.',
    difficultDayReply:
      'Tudo bem desacelerar hoje. Que tal 10 min de caminhada ao ar livre só para manter o corpo em movimento e proteger sua sequência?',
    sampleQuote:
      '"Seu pace médio caiu 14s/km esta semana. Você está construindo consistência de verdade — bora manter o ritmo hoje!"',
  },
  acolhedor: {
    label: 'Acolhedor',
    shortDesc: 'Empático, gentil e atento ao seu momento.',
    overviewPrompt: 'Como você está se sentindo antes de calçar o tênis hoje?',
    overviewSubtext:
      'Lembrei que você dormiu um pouco mais tarde ontem. Se o corpo pedir leveza, 20 min tranquilos já contam muito.',
    difficultDayReply:
      'Sem culpa nenhuma. Dias pesados fazem parte do processo. Faça 8 minutos de alongamento e respiração — sua sequência segue protegida.',
    sampleQuote:
      '"Não precisa ser o treino perfeito hoje. Aparecer por 15 minutos respeitando seu corpo já é uma vitória sua."',
  },
  direto: {
    label: 'Direto',
    shortDesc: 'Objetivo, curto e sem rodeios.',
    overviewPrompt: 'Faltam 7,6 km para bater sua meta semanal de 40 km.',
    overviewSubtext:
      'Pace de ontem: 4:52/km. Hoje: rodagem leve de 5 km em Z2 para consolidar base aeróbica.',
    difficultDayReply:
      'Entendido. Substituímos por 10 min de mobilidade e caminhada curta. Registro salvo e sequência mantida.',
    sampleQuote:
      '"Meta da semana: 81% concluída. 5 km em ritmo leve hoje fecham o bloco sem sobrecarga."',
  },
  analitico: {
    label: 'Analítico',
    shortDesc: 'Foco em números, carga, sono e explicações.',
    overviewPrompt: 'Sua eficiência aeróbica subiu 4,2% nas últimas 2 semanas.',
    overviewSubtext:
      'Com 7h40 de sono na última corrida, sua FC média caiu 6 bpm no mesmo pace. Hoje sua janela ideal é Z2.',
    difficultDayReply:
      'Sua carga aguda está equilibrada. Descanso ativo de 10 min preserva sua recuperação e evita queda de rendimento amanhã.',
    sampleQuote:
      '"Correlação clara: acima de 7h de sono seu pace melhora em média 13s/km com deriva cardíaca 3% menor."',
  },
  personalizado: {
    label: 'Personalizado',
    shortDesc: 'Ajustado exatamente ao seu jeito de conversar.',
    overviewPrompt: 'E aí, Erick! Bora fazer aqueles 5 km sem pressão de relógio?',
    overviewSubtext:
      'Do jeito que você prefere: foco no prazer de correr no fim da tarde e cuidar do joelho direito.',
    difficultDayReply:
      'Fechado, hoje a gente respeita o ritmo do dia. 10 minutos de caminhada solta ou alongamento já te deixam bem.',
    sampleQuote:
      '"Bora no seu ritmo, Erick. Sem comparação com ninguém — só você melhorando um pouco mais que ontem."',
  },
};

export const CHECKIN_DETAILS: Record<
  CheckInState['mood'],
  {
    badge: string;
    headline: string;
    detail: string;
    plannedWorkout: string;
    intensityTag: string;
    ctaLabel: string;
    accentColor: string;
  }
> = {
  Ótimo: {
    badge: 'ENERGIA ALTA · PLANO 100%',
    headline: 'Corpo descansado e pronto para evolução de ritmo',
    detail:
      'Com 7h30 de sono e disposição máxima, mantivemos sua sessão principal com final progressivo.',
    plannedWorkout: '6,0 km · Progressivo (5:05 → 4:48 /km)',
    intensityTag: 'Z2 / Z3 moderado',
    ctaLabel: 'Iniciar 6,0 km agora',
    accentColor: '#34D399',
  },
  Normal: {
    badge: 'RITMO ESTÁVEL · BASE AERÓBICA',
    headline: 'Meta do dia mantida em zona de conforto',
    detail:
      'Sem pressão por recorde hoje: rodagem fluida para somar volume rumo aos 40 km da semana.',
    plannedWorkout: '5,0 km · Rodagem confortável (5:12 /km)',
    intensityTag: 'Z2 estável',
    ctaLabel: 'Iniciar 5,0 km leve',
    accentColor: '#A855F7',
  },
  Cansado: {
    badge: 'CARGA REDUZIDA (-40%) · PROTEÇÃO',
    headline: 'Volume reduzido automaticamente para poupar seu joelho',
    detail:
      'O Vybra diminuiu o treino de 5,0 km para 3,0 km regenerativos sem cobrança de pace.',
    plannedWorkout: '3,0 km · Trote regenerativo (5:38 /km)',
    intensityTag: 'Z1 / Z2 leve',
    ctaLabel: 'Fazer 3,0 km regenerativo',
    accentColor: '#FBBF24',
  },
  Pesado: {
    badge: 'MODO ACOLHIMENTO · SEQUÊNCIA PROTEGIDA',
    headline: 'Treino intenso pausado e alertas de cobrança silenciados hoje',
    detail:
      'Sua sequência de 12 dias está congelada e protegida. Troque a corrida por 10 min de caminhada livre ou descanso total.',
    plannedWorkout: '10 min · Caminhada livre ou alongamento em casa',
    intensityTag: 'Recuperação ativa',
    ctaLabel: 'Conversar e adaptar meu dia',
    accentColor: '#C084FC',
  },
};

export interface SportMetaItem {
  id: SportType;
  label: string;
  shortDesc: string;
  paceUnit: string;
  hasMap: boolean;
  isGymWorkout?: boolean;
  locationLabel: string;
  routePath: string;
  metric1Label: string;
  metric1Idle: string;
  metric2Label: string;
  metric2Value: string;
  metric3Label: string;
  metric3Value: string;
  metric4Label: string;
  metric4Value: string;
  reportTitle: string;
  reportPlaceholder: string;
  quickReportTags: string[];
}

export const SPORTS_META: SportMetaItem[] = [
  {
    id: 'corrida',
    label: 'Corrida',
    shortDesc: 'Ritmo, distância e trajeto',
    paceUnit: '/km',
    hasMap: true,
    locationLabel: 'Parque Ibirapuera · Circuito das Árvores',
    routePath:
      'M 24 128 C 46 82, 82 56, 118 68 C 154 80, 166 36, 206 40 C 248 44, 278 90, 256 122 C 234 152, 164 134, 128 148 C 90 162, 52 152, 24 128',
    metric1Label: 'Distância',
    metric1Idle: '0,00 km',
    metric2Label: 'Pace atual',
    metric2Value: '5:02 /km',
    metric3Label: 'Cadência',
    metric3Value: '174 spm',
    metric4Label: 'Altimetria',
    metric4Value: '+64 m',
    reportTitle: 'Reporte ao vivo',
    reportPlaceholder: 'Ex: Parei 2 min por desconforto no joelho, respiração firme...',
    quickReportTags: [
      'Ritmo confortável',
      'Desconforto leve no joelho',
      'Pausa para hidratar',
      'Fôlego pesado na subida',
    ],
  },
  {
    id: 'ciclismo',
    label: 'Ciclismo',
    shortDesc: 'Velocidade, cadência e rota',
    paceUnit: 'km/h',
    hasMap: true,
    locationLabel: 'Ciclovia Marginal Pinheiros · Trecho Sul',
    routePath:
      'M 18 140 C 55 110, 95 48, 152 62 C 204 74, 232 28, 282 42 C 268 95, 198 136, 112 144 C 64 148, 35 146, 18 140',
    metric1Label: 'Percurso',
    metric1Idle: '0,0 km',
    metric2Label: 'Velocidade',
    metric2Value: '28,6 km/h',
    metric3Label: 'Potência est.',
    metric3Value: '210 W',
    metric4Label: 'Cadência',
    metric4Value: '90 rpm',
    reportTitle: 'Reporte ao vivo',
    reportPlaceholder: 'Ex: Vento contra no km 10, baixei a marcha para poupar quadríceps...',
    quickReportTags: [
      'Cadência estável',
      'Vento contra forte',
      'Pausa rápida no sinal',
      'Pernas respondendo bem',
    ],
  },
  {
    id: 'treino',
    label: 'Treino',
    shortDesc: 'Academia, séries e cargas',
    paceUnit: 'min',
    hasMap: false,
    isGymWorkout: true,
    locationLabel: 'Cronômetro de sessão livre',
    routePath: '',
    metric1Label: 'Tempo',
    metric1Idle: '00:00',
    metric2Label: 'Batimentos est.',
    metric2Value: '124 bpm',
    metric3Label: 'Registros',
    metric3Value: '0 notas',
    metric4Label: 'Esforço',
    metric4Value: 'Moderado',
    reportTitle: 'Relatório do treino para o agente',
    reportPlaceholder:
      'Descreva grupo muscular, exercícios, séries, repetições, carga e descanso (ex: Costas e bíceps · Puxada 4x10 55kg · 90s descanso)...',
    quickReportTags: [
      'Peito e tríceps · 4x10 · 60s descanso',
      'Costas e bíceps · 4x12 · 75s descanso',
      'Pernas completo · carga progressiva',
      'Ombro e core · 3x15 · 45s descanso',
    ],
  },
  {
    id: 'caminhada',
    label: 'Caminhada',
    shortDesc: 'Passos, percurso e ritmo',
    paceUnit: '/km',
    hasMap: true,
    locationLabel: 'Bosque Arborizado · Percurso Leve',
    routePath:
      'M 34 126 C 72 94, 118 134, 162 96 C 204 58, 244 102, 270 72',
    metric1Label: 'Distância',
    metric1Idle: '0,00 km',
    metric2Label: 'Passos est.',
    metric2Value: '0',
    metric3Label: 'Ritmo atual',
    metric3Value: '9:15 /km',
    metric4Label: 'Zona FC',
    metric4Value: '106 bpm',
    reportTitle: 'Reporte ao vivo',
    reportPlaceholder: 'Ex: Caminhada leve para soltar as pernas, zero dor...',
    quickReportTags: [
      'Zero dor muscular',
      'Passada solta',
      'Fadiga leve reduzindo',
      'Dia bom ao ar livre',
    ],
  },
  {
    id: 'trilha',
    label: 'Trilha',
    shortDesc: 'Altimetria, terreno e mapa',
    paceUnit: '/km',
    hasMap: true,
    locationLabel: 'Serra da Cantareira · Trilha da Cachoeira',
    routePath:
      'M 22 142 L 64 98 L 96 116 L 138 54 L 178 88 L 222 34 L 268 78 L 280 128',
    metric1Label: 'Distância',
    metric1Idle: '0,00 km',
    metric2Label: 'Pace médio',
    metric2Value: '5:42 /km',
    metric3Label: 'Ganho elev.',
    metric3Value: '+340 m',
    metric4Label: 'Terreno',
    metric4Value: 'Terra & Trilha',
    reportTitle: 'Reporte ao vivo',
    reportPlaceholder: 'Ex: Trecho íngreme com barro, reduzi o ritmo na descida...',
    quickReportTags: [
      'Subida técnica pesada',
      'Solo úmido / escorregadio',
      'Descida controlada',
      'Pausa para foto e água',
    ],
  },
  {
    id: 'natacao',
    label: 'Natação',
    shortDesc: 'Piscina, metros e braçadas',
    paceUnit: '/100m',
    hasMap: false,
    locationLabel: 'Piscina Semiolímpica · 25m',
    routePath: '',
    metric1Label: 'Volume',
    metric1Idle: '0 m',
    metric2Label: 'Ritmo médio',
    metric2Value: '1:46 /100m',
    metric3Label: 'SWOLF médio',
    metric3Value: '33 pts',
    metric4Label: 'Braçadas',
    metric4Value: '18 /50m',
    reportTitle: 'Reporte ao vivo',
    reportPlaceholder: 'Ex: Fiz 10x100m crawl com 20s de intervalo na borda...',
    quickReportTags: [
      '10x100m crawl · 20s pausa',
      'Respiração bilateral encaixada',
      'Ombro um pouco travado',
      'Série com palmar e prancha',
    ],
  },
];

export const WEEKLY_VOLUME: WeeklyVolumeDay[] = [
  { day: 'Seg', fullDay: 'Segunda-feira', km: 5.2, durationMin: 27, pace: '5:12' },
  { day: 'Ter', fullDay: 'Terça-feira', km: 0, durationMin: 0, pace: '--' },
  { day: 'Qua', fullDay: 'Quarta-feira', km: 6.1, durationMin: 32, pace: '5:16' },
  { day: 'Qui', fullDay: 'Quinta-feira', km: 4.8, durationMin: 24, pace: '5:01' },
  { day: 'Sex', fullDay: 'Sexta-feira', km: 8.8, durationMin: 44, pace: '4:58' },
  { day: 'Sáb', fullDay: 'Sábado', km: 7.5, durationMin: 36, pace: '4:52' },
  { day: 'Dom', fullDay: 'Hoje (Domingo)', km: 0, durationMin: 0, pace: 'Planejado 5 km', isToday: true },
];

export const PACE_TREND_POINTS = [
  { label: '01/11', paceSec: 324, paceStr: '5:24', elev: 42 },
  { label: '04/11', paceSec: 318, paceStr: '5:18', elev: 58 },
  { label: '07/11', paceSec: 316, paceStr: '5:16', elev: 75 },
  { label: '10/11', paceSec: 306, paceStr: '5:06', elev: 64 },
  { label: '12/11', paceSec: 298, paceStr: '4:58', elev: 92 },
  { label: '14/11', paceSec: 292, paceStr: '4:52', elev: 118 },
];

export const ACTIVITIES_MOCK: Activity[] = [
  {
    id: 'act-1',
    title: 'Corrida Matinal no Parque',
    sport: 'corrida',
    dateLabel: 'Sábado, 14 Nov',
    timeLabel: '06:42',
    distanceKm: 7.52,
    durationLabel: '36m 48s',
    paceLabel: '4:52 /km',
    paceSeconds: 292,
    elevationGainM: 118,
    avgHeartRate: 154,
    cadenceSpm: 174,
    calories: 512,
    routePath:
      'M 24 128 C 46 82, 82 56, 118 68 C 154 80, 166 36, 206 40 C 248 44, 278 90, 256 122 C 234 152, 164 134, 128 148 C 90 162, 52 152, 24 128',
    elevationSeries: [12, 18, 29, 44, 61, 53, 72, 95, 88, 108, 118, 96],
    paceSeries: [305, 299, 294, 296, 291, 289, 293, 288, 285, 284, 282, 279],
    splits: [
      { km: 1, pace: '5:04', elevationDelta: 12, heartRate: 141 },
      { km: 2, pace: '4:58', elevationDelta: 19, heartRate: 149 },
      { km: 3, pace: '4:54', elevationDelta: 24, heartRate: 154 },
      { km: 4, pace: '4:51', elevationDelta: -8, heartRate: 156 },
      { km: 5, pace: '4:48', elevationDelta: 31, heartRate: 159 },
      { km: 6, pace: '4:46', elevationDelta: 26, heartRate: 161 },
      { km: 7, pace: '4:41', elevationDelta: 14, heartRate: 164 },
    ],
    comparisonHeadline: '14s/km mais rápido que a média das últimas 4 semanas',
    comparisonDeltaLabel: '-14s /km',
    isBetterThanYesterday: true,
    aiSummary:
      'Você fechou em negative split perfeito: os últimos 2 km foram os mais rápidos mesmo na subida final. Suas 7h40 de sono fizeram diferença real na estabilidade cardíaca.',
  },
  {
    id: 'act-2',
    title: 'Progressivo na Orla',
    sport: 'corrida',
    dateLabel: 'Sexta, 13 Nov',
    timeLabel: '18:15',
    distanceKm: 8.8,
    durationLabel: '43m 42s',
    paceLabel: '4:58 /km',
    paceSeconds: 298,
    elevationGainM: 92,
    avgHeartRate: 158,
    cadenceSpm: 171,
    calories: 590,
    routePath:
      'M 22 132 Q 78 44, 150 92 T 274 58 Q 288 118, 212 138 T 22 132',
    elevationSeries: [8, 12, 16, 21, 35, 42, 48, 52, 64, 78, 86, 92],
    paceSeries: [312, 308, 304, 300, 297, 295, 294, 291, 289, 287, 286, 283],
    splits: [
      { km: 1, pace: '5:10', elevationDelta: 6, heartRate: 144 },
      { km: 2, pace: '5:05', elevationDelta: 11, heartRate: 151 },
      { km: 3, pace: '5:01', elevationDelta: 15, heartRate: 156 },
      { km: 4, pace: '4:57', elevationDelta: 22, heartRate: 160 },
      { km: 5, pace: '4:52', elevationDelta: 18, heartRate: 163 },
    ],
    comparisonHeadline: '+1,3 km acima da sua sexta-feira passada',
    comparisonDeltaLabel: '+1,3 km',
    isBetterThanYesterday: true,
    aiSummary:
      'Ritmo muito sólido no fim da tarde. A cadência subiu para 171 spm na segunda metade, reduzindo o impacto no joelho direito.',
  },
  {
    id: 'act-3',
    title: 'Giro Urbano Matinal',
    sport: 'ciclismo',
    dateLabel: 'Quinta, 12 Nov',
    timeLabel: '06:10',
    distanceKm: 24.6,
    durationLabel: '54m 15s',
    paceLabel: '27,2 km/h',
    paceSeconds: 132,
    elevationGainM: 284,
    avgHeartRate: 142,
    cadenceSpm: 88,
    calories: 640,
    routePath:
      'M 30 120 C 60 30, 140 30, 180 84 C 210 124, 260 44, 276 96 C 288 136, 160 156, 30 120',
    elevationSeries: [20, 45, 92, 110, 148, 130, 175, 212, 240, 260, 275, 284],
    paceSeries: [26, 28, 25, 29, 27, 26, 28, 30, 27, 28, 29, 27],
    splits: [
      { km: 5, pace: '26,4 km/h', elevationDelta: 64, heartRate: 138 },
      { km: 10, pace: '27,8 km/h', elevationDelta: 82, heartRate: 143 },
      { km: 15, pace: '26,9 km/h', elevationDelta: 78, heartRate: 146 },
      { km: 20, pace: '28,1 km/h', elevationDelta: 60, heartRate: 144 },
    ],
    comparisonHeadline: 'Treino cruzado sem sobrecarga articular',
    comparisonDeltaLabel: '+110m elev.',
    isBetterThanYesterday: true,
    aiSummary:
      'Excelente escolha de pedal regenerativo em Z2. Deu fôlego aeróbico poupando o impacto de corrida.',
  },
  {
    id: 'act-4',
    title: 'Rodagem com Subidas Curtas',
    sport: 'corrida',
    dateLabel: 'Quarta, 11 Nov',
    timeLabel: '19:05',
    distanceKm: 6.1,
    durationLabel: '32m 08s',
    paceLabel: '5:16 /km',
    paceSeconds: 316,
    elevationGainM: 145,
    avgHeartRate: 162,
    cadenceSpm: 166,
    calories: 438,
    routePath:
      'M 28 138 L 96 64 L 164 102 L 228 42 L 272 118 L 178 144 L 28 138',
    elevationSeries: [10, 32, 58, 49, 86, 102, 94, 128, 145, 132, 120, 115],
    paceSeries: [318, 322, 328, 315, 319, 324, 312, 316, 310, 308, 305, 301],
    splits: [
      { km: 1, pace: '5:18', elevationDelta: 22, heartRate: 150 },
      { km: 2, pace: '5:28', elevationDelta: 38, heartRate: 163 },
      { km: 3, pace: '5:14', elevationDelta: 18, heartRate: 164 },
      { km: 4, pace: '5:19', elevationDelta: 41, heartRate: 167 },
    ],
    comparisonHeadline: 'Pace 15s/km mais lento que segunda por sono curto + subidas',
    comparisonDeltaLabel: '+15s /km',
    isBetterThanYesterday: false,
    aiSummary:
      'Você dormiu 5h20 na terça e pegou +145m de altimetria sob 28°C. O ritmo subiu, mas o esforço interno foi alto — sem motivo para cobrança.',
  },
  {
    id: 'act-5',
    title: 'Força & Estabilidade de Corrida',
    sport: 'treino',
    dateLabel: 'Terça, 10 Nov',
    timeLabel: '07:20',
    distanceKm: 0,
    durationLabel: '38m 00s',
    paceLabel: 'Força',
    paceSeconds: 0,
    elevationGainM: 0,
    avgHeartRate: 128,
    cadenceSpm: 0,
    calories: 310,
    routePath: 'M 40 95 L 105 95 L 130 58 L 175 130 L 210 95 L 265 95',
    elevationSeries: [15, 25, 42, 38, 60, 52, 74, 68, 82, 70, 55, 40],
    paceSeries: [110, 124, 136, 128, 142, 135, 146, 132, 138, 126, 120, 115],
    splits: [
      { km: 1, pace: 'Glúteo médio', elevationDelta: 0, heartRate: 122 },
      { km: 2, pace: 'Agachamento', elevationDelta: 0, heartRate: 134 },
      { km: 3, pace: 'Core isom.', elevationDelta: 0, heartRate: 128 },
    ],
    comparisonHeadline: 'Proteção articular para sua meta de 10k',
    comparisonDeltaLabel: '38 min',
    isBetterThanYesterday: true,
    aiSummary:
      'Sessão preventiva focada em joelho direito e estabilidade de quadril. Ótima base para acelerar nas corridas de sexta e sábado.',
  },
];

export const PERSONAL_RECORDS: PersonalRecord[] = [
  { distance: '1 km', time: '4m 18s', pace: '4:18 /km', date: '14 Nov', improvement: '-4s' },
  { distance: '5 km', time: '23m 45s', pace: '4:45 /km', date: '08 Nov', improvement: '-22s' },
  { distance: '10 km', time: '49m 32s', pace: '4:57 /km', date: '25 Out', improvement: '-1m 10s' },
  { distance: 'Mais longa', time: '1h 21m', pace: '5:12 /km', date: '19 Out', improvement: '15,6 km' },
];

export const ACHIEVEMENTS_MOCK: Achievement[] = [
  {
    id: 'ach-1',
    category: 'Consistência',
    title: 'Ritmo Vivo — 4 Semanas',
    description: '4 semanas seguidas treinando com descansos planejados respeitados.',
    progress: 1,
    progressLabel: '4 / 4 semanas',
    unlocked: true,
  },
  {
    id: 'ach-2',
    category: 'Evolução',
    title: 'Negative Split Cirúrgico',
    description: 'Fechar a segunda metade da corrida mais rápida que a primeira.',
    progress: 1,
    progressLabel: 'Conquistado em 14 Nov',
    unlocked: true,
  },
  {
    id: 'ach-3',
    category: 'Marcos',
    title: 'Clube dos 500 km',
    description: 'Acumular 500 km somando corrida, trilha e caminhada.',
    progress: 0.78,
    progressLabel: '391 / 500 km',
    unlocked: false,
  },
  {
    id: 'ach-4',
    category: 'Inteligência e Cuidado',
    title: 'Ouviu o Corpo',
    description: 'Escolher recuperação leve quando o alerta de cansaço apareceu.',
    progress: 1,
    progressLabel: '3 recuperações inteligentes',
    unlocked: true,
  },
  {
    id: 'ach-5',
    category: 'Exploração',
    title: 'Novos Horizontes',
    description: 'Completar 5 rotas diferentes nunca registradas antes.',
    progress: 0.6,
    progressLabel: '3 / 5 rotas',
    unlocked: false,
  },
  {
    id: 'ach-6',
    category: 'Personalizada pela IA',
    title: 'Desafio 9 km no Parque',
    description:
      'Você correu 8,8 km com sobra de fôlego. Aceita estender sua marca pessoal para 9 km esta semana?',
    progress: 0.92,
    progressLabel: 'Proposta ativa do Vybra',
    unlocked: false,
    isAiSuggested: true,
    aiAccepted: true,
  },
];

export const MEMORY_FACTS_MOCK: MemoryFact[] = [
  {
    id: 'mem-1',
    layer: 'Perfil',
    text: 'Meta principal: correr 10 km abaixo de 48 min em março.',
    date: 'Atualizado há 3 dias',
  },
  {
    id: 'mem-2',
    layer: 'Semântica',
    text: 'Joelho direito sensível quando acumula mais de 3 dias seguidos de impacto.',
    date: 'Registrado em 02 Nov',
    sensitive: true,
  },
  {
    id: 'mem-3',
    layer: 'Semântica',
    text: 'Trabalha em horários variáveis e prefere treinar entre 06:30 e 07:30 ou após 18:30.',
    date: 'Registrado em 28 Out',
  },
  {
    id: 'mem-4',
    layer: 'Padrão',
    text: 'Pace sobe em média 13s/km após noites com menos de 6h de sono.',
    date: 'Aprendido dos últimos 18 treinos',
  },
  {
    id: 'mem-5',
    layer: 'Episódica',
    text: 'Quarta (11/11): dormiu 5h20 e enfrentou subidas fortes com calor; acolhido sem cobrança.',
    date: '11 Nov',
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'agent',
    text: 'Bom dia, Erick! Vi que ontem você cravou 7,52 km a 4:52/km no Parque. Comparando com a média das últimas semanas, você baixou 14s por km e terminou sobrando.',
    timestamp: '08:12',
    metricCard: {
      leftLabel: 'Média 4 sem.',
      leftValue: '5:06 /km',
      rightLabel: 'Ontem (Sáb)',
      rightValue: '4:52 /km',
      deltaLabel: '-14s /km mais rápido',
      positive: true,
    },
  },
  {
    id: 'msg-2',
    sender: 'user',
    text: 'E por que na quarta meu pace foi bem maior que o normal?',
    timestamp: '08:14',
  },
  {
    id: 'msg-3',
    sender: 'agent',
    text: 'Cruzei seus dados da quarta (5:16/km): você tinha dormido 5h20 na noite anterior, pegou +145m de altimetria e o calor bateu 28°C. Sua frequência média subiu para 162 bpm — você não piorou, só correu sob carga bem maior.',
    timestamp: '08:14',
  },
];

export const PUSH_SAMPLES: PushNotificationData[] = [
  {
    id: 'push-1',
    title: 'Vybra · Check-in do dia',
    body: 'Por que você não foi correr hoje ainda? 20 min leves já mantêm sua sequência viva.',
    tag: 'Lembrete inteligente',
  },
  {
    id: 'push-2',
    title: 'Vybra · Comparativo pronto',
    body: 'Seu pace caiu 14s/km no último treino! Toque para ver o que destravou seu ritmo.',
    tag: 'Evolução pessoal',
  },
  {
    id: 'push-3',
    title: 'Vybra · Dia difícil?',
    body: 'Se a rotina apertou hoje, tudo bem trocar por 10 min de caminhada ou alongamento.',
    tag: 'Apoio sem culpa',
  },
];
