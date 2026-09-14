import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { configureApi } from '@/lib/api';
import { CLIENT_ID, REVOKE_ENDPOINT, TOKEN_ENDPOINT } from '@/lib/config';
import { decodeJwtPayload } from '@/lib/jwt';

const ACCESS_TOKEN_KEY = 'kc.access_token';
const REFRESH_TOKEN_KEY = 'kc.refresh_token';

/** Refresh the access token when less than this many seconds remain. */
const EXPIRY_MARGIN_SECONDS = 30;

type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

type Auth = {
  status: AuthStatus;
  username: string | null;
  isAdmin: boolean;
  signIn(username: string, password: string): Promise<void>;
  signOut(): Promise<void>;
};

const AuthContext = createContext<Auth | null>(null);

type TokenResponse = {
  access_token: string;
  refresh_token: string;
};

async function requestToken(body: URLSearchParams): Promise<TokenResponse> {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!response.ok) {
    throw new Error(`Token request failed with status ${response.status}`);
  }
  return (await response.json()) as TokenResponse;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [username, setUsername] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const accessTokenRef = useRef<string | null>(null);
  const refreshTokenRef = useRef<string | null>(null);
  const expiresAtRef = useRef(0);
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  const applyTokens = useCallback(
    async ({ access_token, refresh_token }: TokenResponse) => {
      accessTokenRef.current = access_token;
      refreshTokenRef.current = refresh_token;
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access_token);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh_token);

      const claims = decodeJwtPayload(access_token);
      expiresAtRef.current = claims.exp * 1000;
      setUsername(claims.preferred_username ?? claims.sub);
      setIsAdmin(claims.realm_access?.roles.includes('admin') ?? false);
      setStatus('signedIn');
    },
    [],
  );

  const clearSession = useCallback(async () => {
    accessTokenRef.current = null;
    refreshTokenRef.current = null;
    expiresAtRef.current = 0;
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    setUsername(null);
    setIsAdmin(false);
    setStatus('signedOut');
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    if (!refreshTokenRef.current) {
      return null;
    }
    // Single-flight: concurrent 401 retries share one refresh call.
    if (!refreshPromiseRef.current) {
      refreshPromiseRef.current = (async () => {
        try {
          const tokens = await requestToken(
            new URLSearchParams({
              grant_type: 'refresh_token',
              client_id: CLIENT_ID,
              refresh_token: refreshTokenRef.current!,
            }),
          );
          await applyTokens(tokens);
          return tokens.access_token;
        } catch {
          await clearSession();
          return null;
        } finally {
          refreshPromiseRef.current = null;
        }
      })();
    }
    return refreshPromiseRef.current;
  }, [applyTokens, clearSession]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const token = accessTokenRef.current;
    if (!token) {
      return null;
    }
    if (Date.now() > expiresAtRef.current - EXPIRY_MARGIN_SECONDS * 1000) {
      return refreshAccessToken();
    }
    return token;
  }, [refreshAccessToken]);

  const signIn = useCallback(
    async (name: string, password: string) => {
      try {
        const tokens = await requestToken(
          new URLSearchParams({
            grant_type: 'password',
            client_id: CLIENT_ID,
            username: name,
            password,
          }),
        );
        await applyTokens(tokens);
      } catch {
        throw new Error('Invalid username or password');
      }
    },
    [applyTokens],
  );

  const signOut = useCallback(async () => {
    // Best-effort revocation; the local session is cleared regardless.
    if (refreshTokenRef.current) {
      try {
        await fetch(REVOKE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: CLIENT_ID,
            token: refreshTokenRef.current,
          }),
        });
      } catch {
        // ignore network failures on sign out
      }
    }
    await clearSession();
  }, [clearSession]);

  // Restore a persisted session on mount.
  useEffect(() => {
    (async () => {
      const [accessToken, refreshToken] = await Promise.all([
        SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
      ]);
      if (accessToken && refreshToken) {
        accessTokenRef.current = accessToken;
        refreshTokenRef.current = refreshToken;
        try {
          const claims = decodeJwtPayload(accessToken);
          expiresAtRef.current = claims.exp * 1000;
          setUsername(claims.preferred_username ?? claims.sub);
          setIsAdmin(claims.realm_access?.roles.includes('admin') ?? false);
          setStatus('signedIn');
        } catch {
          await clearSession();
        }
      } else {
        setStatus('signedOut');
      }
    })();
  }, [clearSession]);

  // Give the api client access to the tokens without a circular import.
  useEffect(() => {
    configureApi({
      getAccessToken,
      refreshAccessToken,
      onSessionExpired: () => {
        clearSession();
      },
    });
  }, [getAccessToken, refreshAccessToken, clearSession]);

  const value = useMemo(
    () => ({ status, username, isAdmin, signIn, signOut }),
    [status, username, isAdmin, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): Auth {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return auth;
}