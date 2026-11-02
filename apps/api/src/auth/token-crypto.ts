import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

// AES-256-GCM. Stored as "iv.authTag.ciphertext", each part base64url.
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

export function encryptToken(plaintext: string, key: Buffer): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv, authTag, ciphertext].map((part) => part.toString('base64url')).join('.');
}

export function decryptToken(stored: string, key: Buffer): string {
  const [iv, authTag, ciphertext] = stored.split('.').map((part) => Buffer.from(part, 'base64url'));
  if (!iv || !authTag || !ciphertext) {
    throw new Error('Malformed encrypted token');
  }
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}
