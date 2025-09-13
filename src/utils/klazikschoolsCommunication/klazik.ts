import { Request, Response } from 'express';
import crypto from 'crypto';
import { AppError } from '../app.error';
import { canonicalize } from '../functions';
import AES from '../crypto/aes';
import { creditStudentAccount } from '../../repository/account.repository';

const klazikSchoolWebhook = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;

    const KLAZIK_CLIENT_SECRET = process.env.KLAZIK_CLIENT_SECRET as string;
    const signature = req.headers['x-klazikschools-signature'] as string;
    const timestamp = req.headers['x-timestamp'] as string;
    const aesKey = crypto
      .createHash('sha256')
      .update(process.env.KLAZIK_CLIENT_SECRET!)
      .digest('hex');

    console.log('signature:', signature);
    console.log('timestamp:', timestamp);
    // console.log('payload:', req.body);
    console.log('payload:', req.body);

    if (!signature || !timestamp) {
      return res
        .status(401)
        .json({ message: 'Missing authentication headers' });
    }

    const requestAge = Date.now() - parseInt(timestamp, 10);
    if (isNaN(requestAge) || requestAge > 5 * 60 * 1000) {
      return res.status(401).json({ message: 'Request expired' });
    }

    // Recompute expected signature
    const canonicalPayload = canonicalize(req.body);
    const dataToSign = `${data}.${timestamp}`;
    const expectedSignature = crypto
      .createHmac('sha256', KLAZIK_CLIENT_SECRET)
      .update(dataToSign)
      .digest('hex');

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      throw new AppError('Invalid signature', 400);
    }

    const decrypted = AES.decrypt(data, aesKey);
    console.log('decrypted:', decrypted);
    const payload = JSON.parse(decrypted);
    if (payload.status === 'Successful') {
      if (payload.type === 'account-credit') {
        const response = await creditStudentAccount(payload);
        return response;
      }
    }

    console.log('payload:', payload);
  } catch (error) {
    console.log(error);
  }
};

export { klazikSchoolWebhook };
