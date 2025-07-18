import mongoose from 'mongoose';

import dotenv from 'dotenv';
dotenv.config();

const connectDB = mongoose
  .connect(process.env.MONGODB_URL || '')
  .then(() => {
    console.log(
      `MongoDB connected successfully to database on ${mongoose.connection.host}`
    );
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });

export default connectDB;
