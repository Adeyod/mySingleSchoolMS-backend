import { Request, Response } from 'express';
import crypto from 'crypto';
import { AppError } from '../app.error';

const klazikSchoolWebhook = async (req: Request, res: Response) => {
  try {
    const KLAZIK_CLIENT_SECRET = process.env.KLAZIK_CLIENT_SECRET as string;
    const signature = req.headers['x-klazikschools-signature'] as string;
    const timestamp = req.headers['x-timestamp'] as string;

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
    const canonicalPayload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', KLAZIK_CLIENT_SECRET)
      .update(`${canonicalPayload}.${timestamp}`)
      .digest('hex');

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      throw new AppError('Invalid signature', 400);
    }

    console.log('klazikSchoolWebhook payload:', req.body);
  } catch (error) {
    console.log(error);
  }
};

export { klazikSchoolWebhook };
