import mongoose, { Schema } from 'mongoose';

const classLevelSchema = new mongoose.Schema({
  // school: { type: Schema.Types.ObjectId, ref: 'School' },
  class_level_array: { type: [String], required: true },
});

const ClassLevel = mongoose.model('ClassLevel', classLevelSchema);
export default ClassLevel;
