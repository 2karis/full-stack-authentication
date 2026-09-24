import { apiFetch } from '@/lib/api';
import { API_URL, KEYCLOAK_URL, REALM } from '@/lib/config';

/** Endpoint for Keycloak's account REST API (profile of the signed-in user). */
const ACCOUNT_URL = `${KEYCLOAK_URL}/realms/${REALM}/account`;

export type Profile = {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

export async function getProfile(): Promise<Profile> {
  const response = await apiFetch(ACCOUNT_URL, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Could not load profile (HTTP ${response.status})`);
  }
  return (await response.json()) as Profile;
}

export async function updateProfile(profile: Profile): Promise<void> {
  const response = await apiFetch(ACCOUNT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(profile),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Could not save profile (HTTP ${response.status})`);
  }
}

/**
 * Keycloak has no REST endpoint for changing your own password, so the
 * Spring API proxies the request: it verifies the current password, then
 * calls Keycloak's Admin REST API server-side with a service account.
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const response = await apiFetch(`${API_URL}/users/me/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Could not update password (HTTP ${response.status})`);
  }
}