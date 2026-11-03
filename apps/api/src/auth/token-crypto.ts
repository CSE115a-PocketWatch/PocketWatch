import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

// Encrypts a token so it's safe to store in the database.
export function encryptToken(plaintext: string, key: Buffer): string {
  // New random IV every time, so the same token never encrypts the same way twice.
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  // Fingerprint used to detect tampering when decrypting.
  const authTag = cipher.getAuthTag();
  // All three parts are needed to decrypt, so store them together as text.
  return [iv, authTag, ciphertext].map((part) => part.toString('base64url')).join('.');
}

// Turns a stored value back into the original token.
// Throws if the value was changed or the wrong key is used.
export function decryptToken(stored: string, key: Buffer): string {
  const [iv, authTag, ciphertext] = stored.split('.').map((part) => Buffer.from(part, 'base64url'));
  if (!iv || !authTag || !ciphertext) {
    throw new Error('Malformed encrypted token');
  }
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}
