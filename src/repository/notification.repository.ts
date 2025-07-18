import { NotificationProp } from '../constants/types';
import Notification from '../models/notification.model';

const createNotificationMessage = async (payload: NotificationProp) => {
  const { title, message, user_id } = payload;

  const response = await new Notification({
    title,
    message,
    user_id,
  }).save();

  return response;
};

export { createNotificationMessage };
