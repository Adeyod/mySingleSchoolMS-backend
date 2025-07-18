import mongoose, { Document, Model } from 'mongoose';
import { verificationEnum } from '../constants/enum';
import {
  RefreshTokenType,
  UserDocument,
  VerificationDocument,
  VerificationType,
  VerifyUserType,
} from '../constants/types';
import {
  AdminToken,
  NonTeachingToken,
  OldStudentToken,
  ParentToken,
  StudentToken,
  SuperAdminToken,
  TeacherToken,
} from '../models/token.model';
import { generateCode } from '../utils/code';
import { RefreshToken } from '../models/refresh_token.model';

const generateAndStoreVerificationToken = async (
  payload: UserDocument,
  purpose: string
): Promise<VerificationType> => {
  const roleTokenModel: Record<string, any> = {
    super_admin: SuperAdminToken,
    admin: AdminToken,
    non_teaching: NonTeachingToken,
    old_student: OldStudentToken,
    parent: ParentToken,
    student: StudentToken,
    teacher: TeacherToken,
  };

  const idFieldMapping: Record<string, string> = {
    super_admin: 'super_admin_id',
    admin: 'admin_id',
    non_teaching: 'non_teaching_id',
    old_student: 'old_student_id',
    parent: 'parent_id',
    student: 'student_id',
    teacher: 'teacher_id',
  };

  const tokenModel = roleTokenModel[payload.role];
  const idField = idFieldMapping[payload.role];

  if (!tokenModel) {
    throw new Error(`Token model not found for role: ${payload.role}`);
  }

  if (!idField) {
    throw new Error(`ID field mapping not found for role: ${payload.role}`);
  }

  const token = generateCode(6);

  if (!token) {
    console.log('TOKEN NOT GENERATED.');
  }

  try {
    const authToken = new tokenModel({
      token,
      [idField]: payload._id,
      purpose: purpose,
      role: payload.role,
    });

    return await authToken.save();
  } catch (error) {
    console.error('Error saving verification token:', error);
    throw new Error('Failed to store verification token');
  }
};

const getUserTokenDetails = async (
  token: string,
  purpose: string
): Promise<VerificationType | null> => {
  const tokenCollections: {
    model: Model<VerificationDocument>;
    field: string;
  }[] = [
    {
      model: SuperAdminToken as unknown as Model<VerificationDocument>,
      field: 'token',
    },
    {
      model: AdminToken as unknown as Model<VerificationDocument>,
      field: 'token',
    },
    {
      model: NonTeachingToken as unknown as Model<VerificationDocument>,
      field: 'token',
    },
    {
      model: OldStudentToken as unknown as Model<VerificationDocument>,
      field: 'token',
    },
    {
      model: ParentToken as unknown as Model<VerificationDocument>,
      field: 'token',
    },
    {
      model: StudentToken as unknown as Model<VerificationDocument>,
      field: 'token',
    },
    {
      model: TeacherToken as unknown as Model<VerificationDocument>,
      field: 'token',
    },
  ];

  for (const { model, field } of tokenCollections) {
    const findToken = await model.findOne({ [field]: token, purpose });
    if (findToken) {
      return findToken as VerificationType;
    }
  }

  return null;
};

const getUserRefreshTokenDetails = async (
  user_id: string | mongoose.Types.ObjectId
): Promise<RefreshTokenType> => {
  console.log('user_id', typeof user_id);
  console.log('user_id', user_id);
  const objectId = new mongoose.Types.ObjectId(user_id);

  const findToken = await RefreshToken.findOne({ user_id: objectId });
  console.log('findToken', findToken);

  return findToken as RefreshTokenType;
};

const getUserTokenDetailsUsingUserId = async (
  user_id: object,
  purpose: string
): Promise<VerificationType | null> => {
  const tokenCollections: {
    model: Model<VerificationDocument>;
    field: string;
  }[] = [
    {
      model: SuperAdminToken as unknown as Model<VerificationDocument>,
      field: 'super_admin_id',
    },
    {
      model: AdminToken as unknown as Model<VerificationDocument>,
      field: 'admin_id',
    },
    {
      model: NonTeachingToken as unknown as Model<VerificationDocument>,
      field: 'non_teaching_id',
    },
    {
      model: OldStudentToken as unknown as Model<VerificationDocument>,
      field: 'old_student_id',
    },
    {
      model: ParentToken as unknown as Model<VerificationDocument>,
      field: 'parent_id',
    },
    {
      model: StudentToken as unknown as Model<VerificationDocument>,
      field: 'student_id',
    },
    {
      model: TeacherToken as unknown as Model<VerificationDocument>,
      field: 'teacher_id',
    },
  ];

  for (const { model, field } of tokenCollections) {
    const findToken = await model.findOne({ [field]: user_id, purpose });
    if (findToken) {
      return findToken as VerificationType;
    }
  }

  return null;
};

export {
  generateAndStoreVerificationToken,
  getUserTokenDetails,
  getUserTokenDetailsUsingUserId,
  getUserRefreshTokenDetails,
};
