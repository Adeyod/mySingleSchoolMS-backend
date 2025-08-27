import crypto from 'crypto';

class RSA {
  static KEY_ALGORITHM = 'RSA';
  static SECURE_PADDING = crypto.constants.RSA_PKCS1_PADDING;

  // Encrypt with the public key
  static encryptWithPublicKey(
    plainText: string,
    publicKeyContent: string
  ): string {
    try {
      const publicKey = Buffer.from(publicKeyContent, 'base64');
      const encrypted = crypto.publicEncrypt(
        {
          key: publicKey,
          padding: RSA.SECURE_PADDING,
        },
        Buffer.from(plainText, 'utf8')
      );
      return encrypted.toString('base64');
    } catch (error: any) {
      console.error('Encryption error: ', error.message);
      return plainText; // return original plainText if error occurs
    }
  }

  // Decrypt with the private key
  static decryptWithPrivateKey(
    encodedText: string,
    privateKeyContent: string
  ): string {
    try {
      const privateKey = Buffer.from(privateKeyContent, 'base64');
      const decrypted = crypto.privateDecrypt(
        {
          key: privateKey,
          padding: RSA.SECURE_PADDING,
        },
        Buffer.from(encodedText, 'base64')
      );
      return decrypted.toString('utf8');
    } catch (error: any) {
      console.error('Decryption error: ', error.message);
      return encodedText; // return original encodedText if error occurs
    }
  }

  // Sign with the private key
  static signWithPrivateKey(
    plainText: string,
    privateKeyContent: string
  ): string | null {
    try {
      const privateKey = Buffer.from(privateKeyContent, 'base64');
      const sign = crypto.createSign('SHA256');
      sign.update(plainText, 'utf8');
      sign.end();

      const signature = sign.sign({
        key: privateKey,
        padding: RSA.SECURE_PADDING,
      });
      return signature.toString('base64');
    } catch (error: any) {
      console.error('Signing error: ', error.message);
      return null;
    }
  }

  // Verify signature with the public key
  static verifySignatureWithPublicKey(
    plainText: string,
    encodedSignature: string,
    publicKeyContent: string
  ): boolean {
    try {
      const publicKey = Buffer.from(publicKeyContent, 'base64');
      const verify = crypto.createVerify('SHA256');
      verify.update(plainText, 'utf8');
      verify.end();

      const signature = Buffer.from(encodedSignature, 'base64');
      return verify.verify(
        { key: publicKey, padding: RSA.SECURE_PADDING },
        signature
      );
    } catch (error: any) {
      console.error('Signature verification failed: ', error.message);
      return false;
    }
  }
}

export default RSA;
