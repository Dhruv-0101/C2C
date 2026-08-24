import crypto from 'node:crypto';
import { env } from '../../config/env.js';

const ALGORITHM = 'aes-256-gcm';

/**
 * Derive 32-byte encryption key from environment variable or fallback secret
 */
function getEncryptionKey() {
  const secret = env.SOCIAL_TOKEN_ENCRYPTION_KEY || env.JWT_ACCESS_SECRET || 'default_brandflow_secret_key_32b';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypt a plain text string using AES-256-GCM
 * @param {string} text - Plain text to encrypt
 * @returns {string} Encrypted string format: ivHex:authTagHex:encryptedHex
 */
export function encryptToken(text) {
  if (!text) return null;
  
  const iv = crypto.randomBytes(12); // 96-bit IV for AES-GCM
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt an AES-256-GCM encrypted string
 * @param {string} encryptedPayload - String in format ivHex:authTagHex:encryptedHex
 * @returns {string} Decrypted original text
 */
export function decryptToken(encryptedPayload) {
  if (!encryptedPayload) return null;
  
  try {
    const parts = encryptedPayload.split(':');
    if (parts.length !== 3) {
      // If text is unencrypted plain text fallback
      return encryptedPayload;
    }
    
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = getEncryptionKey();
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    // Return original if decryption fails or if token was stored in plain text
    return encryptedPayload;
  }
}
