// import mongoose from 'mongoose';
// import {
//   ClassResultsType,
//   MultipleScoreParamType,
//   ResultDocument,
//   ScoreParamType,
//   ScorePayload,
//   SingleStudentScorePayload,
//   StudentClassPayloadType,
//   StudentPopulatedType,
//   StudentResultPopulatedType,
//   StudentResultSessionType,
//   StudentResultTermType,
//   StudentSubjectPositionType,
//   SubjectPopulatedType,
//   SubjectResult,
//   SubjectResultType,
//   TermResult,
//   UserDocument,
// } from '../constants/types';
// import { recordScore } from '../repository/result.repository';
// import { AppError } from '../utils/app.error';
// import Result from '../models/result.model';
// import ClassEnrolment from '../models/classes_enrolment.model';
// import Class from '../models/class.model';
// import Teacher from '../models/teachers.model';
// import Subject from '../models/subject.model';
// import { getTeacherById } from '../repository/teacher.repository';
// import { getAStudentById } from '../repository/student.repository';
// import Session from '../models/session.model';
// import Student from '../models/students.model';
// import { assignPositions, classPositionCalculation } from '../utils/functions';

// const recordStudentScore = async (
//   payload: ScoreParamType
// ): Promise<ResultDocument> => {
//   try {
//     const result = await recordScore(payload);

//     if (!result) {
//       throw new AppError('Unable to process score.', 400);
//     }

//     return result;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened.');
//     }
//   }
// };

// const recordManyStudentScores = async (payload: MultipleScoreParamType) => {
//   try {
//     const {
//       result_objs, // Array of { student_id, score }
//       term,
//       session_id,
//       teacher_id,
//       subject_id,
//       score_type,
//       class_enrolment_id,
//       class_id,
//     } = payload;

//     const recordPromises = result_objs.map(async (student) => {
//       const singleStudentPayload = {
//         term,
//         session_id,
//         teacher_id,
//         subject_id,
//         score_type,
//         class_enrolment_id,
//         class_id,
//         student_id: student.student_id,
//         score: student.score,
//       };
//       const result = await recordScore(singleStudentPayload);

//       return { status: 'fulfilled', student_id: student.student_id, result };
//     });

//     const results = await Promise.all(recordPromises);
//     // const results = await Promise.allSettled(recordPromises);

//     // const successfulRecords = results
//     //   .filter(
//     //     (
//     //       r
//     //     ): r is PromiseFulfilledResult<{
//     //       status: 'fulfilled';
//     //       student_id: string;
//     //       result: ResultDocument;
//     //     }> => r.status === 'fulfilled'
//     //   )
//     //   .map((r) => r.value);

//     // const failedRecords = results
//     //   .filter(
//     //     (
//     //       r
//     //     ): r is PromiseRejectedResult & {
//     //       reason: { student_id: string; reason: any };
//     //     } => r.status === 'rejected'
//     //   )
//     //   .map((r) => ({
//     //     student_id: r.reason.student_id,
//     //     reason: r.reason,
//     //   }));

//     return { successfulRecords: results, failedRecords: [] };
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened.');
//     }
//   }
// };

// const fetchAllScoresPerSubject = async (payload: ScorePayload) => {
//   try {
//     const {
//       class_id,
//       academic_session_id,
//       subject_id,
//       term,
//       userId,
//       userRole,
//     } = payload;

//     const termParam = term;

//     const classExist = await Class.findById({
//       _id: class_id,
//     });

//     if (!classExist) {
//       throw new AppError('Class not found.', 404);
//     }

//     const subjectExist = await Subject.findById({
//       _id: subject_id,
//     });

//     if (!subjectExist) {
//       throw new AppError(`Subject with ID: ${subject_id} does not exist.`, 404);
//     }

//     const enrolment = await ClassEnrolment.findOne({
//       class: class_id,
//       academic_session_id: academic_session_id,
//     });

//     if (!enrolment) {
//       throw new AppError(
//         'Enrolment for this class in this session not found.',
//         404
//       );
//     }

//     if (userRole === 'teacher') {
//       const teacherExist = await Teacher.findById({
//         _id: userId,
//       });

//       if (!teacherExist) {
//         throw new AppError('Teacher not found.', 404);
//       }

//       if (classExist.class_teacher !== teacherExist._id) {
//         const isAssigned = classExist.teacher_subject_assignments.some((s) => {
//           return (
//             s.subject?.equals(subjectExist._id) &&
//             s.teacher?.equals(teacherExist._id.toString())
//           );
//         });

//         if (!isAssigned) {
//           throw new AppError(
//             `You are not the teacher assigned to teach ${subjectExist.name} in ${classExist.name}.`,
//             400
//           );
//         }
//       }
//     }

//     const studentsResults = await Result.find({
//       enrolment: enrolment._id,
//       class: class_id,
//       academic_session_id: academic_session_id,
//     }).populate<{ student: StudentPopulatedType }>('student', '-password');

//     const scores = studentsResults.map((result) => {
//       const termResult = result.term_results.find(
//         (term) => term.term === termParam
//       );

//       if (!termResult) return null;

//       const SubjectResult = termResult.subject_results.find(
//         (subject) => subject.subject.toString() === subject_id.toString()
//       );

//       return {
//         student: {
//           first_name: result.student.first_name,
//           last_name: result.student.last_name,
//           gender: result.student.gender,
//           student_id: result.student._id,
//         },
//         subject_result: SubjectResult || null,
//       };
//     });

//     const filteredScores = scores.filter((score) => score !== null);

//     return filteredScores;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.log(error);
//       throw new Error('Something happened.');
//     }
//   }
// };

// const fetchStudentSubjectResultInAClass = async (
//   payload: SingleStudentScorePayload
// ) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     const {
//       class_id,
//       academic_session_id,
//       student_id,
//       subject_id,
//       term,
//       userId,
//       userRole,
//     } = payload;

//     const termParam = term;

//     const classExist = await Class.findById({
//       _id: class_id,
//     }).session(session);

//     if (!classExist) {
//       throw new AppError('Class not found.', 404);
//     }

//     const subjectExist = await Subject.findById({
//       _id: subject_id,
//     }).session(session);

//     if (!subjectExist) {
//       throw new AppError(`Subject with ID: ${subject_id} does not exist.`, 404);
//     }

//     const getStudentByIdPayload = {
//       student_id,
//       session,
//     };

//     const studentExist = await getAStudentById(getStudentByIdPayload);

//     if (!studentExist) {
//       throw new AppError('Student not found.', 404);
//     }

//     const sessionExist = await Session.findById({
//       _id: academic_session_id,
//     }).session(session);

//     if (!sessionExist) {
//       throw new AppError('Session not found.', 404);
//     }

//     const enrolment = await ClassEnrolment.findOne({
//       class: class_id,
//       academic_session_id: academic_session_id,
//     }).session(session);

//     if (!enrolment) {
//       throw new AppError(
//         'Enrolment for this class in this session not found.',
//         404
//       );
//     }

//     const getTeacherPayload = { teacher_id: userId.toString(), session };

//     if (userRole === 'teacher') {
//       const teacherExist = await getTeacherById(getTeacherPayload);

//       if (!teacherExist) {
//         throw new AppError('Teacher not found.', 404);
//       }

//       if (classExist.class_teacher !== teacherExist._id) {
//         const isAssigned = classExist.teacher_subject_assignments.some((s) => {
//           return (
//             s.subject?.equals(subjectExist._id) &&
//             s.teacher?.equals(teacherExist._id.toString())
//           );
//         });

//         if (!isAssigned) {
//           throw new AppError(
//             `You are not the teacher assigned to teach ${subjectExist.name} in ${classExist.name}.`,
//             400
//           );
//         }
//       }
//     }

//     const studentResult = await Result.findOne({
//       enrolment: enrolment._id,
//       class: class_id,
//       academic_session_id: academic_session_id,
//       student: studentExist._id,
//     })
//       .session(session)
//       .populate<{
//         'term_results.subject_results.subject': SubjectPopulatedType;
//       }>('student term_results.subject_results.subject', '-password');

//     if (!studentResult) {
//       throw new AppError(
//         `No result found for ${studentExist.first_name} ${studentExist.last_name} in ${classExist.name} for the ${sessionExist.academic_session} session.`,
//         404
//       );
//     }

//     const termResult = studentResult.term_results.find(
//       (term) => term.term === termParam
//     );

//     if (!termResult) {
//       throw new AppError(
//         `No result for the ${termParam} found for this student.`,
//         404
//       );
//     }

//     const isPopulatedSubject = (
//       subject: any
//     ): subject is SubjectPopulatedType =>
//       subject && (subject as SubjectPopulatedType)._id !== undefined;

//     const subjectResult = termResult.subject_results.find((subject) => {
//       if (!isPopulatedSubject(subject.subject)) {
//         return false;
//       }

//       const populatedSubject = subject.subject as SubjectPopulatedType;
//       const s = populatedSubject._id.toString() === subject_id.toString();
//       return s;
//     });

//     const { term_results, ...others } = studentResult.toObject();

//     const subject_result_details = {
//       result_document: others,
//       subject_result: subjectResult,
//     };

//     await session.commitTransaction();
//     session.endSession();

//     return subject_result_details;
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened.');
//     }
//   }
// };

// const fetchStudentTermResult = async (payload: StudentResultTermType) => {
//   try {
//     const { student_id, academic_session_id, term, userId, userRole } = payload;

//     console.log('student_id', student_id);

//     const student = await Student.findById({
//       _id: student_id,
//     });

//     if (!student) {
//       throw new AppError(`Student not found`, 404);
//     }

//     const academicSession = await Session.findById({
//       _id: academic_session_id,
//     });

//     if (!academicSession) {
//       throw new AppError('Academic session not found', 404);
//     }

//     if (userId && userRole === 'parent') {
//       if (!student.parent_id?.includes(userId)) {
//         throw new AppError(
//           `You are not a parent to ${student.first_name} ${student.last_name}`,
//           403
//         );
//       }
//     }

//     const studentResult = await Result.findOne({
//       student: student_id,
//       academic_session_id: academic_session_id,
//     }).populate(
//       'term_results.subject_results.subject term_results.subject_results.subject_teacher'
//     );
//     // populate subject and subject teacher

//     if (!studentResult) {
//       throw new AppError(
//         `Result of ${student.first_name} ${student.last_name} for ${academicSession.academic_session} session not found.`,
//         404
//       );
//     }

//     const termParam = term;

//     const termResult = studentResult.term_results.find(
//       (term) => term.term === termParam
//     );

//     return termResult;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.log(error);
//       throw new Error('Something happened.');
//     }
//   }
// };

// const fetchStudentSessionResults = async (
//   payload: StudentResultSessionType
// ) => {
//   try {
//     const { student_id, academic_session_id, userId, userRole } = payload;

//     const student = await Student.findById({
//       _id: student_id,
//     });

//     if (!student) {
//       throw new AppError(`Student not found`, 404);
//     }

//     const academicSession = await Session.findById({
//       _id: academic_session_id,
//     });

//     if (!academicSession) {
//       throw new AppError('Academic session not found', 404);
//     }

//     if (userId && userRole === 'parent') {
//       if (!student.parent_id?.includes(userId)) {
//         throw new AppError(
//           `You are not a parent to ${student.first_name} ${student.last_name}`,
//           403
//         );
//       }
//     }

//     const studentResult = await Result.findOne({
//       student: student_id,
//       academic_session_id: academic_session_id,
//     });

//     if (!studentResult) {
//       throw new AppError(
//         `Result of ${student.first_name} ${student.last_name} for ${academicSession.academic_session} session not found.`,
//         404
//       );
//     }

//     return studentResult;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       // console.log(error);
//       throw new Error('Something happened.');
//     }
//   }
// };

// const fetchAllStudentResultsInClassForActiveTermByClassId = async (
//   payload: ClassResultsType
// ) => {
//   try {
//     const { class_id, userId, userRole, academic_session_id, term } = payload;

//     const classExist = await Class.findById({
//       _id: class_id,
//     });

//     if (!classExist) {
//       throw new AppError(`Class with ID: ${class_id} does not exist.`, 404);
//     }

//     if (userRole === 'teacher') {
//       const teacherExist = await Teacher.findById({
//         _id: userId,
//       });

//       if (!teacherExist) {
//         throw new AppError(`Teacher with ID: ${userId} does not exist.`, 404);
//       }

//       if (
//         teacherExist._id.toString() !== classExist.class_teacher?.toString()
//       ) {
//         throw new AppError(
//           `You are not the class teacher of ${classExist.name}`,
//           403
//         );
//       }
//     }

//     const activeSession = await Session.findById({
//       _id: academic_session_id,
//     });

//     if (!activeSession) {
//       throw new AppError(
//         `Session with ID ${academic_session_id} can not be found.`,
//         404
//       );
//     }

//     const classEnrolment = await ClassEnrolment.findOne({
//       class: classExist._id,
//       academic_session_id: activeSession._id,
//     });

//     if (!classEnrolment) {
//       throw new AppError(
//         `There is no class enrolment found for ${classExist.name} in the ${activeSession.academic_session} session.`,
//         404
//       );
//     }

//     const termValue = term;

//     const activeTerm = activeSession.terms.find(
//       (term) => term.name === termValue
//     );

//     if (!activeTerm) {
//       throw new AppError(
//         `${term} can not be found in the ${activeSession.academic_session} session.`,
//         404
//       );
//     }

//     const studentResults = await Result.find({
//       enrolment: classEnrolment._id,
//       class: classExist._id,
//       academic_session_id: activeSession._id,
//       'term_results.term': termValue,
//     }).populate('student term_results.subject_results.subject', '-password');

//     return studentResults;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened');
//     }
//   }
// };

// const studentsSubjectPositionInClass = async (
//   payload: StudentSubjectPositionType
// ) => {
//   try {
//     const { class_enrolment_id, subject_id, userId, userRole } = payload;

//     if (!userId || !userRole) {
//       throw new AppError(
//         'Please login as the subject teacher to proceed.',
//         400
//       );
//     }

//     const classEnrolment = await ClassEnrolment.findById({
//       _id: class_enrolment_id,
//     }).populate<{
//       students: {
//         student: UserDocument;
//         subjects_offered: mongoose.Types.ObjectId[];
//       }[];
//     }>('students.student', '-password');

//     if (!classEnrolment) {
//       throw new AppError(`Class Enrolment not found.`, 404);
//     }

//     if (classEnrolment.is_active !== true) {
//       throw new AppError(
//         `The session has ended and as such you can not perform this action on the document again.`,
//         400
//       );
//     }

//     const activeSession = await Session.findById({
//       _id: classEnrolment.academic_session_id,
//     });

//     if (!activeSession) {
//       throw new AppError('Session not found.', 404);
//     }

//     if (activeSession.is_active !== true) {
//       throw new AppError(
//         'You can only give position in an active session.',
//         400
//       );
//     }

//     const activeTerm = activeSession.terms.find(
//       (term) => term.is_active === true
//     );

//     if (!activeTerm) {
//       throw new AppError('There is no active term in the session,', 400);
//     }

//     const classExist = await Class.findById({
//       _id: classEnrolment.class,
//     });

//     if (!classExist) {
//       throw new AppError('This class does not exist.', 400);
//     }

//     const subjectExist = await Subject.findById({
//       _id: subject_id,
//     });

//     if (!subjectExist) {
//       throw new AppError('Subject does not exist.', 400);
//     }

//     const subjectTeacher = classExist.teacher_subject_assignments.find(
//       (assignment) => assignment.teacher?.equals(userId.toString())
//     );

//     if (!subjectTeacher) {
//       throw new AppError(
//         `You are not the teacher assigned to teach ${subjectExist.name} in ${classExist.name} and as such you can not give subject position to students.`,
//         400
//       );
//     }

//     const studentsOfferingSubject = classEnrolment.students.map((s) => {
//       const info = s?.subjects_offered?.find((subject) =>
//         (subject as mongoose.Types.ObjectId).equals(subjectExist._id)
//       );

//       const studentObj = {
//         student: s.student,
//         subject: info,
//       };
//       return studentObj;
//     });

//     const studentResults = await Promise.all(
//       studentsOfferingSubject.map(async (student) => {
//         const sessionResult = await Result.findOne({
//           student: student.student,
//           class: classExist._id,
//           enrolment: classEnrolment._id,
//           academic_session_id: classEnrolment.academic_session_id,
//         });

//         const studentSubjectId = new mongoose.Types.ObjectId(student?.subject);

//         const info = sessionResult?.term_results.find(
//           (term) => term.term === activeTerm.name
//         );

//         const actualSubject = info?.subject_results.find(
//           (r) =>
//             r?.subject instanceof mongoose.Types.ObjectId &&
//             r.subject.equals(studentSubjectId)
//         );

//         const obj = {
//           studentId: student.student._id,
//           first_name: student.student.first_name,
//           last_name: student.student.last_name,
//           term: info?.term,
//           cumulative_score: info?.cumulative_score,
//           subjectObj: actualSubject,
//         };

//         return obj;
//       })
//     );

//     const nullTotalScore = studentResults.filter(
//       (s) => s?.subjectObj?.total_score === null
//     );

//     if (nullTotalScore.length > 0) {
//       const studentFullName = nullTotalScore.map(
//         (s) => `${s.first_name} ${s.last_name}`
//       );
//       throw new AppError(
//         `The scores of following students: ${studentFullName.join(
//           ', '
//         )} has not been totally updated. Please make sure you have filled in their first test, second test and exam scores.`,
//         400
//       );
//     } else {
//       const ranking = assignPositions(studentResults);
//       await Promise.all(
//         ranking.map(async (student) => {
//           if (student.subjectObj) {
//             await Result.updateOne(
//               {
//                 student: student.studentId,
//                 class: classExist._id,
//                 enrolment: classEnrolment._id,
//                 academic_session_id: activeSession._id,
//                 'term_results.term': activeTerm.name,
//                 'term_results.subject_results.subject':
//                   student.subjectObj.subject,
//               },
//               {
//                 $set: {
//                   'term_results.$[].subject_results.$[subject].subject_position':
//                     student.subjectObj.subject_position,
//                 },
//               },
//               {
//                 arrayFilters: [
//                   { 'subject.subject': student.subjectObj.subject },
//                 ],
//               }
//             );
//           }
//         })
//       );
//     }

//     return studentResults;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.error(error);
//       throw new Error('Something happened.');
//     }
//   }
// };

// const calculatePositionOfStudentsInClass = async (
//   payload: StudentClassPayloadType
// ) => {
//   try {
//     const { class_id, userId, userRole } = payload;

//     const classExist = await Class.findById({
//       _id: class_id,
//     });

//     if (!classExist) {
//       throw new AppError(`Class with ID: ${class_id} does not exist.`, 404);
//     }

//     if (userRole === 'teacher') {
//       const teacherExist = await Teacher.findById({
//         _id: userId,
//       });

//       if (!teacherExist) {
//         throw new AppError(`Teacher with ID: ${userId} does not exist.`, 404);
//       }

//       if (
//         teacherExist._id.toString() !== classExist.class_teacher?.toString()
//       ) {
//         throw new AppError(
//           `You are not the class teacher of ${classExist.name}`,
//           403
//         );
//       }
//     }

//     const activeSession = await Session.findOne({
//       is_active: true,
//     });

//     if (!activeSession) {
//       throw new AppError(`There is no active session.`, 404);
//     }

//     const activeTerm = activeSession.terms.find(
//       (term) => term.is_active === true
//     );

//     if (!activeTerm) {
//       throw new AppError(
//         `There is no active term found in the ${activeSession.academic_session} session.`,
//         404
//       );
//     }

//     const classEnrolment = await ClassEnrolment.findOne({
//       academic_session_id: activeSession._id,
//       class: classExist._id,
//     });

//     if (!classEnrolment) {
//       throw new AppError(
//         `There is no class enrolment found for ${classExist.name} in the ${activeSession.academic_session} session.`,
//         404
//       );
//     }

//     const allStudentsResult = await Promise.all(
//       classEnrolment.students.map(async (s) => {
//         const result = (await Result.findOne({
//           enrolment: classEnrolment._id,
//           student: s.student,
//           class: classExist._id,
//           academic_session_id: activeSession._id,
//           'term_results.term': activeTerm.name,
//         })
//           .populate<{ student: UserDocument }>('student', '-password')
//           .lean()) as unknown as StudentResultPopulatedType;

//         const allCumm = result?.term_results.find(
//           (term) => term.term === activeTerm.name
//         );

//         const obj = {
//           studentId: s.student,
//           first_name: result?.student?.first_name,
//           last_name: result?.student?.last_name,
//           allCummulatives: (allCumm ?? {
//             term: activeTerm.name,
//             cumulative_score: 0,
//             class_position: '',
//             subject_results: [] as SubjectResultType[],
//             _id: new mongoose.Types.ObjectId(),
//           }) as TermResult,
//         };

//         return obj;
//       })
//     );

//     console.log('allStudentsResult:', allStudentsResult);
//     const updatedPositions = classPositionCalculation(allStudentsResult);

//     await Promise.all(
//       updatedPositions.map(async (student) => {
//         await Result.findOneAndUpdate(
//           {
//             enrolment: classEnrolment._id,
//             student: student.studentId,
//             class: classExist._id,
//             academic_session_id: activeSession._id,
//             'term_results.term': activeTerm.name,
//           },
//           {
//             $set: {
//               'term_results.$.cumulative_score':
//                 student.allCummulatives.cumulative_score,
//               'term_results.$.class_position':
//                 student.allCummulatives.class_position,
//               'term_results.$.subject_results':
//                 student.allCummulatives.subject_results,
//             },
//           },
//           {
//             new: true,
//           }
//         );
//       })
//     );

//     return updatedPositions;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.log(error);
//       throw new Error('Something happened');
//     }
//   }
// };

// export {
//   calculatePositionOfStudentsInClass,
//   fetchAllStudentResultsInClassForActiveTermByClassId,
//   studentsSubjectPositionInClass,
//   fetchStudentSessionResults,
//   fetchStudentTermResult,
//   fetchStudentSubjectResultInAClass,
//   fetchAllScoresPerSubject,
//   recordStudentScore,
//   recordManyStudentScores,
// };

///////////////////////////////////////////////////////////////////////////////////////////////
import mongoose from 'mongoose';
import {
  // ResultSettingComponentType,
  // GradingAndRemarkType,
  ScoreParamType,
  ResultDocument,
  MultipleScoreParamType,
  ScorePayload,
  StudentPopulatedType,
  SingleStudentScorePayload,
  SubjectPopulatedType,
  StudentResultTermType,
  StudentResultSessionType,
  AllStudentResultsPayloadType,
  ClassResultsType,
  MultipleLastCumParamType,
  StudentSubjectPositionType,
  UserDocument,
  StudentClassPayloadType,
  StudentResultPopulatedType,
  SubjectResultType,
  TermResult,
  SchoolType,
  SessionDocument,
  MultipleExamScoreParamType,
  SubjectResultDocument,
  ExamScoreType,
  SubjectPositionJobData,
} from '../constants/types';
import Class from '../models/class.model';
import ClassEnrolment from '../models/classes_enrolment.model';
import Result from '../models/result.model';
import ResultSetting from '../models/result_setting.model';
import Subject from '../models/subject.model';
import Teacher from '../models/teachers.model';
import { recordScore, recordCumScore } from '../repository/result.repository';
import { AppError } from '../utils/app.error';
import { getAStudentById } from '../repository/student.repository';
import Session from '../models/session.model';
import { getTeacherById } from '../repository/teacher.repository';
import Student from '../models/students.model';
import {
  assignPositions,
  classPositionCalculation,
  schoolSubscriptionPlan,
} from '../utils/functions';
import { examKeyEnum, subscriptionEnum } from '../constants/enum';
import { studentResultQueue } from '../utils/queue';
import { SubjectResult } from '../models/subject_result.model';
import CbtResult from '../models/cbt_result.model';

// MAKE PROVISION FOR CUMMULATIVE. THEN IF FIRST TERM,
// CUMMULATIVE SPACE SHOULD TAKE TOTAL AND WHEN IT IS SECOND TERM,
//  TAKE CUMMULATIVE OF FIRST TERM, AND WHEN IT IS THIRD TERM,
// TAKE CUMMULATIVE OF SECOND TERM. AND IF THE PREVIOUS TERM DOES
// NOT HAVE CUMMULATIVE, USE THE TOTAL OF THE CURRENT TERM AS
// CUMMULATIVE

const fetchResultSetting = async () => {
  try {
    const resultSettingExist = await ResultSetting.find();

    if (!resultSettingExist || resultSettingExist.length === 0) {
      throw new AppError(
        'This school does not have result component yet.',
        400
      );
    }

    return resultSettingExist;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened.');
    }
  }
};

const fetchLevelResultSetting = async (level: string) => {
  try {
    const resultSettingExist = await ResultSetting.findOne({
      level: level,
    });

    if (!resultSettingExist) {
      throw new AppError(
        'There is no result settings for this level yet.',
        400
      );
    }

    const examComponent = resultSettingExist.exam_components;
    const normalComponents = resultSettingExist.components;

    const flattenedExamComponents = examComponent.component.map((comp) => ({
      ...JSON.parse(JSON.stringify(comp)),
      exam_name: examComponent.exam_name,
    }));

    const flattenedComponents = [
      ...normalComponents,
      ...flattenedExamComponents,
    ];

    const result = {
      flattenedComponents,
      resultSettingExist,
    };

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened.');
    }
  }
};

const recordStudentScore = async (
  payload: ScoreParamType
): Promise<SubjectResultDocument> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      term,
      student_id,
      session_id,
      teacher_id,
      score,
      subject_id,
      score_name,
      class_enrolment_id,
      class_id,
    } = payload;

    const resultPayload = {
      term,
      student_id,
      session_id,
      teacher_id,
      score,
      subject_id,
      score_name,
      class_enrolment_id,
      class_id,
      session,
    };

    const result = await recordScore(resultPayload);

    if (!result) {
      throw new AppError('Unable to process score.', 400);
    }

    await session.commitTransaction();
    session.endSession();
    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened.');
    }
  }
};

const recordManyStudentScores = async (payload: MultipleScoreParamType) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      result_objs, // Array of { student_id, score }
      term,
      session_id,
      teacher_id,
      subject_id,
      score_name,
      class_enrolment_id,
      class_id,
    } = payload;

    const recordPromises = result_objs.map((student) =>
      recordScore({
        term,
        session_id,
        teacher_id,
        subject_id,
        score_name,
        class_enrolment_id,
        class_id,
        student_id: student.student_id,
        score: student.score,
        session,
      })
        .then((result) => {
          const currentTermResult = result.term_results.find(
            (t) => t.term === term
          );
          const lastScore = currentTermResult?.scores.at(-1);
          return {
            status: 'fulfilled',
            student_id: student.student_id,
            result,
            score: lastScore?.score,
            score_name: lastScore?.score_name,
          };
        })
        .catch((err) => {
          // Skip only if it's the "score already recorded" error
          if (
            err instanceof AppError &&
            err.message.includes('score has already been recorded')
          ) {
            return {
              status: 'skipped',
              student_id: student.student_id,
              reason: err.message,
            };
          }
          return {
            status: 'rejected',
            student_id: student.student_id,
            reason: err.message || 'Unknown error',
          };
        })
    );

    const results = await Promise.all(recordPromises);

    const successfulRecords = results.filter((r) => r.status === 'fulfilled');
    const skippedRecords = results.filter((r) => r.status === 'skipped');
    const failedRecords = results.filter((r) => r.status === 'rejected');

    console.log('successfulRecords:', successfulRecords);
    console.log('skippedRecords:', skippedRecords);
    console.log('failedRecords:', failedRecords);

    if (successfulRecords.length > 0) {
      const jobs = successfulRecords.map((record) => {
        const r = record as {
          status: 'fulfilled';
          student_id: string;
          score: number;
          score_name: string;
        };

        return {
          name: 'update-student-result',
          data: {
            term: term,
            session_id: session_id,
            teacher_id: teacher_id,
            subject_id: subject_id,
            class_enrolment_id: class_enrolment_id,
            class_id: class_id,
            student_id: r.student_id,
            score: r.score,
            score_name: r.score_name,
          },
          opts: {
            attempts: 5,
            removeOnComplete: true,
            backoff: {
              type: 'exponential',
              delay: 3000,
            },
          },
        };
      });

      await studentResultQueue.addBulk(jobs);
    }

    await session.commitTransaction();
    session.endSession();

    return {
      successfulRecords: successfulRecords,
      failedRecords: failedRecords,
      skippedRecords: skippedRecords,
      all_results: results,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened.');
    }
  }
};

const recordManyStudentCumScores = async (
  payload: MultipleLastCumParamType
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      last_term_cumulative_objs, // Array of { student_id, score }
      term,
      session_id,
      teacher_id,
      subject_id,
      class_enrolment_id,
      class_id,
    } = payload;

    const scoreArray = new Set(
      last_term_cumulative_objs.map((result) => result.score)
    );

    const hasInvalidScore = [...scoreArray].some((score) => score > 100);
    const hasEmptyScore = [...scoreArray].some((score) => score === 0);
    const hasNullScore = [...scoreArray].some((score) => score === null);

    if (hasInvalidScore) {
      throw new AppError(
        `Last term cumulative score can not be greater than 100. So please ensure that all student last term cumulative score values is not greater than 100.`,
        400
      );
    }

    if (hasEmptyScore || hasNullScore) {
      throw new AppError(`Last term cumulative score can not be 0.`, 400);
    }

    const results = [];

    for (const student of last_term_cumulative_objs) {
      const singleStudentPayload = {
        term,
        session_id,
        teacher_id,
        subject_id,
        class_enrolment_id,
        class_id,
        student_id: student.student_id,
        score: student.score,
        session,
      };

      const result = await recordCumScore(singleStudentPayload);
      results.push({
        status: 'fulfilled',
        student_id: student.student_id,
        result,
      });

      if (results.length > 0) {
        const jobs = results.map((r) => {
          const termCumScore = r.result.term_results.find(
            (t) => t.term === term
          );

          return {
            name: 'update-cum-score',
            data: {
              term: term,
              session_id: session_id,
              teacher_id: teacher_id,
              subject_id: subject_id,
              class_enrolment_id: class_enrolment_id,
              class_id: class_id,
              student_id: r.student_id,
              actual_term_result: termCumScore,
            },
            opts: {
              attempts: 5,
              removeOnComplete: true,
              backoff: {
                type: 'exponential',
                delay: 3000,
              },
            },
          };
        });

        await studentResultQueue.addBulk(jobs);
      }
    }

    await session.commitTransaction();
    return { successfulRecords: results, failedRecords: [] };
  } catch (error) {
    await session.abortTransaction();
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened.');
    }
  } finally {
    session.endSession();
  }
};

const recordManyStudentExamScores = async (
  payload: MultipleExamScoreParamType
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      result_objs, // Array of { student_id, score_obj }
      term,
      session_id,
      teacher_id,
      subject_id,
      score_name,
      class_enrolment_id,
      class_id,
    } = payload;
    const subject = Object(subject_id);

    const classExist = await Class.findById({
      _id: class_id,
    }).session(session);
    if (!classExist) {
      throw new AppError('Class not found.', 404);
    }

    const subjectTeacher = classExist.teacher_subject_assignments.find(
      (p) =>
        p?.subject?.toString() === subject_id &&
        p?.teacher?.toString() === teacher_id
    );

    if (!subjectTeacher) {
      throw new AppError(
        'You are not the teacher assigned to teach this subject in this class.',
        400
      );
    }

    const sessionExist = await Session.findById({
      _id: session_id,
    }).session(session);
    if (!sessionExist) {
      throw new AppError(`Session does not exist.`, 404);
    }
    if (!sessionExist.is_active) {
      throw new AppError('This session is not active.', 400);
    }

    const termExist = sessionExist.terms.find((a) => a.name === term);
    if (!termExist) {
      throw new AppError(`Term named: ${term} does not exist.`, 404);
    }

    const resultSettings = await ResultSetting.findOne({
      level: classExist.level,
    }).session(session);
    if (!resultSettings) {
      throw new AppError('Result setting not found.', 404);
    }

    const exam_component_name = resultSettings.exam_components.exam_name;
    const exam_components = resultSettings.exam_components.component;
    const expected_length = exam_components.length;

    const actualScoreObj = exam_components.find(
      (exam) => exam.name.toLowerCase() === score_name.toLowerCase()
    );
    if (!actualScoreObj) {
      throw new AppError(`Invalid score type: ${score_name}.`, 400);
    }

    const nonExamComponentNames = resultSettings.components
      .filter((c) => c.name.toLowerCase() !== exam_component_name.toLowerCase())
      .map((a) => a.name.toLowerCase());

    const studentIds = result_objs.map((obj) => obj.student_id);

    // ********** change this to subject result
    const existingResults = await SubjectResult.find({
      enrolment: class_enrolment_id,
      student: { $in: studentIds },
      class: class_id,
      session: session_id,
      subject: subject,
    }).session(session);

    // **********

    const checkCBTScore = async (
      type: 'obj' | 'theory',
      student_id: string
    ): Promise<number | undefined> => {
      const result = await CbtResult.findOne({
        academic_session_id: sessionExist._id,
        term: termExist.name,
        student_id,
        subject_id,
      }).session(session);
      return type === 'obj'
        ? result?.objective_total_score
        : result?.theory_total_score;
    };

    const successfulStudentIds = new Set<string>();
    const successfulResultsMap = new Map<string, ExamScoreType>();

    for (const result of result_objs) {
      if (result.score === undefined) {
        console.log(
          `Student with ID: ${result.student_id} has no score inputted from frontend`
        );
        continue;
      }

      if (result.score > actualScoreObj.percentage) {
        throw new AppError(
          `Score exceeds max of ${actualScoreObj.percentage}.`,
          400
        );
      }

      const studentResult = existingResults.find(
        (a) => a.student.toString() === result.student_id.toString()
      );
      if (!studentResult) {
        continue;
      }

      const termResult = studentResult?.term_results.find(
        (a) => a.term === term
      );

      if (!termResult) {
        continue;
      }

      const alreadyHasExam = termResult?.scores.find(
        (score) =>
          score.score_name.toLowerCase() === exam_component_name.toLowerCase()
      );
      if (alreadyHasExam) {
        console.log('Student already has exam result recorded.');
        continue;
      }

      const hasRecordedExamScore = termResult.exam_object.find(
        (s) => s.score_name.toLowerCase() === score_name.toLowerCase()
      );
      if (hasRecordedExamScore) {
        console.log(
          `Score for ${score_name} has been recorded for this student.`
        );
        continue;
      }

      // const schoolCurrentPlan = schoolSubscriptionPlan
      // const subObj = hasFeatureAccess(schoolCurrentPlan, 'objective_exam');
      // const subTheory = hasFeatureAccess(schoolCurrentPlan, 'theory_exam');

      let scoreToRecord = result.score;

      if (actualScoreObj.key === 'obj') {
        const objScore = await checkCBTScore('obj', result.student_id);
        if (objScore !== undefined && objScore !== scoreToRecord) {
          scoreToRecord = objScore;
        }
      }

      if (actualScoreObj.key === 'theory') {
        const theoryScore = await checkCBTScore('theory', result.student_id);
        if (theoryScore !== undefined && theoryScore !== scoreToRecord) {
          scoreToRecord = theoryScore;
        }
      }

      if (scoreToRecord === undefined) {
        scoreToRecord = result.score;
        continue;
      }

      const scoreObject = {
        score_name,
        score: scoreToRecord,
        key: actualScoreObj.key,
      };

      termResult.exam_object.push(scoreObject);

      termResult.scores.push(scoreObject);

      const expectedKeys = exam_components.map((a) => a.key);
      const recordedKeys = termResult.exam_object.map((b) => b.key);

      const allKeysRecorded = expectedKeys.every((key) =>
        recordedKeys.includes(key)
      );

      if (
        termResult.exam_object.length === expected_length &&
        allKeysRecorded
      ) {
        const totalExamScore = termResult.exam_object.reduce(
          (prev, curr) => prev + curr.score,
          0
        );
        termResult.scores.push({
          score_name: exam_component_name,
          score: totalExamScore,
        });

        const recordedNames = new Set(
          termResult.scores.map((s) => s.score_name.toLowerCase())
        );

        const hasAllComponents =
          !nonExamComponentNames.some((name) => !recordedNames.has(name)) &&
          recordedNames.has(exam_component_name.toLowerCase());

        if (hasAllComponents) {
          const examComponentNames = termResult.exam_object.map((b) =>
            b.score_name.toLowerCase()
          );

          const filteredScoreArray = termResult.scores.filter(
            (a) => !examComponentNames.includes(a.score_name.toLowerCase())
          );

          const total = filteredScoreArray.reduce((sum, a) => sum + a.score, 0);

          let last_term_cumulative = 0;
          if (termExist.name === 'second_term') {
            const firstTerm = studentResult.term_results.find(
              (t) => t.term === 'first_term'
            );
            last_term_cumulative = firstTerm?.cumulative_average ?? 0;
          } else if (termExist.name === 'third_term') {
            const secondTerm = studentResult.term_results.find(
              (t) => t.term === 'second_term'
            );
            last_term_cumulative = secondTerm?.cumulative_average ?? 0;
          } else {
            last_term_cumulative = total;
          }

          termResult.total_score = total;
          termResult.last_term_cumulative = last_term_cumulative;

          await studentResult.save({ session });
          const studentIdStr = studentResult.student.toString();
          successfulStudentIds.add(studentIdStr);
          successfulResultsMap.set(studentIdStr, scoreObject);
        }
      }
    }

    for (const result of existingResults) {
      await result.save({ session });
    }

    const jobs = existingResults.map((studentRes) => {
      const termResult = studentRes.term_results.find((t) => t.term === term);
      const studentIdStr = studentRes.student.toString();

      if (
        termResult &&
        successfulStudentIds.has(studentRes.student.toString()) &&
        termResult.scores.some(
          (s) =>
            s.score_name.toLowerCase() === exam_component_name.toLowerCase()
        )
      ) {
        return {
          name: 'update-student-exam',
          // name: 'update-student-result',
          data: {
            term,
            session_id,
            teacher_id,
            subject_id,
            class_enrolment_id,
            class_id,
            student_id: studentIdStr,
            term_results: studentRes.term_results,
            resultObj: successfulResultsMap.get(studentIdStr),
            exam_component_name,
          },
          opts: {
            attempts: 5,
            removeOnComplete: true,
            // removeOnFail: { count: 3 },
            backoff: {
              type: 'exponential',
              delay: 3000,
            },
          },
        };
      }
      return null;
    });

    const validJobs = jobs.filter((j) => j !== null);

    if (validJobs.length > 0) {
      await studentResultQueue.addBulk(validJobs as any);
    }

    await session.commitTransaction();
    session.endSession();

    return existingResults;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened.');
    }
  }
};

const fetchAllScoresPerSubject = async (payload: ScorePayload) => {
  try {
    const {
      class_id,
      academic_session_id,
      subject_id,
      term,
      userId,
      userRole,
    } = payload;

    const termParam = term;

    const classExist = await Class.findOne({
      _id: class_id,
    });

    if (!classExist) {
      throw new AppError('Class not found.', 404);
    }

    const subjectExist = await Subject.findOne({
      _id: subject_id,
    });

    if (!subjectExist) {
      throw new AppError(`Subject with ID: ${subject_id} does not exist.`, 404);
    }

    const enrolment = await ClassEnrolment.findOne({
      class: class_id,
      academic_session_id: academic_session_id,
    });

    if (!enrolment) {
      throw new AppError(
        'Enrolment for this class in this session not found.',
        404
      );
    }

    if (userRole === 'teacher') {
      const teacherExist = await Teacher.findById({
        _id: userId,
      });

      if (!teacherExist) {
        throw new AppError('Teacher not found.', 404);
      }

      if (classExist.class_teacher !== teacherExist._id) {
        const isAssigned = classExist.teacher_subject_assignments.some((s) => {
          return (
            s.subject?.equals(subjectExist._id) &&
            s.teacher?.equals(teacherExist._id.toString())
          );
        });

        if (!isAssigned) {
          throw new AppError(
            `You are not the teacher assigned to teach ${subjectExist.name} in ${classExist.name}.`,
            400
          );
        }
      }
    }

    const studentsResults = await Result.find({
      enrolment: enrolment._id,
      class: class_id,
      academic_session_id: academic_session_id,
    }).populate<{ student: StudentPopulatedType }>('student', '-password');

    const scores = studentsResults.map((result) => {
      const termResult = result.term_results.find(
        (term) => term.term === termParam
      );

      if (!termResult) return null;

      const SubjectResult = termResult.subject_results.find(
        (subject) => subject.subject.toString() === subject_id.toString()
      );

      return {
        student: {
          first_name: result.student.first_name,
          last_name: result.student.last_name,
          gender: result.student.gender,
          student_id: result.student._id,
        },
        subject_result: SubjectResult || null,
      };
    });

    const filteredScores = scores.filter((score) => score !== null);

    return filteredScores;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened.');
    }
  }
};

const fetchStudentSubjectResultInAClass = async (
  payload: SingleStudentScorePayload
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      class_id,
      academic_session_id,
      student_id,
      subject_id,
      term,
      userId,
      userRole,
    } = payload;

    const termParam = term;

    const classExist = await Class.findById({
      _id: class_id,
    }).session(session);

    if (!classExist) {
      throw new AppError('Class not found.', 404);
    }

    const subjectExist = await Subject.findById({
      _id: subject_id,
    }).session(session);

    if (!subjectExist) {
      throw new AppError(`Subject with ID: ${subject_id} does not exist.`, 404);
    }

    const getStudentByIdPayload = {
      student_id,
      session,
    };

    const studentExist = await getAStudentById(getStudentByIdPayload);

    if (!studentExist) {
      throw new AppError('Student not found.', 404);
    }

    const sessionExist = await Session.findById({
      _id: academic_session_id,
    }).session(session);

    if (!sessionExist) {
      throw new AppError('Session not found.', 404);
    }

    const enrolment = await ClassEnrolment.findOne({
      class: class_id,
      academic_session_id: academic_session_id,
    }).session(session);

    if (!enrolment) {
      throw new AppError(
        'Enrolment for this class in this session not found.',
        404
      );
    }

    const getTeacherPayload = {
      teacher_id: userId.toString(),
      session,
    };

    if (userRole === 'teacher') {
      const teacherExist = await getTeacherById(getTeacherPayload);

      if (!teacherExist) {
        throw new AppError('Teacher not found.', 404);
      }

      if (classExist.class_teacher !== teacherExist._id) {
        const isAssigned = classExist.teacher_subject_assignments.some((s) => {
          return (
            s.subject?.equals(subjectExist._id) &&
            s.teacher?.equals(teacherExist._id.toString())
          );
        });

        if (!isAssigned) {
          throw new AppError(
            `You are not the teacher assigned to teach ${subjectExist.name} in ${classExist.name}.`,
            400
          );
        }
      }
    }

    const studentResult = await Result.findOne({
      enrolment: enrolment._id,
      class: class_id,
      academic_session_id: academic_session_id,
      student: studentExist._id,
    })
      .session(session)
      .populate<{
        'term_results.subject_results.subject': SubjectPopulatedType;
      }>('student term_results.subject_results.subject', '-password');

    if (!studentResult) {
      throw new AppError(
        `No result found for ${studentExist.first_name} ${studentExist.last_name} in ${classExist.name} for the ${sessionExist.academic_session} session.`,
        404
      );
    }

    const termResult = studentResult.term_results.find(
      (term) => term.term === termParam
    );

    if (!termResult) {
      throw new AppError(
        `No result for the ${termParam} found for this student.`,
        404
      );
    }

    const isPopulatedSubject = (
      subject: any
    ): subject is SubjectPopulatedType =>
      subject && (subject as SubjectPopulatedType)._id !== undefined;

    const subjectResult = termResult.subject_results.find((subject) => {
      if (!isPopulatedSubject(subject.subject)) {
        return false;
      }

      const populatedSubject = subject.subject as SubjectPopulatedType;
      const s = populatedSubject._id.toString() === subject_id.toString();
      return s;
    });

    const { term_results, ...others } = studentResult.toObject();

    const subject_result_details = {
      result_document: others,
      subject_result: subjectResult,
    };

    await session.commitTransaction();
    session.endSession();

    return subject_result_details;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened.');
    }
  }
};

const fetchStudentTermResult = async (payload: StudentResultTermType) => {
  try {
    const { student_id, academic_session_id, term, userId, userRole } = payload;

    console.log('student_id', student_id);

    const student = await Student.findById({
      _id: student_id,
    });

    if (!student) {
      throw new AppError(`Student not found`, 404);
    }

    const academicSession = await Session.findById({
      _id: academic_session_id,
    });

    if (!academicSession) {
      throw new AppError('Academic session not found', 404);
    }

    if (userId && userRole === 'parent') {
      if (!student.parent_id?.includes(userId)) {
        throw new AppError(
          `You are not a parent to ${student.first_name} ${student.last_name}`,
          403
        );
      }
    }

    const studentResult = await Result.findOne({
      student: student_id,
      academic_session_id: academic_session_id,
    }).populate(
      'term_results.subject_results.subject term_results.subject_results.subject_teacher'
    );
    // populate subject and subject teacher

    if (!studentResult) {
      throw new AppError(
        `Result of ${student.first_name} ${student.last_name} for ${academicSession.academic_session} session not found.`,
        404
      );
    }

    const termParam = term;

    const termResult = studentResult.term_results.find(
      (term) => term.term === termParam
    );

    return termResult;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened.');
    }
  }
};

const fetchStudentSessionResults = async (
  payload: StudentResultSessionType
) => {
  try {
    const { student_id, academic_session_id, userId, userRole } = payload;

    const student = await Student.findById({
      _id: student_id,
    });

    if (!student) {
      throw new AppError(`Student not found`, 404);
    }

    const academicSession = await Session.findById({
      _id: academic_session_id,
    });

    if (!academicSession) {
      throw new AppError('Academic session not found', 404);
    }

    if (userId && userRole === 'parent') {
      if (!student.parent_id?.includes(userId)) {
        throw new AppError(
          `You are not a parent to ${student.first_name} ${student.last_name}`,
          403
        );
      }
    }

    const studentResult = await Result.findOne({
      student: student_id,
      academic_session_id: academic_session_id,
    });

    if (!studentResult) {
      throw new AppError(
        `Result of ${student.first_name} ${student.last_name} for ${academicSession.academic_session} session not found.`,
        404
      );
    }

    return studentResult;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      // console.log(error);
      throw new Error('Something happened.');
    }
  }
};

const fetchAllStudentResultsInClassForActiveTermByClassId = async (
  payload: ClassResultsType
) => {
  try {
    const { class_id, userId, userRole, academic_session_id, term } = payload;

    const classExist = await Class.findById({
      _id: class_id,
    });

    if (!classExist) {
      throw new AppError(`Class with ID: ${class_id} does not exist.`, 404);
    }

    if (userRole === 'teacher') {
      const teacherExist = await Teacher.findById({
        _id: userId,
      });

      if (!teacherExist) {
        throw new AppError(`Teacher with ID: ${userId} does not exist.`, 404);
      }

      if (
        teacherExist._id.toString() !== classExist.class_teacher?.toString()
      ) {
        throw new AppError(
          `You are not the class teacher of ${classExist.name}`,
          403
        );
      }
    }

    const activeSession = await Session.findById({
      _id: academic_session_id,
    });

    if (!activeSession) {
      throw new AppError(
        `Session with ID ${academic_session_id} can not be found.`,
        404
      );
    }

    const classEnrolment = await ClassEnrolment.findOne({
      class: classExist._id,
      academic_session_id: activeSession._id,
    });

    if (!classEnrolment) {
      throw new AppError(
        `There is no class enrolment found for ${classExist.name} in the ${activeSession.academic_session} session.`,
        404
      );
    }

    const termValue = term;

    const activeTerm = activeSession.terms.find(
      (term) => term.name === termValue
    );

    if (!activeTerm) {
      throw new AppError(
        `${term} can not be found in the ${activeSession.academic_session} session.`,
        404
      );
    }

    const studentResults = await Result.find({
      enrolment: classEnrolment._id,
      class: classExist._id,
      academic_session_id: activeSession._id,
      'term_results.term': termValue,
    }).populate('student term_results.subject_results.subject', '-password');

    return studentResults;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchAllResultsOfAStudent = async (
  payload: AllStudentResultsPayloadType
) => {
  try {
    const { student_id } = payload;

    const student = Object(student_id);

    const studentResults = await Result.find({
      student: student,
    }).populate([
      { path: 'class', select: 'level name' },
      { path: 'academic_session_id', select: 'academic_session' },
      { path: 'student', select: 'first_name last_name' },
    ]);

    if (!studentResults || studentResults.length === 0) {
      throw new AppError('No result found for this student.', 404);
    }

    const formattedStudentResults = studentResults.flatMap((a) => {
      const classDetails = a.class;
      const academicDetails = a.academic_session_id;

      return a.term_results.map((b) => ({
        ...(b as any).toObject(),
        classDetails,
        academicDetails,
      }));
    });

    console.log('formattedStudentResults:', formattedStudentResults);

    return formattedStudentResults;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchStudentResultByResultId = async (
  payload: AllStudentResultsPayloadType
) => {
  try {
    const { student_id, result_id } = payload;

    const student = Object(student_id);
    const result = Object(result_id);

    const studentResult = await Result.findOne(
      {
        student: student,
        'term_results._id': result,
      },
      {
        term_results: { $elemMatch: { _id: result } },
      }
    ).populate([
      { path: 'academic_session_id' },
      { path: 'student' },
      { path: 'term_results.subject_results.subject' },
    ]);

    if (!studentResult || !studentResult.term_results.length) {
      throw new AppError('Specific term result not found.', 404);
    }

    // const schoolType = studentResult.school as unknown as SchoolType;
    const sessionType =
      studentResult.academic_session_id as unknown as SessionDocument;
    const studentType = studentResult.student as unknown as UserDocument;

    // const principal_term_sign = schoolType.principal_signature_per_term.find(
    //   (a) =>
    //     a.academic_session_id === sessionType._id &&
    //     a.term === studentResult.term_results[0].term
    // );

    const studentObj = studentType.toObject();
    // const schoolObj = schoolType.toObject();

    // const { principal_signature_per_term, ...others } = schoolObj;
    const { password, ...remainingValues } = studentObj;

    const neededObj = {
      // principal_signature_for_term: principal_term_sign,
      academic_session: sessionType.academic_session,
      // school: others,
      student: remainingValues,
      term_result: studentResult.term_results[0],
    };

    console.log('neededObj', neededObj);

    return neededObj;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened');
    }
  }
};

const studentsSubjectPositionInClass = async (
  payload: StudentSubjectPositionType
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { class_enrolment_id, subject_id, userId, userRole } = payload;

    if (!userId || !userRole) {
      throw new AppError(
        'Please login as the subject teacher to proceed.',
        400
      );
    }

    const classEnrolment = await ClassEnrolment.findById({
      _id: class_enrolment_id,
    })
      .populate<{
        students: {
          student: UserDocument;
          subjects_offered: mongoose.Types.ObjectId[];
        }[];
      }>('students.student', '-password')
      .session(session);

    if (!classEnrolment) {
      throw new AppError(`Class Enrolment not found.`, 404);
    }

    if (classEnrolment.is_active !== true) {
      throw new AppError(
        `The session has ended and as such you can not perform this action on the document again.`,
        400
      );
    }

    const activeSession = await Session.findById({
      _id: classEnrolment.academic_session_id,
    }).session(session);

    if (!activeSession) {
      throw new AppError('Session not found.', 404);
    }

    if (activeSession.is_active !== true) {
      throw new AppError(
        'You can only give position in an active session.',
        400
      );
    }

    const activeTerm = activeSession.terms.find(
      (term) => term.is_active === true
    );

    if (!activeTerm) {
      throw new AppError('There is no active term in the session,', 400);
    }

    const classExist = await Class.findById({
      _id: classEnrolment.class,
    }).session(session);

    if (!classExist) {
      throw new AppError('This class does not exist.', 400);
    }

    const subjectExist = await Subject.findById({
      _id: subject_id,
    }).session(session);

    if (!subjectExist) {
      throw new AppError('Subject does not exist.', 400);
    }

    const subjectTeacher = classExist.teacher_subject_assignments.find(
      (assignment) => assignment.teacher?.equals(userId.toString())
    );

    if (!subjectTeacher) {
      throw new AppError(
        `You are not the teacher assigned to teach ${subjectExist.name} in ${classExist.name} and as such you can not give subject position to students.`,
        400
      );
    }

    const studentsOfferingSubject = classEnrolment.students.map((s) => {
      const info = s?.subjects_offered?.find((subject) =>
        (subject as mongoose.Types.ObjectId).equals(subjectExist._id)
      );

      const studentObj = {
        student: s.student,
        subject: info,
      };
      return studentObj;
    });

    const studentResults = await Promise.all(
      studentsOfferingSubject.map(async (student) => {
        // ***** find student subject result and put the subject position there
        const studentSubjectId = new mongoose.Types.ObjectId(student?.subject);

        const sessionResult = await SubjectResult.findOne({
          enrolment: classEnrolment._id,
          student: student.student,
          class: classExist._id,
          session: classEnrolment.academic_session_id,
          subject: studentSubjectId,
        }).session(session);

        const info = sessionResult?.term_results.find(
          (term) => term.term === activeTerm.name
        );

        // const actualSubject = info?.subject_results.find(
        //   (r) =>
        //     r?.subject instanceof mongoose.Types.ObjectId &&
        //     r.subject.equals(studentSubjectId)
        // );

        const obj = {
          studentId: student.student._id,
          first_name: student.student.first_name,
          last_name: student.student.last_name,
          term: info?.term,
          cumulative_score: info?.cumulative_average,
          subjectObj: info,
        };

        return obj;
      })
    );

    const studentWhoEnrolledForSubjectButNoResultRecordings =
      studentResults.filter((s) => s.subjectObj === undefined);

    if (studentWhoEnrolledForSubjectButNoResultRecordings.length > 0) {
      const affectedStudentsFullName =
        studentWhoEnrolledForSubjectButNoResultRecordings.map(
          (s) => `${s.first_name} ${s.last_name}`
        );

      throw new AppError(
        `The following students: ${affectedStudentsFullName.join(
          ', '
        )} do not have result for the subject. Please record their scores before proceeding.`,
        400
      );
    }

    const nullCumulativeAvg = studentResults.filter(
      (s) =>
        s?.subjectObj?.cumulative_average === null ||
        s?.subjectObj?.cumulative_average === 0
    );

    console.log('studentResults:', studentResults);

    if (nullCumulativeAvg.length > 0) {
      const studentFullName = nullCumulativeAvg.map(
        (s) => `${s.first_name} ${s.last_name}`
      );
      throw new AppError(
        `The scores of following students: ${studentFullName.join(
          ', '
        )} has not been totally updated. Please make sure you have filled in their scores so as to be to all have cumulative average.`,
        400
      );
    } else {
      const ranking = assignPositions(studentResults);
      const studentReturns: SubjectPositionJobData[] = [];
      await Promise.all(
        ranking.map(async (student) => {
          if (student.subjectObj) {
            // await Result.updateOne(
            //   {
            //     student: student.studentId,
            //     class: classExist._id,
            //     enrolment: classEnrolment._id,
            //     academic_session_id: activeSession._id,
            //     'term_results.term': activeTerm.name,
            //     'term_results.subject_results.subject':
            //       student.subjectObj.subject,
            //   },
            //   {
            //     $set: {
            //       'term_results.$[].subject_results.$[subject].subject_position':
            //         student.subjectObj.subject_position,
            //     },
            //   },
            //   {
            //     arrayFilters: [
            //       { 'subject.subject': student.subjectObj.subject },
            //     ],
            //   }
            // ).session(session);
            await SubjectResult.updateOne(
              {
                enrolment: classEnrolment._id,
                student: student.studentId,
                class: classExist._id,
                session: activeSession._id,
                'term_results.term': activeTerm.name,
              },
              {
                $set: {
                  'term_results.$[elem].subject_position':
                    student.subjectObj.subject_position,
                },
              },
              {
                arrayFilters: [{ 'elem.term': activeTerm.name }],
              }
            ).session(session);

            const studentReturn = {
              student_id: student.studentId as string,
              term: activeTerm.name,
              subject_id: subjectExist._id,
              class_id: classExist._id,
              class_enrolment_id: classEnrolment._id,
              session_id: classEnrolment.academic_session_id,
              subject_position: student.subjectObj.subject_position as string,
            };

            studentReturns.push(studentReturn);
          }
        })
      );

      const jobs = studentReturns.map((studentRes) => {
        if (studentReturns.length !== 0) {
          return {
            name: 'subject-position',
            data: {
              student_id: studentRes.student_id,
              term: studentRes.term,
              subject_id: studentRes.subject_id,
              class_id: studentRes.class_id,
              class_enrolment_id: studentRes.class_enrolment_id,
              session_id: studentRes.session_id,
              subject_position: studentRes.subject_position,
            },
            opts: {
              attempts: 5,
              removeOnComplete: true,
              // removeOnFail: { count: 3 },
              backoff: {
                type: 'exponential',
                delay: 3000,
              },
            },
          };
        }
        return null;
      });

      await studentResultQueue.addBulk(jobs as any);
    }

    await session.commitTransaction();
    session.endSession();
    return studentResults;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.error(error);
      throw new Error('Something happened.');
    }
  }
};

const calculatePositionOfStudentsInClass = async (
  payload: StudentClassPayloadType
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { class_id, userId, userRole } = payload;

    const classExist = await Class.findById({
      _id: class_id,
    }).session(session);

    if (!classExist) {
      throw new AppError(`Class with ID: ${class_id} does not exist.`, 404);
    }

    if (userRole === 'teacher') {
      const teacherExist = await Teacher.findById({
        _id: userId,
      }).session(session);

      if (!teacherExist) {
        throw new AppError(`Teacher with ID: ${userId} does not exist.`, 404);
      }

      if (
        teacherExist._id.toString() !== classExist.class_teacher?.toString()
      ) {
        throw new AppError(
          `You are not the class teacher of ${classExist.name}`,
          403
        );
      }
    }

    const activeSession = await Session.findOne({
      is_active: true,
    }).session(session);

    if (!activeSession) {
      throw new AppError(`There is no active session.`, 404);
    }

    const activeTerm = activeSession.terms.find(
      (term) => term.is_active === true
    );

    if (!activeTerm) {
      throw new AppError(
        `There is no active term found in the ${activeSession.academic_session} session.`,
        404
      );
    }

    const classEnrolment = await ClassEnrolment.findOne({
      academic_session_id: activeSession._id,
      class: classExist._id,
    }).session(session);

    if (!classEnrolment) {
      throw new AppError(
        `There is no class enrolment found for ${classExist.name} in the ${activeSession.academic_session} session.`,
        404
      );
    }

    // console.log('classEnrolment:', classEnrolment);

    const allStudentsResult = await Promise.all(
      classEnrolment.students.map(async (s) => {
        console.log('s.student._id:', s.student._id);
        const result = (await Result.findOne({
          enrolment: classEnrolment._id,
          student: s.student._id,
          class: classExist._id,
          academic_session_id: activeSession._id,
          'term_results.term': activeTerm.name,
        })

          .populate<{ student: UserDocument }>('student', '-password')
          .session(session)
          .lean()) as unknown as StudentResultPopulatedType;

        const allCumm = result?.term_results.find(
          (term) => term.term === activeTerm.name
        );

        const obj = {
          studentId: s.student._id,
          first_name: result?.student?.first_name,
          last_name: result?.student?.last_name,
          allCummulatives: (allCumm ?? {
            term: activeTerm.name,
            cumulative_score: 0,
            class_position: '',
            subject_results: [] as SubjectResultType[],
            _id: new mongoose.Types.ObjectId(),
          }) as TermResult,
        };

        return obj;
      })
    );

    console.log('allStudentsResult:', allStudentsResult);
    const updatedPositions = classPositionCalculation(allStudentsResult);

    await Promise.all(
      updatedPositions.map(async (student) => {
        await Result.findOneAndUpdate(
          {
            enrolment: classEnrolment._id,
            student: student.studentId,
            class: classExist._id,
            academic_session_id: activeSession._id,
            'term_results.term': activeTerm.name,
          },
          {
            $set: {
              'term_results.$.cumulative_score':
                student.allCummulatives.cumulative_score,
              'term_results.$.class_position':
                student.allCummulatives.class_position,
              'term_results.$.subject_results':
                student.allCummulatives.subject_results,
            },
          },
          {
            new: true,
          }
        ).session(session);
      })
    );

    await session.commitTransaction();
    // session.endSession();

    return updatedPositions;
  } catch (error) {
    await session.abortTransaction();
    // session.endSession();
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened');
    }
  } finally {
    session.endSession();
  }
};

export {
  fetchLevelResultSetting,
  calculatePositionOfStudentsInClass,
  studentsSubjectPositionInClass,
  recordManyStudentCumScores,
  fetchAllResultsOfAStudent,
  fetchStudentResultByResultId,
  fetchResultSetting,
  fetchAllStudentResultsInClassForActiveTermByClassId,
  fetchStudentSessionResults,
  fetchStudentTermResult,
  fetchAllScoresPerSubject,
  recordManyStudentScores,
  recordManyStudentExamScores,
  // resultSettingCreation,
  recordStudentScore,
  fetchStudentSubjectResultInAClass,
};
