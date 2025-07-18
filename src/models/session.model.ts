import mongoose from 'mongoose';
import { SessionDocument, TermDocument } from '../constants/types';
import { sessionData } from '../utils/seedingData';

const termSchema = new mongoose.Schema<TermDocument>({
  name: { type: String, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  is_active: { type: Boolean, default: false },
});

const sessionSchema = new mongoose.Schema<SessionDocument>(
  {
    academic_session: { type: String, required: true, unique: true },
    terms: {
      type: [termSchema],
      default: [],
    },
    is_active: { type: Boolean, default: false },
    is_promotion_done: { type: Boolean, default: false },
    is_subscription_mail_sent: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Session = mongoose.model<SessionDocument>('Session', sessionSchema);
async function seedDatabase() {
  try {
    await Session.insertMany(sessionData);
    console.log('Data seeded successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error(error);
    mongoose.connection.close();
  }
}

// seedDatabase();
export default Session;
