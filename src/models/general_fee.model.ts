import mongoose from 'mongoose';

const generalFeesSchema = new mongoose.Schema(
  {
    school_bus: {
      close_group: {
        both_trips: { type: Number },
        single_trip: { type: Number },
      },
      far_group: {
        both_trips: { type: Number },
        single_trip: { type: Number },
      },
    },
  },
  { timestamps: true }
);

const GeneralFee = mongoose.model('GeneralFee', generalFeesSchema);

export default GeneralFee;
