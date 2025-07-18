// import mongoose from 'mongoose';
// import { enrolmentEnum } from '../constants/enum';
// import { GetStudentByIdType, ResultWithClass } from '../constants/types';
// import Class from '../models/class.model';
// import ClassEnrolment from '../models/classes_enrolment.model';
// import Fee from '../models/fees.model';
// import Payment from '../models/payment.model';
// import Result from '../models/result.model';
// import Student from '../models/students.model';
// import { AppError } from '../utils/app.error';
// import OldStudent from '../models/old_student.model';
// import StudentBackup from '../models/student_backup.model';
// import { ClientSession } from 'mongoose';

// const calculateOutStandingPerTerm = async (
//   session: mongoose.ClientSession,
//   session_id: string,
//   term: string
// ) => {
//   try {
//     // FETCH ALL TERM PAYMENT THAT REMAINING AMOUNT IS NOT 0
//     const studentsWithOutstandingPayments = await Payment.find({
//       session: session_id,
//       term: term,
//       remaining_amount: { $ne: 0 },
//     }).session(session);

//     if (
//       !studentsWithOutstandingPayments ||
//       studentsWithOutstandingPayments.length === 0
//     ) {
//       console.warn('No outstanding payments for this term');
//       return {
//         message: 'No students with outstanding payments',
//       };
//     }
//     // FETCH AND UPDATE THE STUDENT DOCUMENT USING THE STUDENT ID STORED WITH THE STUDENT DOCUMENT

//     for (const payment of studentsWithOutstandingPayments) {
//       await Student.updateOne(
//         { _id: payment.student },
//         { $inc: { outstanding_balance: payment.remaining_amount } },
//         { new: true, session }
//       );
//     }

//     console.log(
//       'Outstanding payment recorded for students affected successfully.'
//     );

//     return {
//       message: 'Outstanding payments updated successfully',
//     };
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.error(error);
//       throw new Error('Something happened');
//     }
//   }
// };

// // calculateOutStandingPerTerm('677bf9ddafc50abc196477af', 'third_term');

// const promoteStudentsToNextClass = async (
//   session_id: string,
//   next_session_id: string
// ) => {
//   try {
//     const results = (await Result.find({
//       academic_session_id: session_id,
//       final_status: 'promoted',
//     }).populate('class student')) as unknown as ResultWithClass[];

//     for (const result of results) {
//       const nextClass = await Class.findOne({
//         level: result.class.level + 1,
//       });

//       if (nextClass) {
//         const flattenedSubjects = nextClass.compulsory_subjects.map(
//           (subject) => subject
//         );
//         await new ClassEnrolment({
//           students: [
//             {
//               student: result.student,
//               subjects_offered: flattenedSubjects,
//             },
//           ],
//           class: nextClass._id,
//           academic_session_id: next_session_id,
//           level: nextClass.level,
//           term: 'first_term',
//           status: enrolmentEnum[0],
//         }).save();
//       } else {
//         // this means that the student has finished SSS 3
//         console.log(`No next class found for level ${result.class.level + 1}`);
//       }
//     }
//   } catch (error) {
//     console.error(error);
//   }
// };

// const getAStudentById = async (payload: GetStudentByIdType) => {
//   try {
//     const { student_id, session } = payload;
//     const student = await Student.findById(student_id).session(session || null);
//     return student;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened');
//     }
//   }
// };

// const moveStudentToOldStudent = async (session: ClientSession) => {
//   try {
//     const finalYearStudents = await Student.find({
//       current_class_level: 'SSS 3',
//     }).session(session);

//     if (!finalYearStudents || finalYearStudents.length === 0) {
//       console.log('No final year students found');
//     }

//     const backupData = finalYearStudents.map((student) => ({
//       student_data: student.toObject(),
//       moved_at: new Date(),
//     }));

//     await StudentBackup.insertMany(backupData, { session });

//     const oldStudentsData = finalYearStudents.map((student) => ({
//       _id: student._id,
//       first_name: student.first_name,
//       last_name: student.last_name,
//       middle_name: student.middle_name,
//       email: student.email,
//       admission_number: student.admission_number,
//       graduation_session: new Date().getFullYear(),
//       gender: student.gender,
//       dob: student.dob,
//       home_address: student.home_address,
//       password: student.password,
//       is_verified: student.is_verified,
//       parent_id: student.parent_id,
//       outstanding_balance: student.outstanding_balance,
//       profile_image: student.profile_image,
//     }));

//     await OldStudent.insertMany(oldStudentsData, { session, ordered: false });
//     // await Student.deleteMany({ current_class_level: 'SSS 3', session });

//     return oldStudentsData;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened');
//     }
//   }
// };

// // moveStudentToOldStudent();

// export {
//   getAStudentById,
//   // createSchoolFeePaymentDocumentForStudents,
//   promoteStudentsToNextClass,
//   calculateOutStandingPerTerm,
//   moveStudentToOldStudent,
// };

///////////////////////////////////////////////////////////////////////
import mongoose from 'mongoose';
import Payment from '../models/payment.model';
import Student from '../models/students.model';
import { AppError } from '../utils/app.error';
import { GetStudentByIdType } from '../constants/types';

const calculateOutStandingPerTerm = async (
  session: mongoose.ClientSession,
  session_id: string,
  term: string
) => {
  try {
    // FETCH ALL TERM PAYMENT THAT REMAINING AMOUNT IS NOT 0
    const studentsWithOutstandingPayments = await Payment.find({
      session: session_id,
      term: term,
      remaining_amount: { $ne: 0 },
    }).session(session);

    console.log(
      'studentsWithOutstandingPayments:',
      studentsWithOutstandingPayments
    );

    if (
      !studentsWithOutstandingPayments ||
      studentsWithOutstandingPayments.length === 0
    ) {
      console.warn('No outstanding payments for this term');
      return {
        message: 'No students with outstanding payments',
      };
    }
    // FETCH AND UPDATE THE STUDENT DOCUMENT USING THE STUDENT ID STORED WITH THE STUDENT DOCUMENT

    for (const payment of studentsWithOutstandingPayments) {
      await Student.updateOne(
        { _id: payment.student },
        { $inc: { outstanding_balance: payment.remaining_amount } },
        { new: true, session }
      );
    }

    console.log(
      'Outstanding payment recorded for students affected successfully.'
    );

    return {
      message: 'Outstanding payments updated successfully',
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.error(error);
      throw new Error('Something happened');
    }
  }
};

const getAStudentById = async (payload: GetStudentByIdType) => {
  try {
    const { student_id, session } = payload;
    const student = await Student.findById({
      _id: student_id,
    }).session(session || null);
    return student;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

export { calculateOutStandingPerTerm, getAStudentById };
