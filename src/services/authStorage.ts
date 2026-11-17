/**
 * Vybra · Cofre de tokens (Passo 2 do Plano de Integração)
 *
 * accessToken e refreshToken ficam SOMENTE no expo-secure-store
 * (Keychain no iOS / Keystore no Android). Nunca no SQLite.
 *
 * No navegador (Expo Web) o SecureStore não existe: os tokens ficam só em memória
 * e somem ao recarregar a página.
 */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_KEY = 'vybra.accessToken';
const REFRESH_KEY = 'vybra.refreshToken';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const isWeb = Platform.OS === 'web';
let webMemory: AuthTokens | null = null;

export async function saveTokens(tokens: AuthTokens): Promise<void> {
  if (isWeb) {
    webMemory = tokens;
    return;
  }
  await SecureStore.setItemAsync(ACCESS_KEY, tokens.accessToken);
  await SecureStore.setItemAsync(REFRESH_KEY, tokens.refreshToken);
}

export async function getTokens(): Promise<AuthTokens | null> {
  if (isWeb) return webMemory;
  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_KEY),
    SecureStore.getItemAsync(REFRESH_KEY),
  ]);
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

export async function clearTokens(): Promise<void> {
  if (isWeb) {
    webMemory = null;
    return;
  }
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY),
  ]);
}