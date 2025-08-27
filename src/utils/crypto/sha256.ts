import crypto from 'crypto';

class HashUtil {
  static hash(input: string) {
    const hash = crypto.createHash('sha256');
    hash.update(input, 'utf8');
    return hash.digest('hex');
  }
}

export default HashUtil;
