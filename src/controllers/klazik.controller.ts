import { klazikSchoolWebhookProcessing } from '../services/klazik.service';
import { AppError } from '../utils/app.error';
import catchErrors from '../utils/tryCatch';

const klazikWebhook = catchErrors(async (req, res) => {
  const result = klazikSchoolWebhookProcessing(req, res);
  console.log('controller result:', result);

  if (!result) {
    throw new AppError('Unable to process webhook.', 400);
  }

  return res.status(200).json({
    message: 'Webhook processed successfully.',
    success: true,
    status: 200,
  });
});

export { klazikWebhook };
