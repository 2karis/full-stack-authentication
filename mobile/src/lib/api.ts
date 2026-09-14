export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/**
 * The api client needs tokens, but the auth code lives in a React context.
 * The AuthProvider registers itself via configureApi to avoid a circular import.
 */
export type AuthBridge = {
  getAccessToken(): Promise<string | null>;
  refreshAccessToken(): Promise<string | null>;
  onSessionExpired(): void;
};

let bridge: AuthBridge | null = null;

export function configureApi(authBridge: AuthBridge) {
  bridge = authBridge;
}

function requestHeaders(token: string, init?: RequestInit): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    ...init?.headers,
  };
}

/** Fetch the API with the Bearer token attached, retrying once on 401 after a refresh. */
export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  if (!bridge) {
    throw new ApiError(401, 'Not signed in');
  }

  const token = await bridge.getAccessToken();
  if (!token) {
    throw new ApiError(401, 'Not signed in');
  }

  let response = await fetch(url, { ...init, headers: requestHeaders(token, init) });

  if (response.status === 401) {
    const refreshedToken = await bridge.refreshAccessToken();
    if (refreshedToken) {
      response = await fetch(url, { ...init, headers: requestHeaders(refreshedToken, init) });
    }
    if (!refreshedToken || response.status === 401) {
      bridge.onSessionExpired();
      throw new ApiError(401, 'Session expired');
    }
  }

  return response;
}