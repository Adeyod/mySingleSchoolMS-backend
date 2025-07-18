import mongoose from 'mongoose';
import { examStatusEnum } from '../constants/enum';
import { CbtCutoffDocument } from '../constants/types';

const cbtCutoffSchema = new mongoose.Schema<CbtCutoffDocument>(
  {
    first_cutoff_minutes: {
      type: Number,
      required: true,
    },
    last_cutoff_minutes: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const CbtCutoff = mongoose.model<CbtCutoffDocument>(
  'CbtCutoff',
  cbtCutoffSchema
);
export default CbtCutoff;
