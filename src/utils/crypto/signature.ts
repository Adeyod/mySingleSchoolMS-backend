import crypto from 'crypto';

class Signature {
  private static formatKey(key: string, type: 'PUBLIC' | 'PRIVATE'): string {
    if (key.includes('BEGIN')) {
      return key; // already PEM
    }

    const header =
      type === 'PUBLIC'
        ? '-----BEGIN PUBLIC KEY-----'
        : '-----BEGIN PRIVATE KEY-----';
    const footer =
      type === 'PUBLIC'
        ? '-----END PUBLIC KEY-----'
        : '-----END PRIVATE KEY-----';

    return `${header}\n${key.match(/.{1,64}/g)?.join('\n')}\n${footer}`;
  }
  static sign(payloadHash: string, MERCHANT_PRIVATE_KEY: string) {
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(payloadHash, 'utf8');
    signer.end();

    const signature = signer.sign(
      {
        key: this.formatKey(MERCHANT_PRIVATE_KEY, 'PRIVATE'),
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      'base64'
    );

    return signature;
  }

  static secure(VAS_PUBLIC_KEY: string, aesKey: string): string {
    const token = crypto
      .publicEncrypt(
        {
          key: this.formatKey(VAS_PUBLIC_KEY, 'PUBLIC'),
          padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        aesKey // raw buffer, not hex string
      )
      .toString('base64');
    return token;
  }

  static encrypted(
    payloadString: string,
    aesKey: string,
    iv: Buffer<ArrayBufferLike>
  ): string {
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(aesKey, 'hex'),
      iv
    );

    let encrypted = cipher.update(payloadString, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    return encrypted;
  }
}

export default Signature;
