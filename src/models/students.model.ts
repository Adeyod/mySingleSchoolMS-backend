// import mongoose, { Schema } from 'mongoose';
// import { UserDocument } from '../constants/types';
// import {
//   // currentClassLevelEnum,
//   rolesEnum,
//   streamEnum,
//   studentStatusEnum,
// } from '../constants/enum';

// const studentSchema = new mongoose.Schema<UserDocument>(
//   {
//     first_name: { type: String, required: true },
//     last_name: { type: String, required: true },
//     middle_name: { type: String },
//     gender: { type: String, required: true },
//     admission_session: { type: String, required: true },
//     graduation_session: { type: String },
//     dob: { type: Date, required: true },
//     home_address: { type: String },
//     close_bus_stop: { type: String },
//     admission_number: { type: String, unique: true },
//     current_arm: { type: String },
//     stream: { type: String, enum: streamEnum },
//     current_class_level: {
//       type: String,
//     },
//     current_class: {
//       class_id: {
//         type: Schema.Types.ObjectId,
//         ref: 'Class',
//       },
//     },

//     active_class_enrolment: { type: Boolean, default: false },
//     is_chosen_major: { type: Boolean, default: false }, // change this to true when sss 1 student choose to go to art or science or commercial class.

//     status: {
//       type: String,
//       enum: studentStatusEnum,
//       default: studentStatusEnum[0],
//     },
//     email: { type: String, required: true },
//     password: { type: String, required: true },
//     is_verified: { type: Boolean, default: false },
//     is_updated: { type: Boolean, default: false },
//     role: { type: String, enum: rolesEnum, default: rolesEnum[1] },
//     cumulative_score: { type: Number, default: 0 },
//     overall_position: { type: Number, default: 0 },
//     profile_image: {
//       url: { type: String },
//       public_url: { type: String },
//     },
//     outstanding_balance: { type: Number, default: 0 },
//     new_session_subscription: { type: Boolean, default: null },
//     parent_id: [{ type: Schema.Types.ObjectId, ref: 'Parent' }],
//   },
//   {
//     timestamps: true,
//   }
// );

// studentSchema.index({ admission_number: 1 }, { unique: true });

// const Student = mongoose.model<UserDocument>('Student', studentSchema);
// export default Student;

//////////////////////////////////////////////////////////
import mongoose, { Schema } from 'mongoose';
import { UserDocument } from '../constants/types';
import { rolesEnum, streamEnum, studentStatusEnum } from '../constants/enum';

const studentSchema = new mongoose.Schema<UserDocument>(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    middle_name: { type: String },
    gender: { type: String, required: true },
    admission_session: { type: String, required: true },
    graduation_session: { type: String },
    dob: { type: Date, required: true },
    home_address: { type: String },
    close_bus_stop: { type: String },
    admission_number: { type: String },
    current_arm: { type: String },
    stream: { type: String, enum: streamEnum },
    bus_category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusCategory',
      default: null,
    },
    // user_created_by:{ type: Schema.Types.ObjectId, ref: 'School', required: true },
    current_class_level: {
      type: String,
    },
    current_class: {
      class_id: {
        type: Schema.Types.ObjectId,
        ref: 'Class',
      },
    },

    wallet_account_obj: {
      account_number: { type: String },
      account_name: { type: String },
      bank_name: { type: String },
      balance: { type: Number },
    },

    active_class_enrolment: { type: Boolean, default: false },
    is_chosen_major: { type: Boolean, default: false }, // change this to true when sss 1 student choose to go to art or science or commercial class.

    status: {
      type: String,
      enum: studentStatusEnum,
      default: studentStatusEnum[0],
    },
    email: { type: String, required: true },
    redundant: { type: Boolean, default: false },
    password: { type: String, required: true },
    is_verified: { type: Boolean, default: false },
    is_updated: { type: Boolean, default: false },
    role: { type: String, enum: rolesEnum, default: rolesEnum[2] },
    profile_image: {
      url: { type: String },
      public_url: { type: String },
    },
    outstanding_balance: { type: Number, default: 0 },
    new_session_subscription: { type: Boolean, default: null },
    parent_id: [{ type: Schema.Types.ObjectId, ref: 'Parent' }],
  },
  {
    timestamps: true,
  }
);

studentSchema.index({ email: 1 });
const Student = mongoose.model<UserDocument>('Student', studentSchema);
export default Student;
