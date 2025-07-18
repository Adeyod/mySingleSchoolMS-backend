import mongoose from 'mongoose';

const addressGroupSchema = new mongoose.Schema(
  {
    close_group: [
      {
        street: { type: String },
      },
    ],
    far_group: [
      {
        street: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const AddressGroup = mongoose.model('AddressGroup', addressGroupSchema);

export default AddressGroup;
