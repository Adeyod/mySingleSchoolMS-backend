import mongoose, { Schema } from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },
    user_id: { type: Object, required: true },
    role: { type: String, required: true },
    created_at: {
      type: Date,
      default: Date.now(),
      expires: 172800000,
    },
  },
  {
    timestamps: true,
  }
);

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export { RefreshToken };
