import mongoose, { Model } from 'mongoose';
import { UserDocument, VerifyUserType } from '../constants/types';
import Admin from '../models/admin.model';
import NonTeaching from '../models/non_teaching.model';
import OldStudent from '../models/old_student.model';
import Parent from '../models/parents.model';
import Student from '../models/students.model';
import SuperAdmin from '../models/super_admin.model';
import Teacher from '../models/teachers.model';
import bcrypt from 'bcryptjs';
// import { generateAdmissionNumber } from '../utils/functions';
// import Subject from '../models/subject.model';

const findUserByEmail = async (email: string): Promise<UserDocument | null> => {
  try {
    const userCollections: {
      model: Model<UserDocument>;
      field: string;
    }[] = [
      {
        model: SuperAdmin as unknown as Model<UserDocument>,
        field: 'email',
      },
      {
        model: Admin as unknown as Model<UserDocument>,
        field: 'email',
      },
      {
        model: NonTeaching as unknown as Model<UserDocument>,
        field: 'email',
      },
      {
        model: OldStudent as unknown as Model<UserDocument>,
        field: 'email',
      },
      {
        model: Parent as unknown as Model<UserDocument>,
        field: 'email',
      },
      {
        model: Student as unknown as Model<UserDocument>,
        field: 'email',
      },
      {
        model: Teacher as unknown as Model<UserDocument>,
        field: 'email',
      },
    ];

    const queries = userCollections.map(({ model, field }) =>
      model.findOne({ [field]: email }).exec()
    );

    const results = await Promise.all(queries);
    const foundUser = results.find((user) => user !== null);

    if (foundUser) {
      return foundUser as UserDocument;
    }

    return null;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error occurred while finding user: ${error.message}`);
    }
    throw new Error('Error occurred while finding user');
  }
};

const findUserById = async (user_id: object): Promise<UserDocument | null> => {
  try {
    const userCollections: {
      model: Model<UserDocument>;
      field: string;
    }[] = [
      {
        model: SuperAdmin as unknown as Model<UserDocument>,
        field: '_id',
      },
      {
        model: Admin as unknown as Model<UserDocument>,
        field: '_id',
      },
      {
        model: NonTeaching as unknown as Model<UserDocument>,
        field: '_id',
      },
      {
        model: Parent as unknown as Model<UserDocument>,
        field: '_id',
      },
      {
        model: Student as unknown as Model<UserDocument>,
        field: '_id',
      },
      {
        model: Teacher as unknown as Model<UserDocument>,
        field: '_id',
      },
    ];

    for (const { model, field } of userCollections) {
      const user = await model.findOne({ [field]: user_id });
      if (user) {
        return user as UserDocument;
      }
    }

    return null;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error occurred while finding user: ${error.message}`);
    }
    throw new Error('Error occurred while finding user');
  }
};

const createNewUserDoc = async (payload: UserDocument) => {
  try {
    const roleModels: Record<string, any> = {
      admin: Admin,
      super_admin: SuperAdmin,
      non_teaching: NonTeaching,
      parent: Parent,
      student: Student,
      teacher: Teacher,
    };

    const model = roleModels[payload.role];

    if (!model) {
      throw new Error(`Invalid role specified: ${payload.role}`);
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const commonFields = {
      first_name: payload.first_name,
      last_name: payload.last_name,
      middle_name: payload.middle_name || '',
      gender: payload.gender.toLowerCase(),
      email: payload.email,
      password: hashedPassword,
      // dob: payload.dob,
      role: payload.role,
    };

    // const subjectCapableToLower = payload.subjects_capable_of_teaching?.map(
    //   (
    //     subjectObj:
    //       | string
    //       | { subject: string | mongoose.Schema.Types.ObjectId }
    //   ) => {
    //     if (typeof subjectObj === 'string') {
    //       return subjectObj.toLowerCase();
    //     } else if (typeof subjectObj.subject === 'string') {
    //       return { ...subjectObj, subject: subjectObj.subject.toLowerCase() };
    //     }

    //     return subjectObj;
    //   }
    // );

    // const subjects = await Subject.find({
    //   name: { $in: subjectCapableToLower },
    // });

    // const subjectIds = subjects.map((subject) => subject._id.toString());

    const roleSpecificFields: Record<string, Partial<UserDocument>> = {
      admin: {
        phone: payload.phone,
        dob: payload.dob,
        employment_date: payload.employment_date,
      },
      super_admin: {
        phone: payload.phone,
        dob: payload.dob,
        employment_date: payload.employment_date || undefined,
      },
      non_teaching: {
        phone: payload.phone,
        dob: payload.dob,
        employment_date: payload.employment_date,
      },
      parent: {
        phone: payload.phone,
      },
      student: {
        admission_session: payload.admission_session,
        dob: payload.dob,
        employment_date: payload.employment_date,
        admission_number: payload.admission_number,
        // current_class_level: payload.current_class_level,
        phone: payload.phone || '',
        new_session_subscription: true,
      },
      teacher: {
        phone: payload.phone,
        dob: payload.dob,
        employment_date: payload.employment_date,
        // subjects_capable_of_teaching: subjectIds.map((id) => ({
        //   subject: Object(id),
        // })),
      },
    };

    const newUser = new model({
      ...commonFields,
      ...roleSpecificFields[payload.role],
    });

    console.log('users:', newUser);

    return await newUser;
    // .save();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error creating new user document: ${error.message}`);
    }
    throw new Error(
      'An unknown error occurred while creating new user document.'
    );
  }
};

const findAndVerifyUser = async (payload: VerifyUserType) => {
  try {
    const roleModels: Record<string, any> = {
      admin: Admin,
      super_admin: SuperAdmin,
      non_teaching: NonTeaching,
      old_student: OldStudent,
      parent: Parent,
      student: Student,
      teacher: Teacher,
    };

    const model = roleModels[payload.role];
    if (!model) {
      throw new Error('Invalid role specified');
    }

    const idValue = payload.user_id;
    console.log('idValue:', idValue);

    if (!idValue) {
      throw new Error(`Missing ID for role: ${payload.role}`);
    }

    return await model.findByIdAndUpdate(
      { _id: idValue },
      { is_verified: true },
      { new: true }
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `An Error occurred while verifying user document: ${error.message}`
      );
    }
    throw new Error('An unknown error occurred while verifying user document.');
  }
};

const findSameAdmissionNumber = async (admission_number: string) => {
  try {
    const student = await Student.findOne({
      admission_number: admission_number,
    });

    if (student) {
      return student;
    } else {
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error occurred while finding user: ${error.message}`);
    }
    throw new Error('Error occurred while finding user');
  }
};

export {
  findSameAdmissionNumber,
  findUserByEmail,
  findUserById,
  createNewUserDoc,
  findAndVerifyUser,
};
