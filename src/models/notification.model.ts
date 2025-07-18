import mongoose, { Schema } from 'mongoose';
import { NotificationDocument } from '../constants/types';
import { rolesEnum } from '../constants/enum';

const notificationSchema = new mongoose.Schema<NotificationDocument>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    user_id: { type: String },
    is_viewed: { type: Boolean, default: false },
    is_read: { type: Boolean, default: false },
    is_archived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model<NotificationDocument>(
  'Notification',
  notificationSchema
);

export default Notification;
