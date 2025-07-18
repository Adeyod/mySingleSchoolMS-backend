import mongoose from 'mongoose';
import { ContactUsDocument } from '../constants/types';

const contactUsSchema = new mongoose.Schema<ContactUsDocument>(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const ContactUs = mongoose.model<ContactUsDocument>(
  'ContactUs',
  contactUsSchema
);
export default ContactUs;
