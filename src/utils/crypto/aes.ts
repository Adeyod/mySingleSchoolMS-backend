import crypto from 'crypto';

class AES {
  private static AES_ALGORITHM = 'aes-256-cbc';

  /**
   * Encrypt plaintext using AES-256-CBC
   * @param plainText Text to encrypt
   * @param key 32-byte key in hex format
   * @returns Encrypted data as base64 (IV + ciphertext)
   */
  static encrypt(plainText: string, key: string): string {
    try {
      const iv = crypto.randomBytes(16); // IV must be 16 bytes

      const cipher = crypto.createCipheriv(
        this.AES_ALGORITHM,
        Buffer.from(key, 'hex'),
        iv
      );

      const encrypted = Buffer.concat([
        cipher.update(plainText, 'utf8'),
        cipher.final(),
      ]);

      // Prepend IV to ciphertext, then encode to base64
      const ivAndEncrypted = Buffer.concat([iv, encrypted]).toString('base64');

      return ivAndEncrypted;
    } catch (e: any) {
      console.error('Encryption error:', e.message);
      return plainText;
    }
  }

  /**
   * Decrypt AES-256-CBC encrypted text
   * @param encryptedText Base64 string containing IV + ciphertext
   * @param key 32-byte key in hex format
   * @returns Decrypted plaintext
   */
  static decrypt(encryptedText: string, key: string): string {
    try {
      const ivAndEncrypted = Buffer.from(encryptedText, 'base64');

      const iv = ivAndEncrypted.slice(0, 16); // first 16 bytes = IV
      const ciphertext = ivAndEncrypted.slice(16);

      const decipher = crypto.createDecipheriv(
        this.AES_ALGORITHM,
        Buffer.from(key, 'hex'),
        iv
      );

      const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]).toString('utf8');

      return decrypted;
    } catch (e: any) {
      console.error('Decryption error:', e.message);
      return encryptedText;
    }
  }
}

export default AES;
