import { decodeBase64Url } from './base64url';

export type TokenClaims = {
  sub: string;
  exp: number;
  preferred_username?: string;
  realm_access?: { roles: string[] };
};

/** Decode the payload segment of a JWT. Does not verify the signature. */
export function decodeJwtPayload(token: string): TokenClaims {
  const segments = token.split('.');
  if (segments.length !== 3) {
    throw new Error('Not a JWT');
  }
  return JSON.parse(decodeBase64Url(segments[1])) as TokenClaims;
}