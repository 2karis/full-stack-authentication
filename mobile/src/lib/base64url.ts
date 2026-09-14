const BASE64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Decode a base64url string to its UTF-8 text.
 * Hermes has no guaranteed `atob`, so the decoding is done by hand.
 */
export function decodeBase64Url(input: string): string {
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const char of base64) {
    const value = BASE64_ALPHABET.indexOf(char);
    if (value === -1) {
      continue; // skip '=' padding
    }
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }

  // Interpret the bytes as UTF-8.
  let result = '';
  let codePoint = 0;
  let remaining = 0;
  for (const byte of bytes) {
    if (remaining === 0) {
      if (byte < 0x80) {
        result += String.fromCharCode(byte);
      } else if (byte < 0xe0) {
        codePoint = byte & 0x1f;
        remaining = 1;
      } else if (byte < 0xf0) {
        codePoint = byte & 0x0f;
        remaining = 2;
      } else {
        codePoint = byte & 0x07;
        remaining = 3;
      }
    } else {
      codePoint = (codePoint << 6) | (byte & 0x3f);
      remaining--;
      if (remaining === 0) {
        result += String.fromCodePoint(codePoint);
      }
    }
  }
  return result;
}