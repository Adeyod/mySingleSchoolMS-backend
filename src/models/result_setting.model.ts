import mongoose from 'mongoose';
import { ResultSettingDocument } from '../constants/types';
import { examKeyEnum } from '../constants/enum';

const gradingSchema = new mongoose.Schema(
  {
    value: {
      type: Number,
      required: true,
      min: 0, // Ensures no negative values
    },
    grade: {
      type: String,
      required: true,
      trim: true,
    },
    remark: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const resultSettingSchema = new mongoose.Schema<ResultSettingDocument>({
  level: { type: String, required: true },
  components: [
    {
      name: String,
      percentage: Number,
      column: Number,
      _id: false,
    },
  ],
  exam_components: {
    exam_name: { type: String, required: true, trim: true },
    component: [
      {
        key: { type: String, enum: examKeyEnum },
        name: { type: String, required: true, trim: true },
        percentage: { type: Number, required: true, trim: true },
        _id: false,
      },
    ],
  },

  grading_and_remark: {
    type: [gradingSchema],
    validate: {
      validator: function (gradings: any[]) {
        if (!gradings || gradings.length === 0) {
          return false;
        }

        for (let i = 0; i < gradings.length - 1; i++) {
          if (gradings[i].value <= gradings[i + 1].value) {
            return false;
          }
        }
        return true;
      },
    },
  },
});

const ResultSetting = mongoose.model<ResultSettingDocument>(
  'ResultSetting',
  resultSettingSchema
);
export default ResultSetting;
