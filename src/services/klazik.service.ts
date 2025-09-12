import { Request, Response } from 'express';
import { AppError } from '../utils/app.error';
import { klazikSchoolWebhook } from '../utils/klazikschoolsCommunication/klazik';

const klazikSchoolWebhookProcessing = async (req: Request, res: Response) => {
  try {
    const response = await klazikSchoolWebhook(req, res);

    console.log('service response:', response);

    if (!response) {
      throw new AppError('Unable to process transaction webhook.', 400);
    }
    return response;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.error(error);
      throw new Error('Something went wrong');
    }
  }
};

export { klazikSchoolWebhookProcessing };
