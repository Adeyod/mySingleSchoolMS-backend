// import mongoose from 'mongoose';
// import {
//   SessionSubscriptionType,
//   StudentCumScoreType,
//   StudentLinkingType,
//   StudentNotificationType,
//   StudentUpdateType,
//   StudentWithPaymentType,
//   UserDocument,
//   UserWithoutPassword,
// } from '../constants/types';
// import Parent from '../models/parents.model';
// import Student from '../models/students.model';
// import { AppError } from '../utils/app.error';
// import Grading from '../models/grading.model';
// import { cloudinaryDestroy, handleFileUpload } from '../utils/cloudinary';
// import { Request } from 'express';
// import { capitalizeFirstLetter } from '../utils/functions';
// import { queue } from '../utils/queue';
// import Session from '../models/session.model';
// import Payment from '../models/payment.model';
// import ClassEnrolment from '../models/classes_enrolment.model';
// import Class from '../models/class.model';
// import { maxParentLength } from '../utils/code';
// import { studentsSubjectPositionInClass } from './result.service';

// const studentLinking = async (param: StudentLinkingType) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const student = await Student.findOne(
//       {
//         admission_number: param.admission_number,
//         first_name: param.first_name,
//         last_name: param.last_name,
//       },
//       null,
//       { session }
//     );

//     if (!student) {
//       throw new AppError('Student not found', 404);
//     }

//     if (student.parent_id && student?.parent_id?.length + 1 > maxParentLength) {
//       throw new AppError(
//         `Student can only be linked to ${maxParentLength} parents and presently ${student.first_name} ${student.last_name} has already being linked to ${student.parent_id.length} parents.`,
//         400
//       );
//     }

//     if (student.parent_id?.includes(param.parent_id)) {
//       throw new AppError('This parent is already linked to the student', 400);
//     }

//     const parent = await Parent.findOne({ _id: param.parent_id }, null, {
//       session,
//     });

//     if (!parent) {
//       throw new AppError('Parent does not exist', 404);
//     }

//     if (parent.children?.includes(student._id)) {
//       throw new AppError('This student is already linked to the parent', 400);
//     }

//     const getStudent = await Student.findOneAndUpdate(
//       {
//         admission_number: param.admission_number,
//         first_name: param.first_name,
//         last_name: param.last_name,
//       },
//       {
//         $addToSet: { parent_id: param.parent_id },
//       },
//       {
//         new: true,
//         session,
//       }
//     );

//     if (!getStudent) {
//       throw new AppError('Student not found.', 404);
//     }

//     const getParent = await Parent.findByIdAndUpdate(
//       {
//         _id: param.parent_id,
//       },
//       {
//         $addToSet: { children: getStudent._id },
//       },
//       {
//         new: true,
//         session,
//       }
//     );

//     if (!getParent) {
//       throw new AppError('Parent not found.', 404);
//     }

//     await session.commitTransaction();
//     session.endSession();

//     const linkingDetails = {
//       parent: getParent,
//       student: getStudent,
//     };

//     return linkingDetails;
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     throw error;
//   }
// };

// const studentCumScorePerTerm = async (param: StudentCumScoreType) => {
//   const { studentId, sessionId, term, studentClass } = param;

//   try {
//     const gradingRecords = await Grading.find({
//       student: studentId,
//       session: sessionId,
//       term: term,
//       class: studentClass,
//     }).populate('subject');

//     if (!gradingRecords || gradingRecords.length === 0) {
//       throw new AppError(
//         'No grading data for this student in this session',
//         404
//       );
//     }

//     let totalScore = 0;
//     gradingRecords.forEach((record) => {
//       if (record.total_score !== null) {
//         totalScore += record.total_score;
//       }
//     });

//     const cumulativeScore = totalScore / gradingRecords.length;
//     return cumulativeScore;
//   } catch (error) {
//     throw error;
//   }
// };

// const fetchAllStudents = async (
//   page: number | undefined,
//   limit: number | undefined,
//   searchParams: string
// ): Promise<{
//   studentObj: StudentWithPaymentType[];
//   totalCount: number;
//   totalPages: number;
// }> => {
//   try {
//     let query = Student.find().sort({ createdAt: -1 });

//     if (searchParams) {
//       const regex = new RegExp(searchParams, 'i');

//       query = query.where({
//         $or: [
//           { first_name: { $regex: regex } },
//           { last_name: { $regex: regex } },
//           { middle_name: { $regex: regex } },
//           { email: { $regex: regex } },
//           { gender: { $regex: regex } },
//         ],
//       });
//     }

//     if (!query) {
//       throw new AppError('Students not found.', 404);
//     }

//     const count = await query.clone().countDocuments();
//     let pages = 0;

//     if (page !== undefined && limit !== undefined && count !== 0) {
//       const offset = (page - 1) * limit;
//       query = query.skip(offset).limit(limit).sort({ createdAt: -1 });
//       pages = Math.ceil(count / limit);
//       if (page > pages) {
//         throw new AppError('Page can not be found.', 404);
//       }
//     }

//     const findStudent = await query;

//     if (!findStudent || findStudent.length === 0) {
//       throw new AppError('Students not found.', 404);
//     }

//     const activeSession = await Session.findOne({
//       is_active: true,
//     });

//     const activeTerm = activeSession?.terms.find(
//       (term) => term.is_active === true
//     );

//     const studentsPasswordRemoved2: StudentWithPaymentType[] =
//       await Promise.all(
//         findStudent.map(async (p) => {
//           const payment = await Payment.findOne({
//             student: p._id,
//             session: activeSession?._id,
//             term: activeTerm?.name,
//           }).lean();
//           const { password, ...others } = p.toJSON();

//           const student = {
//             ...others,
//             latest_payment_document: payment || null,
//           } as StudentWithPaymentType;

//           return student;
//         })
//       );

//     return {
//       studentObj: studentsPasswordRemoved2 as StudentWithPaymentType[],
//       totalCount: count,
//       totalPages: pages,
//     };
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something went wrong.');
//     }
//   }
// };

// const fetchStudentById = async (
//   student_id: string
// ): Promise<UserWithoutPassword> => {
//   try {
//     const response = await Student.findById({
//       _id: student_id,
//     }).populate('parent_id', '-password');

//     const session = await Session.findOne({
//       is_active: true,
//     });

//     const activeTerm = session?.terms.find((term) => term.is_active === true);

//     let userPaymentDoc = null;

//     if (session) {
//       userPaymentDoc = await Payment.findOne({
//         student: response?._id,
//         session: session._id,
//         term: activeTerm?.name,
//       });

//       response?.set('latest_payment_document', userPaymentDoc, {
//         strict: false,
//       });
//     }

//     if (!response) {
//       throw new AppError('Parent not found.', 404);
//     }

//     const { password, ...others } = response.toJSON();

//     const userObj = {
//       ...others,
//       latest_payment_document: userPaymentDoc,
//     };

//     return userObj as UserWithoutPassword;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.error(error);
//       throw new Error('Something went wrong');
//     }
//   }
// };

// const studentUpdateDetails = async (
//   req: Request,
//   payload: StudentUpdateType,
//   res: any
// ): Promise<UserWithoutPassword> => {
//   try {
//     const { home_address, close_bus_stop, student_id, parent_id, userRole } =
//       payload;

//     const response = await Student.findById({
//       _id: student_id,
//     });

//     if (!response) {
//       throw new AppError('Student not found.', 404);
//     }

//     if (parent_id !== student_id) {
//       if (userRole === 'parent') {
//         if (
//           !response.parent_id?.includes(new mongoose.Types.ObjectId(parent_id))
//         ) {
//           throw new AppError(
//             'You can not update this student because you are not a parent to this student.',
//             400
//           );
//         }
//       }
//     }

//     if (response.profile_image?.url) {
//       const deletion = await cloudinaryDestroy(
//         response.profile_image.public_url
//       );
//     }

//     const imageUpload = await handleFileUpload(req, res);

//     if (!imageUpload) {
//       throw new AppError('Unable to upload profile image.', 400);
//     }

//     let imageData: { url: string; public_url: string } | undefined;

//     if (Array.isArray(imageUpload)) {
//       imageData = imageUpload[0];
//     } else {
//       imageData = imageUpload;
//     }

//     if (!imageData) {
//       throw new AppError('This is not a valid cloudinary image upload.', 400);
//     }

//     const updateStudent = await Student.findByIdAndUpdate(
//       { _id: student_id },
//       {
//         home_address,
//         close_bus_stop,
//         is_updated: true,
//         profile_image: {
//           url: imageData.url,
//           public_url: imageData.public_url,
//         },
//       },
//       { new: true }
//     );

//     if (!updateStudent) {
//       throw new AppError('Unable to update student.', 400);
//     }

//     const { password, ...others } = updateStudent.toJSON();

//     return others as UserWithoutPassword;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.error(error);
//       throw new Error('Something went wrong');
//     }
//   }
// };

// const newSessionStudentsSubscription = async (): Promise<
//   {
//     studentDetails: {
//       email: string;
//       first_name: string;
//       last_name: string;
//     };
//     parentDetails: {
//       parent_email: string;
//       parent_first_name: string;
//       parent_last_name: string;
//       child_email: string;
//       child_first_name: string;
//       child_last_name: string;
//     } | null;
//   }[]
// > => {
//   try {
//     const students = (await Student.find().populate(
//       'parent_id'
//     )) as StudentNotificationType[];

//     if (!students) {
//       throw new AppError('Students not found', 404);
//     }

//     const activeSession = await Session.findOne({
//       is_active: true,
//     });

//     if (!activeSession) {
//       throw new AppError('No active session not found', 404);
//     }

//     const studentDetails = students.map((student) => {
//       const parent = Array.isArray(student.parent_id)
//         ? student?.parent_id[0]
//         : null;

//       return {
//         studentDetails: {
//           email: student.email,
//           first_name: capitalizeFirstLetter(student.first_name),
//           last_name: capitalizeFirstLetter(student.last_name),
//           type: 'session-subscription',
//         },

//         parentDetails: parent
//           ? {
//               parent_email: parent?.email,
//               parent_first_name: capitalizeFirstLetter(parent?.first_name),
//               parent_last_name: capitalizeFirstLetter(parent?.last_name),
//               child_email: student.email,
//               child_first_name: capitalizeFirstLetter(student.first_name),
//               child_last_name: capitalizeFirstLetter(student.last_name),
//               type: 'session-subscription',
//             }
//           : null,
//       };
//     });

//     const sendStudentEmail = studentDetails.map(async (s) => {
//       const studentJobData = {
//         first_name:
//           s.studentDetails.first_name + ' ' + s.studentDetails.last_name,
//         type: 'session-subscription',
//         email: s.studentDetails.email,
//         academic_session: activeSession.academic_session,
//         option: 'student',
//       };
//       const mailSent = await queue.add('sendMail', studentJobData, {
//         attempts: 3,
//         backoff: 10000,
//         removeOnComplete: true,
//       });
//     });

//     const sendParentEmail = studentDetails.map(async (s) => {
//       if (s.parentDetails !== null) {
//         const parentJobData = {
//           first_name:
//             s.parentDetails?.parent_first_name +
//             ' ' +
//             s.parentDetails?.parent_last_name,
//           child_name:
//             s.parentDetails?.child_first_name +
//             ' ' +
//             s.parentDetails?.child_last_name,
//           child_email: s.parentDetails?.child_email,
//           email: s.parentDetails?.parent_email,
//           type: 'session-subscription',
//           option: 'parent',
//           academic_session: activeSession.academic_session,
//         };

//         const mailSent = await queue.add('sendMail', parentJobData, {
//           attempts: 3,
//           backoff: 10000,
//           removeOnComplete: true,
//         });
//       }
//     });

//     return studentDetails;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened.');
//     }
//   }
// };

// const studentSessionSubscriptionUpdate = async (
//   payload: SessionSubscriptionType
// ): Promise<UserDocument> => {
//   try {
//     const {
//       student_id,
//       academic_session_id,
//       parent_id,
//       userRole,
//       new_session_subscription_status,
//     } = payload;

//     const student = await Student.findById({
//       _id: student_id,
//     });

//     if (!student) {
//       throw new AppError(`Student with ID: ${student_id} not found.`, 404);
//     }

//     if (student.is_verified !== true) {
//       throw new AppError(
//         `Student bearing ${student.first_name} ${student.last_name} need to verify his/her email before progressing`,
//         400
//       );
//     }

//     if (student.is_updated !== true) {
//       throw new AppError(
//         `Student bearing ${student.first_name} ${student.last_name} need to update his/her account by providing address and also latest profile picture before progressing`,
//         400
//       );
//     }

//     if (userRole && parent_id) {
//       if (userRole === 'parent') {
//         const parentMatch = student.parent_id?.includes(parent_id);
//         if (!parentMatch) {
//           throw new AppError(
//             'You can only update a student that you are linked to as a parent.',
//             400
//           );
//         }
//       }
//     }

//     const session = await Session.findById({
//       _id: academic_session_id,
//     });

//     if (!session) {
//       throw new AppError(
//         `Session with ID: ${academic_session_id} not found.`,
//         404
//       );
//     }

//     if (session.is_active !== true) {
//       throw new AppError(
//         `The session with ID: ${academic_session_id} is not active.`,
//         400
//       );
//     }

//     if (student.new_session_subscription !== null) {
//       throw new AppError(
//         `This student has already informed us of his decision concerning session subscription for the ${session.academic_session} academic session.`,
//         400
//       );
//     }

//     student.new_session_subscription = new_session_subscription_status;
//     const studentObj = await student.save();

//     const { password, ...others } = studentObj.toJSON();

//     return others as UserDocument;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened');
//     }
//   }
// };

// const fetchStudentsThatSubscribedToNewSession = async (level: string) => {
//   try {
//     const classExist = await Class.find({ level });

//     if (!classExist || classExist.length === 0) {
//       throw new AppError(`Class with level: ${level} does not exist.`, 404);
//     }

//     const students = await Promise.all(
//       classExist.map(async (d) => {
//         return await Student.find({
//           'current_class.class_id': d?._id,
//           new_session_subscription: true,
//           active_class_enrolment: false,
//         });
//       })
//     );

//     const studentIds = students.flat().map((student) => {
//       const { password, ...others } = student.toJSON();
//       return others;
//     });

//     return studentIds;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.log(error);
//       throw new Error('Something happened');
//     }
//   }
// };

// const fetchNewStudentsThatHasNoClassEnrolmentBefore = async (
//   page: number | undefined,
//   limit: number | undefined,
//   searchParams: string
// ) => {
//   try {
//     // let query = Student.find({
//     //   $or: [
//     //     { 'current_class.class_id': null }, // Handles case where class_id exists but is null
//     //     { current_class: { $exists: false } }, // Handles case where current_class does not exist
//     //   ],
//     //   current_class_level: null,
//     // });

//     let query = Student.find({
//       current_class: null,
//       current_class_level: null,
//     });

//     if (searchParams) {
//       const regex = new RegExp(searchParams, 'i');

//       query = query.where({
//         $or: [
//           { first_name: { $regex: regex } },
//           { last_name: { $regex: regex } },
//           { middle_name: { $regex: regex } },
//           { email: { $regex: regex } },
//         ],
//       });
//     }

//     if (!query) {
//       throw new AppError('Students not found.', 404);
//     }
//     const count = await query.clone().countDocuments();
//     let pages = 0;

//     if (page !== undefined && limit !== undefined && count !== 0) {
//       const offset = (page - 1) * limit;

//       query = query.skip(offset).limit(limit).sort({ createdAt: -1 });

//       pages = Math.ceil(count / limit);

//       if (page > pages) {
//         throw new AppError('Page can not be found.', 404);
//       }
//     }

//     const students = await query;

//     if (!students || students.length === 0) {
//       throw new AppError('Students not found', 404);
//     }

//     return { students, totalPages: pages, totalCount: count };
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened');
//     }
//   }
// };

// const fetchAllStudentsOnAClassLevel = async (level: string) => {
//   try {
//     const students = await Student.find({
//       current_class_level: level,
//     }).select('-password');

//     if (!students || students.length === 0) {
//       throw new AppError('No student found for this class level.', 404);
//     }

//     return students;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened');
//     }
//   }
// };

// export {
//   fetchAllStudentsOnAClassLevel,
//   fetchNewStudentsThatHasNoClassEnrolmentBefore,
//   fetchStudentsThatSubscribedToNewSession,
//   studentSessionSubscriptionUpdate,
//   newSessionStudentsSubscription,
//   studentUpdateDetails,
//   studentLinking,
//   studentCumScorePerTerm,
//   fetchAllStudents,
//   fetchStudentById,
// };

////////////////////////////////////////////////////////////////////////////////
import mongoose, { ObjectId } from 'mongoose';
import {
  ParentObjType,
  SessionSubscriptionType,
  StudentLinkingType,
  StudentNotificationType,
  StudentSessionSubscriptionType,
  StudentUpdateType,
  StudentWithPaymentType,
  UserDocument,
  UserWithoutPassword,
} from '../constants/types';
import Payment from '../models/payment.model';
import Session from '../models/session.model';
import Student from '../models/students.model';
import { AppError } from '../utils/app.error';
import { Request } from 'express';
import { cloudinaryDestroy, handleFileUpload } from '../utils/cloudinary';
import { maxParentLength } from '../utils/code';
import Parent from '../models/parents.model';
import { createNotificationMessage } from '../repository/notification.repository';
import {
  capitalizeFirstLetter,
  schoolCityHandCoded,
  schoolCountryHandCoded,
  schoolNameHandCoded,
  schoolStateHandCoded,
  sendingEmailToQueue,
} from '../utils/functions';
import { emailQueue } from '../utils/queue';
import Class from '../models/class.model';
import { schoolBusValidation } from '../utils/validation';

const fetchStudentById = async (
  student_id: string
): Promise<UserWithoutPassword> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const response = await Student.findById({
      _id: student_id,
    })
      .populate('parent_id', '-password')
      .session(session);

    const sessionExist = await Session.findOne({
      is_active: true,
    });

    const activeTerm = sessionExist?.terms.find(
      (term) => term.is_active === true
    );

    let userPaymentDoc = null;

    if (sessionExist) {
      userPaymentDoc = await Payment.findOne({
        student: response?._id,
        session: sessionExist._id,
        term: activeTerm?.name,
      }).session(session);

      response?.set('latest_payment_document', userPaymentDoc, {
        strict: false,
      });
    }

    if (!response) {
      throw new AppError('Parent not found.', 404);
    }

    const { password, ...others } = response.toJSON();

    const userObj = {
      ...others,
      latest_payment_document: userPaymentDoc,
    };

    await session.commitTransaction();
    session.endSession();

    console.log('userObj:', userObj);

    return userObj as UserWithoutPassword;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.error(error);
      throw new Error('Something went wrong');
    }
  }
};

const studentUpdateDetails = async (
  req: Request,
  payload: StudentUpdateType,
  res: any
): Promise<UserWithoutPassword> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { home_address, student_id, parent_id, userRole } = payload;

    console.log('PAYLOAD INSIDE SERVICE:', payload);

    const response = await Student.findById({
      _id: student_id,
    }).session(session);

    if (!response) {
      throw new AppError('Student not found.', 404);
    }

    if (parent_id !== student_id) {
      if (userRole === 'parent') {
        if (!response.parent_id?.includes(Object(parent_id))) {
          throw new AppError(
            'You can not update this student because you are not a parent to this student.',
            400
          );
        }
      }
    }

    if (response.profile_image?.url) {
      const deletion = await cloudinaryDestroy(
        response.profile_image.public_url
      );
    }

    console.log('STUDENT IMAGE INSIDE SERVICE SINGLE:', req.file);
    console.log('STUDENT IMAGE INSIDE SERVICE ARRAY:', req.files);

    const imageUpload = await handleFileUpload(req, res);

    if (!imageUpload) {
      throw new AppError('Unable to upload profile image.', 400);
    }

    let imageData: { url: string; public_url: string } | undefined;

    if (Array.isArray(imageUpload)) {
      imageData = imageUpload[0];
    } else {
      imageData = imageUpload;
    }

    if (!imageData) {
      throw new AppError('This is not a valid cloudinary image upload.', 400);
    }

    const updateStudent = await Student.findByIdAndUpdate(
      { _id: student_id },
      {
        home_address,
        is_updated: true,
        profile_image: {
          url: imageData.url,
          public_url: imageData.public_url,
        },
      },
      { new: true }
    ).session(session);

    if (!updateStudent) {
      throw new AppError('Unable to update student.', 400);
    }

    const { password, ...others } = updateStudent.toJSON();

    await session.commitTransaction();
    session.endSession();

    return others as UserWithoutPassword;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.error(error);
      throw new Error('Something went wrong');
    }
  }
};

// const fetchAllStudents = async (
//   page: number | undefined,
//   limit: number | undefined,
//   searchParams: string
// ): Promise<{
//   studentObj: StudentWithPaymentType[];
//   totalCount: number;
//   totalPages: number;
// }> => {
//   try {
//     let query = Student.find({}).sort({ createdAt: -1 });

//     if (searchParams) {
//       const regex = new RegExp(searchParams, 'i');

//       query = query.where({
//         $or: [
//           { first_name: { $regex: regex } },
//           { last_name: { $regex: regex } },
//           { middle_name: { $regex: regex } },
//           { email: { $regex: regex } },
//           { gender: { $regex: regex } },
//         ],
//       });
//     }

//     if (!query) {
//       throw new AppError('Students not found.', 404);
//     }

//     console.log('i am here');

//     const count = await query.clone().countDocuments();
//     let pages = 0;

//     if (page !== undefined && limit !== undefined && count !== 0) {
//       const offset = (page - 1) * limit;
//       query = query.skip(offset).limit(limit);

//       pages = Math.ceil(count / limit);
//       if (page > pages) {
//         throw new AppError('Page can not be found.', 404);
//       }
//     }

//     const findStudent = await query.sort({ createdAt: -1 });

//     if (!findStudent || findStudent.length === 0) {
//       throw new AppError('Students not found.', 404);
//     }

//     const activeSession = await Session.findOne({
//       is_active: true,
//     });

//     const activeTerm = activeSession?.terms.find(
//       (term) => term.is_active === true
//     );

//     console.log('activeSession:', activeSession);
//     console.log('activeTerm:', activeTerm);

//     const studentsPasswordRemoved2: StudentWithPaymentType[] =
//       await Promise.all(
//         findStudent.map(async (p) => {
//           const payment = await Payment.findOne({
//             student: p._id,
//             session: activeSession?._id,
//             term: activeTerm?.name,
//           }).lean();
//           const { password, ...others } = p.toJSON();

//           const student = {
//             ...others,
//             latest_payment_document: payment || null,
//           } as StudentWithPaymentType;

//           return student;
//         })
//       );

//     return {
//       studentObj: studentsPasswordRemoved2 as StudentWithPaymentType[],
//       totalCount: count,
//       totalPages: pages,
//     };
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something went wrong.');
//     }
//   }
// };

const fetchAllStudents = async (
  page?: number,
  limit?: number,
  searchParams = ''
): Promise<{
  studentObj: StudentWithPaymentType[];
  totalCount: number;
  totalPages: number;
}> => {
  try {
    let query = Student.find({}).sort({ createdAt: -1 });

    // Apply search filter if present
    if (searchParams?.trim()) {
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

    const count = await query.clone().countDocuments();
    let pages = 1;

    // If page and limit are defined, apply pagination
    if (page && limit && count !== 0) {
      const offset = (page - 1) * limit;
      query = query.skip(offset).limit(limit);
      pages = Math.ceil(count / limit);

      if (page > pages) {
        throw new AppError('Page can not be found.', 404);
      }
    }

    const findStudent = await query.sort({ createdAt: -1 });

    console.log('findStudent:', findStudent);

    if (!findStudent || findStudent.length === 0) {
      throw new AppError('Students not found.', 404);
    }

    const activeSession = await Session.findOne({ is_active: true });
    const activeTerm = activeSession?.terms.find(
      (term) => term.is_active === true
    );

    const studentsWithPayments: StudentWithPaymentType[] = await Promise.all(
      findStudent.map(async (student) => {
        const payment = await Payment.findOne({
          student: student._id,
          session: activeSession?._id,
          term: activeTerm?.name,
        }).lean();

        const { password, ...others } = student.toJSON();

        return {
          ...others,
          latest_payment_document: payment || null,
        } as StudentWithPaymentType;
      })
    );

    console.log('studentsWithPayments:', studentsWithPayments);

    return {
      studentObj: studentsWithPayments,
      totalCount: count,
      totalPages: pages,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    }
    throw new Error('Something went wrong.');
  }
};

const fetchAllStudentsOnAClassLevel = async (level: string) => {
  try {
    const students = await Student.find({
      current_class_level: level,
    }).select('-password');

    if (!students || students.length === 0) {
      throw new AppError('No student found for this class level.', 404);
    }

    return students;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const studentLinking = async (param: StudentLinkingType) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { first_name, last_name, admission_number, parent_id } = param;

    const student = await Student.findOne(
      {
        admission_number: admission_number,
        first_name: first_name,
        last_name: last_name,
      },
      null,
      { session }
    );

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    if (student.parent_id && student?.parent_id?.length + 1 > maxParentLength) {
      throw new AppError(
        `Student can only be linked to ${maxParentLength} parents and presently ${student.first_name} ${student.last_name} has already being linked to ${student.parent_id.length} parents.`,
        400
      );
    }

    if (student.parent_id?.includes(parent_id)) {
      throw new AppError('This parent is already linked to the student', 400);
    }

    const parent = await Parent.findById({ _id: parent_id }, null, {
      session,
    });

    if (!parent) {
      throw new AppError('Parent does not exist', 404);
    }

    const studentObj = Object(student._id);

    console.log(
      'This can cause error studentObj. because i modified it.',
      studentObj
    );

    if (parent.children?.includes(studentObj)) {
      throw new AppError('This student is already linked to the parent', 400);
    }

    const getStudent = await Student.findOneAndUpdate(
      {
        admission_number: param.admission_number,
        first_name: param.first_name,
        last_name: param.last_name,
      },
      {
        $addToSet: { parent_id: parent_id },
      },
      {
        new: true,
        session,
      }
    );

    if (!getStudent) {
      throw new AppError('Student not found.', 404);
    }

    const getParent = await Parent.findByIdAndUpdate(
      {
        _id: param.parent_id,
      },
      {
        $addToSet: { children: getStudent._id },
      },
      {
        new: true,
        session,
      }
    );

    if (!getParent) {
      throw new AppError('Parent not found.', 404);
    }

    const notificationPayload = {
      title: 'Student Linkage',
      message: `Your child whose name is ${getStudent.first_name} ${getStudent.last_name} has been linked to you. You can now view the progress of ${getStudent.first_name} and also pay for his/her school fees and other fees.`,
      user_id: getParent._id,
      session: session,
    };

    const notifyParent = await createNotificationMessage(notificationPayload);

    const name = capitalizeFirstLetter(getStudent.first_name);
    const sch_name = capitalizeFirstLetter(schoolNameHandCoded);

    const jobDataPayload = {
      first_name: getStudent.first_name,
      title: 'Child Linkage',
      school_name: sch_name,
      school_city: schoolCityHandCoded,
      school_state: schoolStateHandCoded,
      school_country: schoolCountryHandCoded,
      email: getParent.email,
      message: `Your child whose name is ${name} ${getStudent.last_name} who is a student of ${sch_name} has been linked to you. You can now view the progress of ${name} and also pay for his/her school fees and other fees.`,
    };

    const info = await sendingEmailToQueue(jobDataPayload, 'child-linkage');

    await session.commitTransaction();
    session.endSession();

    const linkingDetails = {
      parent: getParent,
      student: getStudent,
    };

    return linkingDetails;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// I NEED TO CHECK IF THERE IS AN ACTIVE SESSION AND PREVENT
// SENDING SESSION NOTIFICATION MAIL
const newSessionStudentsSubscription = async (): Promise<
  {
    studentDetails: {
      email: string;
      first_name: string;
      last_name: string;
    };
    parentDetails: {
      parent_email: string;
      parent_first_name: string;
      parent_last_name: string;
      child_email: string;
      child_first_name: string;
      child_last_name: string;
    } | null;
  }[]
> => {
  try {
    // ADD is_subscription_mail_sent BOOLEAN TO SESSION
    // I NEED TO CHECK IF THERE IS AN ACTIVE SESSION AND
    // is_subscription_mail_sent IS TRUE, THEN PREVENT SENDING
    // SESSION NOTIFICATION MAIL SO THAT THIS BUTTON WILL NOT BE
    // ABUSED

    // const students = (await Student.find(school).populate(
    //   'parent_id'
    // )) as StudentNotificationType[];

    const students = await Student.find({})
      .populate<{ parent_id: ParentObjType[] }>('parent_id') // Ensure correct type for populated data
      .lean();

    console.log('students:', students[0]);

    if (!students) {
      throw new AppError('Students not found', 404);
    }

    const activeSession = await Session.findOne({
      is_active: true,
    });

    console.log('activeSession:', activeSession);

    if (!activeSession) {
      throw new AppError('No active session found', 404);
    }

    if (activeSession.is_subscription_mail_sent === true) {
      throw new AppError('Session notification mail has been sent ones.', 400);
    }

    const studentDetails = students.map((student) => {
      const parent = Array.isArray(student.parent_id)
        ? student?.parent_id[0]
        : null;

      return {
        studentDetails: {
          email: student.email,
          first_name: capitalizeFirstLetter(student.first_name),
          last_name: capitalizeFirstLetter(student.last_name),
          type: 'session-subscription',
        },

        parentDetails: parent
          ? {
              parent_email: parent?.email,
              parent_first_name: capitalizeFirstLetter(parent?.first_name),
              parent_last_name: capitalizeFirstLetter(parent?.last_name),
              child_email: student.email,
              child_first_name: capitalizeFirstLetter(student.first_name),
              child_last_name: capitalizeFirstLetter(student.last_name),
              type: 'session-subscription',
            }
          : null,
      };
    });

    const sendStudentEmail = studentDetails.map(async (s) => {
      const studentJobData = {
        first_name:
          s.studentDetails.first_name + ' ' + s.studentDetails.last_name,
        type: 'session-subscription',
        email: s.studentDetails.email,
        academic_session: activeSession.academic_session,
        school_name: schoolNameHandCoded,
        city: schoolCityHandCoded,
        state: schoolStateHandCoded,
        country: schoolCountryHandCoded,
        option: 'student',
      };
      const mailSent = await emailQueue.add('sendMail', studentJobData, {
        attempts: 3,
        backoff: 10000,
        removeOnComplete: true,
      });
    });

    const sendParentEmail = studentDetails.map(async (s) => {
      if (s.parentDetails !== null) {
        const parentJobData = {
          first_name:
            s.parentDetails?.parent_first_name +
            ' ' +
            s.parentDetails?.parent_last_name,
          child_name:
            s.parentDetails?.child_first_name +
            ' ' +
            s.parentDetails?.child_last_name,
          child_email: s.parentDetails?.child_email,
          email: s.parentDetails?.parent_email,
          type: 'session-subscription',
          option: 'parent',
          school_name: schoolNameHandCoded,
          city: schoolCityHandCoded,
          state: schoolStateHandCoded,
          country: schoolCountryHandCoded,
          academic_session: activeSession.academic_session,
        };

        const mailSent = await emailQueue.add('sendMail', parentJobData, {
          attempts: 3,
          backoff: 10000,
          removeOnComplete: true,
        });
      }
    });

    activeSession.is_subscription_mail_sent = true;
    await activeSession.save();

    return studentDetails;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened.');
    }
  }
};

const studentSessionSubscriptionUpdateByAdmin = async (
  payload: SessionSubscriptionType
): Promise<Omit<UserDocument, 'password'>[]> => {
  try {
    const { student_ids_array, academic_session_id, userRole } = payload;

    student_ids_array.map((student_id) => {});

    const validStudentIds = student_ids_array.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    const objectIds = validStudentIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const foundStudents = await Student.find({
      _id: { $in: objectIds },
    });

    if (foundStudents.length !== validStudentIds.length) {
      throw new AppError(`One or more students not found or invalid..`, 404);
    }

    const notVerified = foundStudents.map((student) => {
      const isValid = student.is_verified;
      const studentName = student.first_name + student.last_name;
      const isUpdated = student.is_updated;

      return {
        isValid,
        studentName,
        isUpdated,
      };
    });

    const validStudents = notVerified.filter(
      (s) => s.isValid === true && s.isUpdated === true
    );
    const notValidStudents = notVerified.filter((s) => s.isValid !== true);
    const notUpdatedStudents = notVerified.filter((s) => s.isUpdated !== true);

    if (notValidStudents.length > 0) {
      const notValidNames = notValidStudents.map((a) => a.studentName);
      throw new AppError(
        `The students with the following names are not verified: ${notValidNames.join(
          ', '
        )}`,
        400
      );
    }

    if (notUpdatedStudents.length > 0) {
      const notUpdatedNames = notUpdatedStudents.map((a) => a.studentName);
      throw new AppError(
        `The students with the following names have not updated their addresses and profile picture: ${notUpdatedNames.join(
          ', '
        )}`,
        400
      );
    }

    const session = await Session.findById({
      _id: academic_session_id,
    });

    if (!session) {
      throw new AppError(
        `Session with ID: ${academic_session_id} not found.`,
        404
      );
    }

    if (session.is_active !== true) {
      throw new AppError(
        `The session with ID: ${academic_session_id} is not active.`,
        400
      );
    }

    for (const student of foundStudents) {
      student.new_session_subscription = true;

      await student.save();
    }

    const sanitizedStudents = foundStudents.map((student) => {
      const { password, ...others } = student.toJSON();
      return others;
    });

    console.log('sanitizedStudents:', sanitizedStudents);

    return sanitizedStudents as Omit<UserDocument, 'password'>[];
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened');
    }
  }
};

const fetchStudentsThatSubscribedToNewSession = async (level: string) => {
  try {
    const classExist = await Class.find({ level });

    if (!classExist || classExist.length === 0) {
      throw new AppError(`Class with level: ${level} does not exist.`, 404);
    }

    const students = await Promise.all(
      classExist.map(async (d) => {
        return await Student.find({
          'current_class.class_id': d?._id,
          new_session_subscription: true,
          active_class_enrolment: false,
        });
      })
    );

    const studentIds = students.flat().map((student) => {
      const { password, ...others } = student.toJSON();
      return others;
    });

    return studentIds;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened');
    }
  }
};

const fetchNewStudentsThatHasNoClassEnrolmentBefore = async (
  page: number | undefined,
  limit: number | undefined,
  searchParams: string
) => {
  try {
    // let query = Student.find({
    //   $or: [
    //     { 'current_class.class_id': null }, // Handles case where class_id exists but is null
    //     { current_class: { $exists: false } }, // Handles case where current_class does not exist
    //   ],
    //   current_class_level: null,
    // });

    let query = Student.find({
      current_class: null,
      current_class_level: null,
    });

    if (searchParams) {
      const regex = new RegExp(searchParams, 'i');

      query = query.where({
        $or: [
          { first_name: { $regex: regex } },
          { last_name: { $regex: regex } },
          { middle_name: { $regex: regex } },
          { email: { $regex: regex } },
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

      query = query.skip(offset).limit(limit).sort({ createdAt: -1 });

      pages = Math.ceil(count / limit);

      if (page > pages) {
        throw new AppError('Page can not be found.', 404);
      }
    }

    const students = await query;

    if (!students || students.length === 0) {
      throw new AppError('Students not found', 404);
    }

    return { students, totalPages: pages, totalCount: count };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchStudentsThatAreYetToSubscribedToNewSession = async (
  page: number | undefined,
  limit: number | undefined,
  searchParams: string
) => {
  try {
    const activeSessionExist = await Session.findOne({
      is_active: true,
    });

    if (!activeSessionExist) {
      throw new AppError(
        'There is no active session found for the school. Please start a new session before proceeding.',
        400
      );
    }

    const classExist = await Class.find({});

    if (!classExist || classExist.length === 0) {
      throw new AppError(`Classes not found for this school.`, 404);
    }

    let query = Student.find({
      new_session_subscription: null,
      active_class_enrolment: false,
    });

    if (searchParams) {
      const regex = new RegExp(searchParams, 'i');

      console.log('searchParams', searchParams);

      query = query.where({
        $or: [
          { first_name: { $regex: regex } },
          { last_name: { $regex: regex } },
          { middle_name: { $regex: regex } },
          { admission_number: { $regex: regex } },
        ],
      });
    }

    if (!query) {
      throw new AppError('Students not found', 404);
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

    if (limit === undefined && count !== 0) {
      limit = 10;
      pages = Math.ceil(count / limit);
    }

    const students = await query.sort({ createdAt: -1 });

    if (students.length === 0) {
      throw new AppError(
        'There is no student that has not subscribed to a new session in the school.',
        400
      );
    }

    console.log('students:', students);

    const studentIds = students.flat().map((student) => {
      const { password, ...others } = student.toJSON();
      return others;
    });

    return {
      studentIds,
      totalPages: pages,
      totalCount: count,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened');
    }
  }
};

const studentSessionSubscriptionUpdateByStudentOrParent = async (
  payload: StudentSessionSubscriptionType
): Promise<Omit<UserDocument, 'password'>> => {
  try {
    const {
      student_id,
      academic_session_id,
      parent_id,
      userRole,
      new_session_subscription_status,
    } = payload;

    const student = await Student.findById({
      _id: student_id,
    });

    if (!student) {
      throw new AppError(`Student with ID: ${student_id} not found.`, 404);
    }

    if (student.is_verified !== true) {
      throw new AppError(
        `Student bearing ${student.first_name} ${student.last_name} need to verify his/her email before progressing`,
        400
      );
    }

    if (student.is_updated !== true) {
      throw new AppError(
        `Student bearing ${student.first_name} ${student.last_name} need to update his/her account by providing address and also latest profile picture before progressing`,
        400
      );
    }

    if (userRole && parent_id) {
      if (userRole === 'parent') {
        const parentMatch = student.parent_id?.includes(parent_id);
        if (!parentMatch) {
          throw new AppError(
            'You can only update a student that you are linked to as a parent.',
            400
          );
        }
      }
    }

    const session = await Session.findById({
      _id: academic_session_id,
    });

    if (!session) {
      throw new AppError(
        `Session with ID: ${academic_session_id} not found.`,
        404
      );
    }

    if (session.is_active !== true) {
      throw new AppError(
        `The session with ID: ${academic_session_id} is not active.`,
        400
      );
    }

    if (student.new_session_subscription !== null) {
      throw new AppError(
        `This student has already informed us of his decision concerning session subscription for the ${session.academic_session} academic session.`,
        400
      );
    }

    student.new_session_subscription = new_session_subscription_status;
    const studentObj = await student.save();

    const { password, ...others } = studentObj.toJSON();

    return others as Omit<UserDocument, 'password'>;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

// WE NEED TO ALLOW SCHOOL ADMIN TO BE ABLE TO HELP ANY STUDENT TO
// SUBSCRIBE TO NEW SESSION SO AS TO CATER FOR THOSE THAT ARE NOT
// TECH SAVVY. ALSO ON THE MODAL FOR ENROLLING RETURNING STUDENTS,
// THE NEW CLASS DROP DOWN SHOULD MAKE PROVISION FOR THOSE SCHOOLS
// THAT ALLOW DOUBLE PROMOTION AND STUDENT TO REPEAT CLASS.

export {
  fetchStudentsThatAreYetToSubscribedToNewSession,
  fetchNewStudentsThatHasNoClassEnrolmentBefore,
  fetchStudentsThatSubscribedToNewSession,
  studentSessionSubscriptionUpdateByAdmin,
  studentSessionSubscriptionUpdateByStudentOrParent,
  newSessionStudentsSubscription,
  studentLinking,
  fetchAllStudents,
  fetchStudentById,
  studentUpdateDetails,
  fetchAllStudentsOnAClassLevel,
};
