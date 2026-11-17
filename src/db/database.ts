/**
 * Vybra · Banco local offline-first (Passo 2 do Plano de Integração)
 *
 * - SQLite via expo-sqlite, com WAL + foreign keys.
 * - Migrations versionadas por PRAGMA user_version.
 * - Contas locais: cada usuário só enxerga os próprios dados (user_id em toda tabela).
 * - sync_queue idempotente (clientId UUID v4) para o futuro syncManager → NestJS.
 *
 * Regras:
 * - Tokens de sessão NUNCA ficam aqui (ver src/services/authStorage.ts → SecureStore).
 * - A senha local nunca é gravada em texto: só hash + salt. Quando a API existir,
 *   o login passa a ser validado pelo servidor (argon2) e este hash vira só um cache offline.
 * - Fotos/arquivos NUNCA ficam aqui: só a URL/caminho.
 */
import * as Crypto from 'expo-crypto';
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import {
  ACTIVITIES_MOCK,
  INITIAL_CHAT_MESSAGES,
  MEMORY_FACTS_MOCK,
} from '../data/mockData';
import {
  Activity,
  AgentTone,
  ChatMessage,
  ChatMetricSnapshot,
  CheckInState,
  MemoryFact,
  NotificationSettings,
  PrivacySettings,
  SplitMetric,
  SportType,
  ThemeId,
  WorkoutReport,
} from '../types/vybra';

// ---------------------------------------------------------------------------
// Tipos públicos
// ---------------------------------------------------------------------------

export type SyncStatus = 'pending' | 'synced' | 'error' | 'local_only';

export type SyncEntity =
  | 'activity'
  | 'checkin'
  | 'workout_report'
  | 'memory'
  | 'profile'
  | 'settings';

export type SyncOperation = 'upsert' | 'delete';

export interface SyncQueueItem {
  id: string;
  userId: string | null;
  entity: SyncEntity;
  entityId: string;
  operation: SyncOperation;
  payload: Record<string, unknown>;
  attempts: number;
  nextRetryAt: number;
  lastError: string | null;
  createdAt: number;
}

export interface ActivitySampleInput {
  tsMs: number;
  lat?: number | null;
  lng?: number | null;
  altM?: number | null;
  hr?: number | null;
}

export interface LocalProfile {
  name: string;
  email: string;
  favoriteSport: SportType;
  agentTone: AgentTone;
  customToneNote: string;
  themeId: ThemeId;
}

export interface LocalAccount extends LocalProfile {
  id: string;
}

export type AccountResult =
  | { ok: true; account: LocalAccount }
  | { ok: false; error: string };

export interface RegisterAccountInput {
  name: string;
  email: string;
  password: string;
  favoriteSport: SportType;
  agentTone: AgentTone;
  customToneNote?: string;
  themeId?: ThemeId;
}

export interface StoredNotificationSettings extends NotificationSettings {
  /** Data (YYYY-MM-DD) em que "Me deixe em paz hoje" foi ligado. */
  leaveMeAloneDateIso?: string | null;
}

export interface UserDataSnapshot {
  activities: Activity[];
  memories: MemoryFact[];
  chatMessages: ChatMessage[];
  todayCheckIn: CheckInState | null;
  notifications: NotificationSettings | null;
  privacy: PrivacySettings | null;
  aiChallengeAccepted: Record<string, boolean> | null;
}

export interface SaveActivityInput {
  /** Objeto já pronto para a UI (o mesmo que vai para o estado do contexto). */
  activity: Activity;
  /** UUID v4 gerado no aparelho — chave de idempotência do POST /activities/sync. */
  clientId: string;
  startedAtIso: string;
  durationSec: number;
  samples?: ActivitySampleInput[];
  /** Reportes da sessão atual que devem ser vinculados a esta atividade. */
  reportIds?: string[];
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

const DB_NAME = 'vybra.db';
const PASSWORD_ROUNDS = 1000;
export const MIN_PASSWORD_LENGTH = 6;

export const SETTINGS_KEYS = {
  /** Global: qual conta está logada neste aparelho. */
  session: 'session.v2',
  /** Por usuário (use userSettingKey). */
  notifications: 'notifications',
  privacy: 'privacy',
  aiChallenge: 'achievements.ai_accepted',
} as const;

/** Chave de configuração isolada por usuário. */
export function userSettingKey(userId: string, key: string): string {
  return `user:${userId}:${key}`;
}

/** UUID v4 gerado no aparelho (clientId). */
export function newClientId(): string {
  return Crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Data local do aparelho no formato YYYY-MM-DD (chave do check-in diário). */
export function todayIsoDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatDayMonth(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')} ${MONTHS[date.getMonth()]}`;
}

function formatDateLabel(iso: string): string {
  const date = new Date(iso);
  const today = todayIsoDate();
  const yesterday = todayIsoDate(new Date(Date.now() - 86_400_000));
  const key = todayIsoDate(date);
  if (key === today) return 'Hoje';
  if (key === yesterday) return 'Ontem';
  return `${WEEKDAYS[date.getDay()]}, ${formatDayMonth(date)}`;
}

function formatTimeLabel(iso: string): string {
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function formatMemoryDateLabel(iso: string): string {
  const date = new Date(iso);
  if (todayIsoDate(date) === todayIsoDate()) return 'Registrado hoje';
  return `Registrado em ${formatDayMonth(date)}`;
}

/** Converte "36m 48s", "1h 02m 10s" etc. em segundos. */
export function parseDurationLabel(label: string): number {
  const h = /(\d+)\s*h/.exec(label);
  const m = /(\d+)\s*m(?!s)/.exec(label);
  const s = /(\d+)\s*s/.exec(label);
  return (
    (h ? Number(h[1]) * 3600 : 0) + (m ? Number(m[1]) * 60 : 0) + (s ? Number(s[1]) : 0)
  );
}

function safeParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

async function hashPassword(password: string, salt: string): Promise<string> {
  let hash = `${salt}:${password}`;
  for (let i = 0; i < PASSWORD_ROUNDS; i += 1) {
    hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${hash}`);
  }
  return hash;
}

// ---------------------------------------------------------------------------
// Migrations (PRAGMA user_version)
// ---------------------------------------------------------------------------

const SYNC_STATUS_CHECK = `CHECK (sync_status IN ('pending','synced','error','local_only'))`;

const MIGRATIONS: { version: number; sql: string }[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS user_profile (
        id TEXT PRIMARY KEY NOT NULL DEFAULT 'local',
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        favorite_sport TEXT NOT NULL,
        agent_tone TEXT NOT NULL,
        custom_tone_note TEXT NOT NULL DEFAULT '',
        theme_id TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'pending' ${SYNC_STATUS_CHECK}
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY NOT NULL,
        value_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY NOT NULL,
        client_id TEXT UNIQUE NOT NULL,
        sport TEXT NOT NULL,
        title TEXT NOT NULL,
        started_at TEXT NOT NULL,
        duration_sec INTEGER NOT NULL,
        distance_m REAL NOT NULL,
        elevation_gain_m REAL NOT NULL DEFAULT 0,
        avg_pace_sec INTEGER,
        avg_heart_rate INTEGER,
        cadence_spm INTEGER,
        calories INTEGER,
        route_polyline TEXT,
        details_json TEXT NOT NULL DEFAULT '{}',
        is_demo INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'pending' ${SYNC_STATUS_CHECK}
      );
      CREATE INDEX IF NOT EXISTS idx_activities_started_at ON activities (started_at DESC);
      CREATE INDEX IF NOT EXISTS idx_activities_sync_status ON activities (sync_status);

      CREATE TABLE IF NOT EXISTS activity_samples (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        activity_id TEXT NOT NULL REFERENCES activities (id) ON DELETE CASCADE,
        seq INTEGER NOT NULL,
        ts_ms INTEGER NOT NULL,
        lat REAL,
        lng REAL,
        alt_m REAL,
        hr INTEGER,
        UNIQUE (activity_id, seq)
      );
      CREATE INDEX IF NOT EXISTS idx_samples_activity ON activity_samples (activity_id, seq);

      CREATE TABLE IF NOT EXISTS daily_checkins (
        date_iso TEXT PRIMARY KEY NOT NULL,
        client_id TEXT UNIQUE NOT NULL,
        energy INTEGER NOT NULL CHECK (energy BETWEEN 1 AND 5),
        sleep_hours TEXT NOT NULL,
        mood TEXT NOT NULL,
        difficult_day INTEGER NOT NULL DEFAULT 0,
        reason TEXT,
        updated_at TEXT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'pending' ${SYNC_STATUS_CHECK}
      );

      CREATE TABLE IF NOT EXISTS workout_reports (
        id TEXT PRIMARY KEY NOT NULL,
        client_id TEXT UNIQUE NOT NULL,
        activity_id TEXT REFERENCES activities (id) ON DELETE SET NULL,
        sport TEXT NOT NULL,
        elapsed_label TEXT NOT NULL,
        timestamp_label TEXT NOT NULL,
        text TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'pending' ${SYNC_STATUS_CHECK}
      );
      CREATE INDEX IF NOT EXISTS idx_reports_activity ON workout_reports (activity_id);

      CREATE TABLE IF NOT EXISTS memory_facts (
        id TEXT PRIMARY KEY NOT NULL,
        client_id TEXT UNIQUE NOT NULL,
        layer TEXT NOT NULL CHECK (layer IN ('Semântica','Episódica','Perfil','Padrão')),
        text TEXT NOT NULL,
        date_label TEXT,
        sensitive INTEGER NOT NULL DEFAULT 0,
        is_demo INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'pending' ${SYNC_STATUS_CHECK}
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY NOT NULL,
        sender TEXT NOT NULL CHECK (sender IN ('agent','user')),
        text TEXT NOT NULL,
        timestamp_label TEXT NOT NULL,
        metric_card_json TEXT,
        is_demo INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_messages (created_at);

      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY NOT NULL,
        entity TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL CHECK (operation IN ('upsert','delete')),
        payload_json TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        next_retry_at INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_sync_queue_due ON sync_queue (next_retry_at, created_at);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_entity ON sync_queue (entity, entity_id);
    `,
  },
  {
    // v2: contas locais com senha + isolamento por user_id.
    version: 2,
    sql: `
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY NOT NULL,
        email TEXT NOT NULL UNIQUE COLLATE NOCASE,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        password_salt TEXT NOT NULL,
        favorite_sport TEXT NOT NULL,
        agent_tone TEXT NOT NULL,
        custom_tone_note TEXT NOT NULL DEFAULT '',
        theme_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        last_login_at TEXT,
        sync_status TEXT NOT NULL DEFAULT 'pending' ${SYNC_STATUS_CHECK}
      );

      DROP TABLE IF EXISTS user_profile;

      ALTER TABLE activities ADD COLUMN user_id TEXT;
      ALTER TABLE workout_reports ADD COLUMN user_id TEXT;
      ALTER TABLE memory_facts ADD COLUMN user_id TEXT;
      ALTER TABLE chat_messages ADD COLUMN user_id TEXT;
      ALTER TABLE sync_queue ADD COLUMN user_id TEXT;

      -- Os dados de demonstração agora são criados por conta, no cadastro.
      DELETE FROM activities WHERE is_demo = 1;
      DELETE FROM memory_facts WHERE is_demo = 1;
      DELETE FROM chat_messages WHERE is_demo = 1;
      DELETE FROM app_settings WHERE key IN ('seed.demo_v1', 'session', 'notifications', 'privacy', 'achievements.ai_accepted');
      DELETE FROM sync_queue WHERE entity IN ('profile', 'settings');

      -- Check-in passa a ter chave (user_id, date_iso).
      CREATE TABLE daily_checkins_v2 (
        user_id TEXT NOT NULL DEFAULT '',
        date_iso TEXT NOT NULL,
        client_id TEXT UNIQUE NOT NULL,
        energy INTEGER NOT NULL CHECK (energy BETWEEN 1 AND 5),
        sleep_hours TEXT NOT NULL,
        mood TEXT NOT NULL,
        difficult_day INTEGER NOT NULL DEFAULT 0,
        reason TEXT,
        updated_at TEXT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'pending' ${SYNC_STATUS_CHECK},
        PRIMARY KEY (user_id, date_iso)
      );
      INSERT INTO daily_checkins_v2
        (user_id, date_iso, client_id, energy, sleep_hours, mood, difficult_day, reason, updated_at, sync_status)
        SELECT '', date_iso, client_id, energy, sleep_hours, mood, difficult_day, reason, updated_at, sync_status
        FROM daily_checkins;
      DROP TABLE daily_checkins;
      ALTER TABLE daily_checkins_v2 RENAME TO daily_checkins;
      UPDATE sync_queue
        SET entity_id = (SELECT client_id FROM daily_checkins WHERE daily_checkins.date_iso = sync_queue.entity_id)
        WHERE entity = 'checkin';
      DELETE FROM sync_queue WHERE entity = 'checkin' AND entity_id IS NULL;

      CREATE INDEX IF NOT EXISTS idx_activities_user ON activities (user_id, started_at DESC);
      CREATE INDEX IF NOT EXISTS idx_reports_user ON workout_reports (user_id);
      CREATE INDEX IF NOT EXISTS idx_memories_user ON memory_facts (user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_messages (user_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_user ON sync_queue (user_id);
    `,
  },
  // Próximas mudanças de schema: adicione { version: 3, sql: `ALTER TABLE ...` } aqui.
  // Nunca edite uma migration que já foi para o aparelho de alguém.
];

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let current = row?.user_version ?? 0;

  for (const migration of MIGRATIONS) {
    if (migration.version <= current) continue;
    await writeTx(db, async () => {
      await db.execAsync(migration.sql);
      await db.execAsync(`PRAGMA user_version = ${migration.version}`);
    });
    current = migration.version;
  }
}

// ---------------------------------------------------------------------------
// Conexão (singleton)
// ---------------------------------------------------------------------------

/**
 * Serializa as transações de escrita. Sem isso, duas gravações disparadas ao mesmo
 * tempo pela UI tentariam abrir transações aninhadas e o SQLite recusaria.
 */
let writeChain: Promise<unknown> = Promise.resolve();

function writeTx(db: SQLite.SQLiteDatabase, task: () => Promise<void>): Promise<void> {
  const run = writeChain.then(() => db.withTransactionAsync(task));
  writeChain = run.catch(() => undefined);
  return run;
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function openAndPrepare(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  if (Platform.OS !== 'web') {
    await db.execAsync('PRAGMA journal_mode = WAL;');
  }
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await runMigrations(db);
  return db;
}

/** Abre (uma única vez) o banco e roda as migrations. */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openAndPrepare().catch((error: unknown) => {
      dbPromise = null; // permite tentar de novo
      throw error;
    });
  }
  return dbPromise;
}

export const initDatabase = getDatabase;

// ---------------------------------------------------------------------------
// Fila de sincronização (helpers internos)
// ---------------------------------------------------------------------------

/**
 * Coloca uma operação na fila. Se já existe item pendente para a mesma entidade,
 * ele é substituído pela versão mais nova (o servidor é idempotente por clientId).
 */
async function enqueue(
  db: SQLite.SQLiteDatabase,
  userId: string,
  entity: SyncEntity,
  entityId: string,
  operation: SyncOperation,
  payload: Record<string, unknown>
): Promise<void> {
  await db.runAsync('DELETE FROM sync_queue WHERE entity = ? AND entity_id = ?', entity, entityId);
  await db.runAsync(
    `INSERT INTO sync_queue (id, user_id, entity, entity_id, operation, payload_json, attempts, next_retry_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?)`,
    newClientId(),
    userId,
    entity,
    entityId,
    operation,
    JSON.stringify(payload),
    Date.now()
  );
}

const ENTITY_TABLE: Partial<Record<SyncEntity, { table: string; key: string }>> = {
  activity: { table: 'activities', key: 'id' },
  checkin: { table: 'daily_checkins', key: 'client_id' },
  workout_report: { table: 'workout_reports', key: 'id' },
  memory: { table: 'memory_facts', key: 'id' },
  profile: { table: 'accounts', key: 'id' },
};

// ---------------------------------------------------------------------------
// Linhas do banco → tipos da UI
// ---------------------------------------------------------------------------

interface ActivityRow {
  id: string;
  client_id: string;
  sport: string;
  title: string;
  started_at: string;
  duration_sec: number;
  distance_m: number;
  elevation_gain_m: number;
  avg_pace_sec: number | null;
  avg_heart_rate: number | null;
  cadence_spm: number | null;
  calories: number | null;
  route_polyline: string | null;
  details_json: string;
  is_demo: number;
  sync_status: SyncStatus;
}

interface ActivityDetails {
  dateLabel?: string;
  timeLabel?: string;
  durationLabel?: string;
  paceLabel?: string;
  elevationSeries?: number[];
  paceSeries?: number[];
  splits?: SplitMetric[];
  comparisonHeadline?: string;
  comparisonDeltaLabel?: string;
  isBetterThanYesterday?: boolean;
  aiSummary?: string;
}

function activityToDetails(activity: Activity): ActivityDetails {
  return {
    dateLabel: activity.dateLabel,
    timeLabel: activity.timeLabel,
    durationLabel: activity.durationLabel,
    paceLabel: activity.paceLabel,
    elevationSeries: activity.elevationSeries,
    paceSeries: activity.paceSeries,
    splits: activity.splits,
    comparisonHeadline: activity.comparisonHeadline,
    comparisonDeltaLabel: activity.comparisonDeltaLabel,
    isBetterThanYesterday: activity.isBetterThanYesterday,
    aiSummary: activity.aiSummary,
  };
}

function rowToActivity(row: ActivityRow): Activity {
  const d = safeParse<ActivityDetails>(row.details_json, {});
  const isDemo = row.is_demo === 1;
  return {
    id: row.id,
    title: row.title,
    sport: row.sport as SportType,
    // Datas reais são recalculadas na leitura ("Hoje" vira "Ontem" no dia seguinte).
    dateLabel: isDemo ? d.dateLabel ?? '' : formatDateLabel(row.started_at),
    timeLabel: isDemo ? d.timeLabel ?? '' : formatTimeLabel(row.started_at),
    distanceKm: Number((row.distance_m / 1000).toFixed(2)),
    durationLabel: d.durationLabel ?? '',
    paceLabel: d.paceLabel ?? '',
    paceSeconds: row.avg_pace_sec ?? 0,
    elevationGainM: row.elevation_gain_m,
    avgHeartRate: row.avg_heart_rate ?? 0,
    cadenceSpm: row.cadence_spm ?? 0,
    calories: row.calories ?? 0,
    routePath: row.route_polyline ?? '',
    elevationSeries: d.elevationSeries ?? [],
    paceSeries: d.paceSeries ?? [],
    splits: d.splits ?? [],
    comparisonHeadline: d.comparisonHeadline ?? '',
    comparisonDeltaLabel: d.comparisonDeltaLabel ?? '',
    isBetterThanYesterday: d.isBetterThanYesterday ?? false,
    aiSummary: d.aiSummary ?? '',
  };
}

interface MemoryRow {
  id: string;
  layer: MemoryFact['layer'];
  text: string;
  date_label: string | null;
  sensitive: number;
  is_demo: number;
  created_at: string;
}

function rowToMemory(row: MemoryRow): MemoryFact {
  return {
    id: row.id,
    layer: row.layer,
    text: row.text,
    date: row.is_demo === 1 && row.date_label ? row.date_label : formatMemoryDateLabel(row.created_at),
    sensitive: row.sensitive === 1 ? true : undefined,
  };
}

interface ChatRow {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  timestamp_label: string;
  metric_card_json: string | null;
}

function rowToChat(row: ChatRow): ChatMessage {
  const card = safeParse<ChatMetricSnapshot | null>(row.metric_card_json, null);
  return {
    id: row.id,
    sender: row.sender,
    text: row.text,
    timestamp: row.timestamp_label,
    ...(card ? { metricCard: card } : {}),
  };
}

interface CheckInRow {
  energy: number;
  sleep_hours: string;
  mood: CheckInState['mood'];
  difficult_day: number;
  reason: string | null;
}

interface AccountRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  password_salt: string;
  favorite_sport: string;
  agent_tone: string;
  custom_tone_note: string;
  theme_id: string;
}

interface SampleRow {
  seq: number;
  ts_ms: number;
  lat: number | null;
  lng: number | null;
  alt_m: number | null;
  hr: number | null;
}

interface ReportRow {
  id: string;
  sport: string;
  elapsed_label: string;
  timestamp_label: string;
  text: string;
}

interface SyncQueueRow {
  id: string;
  user_id: string | null;
  entity: SyncEntity;
  entity_id: string;
  operation: SyncOperation;
  payload_json: string;
  attempts: number;
  next_retry_at: number;
  last_error: string | null;
  created_at: number;
}

function rowToAccount(row: AccountRow): LocalAccount {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    favoriteSport: row.favorite_sport as SportType,
    agentTone: row.agent_tone as AgentTone,
    customToneNote: row.custom_tone_note,
    themeId: row.theme_id as ThemeId,
  };
}

// ---------------------------------------------------------------------------
// Dados de demonstração por conta (mantém o protótipo visual no primeiro uso)
// ---------------------------------------------------------------------------

async function seedDemoForUser(
  db: SQLite.SQLiteDatabase,
  userId: string,
  userName: string
): Promise<void> {
  const now = Date.now();
  const created = nowIso();
  const firstName = userName.trim().split(/\s+/)[0] || 'atleta';
  const personalize = (text: string) => text.replace(/Erick/g, firstName);

  for (let i = 0; i < ACTIVITIES_MOCK.length; i += 1) {
    const a = ACTIVITIES_MOCK[i];
    const id = `${userId}:${a.id}`;
    await db.runAsync(
      `INSERT OR IGNORE INTO activities
        (id, client_id, user_id, sport, title, started_at, duration_sec, distance_m, elevation_gain_m,
         avg_pace_sec, avg_heart_rate, cadence_spm, calories, route_polyline, details_json,
         is_demo, created_at, updated_at, sync_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, 'local_only')`,
      id,
      `demo:${id}`,
      userId,
      a.sport,
      a.title,
      new Date(now - (i + 1) * 86_400_000).toISOString(),
      parseDurationLabel(a.durationLabel),
      Math.round(a.distanceKm * 1000),
      a.elevationGainM,
      a.paceSeconds,
      a.avgHeartRate,
      a.cadenceSpm,
      a.calories,
      a.routePath,
      JSON.stringify({ ...activityToDetails(a), aiSummary: personalize(a.aiSummary) }),
      created,
      created
    );
  }

  for (const m of MEMORY_FACTS_MOCK) {
    const id = `${userId}:${m.id}`;
    await db.runAsync(
      `INSERT OR IGNORE INTO memory_facts
        (id, client_id, user_id, layer, text, date_label, sensitive, is_demo, created_at, updated_at, sync_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, 'local_only')`,
      id,
      `demo:${id}`,
      userId,
      m.layer,
      personalize(m.text),
      m.date,
      m.sensitive ? 1 : 0,
      created,
      created
    );
  }

  for (let i = 0; i < INITIAL_CHAT_MESSAGES.length; i += 1) {
    const msg = INITIAL_CHAT_MESSAGES[i];
    await db.runAsync(
      `INSERT OR IGNORE INTO chat_messages
        (id, user_id, sender, text, timestamp_label, metric_card_json, is_demo, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
      `${userId}:${msg.id}`,
      userId,
      msg.sender,
      personalize(msg.text),
      msg.timestamp,
      msg.metricCard ? JSON.stringify(msg.metricCard) : null,
      now - (INITIAL_CHAT_MESSAGES.length - i) * 1000
    );
  }
}

/** Dados gravados antes das contas existirem (v1) ficam com a primeira conta criada. */
async function claimOrphanData(db: SQLite.SQLiteDatabase, userId: string): Promise<void> {
  await db.runAsync('UPDATE activities SET user_id = ? WHERE user_id IS NULL', userId);
  await db.runAsync('UPDATE workout_reports SET user_id = ? WHERE user_id IS NULL', userId);
  await db.runAsync('UPDATE memory_facts SET user_id = ? WHERE user_id IS NULL', userId);
  await db.runAsync('UPDATE chat_messages SET user_id = ? WHERE user_id IS NULL', userId);
  await db.runAsync('UPDATE sync_queue SET user_id = ? WHERE user_id IS NULL', userId);
  await db.runAsync(`UPDATE daily_checkins SET user_id = ? WHERE user_id = ''`, userId);
}

// ---------------------------------------------------------------------------
// Repositórios
// ---------------------------------------------------------------------------

export const settingsRepo = {
  async get<T>(key: string): Promise<T | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ value_json: string }>(
      'SELECT value_json FROM app_settings WHERE key = ?',
      key
    );
    return row ? safeParse<T | null>(row.value_json, null) : null;
  },

  async set(
    key: string,
    value: unknown,
    options: { syncForUserId?: string; syncKey?: string } = {}
  ): Promise<void> {
    const db = await getDatabase();
    await writeTx(db, async () => {
      await db.runAsync(
        'INSERT OR REPLACE INTO app_settings (key, value_json, updated_at) VALUES (?, ?, ?)',
        key,
        JSON.stringify(value),
        nowIso()
      );
      if (options.syncForUserId) {
        await enqueue(db, options.syncForUserId, 'settings', key, 'upsert', {
          key: options.syncKey ?? key,
          value,
          updatedAt: nowIso(),
        });
      }
    });
  },
};

export const sessionRepo = {
  async getUserId(): Promise<string | null> {
    const value = await settingsRepo.get<{ userId: string | null }>(SETTINGS_KEYS.session);
    return value?.userId ?? null;
  },

  async setUserId(userId: string | null): Promise<void> {
    await settingsRepo.set(SETTINGS_KEYS.session, { userId });
  },
};

export const accountsRepo = {
  async getById(id: string): Promise<LocalAccount | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<AccountRow>('SELECT * FROM accounts WHERE id = ?', id);
    return row ? rowToAccount(row) : null;
  },

  /** Cria a conta local, os dados de demonstração e já deixa a sessão ativa. */
  async register(input: RegisterAccountInput): Promise<AccountResult> {
    const email = normalizeEmail(input.email);
    const name = input.name.trim();
    if (!name || !email) return { ok: false, error: 'Preencha nome e e-mail.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: 'Digite um e-mail válido.' };
    }
    if (input.password.length < MIN_PASSWORD_LENGTH) {
      return { ok: false, error: `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.` };
    }

    const db = await getDatabase();
    const existing = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM accounts WHERE email = ?',
      email
    );
    if (existing) {
      return { ok: false, error: 'Já existe uma conta com este e-mail neste aparelho. Faça login.' };
    }

    const id = newClientId();
    const salt = newClientId().replace(/-/g, '');
    const passwordHash = await hashPassword(input.password, salt);
    const ts = nowIso();
    const account: LocalAccount = {
      id,
      name,
      email,
      favoriteSport: input.favoriteSport,
      agentTone: input.agentTone,
      customToneNote: input.customToneNote ?? '',
      themeId: input.themeId ?? 'vybra-neon',
    };

    try {
      await writeTx(db, async () => {
        const count = await db.getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM accounts');
        await db.runAsync(
          `INSERT INTO accounts
             (id, email, name, password_hash, password_salt, favorite_sport, agent_tone,
              custom_tone_note, theme_id, created_at, updated_at, last_login_at, sync_status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
          id,
          email,
          name,
          passwordHash,
          salt,
          account.favoriteSport,
          account.agentTone,
          account.customToneNote,
          account.themeId,
          ts,
          ts,
          ts
        );
        if ((count?.total ?? 0) === 0) await claimOrphanData(db, id);

        const hasActivities = await db.getFirstAsync<{ id: string }>(
          'SELECT id FROM activities WHERE user_id = ? LIMIT 1',
          id
        );
        if (!hasActivities) await seedDemoForUser(db, id, name);

        await db.runAsync(
          'INSERT OR REPLACE INTO app_settings (key, value_json, updated_at) VALUES (?, ?, ?)',
          SETTINGS_KEYS.session,
          JSON.stringify({ userId: id }),
          ts
        );
        // POST /auth/register (a senha NÃO entra na fila: será pedida no primeiro login online)
        const { id: _omit, ...profile } = account;
        await enqueue(db, id, 'profile', id, 'upsert', { ...profile, updatedAt: ts });
      });
    } catch (error) {
      const message = String(error);
      if (message.includes('UNIQUE')) {
        return { ok: false, error: 'Já existe uma conta com este e-mail neste aparelho. Faça login.' };
      }
      throw error;
    }

    return { ok: true, account };
  },

  /** Confere e-mail + senha e ativa a sessão. */
  async login(emailInput: string, password: string): Promise<AccountResult> {
    const email = normalizeEmail(emailInput);
    if (!email || !password) return { ok: false, error: 'Informe e-mail e senha para entrar.' };

    const db = await getDatabase();
    const row = await db.getFirstAsync<AccountRow>('SELECT * FROM accounts WHERE email = ?', email);
    const invalid: AccountResult = { ok: false, error: 'E-mail ou senha incorretos.' };
    if (!row) return invalid;

    const hash = await hashPassword(password, row.password_salt);
    if (hash !== row.password_hash) return invalid;

    const ts = nowIso();
    await writeTx(db, async () => {
      await db.runAsync('UPDATE accounts SET last_login_at = ? WHERE id = ?', ts, row.id);
      await db.runAsync(
        'INSERT OR REPLACE INTO app_settings (key, value_json, updated_at) VALUES (?, ?, ?)',
        SETTINGS_KEYS.session,
        JSON.stringify({ userId: row.id }),
        ts
      );
    });
    return { ok: true, account: rowToAccount(row) };
  },

  async updateProfile(userId: string, profile: LocalProfile): Promise<void> {
    const db = await getDatabase();
    const ts = nowIso();
    await writeTx(db, async () => {
      await db.runAsync(
        `UPDATE accounts SET
           name = ?, favorite_sport = ?, agent_tone = ?, custom_tone_note = ?, theme_id = ?,
           updated_at = ?, sync_status = 'pending'
         WHERE id = ?`,
        profile.name,
        profile.favoriteSport,
        profile.agentTone,
        profile.customToneNote,
        profile.themeId,
        ts,
        userId
      );
      // O e-mail é a identidade da conta: não muda por aqui.
      const { email: _email, ...rest } = profile;
      await enqueue(db, userId, 'profile', userId, 'upsert', { ...rest, updatedAt: ts });
    });
  },
};

export const activitiesRepo = {
  async list(userId: string, limit = 200): Promise<Activity[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ActivityRow>(
      'SELECT * FROM activities WHERE user_id = ? ORDER BY started_at DESC LIMIT ?',
      userId,
      limit
    );
    return rows.map(rowToActivity);
  },

  async getById(userId: string, id: string): Promise<Activity | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<ActivityRow>(
      'SELECT * FROM activities WHERE id = ? AND user_id = ?',
      id,
      userId
    );
    return row ? rowToActivity(row) : null;
  },

  /** Grava atividade + amostras GPS + vínculo dos reportes + fila de sync, tudo numa transação. */
  async saveCompleted(userId: string, input: SaveActivityInput): Promise<void> {
    const db = await getDatabase();
    const { activity, clientId, startedAtIso, durationSec } = input;
    const ts = nowIso();
    const distanceM = Math.round(activity.distanceKm * 1000);

    await writeTx(db, async () => {
      await db.runAsync(
        `INSERT INTO activities
          (id, client_id, user_id, sport, title, started_at, duration_sec, distance_m, elevation_gain_m,
           avg_pace_sec, avg_heart_rate, cadence_spm, calories, route_polyline, details_json,
           is_demo, created_at, updated_at, sync_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 'pending')
         ON CONFLICT (client_id) DO UPDATE SET
           title = excluded.title,
           duration_sec = excluded.duration_sec,
           distance_m = excluded.distance_m,
           elevation_gain_m = excluded.elevation_gain_m,
           avg_pace_sec = excluded.avg_pace_sec,
           details_json = excluded.details_json,
           updated_at = excluded.updated_at,
           sync_status = 'pending'`,
        activity.id,
        clientId,
        userId,
        activity.sport,
        activity.title,
        startedAtIso,
        durationSec,
        distanceM,
        activity.elevationGainM,
        activity.paceSeconds,
        activity.avgHeartRate,
        activity.cadenceSpm,
        activity.calories,
        activity.routePath,
        JSON.stringify(activityToDetails(activity)),
        ts,
        ts
      );

      if (input.samples?.length) {
        await insertSamples(db, activity.id, input.samples, 0);
      }

      if (input.reportIds?.length) {
        for (const reportId of input.reportIds) {
          await db.runAsync(
            `UPDATE workout_reports SET activity_id = ?, updated_at = ?, sync_status = 'pending'
             WHERE id = ? AND user_id = ?`,
            activity.id,
            ts,
            reportId,
            userId
          );
        }
      }

      // POST /activities/sync
      await enqueue(db, userId, 'activity', activity.id, 'upsert', {
        clientId,
        sport: activity.sport,
        title: activity.title,
        startedAt: startedAtIso,
        durationSec,
        distanceM,
        elevationGainM: activity.elevationGainM,
        avgPaceSec: activity.paceSeconds,
        routePolyline: activity.routePath,
        // As amostras GPS são lidas na hora do envio (activitiesRepo.getSamples).
        hasSamples: Boolean(input.samples?.length),
        updatedAt: ts,
      });
    });
  },

  /** Para o Passo 4: gravar lotes de GPS a cada poucos segundos durante a corrida. */
  async appendSamples(activityId: string, samples: ActivitySampleInput[]): Promise<void> {
    if (!samples.length) return;
    const db = await getDatabase();
    await writeTx(db, async () => {
      const row = await db.getFirstAsync<{ max_seq: number | null }>(
        'SELECT MAX(seq) AS max_seq FROM activity_samples WHERE activity_id = ?',
        activityId
      );
      await insertSamples(db, activityId, samples, (row?.max_seq ?? -1) + 1);
    });
  },

  async getSamples(activityId: string): Promise<(ActivitySampleInput & { seq: number })[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<SampleRow>(
      'SELECT seq, ts_ms, lat, lng, alt_m, hr FROM activity_samples WHERE activity_id = ? ORDER BY seq',
      activityId
    );
    return rows.map((r: SampleRow) => ({
      seq: r.seq,
      tsMs: r.ts_ms,
      lat: r.lat,
      lng: r.lng,
      altM: r.alt_m,
      hr: r.hr,
    }));
  },
};

async function insertSamples(
  db: SQLite.SQLiteDatabase,
  activityId: string,
  samples: ActivitySampleInput[],
  startSeq: number
): Promise<void> {
  const statement = await db.prepareAsync(
    `INSERT OR IGNORE INTO activity_samples (activity_id, seq, ts_ms, lat, lng, alt_m, hr)
     VALUES ($activityId, $seq, $tsMs, $lat, $lng, $altM, $hr)`
  );
  try {
    for (let i = 0; i < samples.length; i += 1) {
      const s = samples[i];
      await statement.executeAsync({
        $activityId: activityId,
        $seq: startSeq + i,
        $tsMs: s.tsMs,
        $lat: s.lat ?? null,
        $lng: s.lng ?? null,
        $altM: s.altM ?? null,
        $hr: s.hr ?? null,
      });
    }
  } finally {
    await statement.finalizeAsync();
  }
}

export const checkinsRepo = {
  async getByDate(userId: string, dateIso: string = todayIsoDate()): Promise<CheckInState | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<CheckInRow>(
      `SELECT energy, sleep_hours, mood, difficult_day, reason
       FROM daily_checkins WHERE user_id = ? AND date_iso = ?`,
      userId,
      dateIso
    );
    if (!row) return null;
    return {
      energy: Math.min(5, Math.max(1, row.energy)) as CheckInState['energy'],
      sleepHours: row.sleep_hours,
      mood: row.mood,
      difficultDayActive: row.difficult_day === 1,
      ...(row.reason ? { difficultReason: row.reason } : {}),
    };
  },

  async upsertToday(
    userId: string,
    checkIn: CheckInState,
    dateIso: string = todayIsoDate()
  ): Promise<void> {
    const db = await getDatabase();
    const ts = nowIso();
    await writeTx(db, async () => {
      const existing = await db.getFirstAsync<{ client_id: string }>(
        'SELECT client_id FROM daily_checkins WHERE user_id = ? AND date_iso = ?',
        userId,
        dateIso
      );
      const clientId = existing?.client_id ?? newClientId();
      await db.runAsync(
        `INSERT INTO daily_checkins
           (user_id, date_iso, client_id, energy, sleep_hours, mood, difficult_day, reason, updated_at, sync_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
         ON CONFLICT (user_id, date_iso) DO UPDATE SET
           energy = excluded.energy,
           sleep_hours = excluded.sleep_hours,
           mood = excluded.mood,
           difficult_day = excluded.difficult_day,
           reason = excluded.reason,
           updated_at = excluded.updated_at,
           sync_status = 'pending'`,
        userId,
        dateIso,
        clientId,
        checkIn.energy,
        checkIn.sleepHours,
        checkIn.mood,
        checkIn.difficultDayActive ? 1 : 0,
        checkIn.difficultReason ?? null,
        ts
      );
      // PUT /checkins/today
      await enqueue(db, userId, 'checkin', clientId, 'upsert', {
        clientId,
        dateIso,
        ...checkIn,
        updatedAt: ts,
      });
    });
  },
};

export const reportsRepo = {
  async insert(userId: string, report: WorkoutReport, clientId: string = newClientId()): Promise<void> {
    const db = await getDatabase();
    const ts = nowIso();
    await writeTx(db, async () => {
      await db.runAsync(
        `INSERT OR IGNORE INTO workout_reports
           (id, client_id, user_id, activity_id, sport, elapsed_label, timestamp_label, text, created_at, updated_at, sync_status)
         VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, 'pending')`,
        report.id,
        clientId,
        userId,
        report.sport,
        report.elapsedLabel,
        report.timestamp,
        report.text,
        ts,
        ts
      );
      // POST /workouts/reports
      await enqueue(db, userId, 'workout_report', report.id, 'upsert', {
        clientId,
        sport: report.sport,
        elapsedLabel: report.elapsedLabel,
        text: report.text,
        createdAt: ts,
      });
    });
  },

  async listByActivity(userId: string, activityId: string): Promise<WorkoutReport[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ReportRow>(
      `SELECT id, sport, elapsed_label, timestamp_label, text FROM workout_reports
       WHERE user_id = ? AND activity_id = ? ORDER BY created_at`,
      userId,
      activityId
    );
    return rows.map((r: ReportRow) => ({
      id: r.id,
      sport: r.sport as SportType,
      elapsedLabel: r.elapsed_label,
      timestamp: r.timestamp_label,
      text: r.text,
    }));
  },
};

export const memoriesRepo = {
  async list(userId: string): Promise<MemoryFact[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<MemoryRow>(
      `SELECT id, layer, text, date_label, sensitive, is_demo, created_at
       FROM memory_facts WHERE user_id = ? ORDER BY is_demo ASC, created_at DESC`,
      userId
    );
    return rows.map(rowToMemory);
  },

  async insert(userId: string, fact: MemoryFact, clientId: string = newClientId()): Promise<void> {
    const db = await getDatabase();
    const ts = nowIso();
    await writeTx(db, async () => {
      await db.runAsync(
        `INSERT OR IGNORE INTO memory_facts
           (id, client_id, user_id, layer, text, date_label, sensitive, is_demo, created_at, updated_at, sync_status)
         VALUES (?, ?, ?, ?, ?, NULL, ?, 0, ?, ?, 'pending')`,
        fact.id,
        clientId,
        userId,
        fact.layer,
        fact.text,
        fact.sensitive ? 1 : 0,
        ts,
        ts
      );
      // POST /memories
      await enqueue(db, userId, 'memory', fact.id, 'upsert', {
        clientId,
        layer: fact.layer,
        text: fact.text,
        sensitive: Boolean(fact.sensitive),
        updatedAt: ts,
      });
    });
  },

  async remove(userId: string, id: string): Promise<void> {
    const db = await getDatabase();
    await writeTx(db, async () => {
      const row = await db.getFirstAsync<{ client_id: string; is_demo: number }>(
        'SELECT client_id, is_demo FROM memory_facts WHERE id = ? AND user_id = ?',
        id,
        userId
      );
      if (!row) return;
      await db.runAsync('DELETE FROM memory_facts WHERE id = ? AND user_id = ?', id, userId);
      if (row.is_demo === 1) {
        await db.runAsync('DELETE FROM sync_queue WHERE entity = ? AND entity_id = ?', 'memory', id);
        return;
      }
      // DELETE /memories/:id (apaga fato e embedding no servidor)
      await enqueue(db, userId, 'memory', id, 'delete', { clientId: row.client_id });
    });
  },
};

export const chatRepo = {
  async list(userId: string, limit = 300): Promise<ChatMessage[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ChatRow>(
      `SELECT id, sender, text, timestamp_label, metric_card_json FROM (
         SELECT id, sender, text, timestamp_label, metric_card_json, created_at, rowid AS rid
         FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC, rid DESC LIMIT ?
       ) ORDER BY created_at ASC, rid ASC`,
      userId,
      limit
    );
    return rows.map(rowToChat);
  },

  async insertMany(userId: string, messages: ChatMessage[]): Promise<void> {
    if (!messages.length) return;
    const db = await getDatabase();
    const base = Date.now();
    await writeTx(db, async () => {
      for (let i = 0; i < messages.length; i += 1) {
        const msg = messages[i];
        await db.runAsync(
          `INSERT OR IGNORE INTO chat_messages
             (id, user_id, sender, text, timestamp_label, metric_card_json, is_demo, created_at)
           VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
          msg.id,
          userId,
          msg.sender,
          msg.text,
          msg.timestamp,
          msg.metricCard ? JSON.stringify(msg.metricCard) : null,
          base + i
        );
      }
    });
  },

  async insert(userId: string, message: ChatMessage): Promise<void> {
    await chatRepo.insertMany(userId, [message]);
  },
};

/** Fila consumida pelo futuro src/services/syncManager.ts. */
export const syncQueueRepo = {
  async listDue(limit = 25, now: number = Date.now()): Promise<SyncQueueItem[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<SyncQueueRow>(
      'SELECT * FROM sync_queue WHERE next_retry_at <= ? ORDER BY created_at ASC LIMIT ?',
      now,
      limit
    );
    return rows.map((r: SyncQueueRow) => ({
      id: r.id,
      userId: r.user_id,
      entity: r.entity,
      entityId: r.entity_id,
      operation: r.operation,
      payload: safeParse<Record<string, unknown>>(r.payload_json, {}),
      attempts: r.attempts,
      nextRetryAt: r.next_retry_at,
      lastError: r.last_error,
      createdAt: r.created_at,
    }));
  },

  async countPending(userId?: string): Promise<number> {
    const db = await getDatabase();
    const row = userId
      ? await db.getFirstAsync<{ total: number }>(
          'SELECT COUNT(*) AS total FROM sync_queue WHERE user_id = ?',
          userId
        )
      : await db.getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM sync_queue');
    return row?.total ?? 0;
  },

  /** Servidor confirmou: remove da fila e marca a entidade como 'synced' (se não houver versão mais nova na fila). */
  async markSuccess(item: SyncQueueItem): Promise<void> {
    const db = await getDatabase();
    await writeTx(db, async () => {
      await db.runAsync('DELETE FROM sync_queue WHERE id = ?', item.id);
      const target = ENTITY_TABLE[item.entity];
      if (!target || item.operation === 'delete') return;
      const newer = await db.getFirstAsync<{ id: string }>(
        'SELECT id FROM sync_queue WHERE entity = ? AND entity_id = ?',
        item.entity,
        item.entityId
      );
      if (newer) return;
      await db.runAsync(
        `UPDATE ${target.table} SET sync_status = 'synced' WHERE ${target.key} = ?`,
        item.entityId
      );
    });
  },

  /** Falhou: backoff exponencial (5s, 10s, 20s ... até 15 min). */
  async markFailure(item: SyncQueueItem, error: string): Promise<void> {
    const db = await getDatabase();
    const attempts = item.attempts + 1;
    const delay = Math.min(5_000 * 2 ** (attempts - 1), 15 * 60_000);
    await writeTx(db, async () => {
      await db.runAsync(
        'UPDATE sync_queue SET attempts = ?, next_retry_at = ?, last_error = ? WHERE id = ?',
        attempts,
        Date.now() + delay,
        error.slice(0, 500),
        item.id
      );
      const target = ENTITY_TABLE[item.entity];
      if (target && attempts >= 5) {
        await db.runAsync(
          `UPDATE ${target.table} SET sync_status = 'error' WHERE ${target.key} = ?`,
          item.entityId
        );
      }
    });
  },
};

// ---------------------------------------------------------------------------
// Carga inicial e LGPD
// ---------------------------------------------------------------------------

/** Conta que estava logada quando o app foi fechado (ou null). */
export async function loadSessionAccount(): Promise<LocalAccount | null> {
  const userId = await sessionRepo.getUserId();
  if (!userId) return null;
  const account = await accountsRepo.getById(userId);
  if (!account) await sessionRepo.setUserId(null);
  return account;
}

/** Lê tudo o que o VybraContext precisa para a conta logada. */
export async function loadUserData(userId: string): Promise<UserDataSnapshot> {
  const [activities, memories, chatMessages, todayCheckIn, notifications, privacy, ai] =
    await Promise.all([
      activitiesRepo.list(userId),
      memoriesRepo.list(userId),
      chatRepo.list(userId),
      checkinsRepo.getByDate(userId),
      settingsRepo.get<StoredNotificationSettings>(userSettingKey(userId, SETTINGS_KEYS.notifications)),
      settingsRepo.get<PrivacySettings>(userSettingKey(userId, SETTINGS_KEYS.privacy)),
      settingsRepo.get<Record<string, boolean>>(userSettingKey(userId, SETTINGS_KEYS.aiChallenge)),
    ]);

  let normalizedNotifications: NotificationSettings | null = null;
  if (notifications) {
    const { leaveMeAloneDateIso, ...rest } = notifications;
    // "Me deixe em paz hoje" vale só para o dia em que foi ligado.
    normalizedNotifications = {
      ...rest,
      leaveMeAloneToday: rest.leaveMeAloneToday && leaveMeAloneDateIso === todayIsoDate(),
    };
  }

  return {
    activities,
    memories,
    chatMessages,
    todayCheckIn,
    notifications: normalizedNotifications,
    privacy,
    aiChallengeAccepted: ai,
  };
}

/** Exclusão definitiva da conta e de todos os dados dela neste aparelho (LGPD · DELETE /account). */
export async function deleteAccountLocalData(userId: string): Promise<void> {
  const db = await getDatabase();
  await writeTx(db, async () => {
    await db.runAsync(
      'DELETE FROM activity_samples WHERE activity_id IN (SELECT id FROM activities WHERE user_id = ?)',
      userId
    );
    await db.runAsync('DELETE FROM workout_reports WHERE user_id = ?', userId);
    await db.runAsync('DELETE FROM activities WHERE user_id = ?', userId);
    await db.runAsync('DELETE FROM daily_checkins WHERE user_id = ?', userId);
    await db.runAsync('DELETE FROM memory_facts WHERE user_id = ?', userId);
    await db.runAsync('DELETE FROM chat_messages WHERE user_id = ?', userId);
    await db.runAsync('DELETE FROM sync_queue WHERE user_id = ?', userId);
    await db.runAsync('DELETE FROM app_settings WHERE key LIKE ?', `user:${userId}:%`);
    await db.runAsync('DELETE FROM accounts WHERE id = ?', userId);
    await db.runAsync(
      'INSERT OR REPLACE INTO app_settings (key, value_json, updated_at) VALUES (?, ?, ?)',
      SETTINGS_KEYS.session,
      JSON.stringify({ userId: null }),
      nowIso()
    );
  });
}