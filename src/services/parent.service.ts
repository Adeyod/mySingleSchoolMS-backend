import {
  PaymentDocument,
  StudentWithPaymentType,
  UserDocument,
  UserWithoutPassword,
} from '../constants/types';
import Parent from '../models/parents.model';
import Payment from '../models/payment.model';
import Session from '../models/session.model';
import Student from '../models/students.model';
import { AppError } from '../utils/app.error';
import mongoose from 'mongoose';

const getStudentDetails = async (
  student_id: string,
  parent_id: object
): Promise<StudentWithPaymentType> => {
  try {
    const getParentDetails = await Parent.findById({
      _id: parent_id,
    });

    if (!getParentDetails) {
      throw new AppError('Parent not found.', 404);
    }

    const studentId = new mongoose.Types.ObjectId(student_id);

    const checkLinkage = getParentDetails.children?.includes(studentId);

    if (!checkLinkage) {
      throw new AppError(
        'This student is not linked to you and as such you do not have the right to fetch the student.',
        401
      );
    }

    const getStudent = await Student.findById({ _id: student_id });
    if (!getStudent) {
      throw new AppError('Student not found.', 404);
    }

    const activeSession = await Session.findOne({
      is_active: true,
    });

    const activeTerm = activeSession?.terms.find(
      (term) => term.is_active === true
    );

    const payment = (await Payment.findOne({
      student: getStudent._id,
      session: activeSession?._id,
      term: activeTerm?.name,
    }).lean()) as PaymentDocument | null;

    const { password, ...others } = getStudent.toJSON();

    return {
      ...others,
      latest_payment_document: payment || null,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`An error occurred: ${error.message}`);
    } else {
      throw new Error(`An unknown error occurred`);
    }
  }
};

const getManyStudentDetails = async (
  parent_id: string
): Promise<{ students: StudentWithPaymentType[] }> => {
  try {
    const getParentDetails = await Parent.findById({
      _id: parent_id,
    });

    if (!getParentDetails) {
      throw new AppError('Parent not found.', 404);
    }

    const student_ids = getParentDetails.children?.map((p) => p);

    const getStudents = await Student.find({ _id: { $in: student_ids } });
    if (!getStudents || getStudents.length === 0) {
      throw new AppError('Students not found.', 404);
    }

    const activeSession = await Session.findOne({
      is_active: true,
    });

    const activeTerm = activeSession?.terms.find(
      (term) => term.is_active === true
    );

    const studentsArray: StudentWithPaymentType[] = await Promise.all(
      getStudents.map(async (p) => {
        const payment = await Payment.findOne({
          student: p._id,
          session: activeSession?._id,
          term: activeTerm?.name,
        }).lean();

        const { password, ...others } = p.toJSON();

        const student = {
          ...others,
          latest_payment_document: payment || null,
        } as StudentWithPaymentType;

        return student;
      })
    );

    return { students: studentsArray };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`An error occurred: ${error.message}`);
    } else {
      throw new Error(`An unknown error occurred`);
    }
  }
};

const fetchAllParents = async (
  page: number | undefined,
  limit: number | undefined,
  searchParams: string
): Promise<{
  parentObj: UserWithoutPassword[];
  totalCount: number;
  totalPages: number;
}> => {
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
      query = query.skip(offset).limit(limit).sort({ createdAt: -1 });

      pages = Math.ceil(count / limit);

      if (page > pages) {
        throw new AppError('Page can not be found.', 404);
      }
    }
    const findParent = await query;

    if (!findParent || findParent.length === 0) {
      throw new AppError('Parents not found.', 404);
    }

    const parentsPasswordRemoved = findParent.map((p) => {
      const { password, ...others } = p.toJSON();
      return others;
    });

    const destructuredParent = parentsPasswordRemoved as UserWithoutPassword[];

    return {
      parentObj: destructuredParent,
      totalCount: count,
      totalPages: pages,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something went wrong.');
    }
  }
};

const fetchParentById = async (
  parent_id: string
): Promise<UserWithoutPassword> => {
  try {
    const response = await Parent.findById({
      _id: parent_id,
    }).populate('children', '-password');

    if (!response) {
      throw new AppError('Parent not found.', 404);
    }

    const { password, ...others } = response.toJSON();

    return others as UserWithoutPassword;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export {
  fetchParentById,
  fetchAllParents,
  getStudentDetails,
  getManyStudentDetails,
};
