import {
  AccountObjectType,
  AccountType,
  AddingNegotiatedChargesType,
  CutoffMinutesCreationPayload,
} from '../constants/types';
import { saveLog } from '../logs/log.service';
import Admin from '../models/admin.model';
import CbtCutoff from '../models/cbt_cutoffs.model';
import Owner from '../models/owner.model';
import Parent from '../models/parent.model';
import School from '../models/school.model';
import SchoolAccount from '../models/school_account.model';
import Student from '../models/student.model';
import Teacher from '../models/teacher.model';
import { AppError } from '../utils/app.error';

const fetchASchoolById = async (school_id: string) => {
  try {
    const school = Object(school_id);

    let schoolExist = await School.findById({
      _id: school,
    });

    if (!schoolExist) {
      throw new AppError('Schools not found.', 404);
    }

    return schoolExist;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchAllSchools = async (
  page: number | undefined,
  limit: number | undefined,
  searchParams: string
) => {
  try {
    let query = School.find();

    if (searchParams) {
      const regex = new RegExp(searchParams, 'i');

      query = query.where({
        $or: [
          { school_name: { $regex: regex } },
          { city: { $regex: regex } },
          { state: { $regex: regex } },
          { country: { $regex: regex } },
        ],
      });
    }

    if (!query) {
      throw new AppError('Schools not found.', 404);
    }
    const count = await query.clone().countDocuments();
    let pages = 0;

    if (page !== undefined && limit !== undefined && count !== 0) {
      const offset = (page - 1) * limit;

      query = query.skip(offset).limit(limit);

      pages = Math.ceil(count / limit);

      if (page > pages) {
        throw new AppError('Page can not be found.', 404);
      }
    }

    const result = await query
      .sort({ createdAt: -1 })
      .populate('school_owner', '-password');

    if (!result || result.length === 0) {
      throw new AppError('No school found.', 404);
    }

    return { result, totalPages: pages, totalCount: count };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchSchoolOwnerById = async (owner_id: string) => {
  try {
    const result = Owner.findById({
      _id: owner_id,
    }).select('-password');

    if (!result) {
      throw new AppError('No school owner found.', 404);
    }

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchAllSchoolOwners = async (
  page: number | undefined,
  limit: number | undefined,
  searchParams: string
) => {
  try {
    let query = Owner.find();

    if (searchParams) {
      const regex = new RegExp(searchParams, 'i');

      query = query.where({
        $or: [
          { school_name: { $regex: regex } },
          { city: { $regex: regex } },
          { state: { $regex: regex } },
          { country: { $regex: regex } },
        ],
      });
    }

    if (!query) {
      throw new AppError('School owners not found.', 404);
    }
    const count = await query.clone().countDocuments();
    let pages = 0;

    if (page !== undefined && limit !== undefined && count !== 0) {
      const offset = (page - 1) * limit;

      query = query.skip(offset).limit(limit);

      pages = Math.ceil(count / limit);

      if (page > pages) {
        throw new AppError('Page can not be found.', 404);
      }
    }

    const result = await query
      .sort({ createdAt: -1 })
      .select('-password')
      .populate('school');

    if (!result || result.length === 0) {
      throw new AppError('No school owner found.', 404);
    }

    return { result, totalPages: pages, totalCount: count };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const addingNegotiatedCharges = async (
  payload: AddingNegotiatedChargesType
) => {
  try {
    const {
      negotiated_school_charge,
      negotiated_transaction_charge,
      school_id,
    } = payload;

    const school = Object(school_id);

    const schoolExist = await School.findById({
      _id: school,
    });

    if (!schoolExist) {
      throw new AppError('School not found.', 404);
    }
    schoolExist.negotiated_school_charge_per_student = negotiated_school_charge;
    schoolExist.negotiated_school_payment_transaction_charge_per_transaction =
      negotiated_transaction_charge;

    await schoolExist.save();
    return schoolExist;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchAllSchoolsAdmins = async () => {
  try {
    const admins = await Admin.find().populate('school');
    if (!admins) {
      throw new AppError('No school admin found.', 404);
    }

    const adminsWithoutPassword = admins.map((admin) => {
      const { password, ...others } = admin.toJSON();
      return others;
    });

    console.log('adminsWithoutPassword:', adminsWithoutPassword);

    return adminsWithoutPassword;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchASchoolAdminsBySchoolId = async (school_id: string) => {
  try {
    const school = Object(school_id);

    const admins = await Admin.find({
      school: school,
    }).populate('school');

    if (!admins) {
      throw new AppError('No school admin found.', 404);
    }

    const adminsWithoutPassword = admins.map((admin) => {
      const { password, ...others } = admin.toJSON();
      return others;
    });

    console.log('adminsWithoutPassword:', adminsWithoutPassword);

    return adminsWithoutPassword;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchSchoolAdminBySchoolIAndAdminId = async (
  school_id: string,
  admin_id: string
) => {
  try {
    const school = Object(school_id);
    const adminObj = Object(admin_id);

    const admin = await Admin.findOne({
      school: school,
      _id: adminObj,
    }).populate('school');
    if (!admin) {
      throw new AppError('No school admin found.', 404);
    }

    const { password, ...others } = admin.toJSON();
    return others;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchAllAccountsOfASchoolBySchoolId = async (school_id: string) => {
  try {
    const school = Object(school_id);
    const accounts = await SchoolAccount.findOne({
      school: school,
    });

    if (!accounts) {
      throw new AppError('School accounts not found.', 404);
    }

    return accounts;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchAllAccountsOfAllSchools = async (
  page: number | undefined,
  limit: number | undefined,
  searchParams: string
): Promise<{
  accounts: AccountType[];
  totalCount: number;
  totalPages: number;
}> => {
  try {
    let query = SchoolAccount.find();

    if (searchParams) {
      const regex = new RegExp(searchParams, 'i');
      console.log('searchParams:', searchParams);

      query = query
        .where({
          accounts: {
            $elemMatch: {
              $or: [
                { account_name: { $regex: searchParams, $options: 'i' } },
                { bank_name: { $regex: searchParams, $options: 'i' } },
              ],
            },
          },
        })
        .select({
          accounts: {
            $filter: {
              input: '$accounts',
              as: 'account',
              cond: {
                $or: [
                  {
                    $regexMatch: {
                      input: '$$account.bank_name',
                      regex: searchParams,
                      options: 'i',
                    },
                  },
                  {
                    $regexMatch: {
                      input: '$$account.account_name',
                      regex: searchParams,
                      options: 'i',
                    },
                  },
                ],
              },
            },
          },
        });
    }

    if (!query) {
      throw new AppError('Students not found.', 404);
    }

    const count = await query.clone().countDocuments();
    let pages = 0;

    if (page !== undefined && limit !== undefined && count !== 0) {
      const offset = (page - 1) * limit;
      query = query.skip(offset).limit(limit);
      pages = Math.ceil(count / limit);
      if (page > pages) {
        throw new AppError('Page can not be found.', 404);
      }
    }

    const accounts = await query.sort({ createdAt: -1 });

    if (!accounts || accounts.length === 0) {
      throw new AppError('Accounts not found.', 404);
    }

    const testing = accounts.flatMap((a) => a.accounts);

    return { accounts: testing, totalCount: count, totalPages: pages };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened');
    }
  }
};

const fetchAllTeachersOnTheApplication = async (
  page: number | undefined,
  limit: number | undefined,
  searchParams: string
) => {
  try {
    let query = Teacher.find();

    if (searchParams) {
      const regex = new RegExp(searchParams, 'i');

      query = query.where({
        $or: [
          { first_name: { $regex: regex } },
          { last_name: { $regex: regex } },
          { middle_name: { $regex: regex } },
          { email: { $regex: regex } },
          { gender: { $regex: regex } },
        ],
      });
    }

    if (!query) {
      throw new AppError('Teachers not found.', 404);
    }
    const count = await query.clone().countDocuments();
    let pages = 0;

    if (page !== undefined && limit !== undefined && count !== 0) {
      const offset = (page - 1) * limit;

      query = query.skip(offset).limit(limit);

      pages = Math.ceil(count / limit);

      if (page > pages) {
        throw new AppError('Page can not be found.', 404);
      }
    }

    const result = await query
      .sort({ createdAt: -1 })
      .select('-password')
      .populate('school');

    if (!result || result.length === 0) {
      throw new AppError('No teacher found.', 404);
    }

    console.log('result:', result);

    return { result, totalPages: pages, totalCount: count };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchAllStudentsOnTheApplication = async (
  page: number | undefined,
  limit: number | undefined,
  searchParams: string
) => {
  try {
    let query = Student.find();

    if (searchParams) {
      const regex = new RegExp(searchParams, 'i');

      query = query.where({
        $or: [
          { first_name: { $regex: regex } },
          { last_name: { $regex: regex } },
          { middle_name: { $regex: regex } },
          { email: { $regex: regex } },
          { gender: { $regex: regex } },
        ],
      });
    }

    if (!query) {
      throw new AppError('Students not found.', 404);
    }
    const count = await query.clone().countDocuments();
    let pages = 0;

    if (page !== undefined && limit !== undefined && count !== 0) {
      const offset = (page - 1) * limit;

      query = query.skip(offset).limit(limit);

      pages = Math.ceil(count / limit);

      if (page > pages) {
        throw new AppError('Page can not be found.', 404);
      }
    }

    const result = await query
      .sort({ createdAt: -1 })
      .select('-password')
      .populate('school');

    if (!result || result.length === 0) {
      throw new AppError('No student found.', 404);
    }

    console.log('result:', result);

    return { result, totalPages: pages, totalCount: count };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchAllParentsOnTheApplication = async (
  page: number | undefined,
  limit: number | undefined,
  searchParams: string
) => {
  try {
    let query = Parent.find();

    if (searchParams) {
      const regex = new RegExp(searchParams, 'i');

      query = query.where({
        $or: [
          { first_name: { $regex: regex } },
          { last_name: { $regex: regex } },
          { middle_name: { $regex: regex } },
          { email: { $regex: regex } },
          { gender: { $regex: regex } },
        ],
      });
    }

    if (!query) {
      throw new AppError('Parents not found.', 404);
    }
    const count = await query.clone().countDocuments();
    let pages = 0;

    if (page !== undefined && limit !== undefined && count !== 0) {
      const offset = (page - 1) * limit;

      query = query.skip(offset).limit(limit);

      pages = Math.ceil(count / limit);

      if (page > pages) {
        throw new AppError('Page can not be found.', 404);
      }
    }

    const result = await query
      .sort({ createdAt: -1 })
      .select('-password')
      .populate('school');

    if (!result || result.length === 0) {
      throw new AppError('No parent found.', 404);
    }

    console.log('result:', result);

    return { result, totalPages: pages, totalCount: count };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchAllTeachersOfASchoolOnTheApplication = async (
  page: number | undefined,
  limit: number | undefined,
  searchParams: string,
  school_id: string
) => {
  try {
    const school = Object(school_id);

    const schoolExist = await School.findById({
      _id: school,
    });

    if (!schoolExist) {
      throw new AppError(' School not found.', 404);
    }

    let query = Teacher.find({
      school: school,
    });

    if (searchParams) {
      const regex = new RegExp(searchParams, 'i');

      query = query.where({
        $or: [
          { first_name: { $regex: regex } },
          { last_name: { $regex: regex } },
          { middle_name: { $regex: regex } },
          { email: { $regex: regex } },
          { gender: { $regex: regex } },
        ],
      });
    }

    if (!query) {
      throw new AppError('Teachers not found.', 404);
    }
    const count = await query.clone().countDocuments();
    let pages = 0;

    if (page !== undefined && limit !== undefined && count !== 0) {
      const offset = (page - 1) * limit;

      query = query.skip(offset).limit(limit);

      pages = Math.ceil(count / limit);

      if (page > pages) {
        throw new AppError('Page can not be found.', 404);
      }
    }

    const result = await query
      .sort({ createdAt: -1 })
      .select('-password')
      .populate('school');

    if (!result || result.length === 0) {
      throw new AppError('No teacher found.', 404);
    }

    console.log('result:', result);

    return {
      result,
      totalPages: pages,
      totalCount: count,
      school_name: schoolExist.school_name,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchAllStudentsOfASchoolOnTheApplication = async (
  page: number | undefined,
  limit: number | undefined,
  searchParams: string,
  school_id: string
) => {
  try {
    const school = Object(school_id);

    const schoolExist = await School.findById({
      _id: school,
    });

    if (!schoolExist) {
      throw new AppError(' School not found.', 404);
    }

    let query = Student.find({
      school: school,
    });

    if (searchParams) {
      const regex = new RegExp(searchParams, 'i');

      query = query.where({
        $or: [
          { first_name: { $regex: regex } },
          { last_name: { $regex: regex } },
          { middle_name: { $regex: regex } },
          { email: { $regex: regex } },
          { gender: { $regex: regex } },
        ],
      });
    }

    if (!query) {
      throw new AppError('Students not found.', 404);
    }
    const count = await query.clone().countDocuments();
    let pages = 0;

    if (page !== undefined && limit !== undefined && count !== 0) {
      const offset = (page - 1) * limit;

      query = query.skip(offset).limit(limit);

      pages = Math.ceil(count / limit);

      if (page > pages) {
        throw new AppError('Page can not be found.', 404);
      }
    }

    const result = await query
      .sort({ createdAt: -1 })
      .select('-password')
      .populate('school');

    if (!result || result.length === 0) {
      throw new AppError('No student found.', 404);
    }

    console.log('result:', result);

    return {
      result,
      totalPages: pages,
      totalCount: count,
      school_name: schoolExist.school_name,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchAllParentsOfASchoolOnTheApplication = async (
  page: number | undefined,
  limit: number | undefined,
  searchParams: string,
  school_id: string
) => {
  try {
    const school = Object(school_id);

    const schoolExist = await School.findById({
      _id: school,
    });

    if (!schoolExist) {
      throw new AppError(' School not found.', 404);
    }

    let query = Parent.find({
      school: school,
    });

    if (searchParams) {
      const regex = new RegExp(searchParams, 'i');

      query = query.where({
        $or: [
          { first_name: { $regex: regex } },
          { last_name: { $regex: regex } },
          { middle_name: { $regex: regex } },
          { email: { $regex: regex } },
          { gender: { $regex: regex } },
        ],
      });
    }

    if (!query) {
      throw new AppError('Parents not found.', 404);
    }
    const count = await query.clone().countDocuments();
    let pages = 0;

    if (page !== undefined && limit !== undefined && count !== 0) {
      const offset = (page - 1) * limit;

      query = query.skip(offset).limit(limit);

      pages = Math.ceil(count / limit);

      if (page > pages) {
        throw new AppError('Page can not be found.', 404);
      }
    }

    const result = await query
      .sort({ createdAt: -1 })
      .select('-password')
      .populate('school');

    if (!result || result.length === 0) {
      throw new AppError('No parent found.', 404);
    }

    console.log('result:', result);

    return {
      result,
      totalPages: pages,
      totalCount: count,
      school_name: schoolExist.school_name,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchSchoolsWithoutResultSettings = async () => {
  try {
    const schoolsWithoutResultSettings = await School.find({
      has_result_setting: false,
    });

    if (
      !schoolsWithoutResultSettings ||
      schoolsWithoutResultSettings.length === 0
    ) {
      throw new AppError('No school without result settings.', 400);
    }

    console.log('schoolsWithoutResultSettings:', schoolsWithoutResultSettings);

    return schoolsWithoutResultSettings;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const cutoffMinutesCreation = async (payload: CutoffMinutesCreationPayload) => {
  try {
    const { first_cutoff_minutes, last_cutoff_minutes, school_id } = payload;
    const school = Object(school_id);

    const schoolExist = await School.findById({
      _id: school,
    });

    if (!schoolExist) {
      throw new AppError('School not found.', 404);
    }

    const cutoffExist = await CbtCutoff.findOne({
      school: schoolExist._id,
    });

    if (cutoffExist) {
      throw new AppError(
        `${schoolExist.school_name} already has cutoff recorded.`,
        400
      );
    }

    const newCutoff = new CbtCutoff({
      school: schoolExist._id,
      first_cutoff_minutes: first_cutoff_minutes,
      last_cutoff_minutes: last_cutoff_minutes,
    });

    await newCutoff.save();

    return newCutoff;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

export {
  cutoffMinutesCreation,
  fetchSchoolsWithoutResultSettings,
  fetchAllStudentsOfASchoolOnTheApplication,
  fetchAllParentsOfASchoolOnTheApplication,
  fetchAllTeachersOfASchoolOnTheApplication,
  fetchAllParentsOnTheApplication,
  fetchAllStudentsOnTheApplication,
  fetchAllTeachersOnTheApplication,
  fetchAllAccountsOfAllSchools,
  fetchAllAccountsOfASchoolBySchoolId,
  fetchSchoolAdminBySchoolIAndAdminId,
  fetchASchoolAdminsBySchoolId,
  fetchAllSchoolsAdmins,
  fetchAllSchools,
  fetchAllSchoolOwners,
  fetchSchoolOwnerById,
  fetchASchoolById,
  addingNegotiatedCharges,
};
