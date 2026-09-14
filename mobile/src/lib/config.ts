export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8001/api';
export const KEYCLOAK_URL = process.env.EXPO_PUBLIC_KEYCLOAK_URL ?? 'http://localhost:8080';
export const REALM = 'fullstackauthentication';
export const CLIENT_ID = 'frontend';

export const TOKEN_ENDPOINT = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;
export const REVOKE_ENDPOINT = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/revoke`;