// import mongoose, { ObjectId, Types } from 'mongoose';
// import {
//   ClassDocument,
//   TeacherToSubjectType,
//   UserDocument,
//   UserWithoutPassword,
//   OnboardTeacherType,
//   ClassTeacherChangeType,
//   ClassSubjectTeacherChangeType,
//   StudentSubjectType,
//   TeacherSubjectType,
//   SubjectDocument,
//   StudentClassPayloadType,
//   StudentClassByIdPayloadType,
// } from '../constants/types';
// import Class from '../models/class.model';
// import Session from '../models/session.model';
// import Subject from '../models/subject.model';
// import TeacherAssignment from '../models/teacher_assignment.model';
// import Teacher from '../models/teachers.model';
// import { AppError } from '../utils/app.error';
// import { capitalizeFirstLetter, genderFunction } from '../utils/functions';
// import { maxSubjectNum, maxClassTeachingAssignment } from '../utils/code';
// import ClassEnrolment from '../models/classes_enrolment.model';
// import Result from '../models/result.model';

// const assigningTeacherToSubject = async (
//   payload: TeacherToSubjectType
// ): Promise<{
//   classDoc: ClassDocument;
//   teacherFullName: string;
//   subject: string;
// }> => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     const { subject, class_id, teacher_id } = payload;

//     const classInfo = await Class.findById({ _id: class_id }).session(session);
//     if (!classInfo) {
//       throw new AppError('Class not found.', 404);
//     }

//     const teacherInfo = await Teacher.findById({
//       _id: teacher_id,
//     }).session(session);

//     if (!teacherInfo) {
//       throw new AppError('Teacher not found.', 404);
//     }

//     if (teacherInfo.is_updated !== true) {
//       throw new AppError(
//         'This teacher needs to be onboarded before being assigned to teach any subject.',
//         400
//       );
//     }

//     const possibleMiddleName = teacherInfo.middle_name
//       ? `${teacherInfo.middle_name}`
//       : '';

//     const middleName = capitalizeFirstLetter(possibleMiddleName);
//     const firstName = capitalizeFirstLetter(teacherInfo.first_name);
//     const lastName = teacherInfo.last_name.toUpperCase();
//     const teacherFullName = `${lastName} ${firstName} ${middleName}`;

//     const info = genderFunction(teacherInfo);

//     const currentNumber = teacherInfo?.teaching_assignment?.length || 0;

//     const limitCheckCount = currentNumber + 1;
//     console.log('limitCheckCount:', limitCheckCount);

//     if (limitCheckCount > maxClassTeachingAssignment) {
//       const canBeAdded = maxClassTeachingAssignment - currentNumber;

//       throw new AppError(
//         `Since a teacher can only teach maximum of ${maxClassTeachingAssignment} classes, ${info.title} ${teacherFullName} has already been assigned ${currentNumber} of classes and ${info.rep} can only get ${canBeAdded} number of classes added.`,
//         400
//       );
//     }

//     const subjectInfo = await Subject.findOne({
//       name: subject?.toLowerCase(),
//     }).session(session);

//     if (!subjectInfo) {
//       throw new AppError('Subject not found.', 404);
//     }

//     const checkSubject = teacherInfo.subjects_capable_of_teaching?.find(
//       (subject) => {
//         if (subject) {
//           console.log('subject', subject);
//           return subject.toString() === subjectInfo._id.toString();
//         }
//         return false;
//       }
//     );

//     if (!checkSubject) {
//       throw new AppError(
//         `${teacherFullName}is not qualify to teach ${subject}.`,
//         400
//       );
//     }

//     const isSubjectPartOfClass = classInfo.compulsory_subjects
//       .concat(classInfo.optional_subjects)
//       .some((subject) => subject.toString() === subjectInfo._id.toString());

//     if (!isSubjectPartOfClass) {
//       throw new AppError('Subject not associated with this class.', 400);
//     }

//     const currentSession = await Session.findOne({
//       is_active: true,
//     });
//     if (!currentSession) {
//       throw new AppError('No active session found.', 404);
//     }

//     const activeTerm = currentSession.terms.find((term) => term.is_active);

//     if (!activeTerm) {
//       throw new AppError('No active term found in this current session.', 404);
//     }

//     const findTeacherAndSubject = await Class.findOne({
//       _id: class_id,
//       'teacher_subject_assignments.subject': subjectInfo._id,
//     })
//       .populate(
//         'teacher_subject_assignments.subject teacher_subject_assignments.teacher'
//       )
//       .session(session);

//     if (findTeacherAndSubject) {
//       const classSubjectDetails =
//         findTeacherAndSubject?.teacher_subject_assignments.find((item) => {
//           const info =
//             item.subject?._id.toString() === subjectInfo._id.toString();

//           return info;
//         });

//       if (classSubjectDetails) {
//         let msg = '';
//         if (classSubjectDetails?.teacher?._id.toString() === teacher_id) {
//           msg = `This teacher has already being assigned to teach ${subject} in this class.`;
//         } else {
//           msg = `A teacher has already being assigned to teach ${subject} in the class`;
//         }

//         throw new AppError(msg, 400);
//       }
//     }

//     const newTeacherAssignment = new TeacherAssignment({
//       teacher: teacherInfo._id,
//       class: classInfo._id,
//       subject: subjectInfo._id,
//       academic_session: currentSession._id,
//       term: activeTerm.name,
//       session: currentSession._id,
//     });

//     classInfo.teacher_subject_assignments.push({
//       teacher: teacherInfo._id,
//       subject: subjectInfo._id,
//     });

//     teacherInfo.teaching_assignment?.push({
//       subject: subjectInfo._id,
//       class_id: classInfo._id,
//     });

//     // 6775480e3774e256a471dfe4

//     await classInfo.save({ session });
//     await teacherInfo.save({ session });
//     await newTeacherAssignment.save({ session });

//     const classDoc = classInfo as ClassDocument;

//     const classObj = {
//       classDoc,
//       teacherFullName,
//       subject: subject ? subject : '',
//     };
//     await session.commitTransaction();
//     session.endSession();
//     return classObj;
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     if (error instanceof AppError) {
//       throw new AppError(`${error.message}`, 400);
//     } else {
//       console.error(error);
//       throw new Error('Unable to assign teacher to subject,');
//     }
//   }
// };

// const classTeacherAssignedEndpoint = async (
//   payload: TeacherToSubjectType
// ): Promise<ClassDocument> => {
//   try {
//     const { teacher_id, class_id } = payload;

//     const findTeacher = await Teacher.findById({
//       _id: teacher_id,
//     });

//     if (!findTeacher) {
//       throw new AppError('Teacher not found.', 404);
//     }

//     if (findTeacher.is_updated !== true) {
//       throw new AppError(
//         'This teacher needs to be onboarded before being assigned as a class teacher.',
//         400
//       );
//     }

//     if (findTeacher.class_managing) {
//       throw new AppError(
//         'Teacher already assigned to a class and a teacher can only be assigned to one class.',
//         400
//       );
//     }

//     const info = await Class.findById({
//       _id: class_id,
//     });

//     if (!info) {
//       throw new AppError('Class not found.', 404);
//     }

//     if (info.class_teacher) {
//       throw new AppError('Class has a class teacher already.', 400);
//     }

//     const result = await Class.findByIdAndUpdate(
//       { _id: class_id },
//       { class_teacher: teacher_id },
//       { new: true }
//     ).populate('class_teacher', '-password');

//     if (!result) {
//       throw new AppError('Unable to assign class teacher.', 400);
//     }

//     findTeacher.class_managing = result._id;
//     await findTeacher.save();

//     return result as ClassDocument;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something went wrong');
//     }
//   }
// };

// const getTeacherDetailsById = async (
//   teacher_id: string
// ): Promise<UserWithoutPassword> => {
//   try {
//     const findTeacher = await Teacher.findById({
//       _id: teacher_id,
//     }).populate(
//       'teaching_assignment.subject teaching_assignment.class_id subjects_capable_of_teaching class_managing'
//     );

//     if (!findTeacher) {
//       throw new AppError('Teacher not found.', 404);
//     }

//     const { password, ...others } = findTeacher.toObject();

//     return others as UserWithoutPassword;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something went wrong');
//     }
//   }
// };

// const fetchAllTeachers = async (
//   page: number | undefined,
//   limit: number | undefined,
//   searchParams: string
// ): Promise<{
//   teacherObj: UserWithoutPassword[];
//   totalCount: number;
//   totalPages: number;
// }> => {
//   try {
//     let query = Teacher.find().populate(
//       'teaching_assignment.class_id teaching_assignment.subject subjects_capable_of_teaching'
//     );

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
//       throw new AppError('Teacher not found.', 404);
//     }

//     const count = await query.clone().countDocuments();
//     let pages = 0;

//     if (page !== undefined && limit !== undefined && count !== 0) {
//       console.log('i am running here');
//       const offset = (page - 1) * limit;

//       query = query.skip(offset).limit(limit).sort({ createdAt: -1 });

//       pages = Math.ceil(count / limit);
//       console.log('count: ', count);
//       console.log('pages: ', pages);

//       if (page > pages) {
//         throw new AppError('Page can not be found.', 404);
//       }
//     }

//     const findTeachers = await query;

//     if (!findTeachers || findTeachers.length === 0) {
//       throw new AppError('Teachers not found.', 404);
//     }

//     const teachersArray = findTeachers.map((teacher) => {
//       const { password, ...others } = teacher.toJSON();
//       return others;
//     });

//     const destructuredTeacher = teachersArray as UserWithoutPassword[];
//     return {
//       teacherObj: destructuredTeacher,
//       totalPages: pages,
//       totalCount: count,
//     };
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.log(error);
//       throw new Error('Something went wrong');
//     }
//   }
// };

// const fetchTeachersBySubjectId = async (
//   subject_id: string,
//   page: number = 1,
//   limit: number = 10,
//   searchParams: string
// ): Promise<{
//   teacherObj: UserWithoutPassword[];
//   totalCount: number;
//   totalPages: number;
// }> => {
//   try {
//     let query = Teacher.find({
//       'subjects_capable_of_teaching.subject': subject_id,
//     });

//     if (searchParams) {
//       console.log('searchParams: ', searchParams);

//       const regex = new RegExp(searchParams, 'i');

//       query = query.where({
//         $or: [
//           { first_name: { $regex: regex } },
//           { last_name: { $regex: regex } },
//           { email: { $regex: regex } },
//           { gender: { $regex: regex } },
//         ],
//       });
//     }

//     if (!query) {
//       throw new AppError('Teachers not found.', 404);
//     }

//     query = query.sort({ createdAt: -1 });

//     const offset = (page - 1) * limit;
//     let count = await Teacher.countDocuments({
//       'subjects_capable_of_teaching.subject': subject_id,
//     });

//     query = query.skip(offset).limit(limit);

//     const findTeachers = await query;
//     // if (searchParams) {
//     //   count = findTeachers.length;
//     // }

//     const pages = Math.ceil(count / limit);

//     if (page > pages) {
//       throw new AppError('Page can not be found.', 404);
//     }

//     if (!findTeachers) {
//       throw new AppError('Teachers not found.', 404);
//     }

//     console.log('findTeachers: ', findTeachers);

//     const teachersArray = findTeachers.map((teacher) => {
//       const { password, ...others } = teacher.toJSON();
//       return others;
//     });

//     const destructuredTeacher = teachersArray as UserWithoutPassword[];
//     return {
//       teacherObj: destructuredTeacher,
//       totalPages: pages,
//       totalCount: count,
//     };
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.log(error);
//       throw new Error('Something went wrong');
//     }
//   }
// };

// const onboardTeacher = async (
//   payload: OnboardTeacherType
// ): Promise<UserDocument> => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     if (payload.subject_ids.length > maxSubjectNum) {
//       throw new AppError(
//         `A teacher can only teacher maximum of ${maxSubjectNum} subjects.`,
//         400
//       );
//     }

//     for (const subject of payload.subject_ids) {
//       const findSubject = await Subject.findById({ _id: subject }).session(
//         session
//       );
//       if (!findSubject) {
//         throw new AppError(`Subject with ID: ${subject} not found.`, 404);
//       }
//     }

//     const teacher = await Teacher.findById({
//       _id: payload.teacher_id,
//     }).session(session);

//     if (!teacher) {
//       throw new AppError('Teacher not found.', 404);
//     }

//     if (teacher.is_verified !== true) {
//       throw new AppError(
//         'Teacher must verify his or her email before such teacher can be onboarded.',
//         404
//       );
//     }

//     const currentSubjectNumber =
//       teacher?.subjects_capable_of_teaching?.length || 0;

//     if (currentSubjectNumber + payload.subject_ids.length > maxSubjectNum) {
//       const info = genderFunction(teacher);
//       const canBeAdded = maxSubjectNum - currentSubjectNumber;
//       throw new AppError(
//         `Since a teacher can only teach maximum of ${maxSubjectNum} subject(s), ${info.title} ${teacher.first_name} ${teacher.last_name} with ID ${teacher._id} already has ${currentSubjectNumber} subjects and ${info.rep} can only get ${canBeAdded} number of subject(s) added.`,
//         400
//       );
//     }

//     const existingSubjectIds = teacher.subjects_capable_of_teaching?.map(
//       (subject) => subject.toString()
//     );

//     const duplicateSubjects = payload.subject_ids.filter((id) =>
//       existingSubjectIds?.includes(id)
//     );

//     if (duplicateSubjects.length > 0) {
//       throw new AppError(
//         `Subjects with IDs ${duplicateSubjects.join(', ')} already exist`,
//         400
//       );
//     }

//     const findAndUpdateTeacher = await Teacher.findByIdAndUpdate(
//       { _id: Object(payload.teacher_id) },
//       {
//         is_updated: true,
//         $addToSet: {
//           subjects_capable_of_teaching: {
//             $each: payload.subject_ids.map((subject) => subject),
//           },
//         },
//       },
//       { new: true }
//     )
//       .session(session)
//       .populate('subjects_capable_of_teaching');

//     if (!findAndUpdateTeacher) {
//       throw new AppError('Teacher not found or unable to update teacher.', 400);
//     }

//     const findSubjectAndUpdate = await Promise.all(
//       payload.subject_ids.map((subject) =>
//         Subject.findByIdAndUpdate(
//           { _id: subject },
//           {
//             $addToSet: {
//               teacher_ids: payload.teacher_id,
//             },
//           },
//           { new: true }
//         ).session(session)
//       )
//     );

//     console.log('findSubjectAndUpdate', findSubjectAndUpdate);

//     const { password, ...others } = findAndUpdateTeacher.toJSON();

//     await session.commitTransaction();
//     session.endSession();

//     return others as UserDocument;
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.log(error);
//       throw new Error('Something happened.');
//     }
//   }
// };

// const classTeacherChange = async (payload: ClassTeacherChangeType) => {
//   try {
//     const { class_id, new_class_teacher_id } = payload;
//     const classInfo = await Class.findById(class_id).populate(
//       'class_teacher',
//       '-password'
//     );

//     if (!classInfo) {
//       throw new AppError(`Class with ID: ${class_id} does not exist.`, 404);
//     }

//     // find the teacher and check if such teacher is managing a class already and throw error because a teacher can only manage one class at a time.
//     const teacherInfo = await Teacher.findById(new_class_teacher_id).populate(
//       'class_managing'
//     );

//     if (!teacherInfo) {
//       throw new AppError(
//         `Teacher with ID: ${new_class_teacher_id} can not be found.`,
//         404
//       );
//     }

//     if (teacherInfo.class_managing) {
//       throw new AppError(
//         `Teacher with name ${teacherInfo.first_name} ${teacherInfo.last_name} is already made a class teacher for ${teacherInfo.class_managing}`,
//         400
//       );
//     }

//     const previousTeacherInfo = await Teacher.findOne({
//       class_managing: class_id,
//     });

//     classInfo.class_teacher = new mongoose.Types.ObjectId(new_class_teacher_id);
//     teacherInfo.class_managing = classInfo._id;

//     if (previousTeacherInfo) {
//       previousTeacherInfo.class_managing = undefined;
//       await previousTeacherInfo.save();
//     }

//     await teacherInfo.save();
//     await classInfo.save();

//     return classInfo;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened');
//     }
//   }
// };

// const changingTeacherToSubject = async (
//   payload: ClassSubjectTeacherChangeType
// ) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     const { subject, class_id, new_teacher_id } = payload;

//     const classInfo = await Class.findById({ _id: class_id }).session(session);
//     if (!classInfo) {
//       throw new AppError('Class not found.', 404);
//     }

//     const teacherInfo = await Teacher.findById({
//       _id: new_teacher_id,
//     }).session(session);

//     if (!teacherInfo) {
//       throw new AppError('Teacher not found.', 404);
//     }

//     if (teacherInfo.is_updated !== true) {
//       throw new AppError(
//         'This teacher needs to be onboarded before being assigned to teach any subject.',
//         400
//       );
//     }

//     const possibleMiddleName = teacherInfo.middle_name
//       ? `${teacherInfo.middle_name}`
//       : '';

//     const middleName = capitalizeFirstLetter(possibleMiddleName);
//     const firstName = capitalizeFirstLetter(teacherInfo.first_name);
//     const lastName = teacherInfo.last_name.toUpperCase();
//     const teacherFullName = `${lastName} ${firstName} ${middleName}`;

//     const info = genderFunction(teacherInfo);

//     const currentNumber = teacherInfo?.teaching_assignment?.length || 0;

//     const limitCheckCount = currentNumber + 1;

//     if (limitCheckCount > maxClassTeachingAssignment) {
//       const canBeAdded = maxClassTeachingAssignment - currentNumber;

//       throw new AppError(
//         `Since a teacher can only teach maximum of ${maxClassTeachingAssignment} classes, ${info.title} ${teacherFullName} has already been assigned ${currentNumber} of classes and ${info.rep} can only get ${canBeAdded} number of classes added.`,
//         400
//       );
//     }

//     const subjectInfo = await Subject.findOne({
//       name: subject?.toLowerCase(),
//     }).session(session);

//     if (!subjectInfo) {
//       throw new AppError('Subject not found.', 404);
//     }

//     const checkSubject = teacherInfo.subjects_capable_of_teaching?.find(
//       (subject) => {
//         if (subject) {
//           console.log('subject', subject);
//           return subject.toString() === subjectInfo._id.toString();
//         }
//         return false;
//       }
//     );

//     if (!checkSubject) {
//       throw new AppError(
//         `${teacherFullName}is not qualify to teach ${subject}.`,
//         400
//       );
//     }

//     const isSubjectPartOfClass = classInfo.compulsory_subjects
//       .concat(classInfo.optional_subjects)
//       .some((subject) => subject.toString() === subjectInfo._id.toString());

//     if (!isSubjectPartOfClass) {
//       throw new AppError('Subject not associated with this class.', 400);
//     }

//     const findTeacherAndSubject = await Class.findOne({
//       _id: class_id,
//       'teacher_subject_assignments.subject': subjectInfo._id,
//     })
//       .populate(
//         'teacher_subject_assignments.subject teacher_subject_assignments.teacher'
//       )
//       .session(session);

//     if (findTeacherAndSubject) {
//       const classSubjectDetails =
//         findTeacherAndSubject?.teacher_subject_assignments.find((item) => {
//           const info =
//             item.subject?._id.toString() === subjectInfo._id.toString();

//           return info;
//         });

//       if (classSubjectDetails) {
//         if (classSubjectDetails?.teacher?._id.toString() === new_teacher_id) {
//           throw new AppError(
//             `This teacher has already been assigned to teach ${subject} in this class.`,
//             400
//           );
//         }

//         // Remove the subject and class from the formal teacher's assignments
//         const formalTeacher = await Teacher.findById({
//           _id: classSubjectDetails.teacher?._id,
//         }).session(session);

//         if (formalTeacher) {
//           formalTeacher.teaching_assignment =
//             formalTeacher.teaching_assignment?.filter(
//               (t: { subject: object; class_id: object }) =>
//                 t.subject.toString() !== subjectInfo._id.toString() ||
//                 t.class_id.toString() !== classInfo._id.toString()
//             );

//           await formalTeacher.save({ session });
//         }

//         classInfo.teacher_subject_assignments =
//           classInfo.teacher_subject_assignments.map((item) =>
//             item.subject &&
//             item.subject.toString() === subjectInfo._id.toString()
//               ? {
//                   ...item,
//                   teacher: new mongoose.Types.ObjectId(new_teacher_id),
//                 }
//               : item
//           ) as typeof classInfo.teacher_subject_assignments;

//         await classInfo.save({ session });

//         // Add the assignment to the new teacher
//         const teacherObj = {
//           subject: subjectInfo._id,
//           class_id: classInfo._id,
//         };
//         teacherInfo.teaching_assignment?.push(teacherObj);

//         await teacherInfo.save({ session });
//       }
//     }

//     await classInfo.save({ session });

//     const classDoc = classInfo as ClassDocument;

//     const classObj = {
//       classDoc,
//       teacherFullName,
//       subject: subject ? subject : '',
//     };

//     await session.commitTransaction();
//     session.endSession();
//     return classObj;
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.error(error);
//       throw new Error('Something happened');
//     }
//   }
// };

// const fetchStudentsInClassOfferingTeacherSubject = async (
//   payload: StudentSubjectType
// ) => {
//   try {
//     const { class_id, subject_id, userRole, userId, academic_session_id } =
//       payload;

//     const classExist = await Class.findById({
//       _id: class_id,
//     }).populate(
//       'teacher_subject_assignments.teacher teacher_subject_assignments.subject'
//     );

//     if (!classExist) {
//       throw new AppError(`Class with ID: ${class_id} does not exist.`, 404);
//     }

//     const subjectExist = await Subject.findById({
//       _id: subject_id,
//     });

//     if (!subjectExist) {
//       throw new AppError(`Subject with ID: ${subject_id} does not exist.`, 404);
//     }

//     if (userRole === 'teacher') {
//       const findTeacher = await Teacher.findById({
//         _id: userId,
//       });
//       if (!findTeacher) {
//         throw new AppError('Teacher not found.', 404);
//       }

//       // Check if teacher is assigned
//       const isAssigned = classExist.teacher_subject_assignments.some((s) => {
//         return (
//           s.subject?.equals(subjectExist._id) &&
//           s.teacher?.equals(findTeacher._id.toString())
//         );
//       });

//       if (!isAssigned) {
//         throw new AppError(
//           `You are not the teacher assigned to teach ${subjectExist.name} in ${classExist.name}.`,
//           400
//         );
//       }
//     }

//     const sessionExist = await Session.findById({
//       _id: academic_session_id,
//     });

//     if (!sessionExist) {
//       throw new AppError(
//         `Session with ID: ${academic_session_id} does not exist.`,
//         404
//       );
//     }

//     const activeTerm = sessionExist.terms.find(
//       (term) => term.is_active === true
//     );

//     const classDetails = await ClassEnrolment.findOne({
//       class: classExist._id,
//       academic_session_id: sessionExist._id,
//     }).populate('students.student students.subjects_offered', '-password');

//     if (!classDetails || !classDetails.students) {
//       throw new AppError(
//         `No students are enrolled in ${classExist.name} for the ${sessionExist.academic_session} academic session.`,
//         404
//       );
//     }

//     const studentOfferingSubject = await Promise.all(
//       classDetails?.students
//         .filter((s) => {
//           return s.subjects_offered.some((p) => p.equals(subjectExist._id));
//         })
//         .map(async (student) => {
//           const subjectIncluded = student.subjects_offered.find((p) =>
//             p.equals(subjectExist._id)
//           );

//           const result = await Result.findOne({
//             enrolment: classDetails._id,
//             class: classExist._id,
//             academic_session_id: sessionExist._id,
//             student: student.student._id,
//           });

//           const currentTermResult = result?.term_results.find(
//             (term) => term.term === activeTerm?.name
//           );

//           const subjectResult = currentTermResult?.subject_results.find((s) => {
//             const subject =
//               s.subject.toString() === subjectExist?._id.toString();
//             return subject;
//           });

//           return {
//             ...student.toObject(),
//             subject_result: subjectResult,
//             subjects_offered: subjectIncluded,
//           };
//         })
//     );

//     const subjectTeacherObj = classExist.teacher_subject_assignments.find(
//       (s) => s?.subject?._id.toString() === subjectExist._id.toString()
//     );

//     const subjectObj = {
//       students: studentOfferingSubject,
//       subject: subjectTeacherObj?.subject,
//       subject_teacher: subjectTeacherObj?.teacher,
//       class_enrolment_id: classDetails._id,
//     };

//     return subjectObj;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened');
//     }
//   }
// };

// const fetchAllClassesTeacherTeachesByTeacherId = async (
//   payload: TeacherSubjectType
// ) => {
//   try {
//     const { teacher_id, userRole, userId } = payload;

//     if (userRole === 'teacher') {
//       if (teacher_id !== userId.toString()) {
//         throw new AppError(
//           'You can only view the class and subject that belong to you as a teacher.',
//           403
//         );
//       }
//     }

//     const teacher = await Teacher.findById({
//       _id: teacher_id,
//     }).populate<{
//       teaching_assignment: {
//         class_id: string;
//         subject: SubjectDocument;
//       }[];
//     }>('teaching_assignment.class_id teaching_assignment.subject');

//     if (!teacher) {
//       throw new AppError(`Teacher with ID: ${teacher_id} does not exist.`, 404);
//     }

//     const result = [];

//     if (!teacher.teaching_assignment) {
//       throw new AppError(
//         'Teacher assignment does not exist for this teacher.',
//         400
//       );
//     }

//     const activeSession = await Session.findOne({
//       is_active: true,
//     });

//     for (const assignment of teacher?.teaching_assignment) {
//       const { class_id, subject } = assignment;

//       if (!subject || !subject._id) {
//         throw new AppError('Invalid subject data.', 400);
//       }

//       const classEnrolment = await ClassEnrolment.find({
//         class: class_id,
//         academic_session_id: activeSession?._id,
//       }).populate<
//         {
//           student: object;
//           subjects_offered: Types.ObjectId[];
//         }[]
//       >('students.student');

//       const studentObj = classEnrolment.map((c) => c.students);

//       const studentOfferingSubject = studentObj.map((students) => {
//         return students
//           .filter((entry) =>
//             entry.subjects_offered.some((a) => a.equals(subject._id))
//           )
//           .map((entry) => {
//             const { subjects_offered, ...others } = entry.toObject();
//             return {
//               ...others,
//               subjects_offered: [subject._id],
//             };
//           });
//       });

//       result.push({
//         class_id,
//         subject,
//         students: studentOfferingSubject,
//       });
//     }

//     return result;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.log(error);
//       throw new Error('Something happened');
//     }
//   }
// };

// const fetchAllStudentsInClassByClassId = async (
//   payload: StudentClassByIdPayloadType
// ) => {
//   try {
//     const { class_id, userId, userRole, academic_session_id } = payload;

//     const classExist = await Class.findById({
//       _id: class_id,
//     });

//     if (!classExist) {
//       throw new AppError(`Class with ID: ${class_id} does not exist.`, 404);
//     }

//     if (userRole === 'teacher') {
//       const teacher = await Teacher.findById({
//         _id: userId,
//       });

//       if (!teacher) {
//         throw new AppError(`Teacher with ID: ${userId} does not exist.`, 404);
//       }

//       if (teacher._id.toString() !== classExist.class_teacher?.toString()) {
//         throw new AppError(
//           `You are not the class teacher of ${classExist.name}.`,
//           403
//         );
//       }
//     }

//     const activeSession = await Session.findById({
//       _id: academic_session_id,
//     });

//     if (!activeSession) {
//       throw new AppError(`Active session does not exist.`, 404);
//     }

//     const latestClassEnrolment = await ClassEnrolment.findOne({
//       class: classExist._id,
//       academic_session_id: activeSession._id,
//     }).populate('students.student', '-password');

//     if (!latestClassEnrolment) {
//       throw new AppError(
//         `There is no active class enrolment for ${classExist.name} in the ${activeSession.academic_session} session.`,
//         404
//       );
//     }

//     return latestClassEnrolment;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.log(error);
//       throw new Error('Something happened');
//     }
//   }
// };

// const fetchStudentsOfferingTeacherSubjectUsingClassId = async (
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

//     console.log('classExist', classExist);

//     if (userRole === 'teacher') {
//       const teacher = await Teacher.findById({
//         _id: userId,
//       });

//       if (!teacher) {
//         throw new AppError(`Teacher with ID: ${userId} does not exist.`, 404);
//       }

//       const subjectExistInTeacher = teacher.teaching_assignment?.find((c) => {
//         return c.class_id.toString() === classExist._id.toString();
//       });

//       const teacherSubject = classExist.teacher_subject_assignments.find(
//         (s) => {
//           return s.teacher?.toString() === teacher._id.toString();
//         }
//       );
//       // console.log('teacherSubject:', teacherSubject);
//       // console.log('subjectExistInTeacher:', subjectExistInTeacher);

//       if (!teacherSubject || !subjectExistInTeacher) {
//         throw new AppError(
//           'You are not the teacher assigned to teach this subject in this class.',
//           403
//         );
//       }

//       const subjectExist = await Subject.findById({
//         _id: subjectExistInTeacher.subject,
//       });

//       console.log('subjectExist:', subjectExist);

//       if (!subjectExist) {
//         throw new AppError(
//           `Subject with ID: ${subjectExistInTeacher} does not exist.`,
//           404
//         );
//       }

//       const activeSession = await Session.findOne({
//         is_active: true,
//       });

//       if (!activeSession) {
//         throw new AppError(`Active session does not exist.`, 404);
//       }
//     }
//     return classExist;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.log(error);
//       throw new Error('Something happened');
//     }
//   }
// };

// const fetchStudentsInClassThatTeacherManages = async (
//   payload: StudentClassByIdPayloadType
// ) => {
//   try {
//     const { class_id, userId, userRole, academic_session_id, teacher_id } =
//       payload;

//     const classExist = await Class.findById({
//       _id: class_id,
//     });

//     if (!classExist) {
//       throw new AppError(`Class with ID: ${class_id} does not exist.`, 404);
//     }

//     if (userRole === 'teacher') {
//       const teacher = await Teacher.findById({
//         _id: userId,
//       });

//       if (!teacher) {
//         throw new AppError(`Teacher with ID: ${userId} does not exist.`, 404);
//       }

//       if (
//         teacher._id.toString() !== classExist.class_teacher?.toString() ||
//         teacher.class_managing?.toString() !== classExist._id.toString()
//       ) {
//         throw new AppError(
//           `You are not the class teacher of ${classExist.name}.`,
//           403
//         );
//       }
//     }

//     const activeSession = await Session.findById({
//       _id: academic_session_id,
//     });

//     if (!activeSession) {
//       throw new AppError(`Session does not exist.`, 404);
//     }

//     const latestClassEnrolment = await ClassEnrolment.findOne({
//       class: classExist._id,
//       academic_session_id: activeSession._id,
//     }).populate('students.student', '-password');

//     if (!latestClassEnrolment) {
//       throw new AppError(
//         `There is no active class enrolment for ${classExist.name} in the ${activeSession.academic_session} session.`,
//         404
//       );
//     }

//     return latestClassEnrolment;
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
//   fetchStudentsInClassThatTeacherManages,
//   fetchAllStudentsInClassByClassId,
//   fetchStudentsOfferingTeacherSubjectUsingClassId,
//   fetchAllClassesTeacherTeachesByTeacherId,
//   fetchStudentsInClassOfferingTeacherSubject,
//   changingTeacherToSubject,
//   classTeacherChange,
//   onboardTeacher,
//   fetchAllTeachers,
//   fetchTeachersBySubjectId,
//   getTeacherDetailsById,
//   assigningTeacherToSubject,
//   classTeacherAssignedEndpoint,
// };

///////////////////////////////////////////////////////
import mongoose, { Types } from 'mongoose';
import {
  ClassDocument,
  ClassSubjectTeacherChangeType,
  ClassTeacherChangeType,
  ClassTeacherManagesPayloadType,
  OnboardTeacherType,
  StudentClassByIdPayloadType,
  StudentClassPayloadType,
  StudentDocument,
  StudentSubjectType,
  SubjectDocument,
  TeacherSubjectType,
  TeacherToSubjectType,
  UserDocument,
  UserReturn,
  UserWithoutPassword,
} from '../constants/types';
import Class from '../models/class.model';
import Teacher from '../models/teachers.model';
import { AppError } from '../utils/app.error';
import { capitalizeFirstLetter, genderFunction } from '../utils/functions';
import Subject from '../models/subject.model';
import Session from '../models/session.model';
import TeacherAssignment from '../models/teacher_assignment.model';
import ClassEnrolment from '../models/classes_enrolment.model';
import Result from '../models/result.model';

const classTeacherAssignedEndpoint = async (
  payload: TeacherToSubjectType
): Promise<ClassDocument> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { teacher_id, class_id } = payload;

    const findTeacher = await Teacher.findById({
      _id: teacher_id,
    }).session(session);

    if (!findTeacher) {
      throw new AppError('Teacher not found.', 404);
    }

    console.log('findTeacher:', findTeacher);

    if (findTeacher.is_updated !== true) {
      throw new AppError(
        'This teacher needs to be onboarded before being assigned as a class teacher.',
        400
      );
    }

    if (findTeacher.class_managing) {
      throw new AppError(
        'Teacher already assigned to a class and a teacher can only be assigned to one class.',
        400
      );
    }

    const info = await Class.findById({
      _id: class_id,
    }).session(session);

    if (!info) {
      throw new AppError('Class not found.', 404);
    }

    console.log('info:', info);

    if (info.class_teacher) {
      throw new AppError('Class has a class teacher already.', 400);
    }

    const result = await Class.findByIdAndUpdate(
      { _id: class_id },
      { class_teacher: teacher_id },
      { new: true }
    )
      .populate('class_teacher', '-password')
      .session(session);

    if (!result) {
      throw new AppError('Unable to assign class teacher.', 400);
    }

    findTeacher.class_managing = result._id;
    await findTeacher.save({ session });
    console.log('result:', result);

    await session.commitTransaction();
    session.endSession();

    return result as ClassDocument;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

const assigningTeacherToSubject = async (
  payload: TeacherToSubjectType
): Promise<{
  classDoc: ClassDocument;
  teacherFullName: string;
  subject: string;
}> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { subject, class_id, teacher_id } = payload;

    const classInfo = await Class.findById({
      _id: class_id,
    }).session(session);

    if (!classInfo) {
      throw new AppError('Class not found.', 404);
    }

    console.log('classInfo:', classInfo);

    const teacherInfo = await Teacher.findById({
      _id: teacher_id,
    }).session(session);

    if (!teacherInfo) {
      throw new AppError('Teacher not found.', 404);
    }

    console.log('teacherInfo:', teacherInfo);

    if (teacherInfo.is_updated !== true) {
      throw new AppError(
        'This teacher needs to be onboarded before being assigned to teach any subject.',
        400
      );
    }

    const possibleMiddleName = teacherInfo.middle_name
      ? `${teacherInfo.middle_name}`
      : '';

    const middleName = capitalizeFirstLetter(possibleMiddleName);
    const firstName = capitalizeFirstLetter(teacherInfo.first_name);
    const lastName = teacherInfo.last_name.toUpperCase();
    const teacherFullName = `${lastName} ${firstName} ${middleName}`;

    const info = genderFunction(teacherInfo);

    // const currentNumber = teacherInfo?.teaching_assignment?.length || 0;

    // const limitCheckCount = currentNumber + 1;
    // console.log('limitCheckCount:', limitCheckCount);

    // if (limitCheckCount > maxClassTeachingAssignment) {
    //   const canBeAdded = maxClassTeachingAssignment - currentNumber;

    //   throw new AppError(
    //     `Since a teacher can only teach maximum of ${maxClassTeachingAssignment} classes, ${info.title} ${teacherFullName} has already been assigned ${currentNumber} of classes and ${info.rep} can only get ${canBeAdded} number of classes added.`,
    //     400
    //   );
    // }

    const subjectInfo = await Subject.findOne({
      name: subject?.toLowerCase(),
    }).session(session);

    if (!subjectInfo) {
      throw new AppError('Subject not found.', 404);
    }

    console.log('subjectInfo:', subjectInfo);

    const checkSubject = teacherInfo.subjects_capable_of_teaching?.find(
      (subject) => {
        if (subject) {
          console.log('subject', subject);
          return subject.toString() === subjectInfo._id.toString();
        }
        return false;
      }
    );

    if (!checkSubject) {
      throw new AppError(
        `${teacherFullName}is not qualify to teach ${subject}.`,
        400
      );
    }

    console.log('checkSubject:', checkSubject);

    const isSubjectPartOfClass = classInfo.compulsory_subjects
      // .concat(classInfo.optional_subjects)
      .some((subject) => subject.toString() === subjectInfo._id.toString());

    if (!isSubjectPartOfClass) {
      throw new AppError('Subject not associated with this class.', 400);
    }

    const currentSession = await Session.findOne({
      is_active: true,
    });

    if (!currentSession) {
      throw new AppError('No active session found.', 404);
    }

    console.log('currentSession:', currentSession);

    const activeTerm = currentSession.terms.find((term) => term.is_active);

    if (!activeTerm) {
      throw new AppError('No active term found in this current session.', 404);
    }

    console.log('activeTerm:', activeTerm);

    const findTeacherAndSubject = await Class.findOne({
      _id: class_id,
      'teacher_subject_assignments.subject': subjectInfo._id,
    })
      .populate<{
        teacher_subject_assignments: {
          subject: SubjectDocument;
          teacher: UserDocument;
        }[];
      }>(
        'teacher_subject_assignments.subject teacher_subject_assignments.teacher'
      )
      .session(session);

    console.log('findTeacherAndSubject:', findTeacherAndSubject);

    // Check if the subject has teacher already
    if (findTeacherAndSubject) {
      const classSubjectDetails =
        findTeacherAndSubject?.teacher_subject_assignments.find((item) => {
          const info =
            item.subject?._id.toString() === subjectInfo._id.toString();

          return info;
        });

      console.log('classSubjectDetails:', classSubjectDetails);

      if (classSubjectDetails) {
        let msg = '';
        if (classSubjectDetails?.teacher?._id.toString() === teacher_id) {
          msg = `This teacher has already being assigned to teach ${subject} in this class.`;
        } else {
          msg = `A teacher has already being assigned to teach ${subject} in the class`;
        }

        throw new AppError(msg, 400);
      }
    }

    const newTeacherAssignment = new TeacherAssignment({
      teacher: teacherInfo._id,
      class: classInfo._id,
      subject: subjectInfo._id,
      academic_session: currentSession._id,
      term: activeTerm.name,
      session: currentSession._id,
    });

    classInfo.teacher_subject_assignments.push({
      teacher: teacherInfo._id,
      subject: subjectInfo._id,
    });

    teacherInfo.teaching_assignment?.push({
      subject: subjectInfo._id,
      class_id: Object(classInfo._id),
    });

    await classInfo.save({ session });
    await teacherInfo.save({ session });
    await newTeacherAssignment.save({ session });

    const classDoc = classInfo as ClassDocument;

    const classObj = {
      classDoc,
      teacherFullName,
      subject: subject ? subject : '',
    };

    console.log('classObj:', classObj);

    await session.commitTransaction();
    session.endSession();
    return classObj;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw new AppError(`${error.message}`, 400);
    } else {
      console.error(error);
      throw new Error('Unable to assign teacher to subject,');
    }
  }
};

const getTeacherDetailsById = async (
  teacher_id: string
): Promise<UserWithoutPassword> => {
  try {
    const findTeacher = await Teacher.findById({
      _id: teacher_id,
    })
      .populate(
        'teaching_assignment.subject teaching_assignment.class_id subjects_capable_of_teaching class_managing'
      )
      .lean();

    if (!findTeacher) {
      throw new AppError('Teacher not found.', 404);
    }

    const { password, ...others } = findTeacher;

    console.log('service others:', others);

    return others as UserWithoutPassword;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

const fetchTeachersBySubjectId = async (
  subject_id: string,
  page: number | undefined,
  limit: number | undefined,
  searchParams: string
): Promise<{
  teacherObj: UserWithoutPassword[];
  totalCount: number;
  totalPages: number;
}> => {
  try {
    let query = Teacher.find({
      subjects_capable_of_teaching: new mongoose.Types.ObjectId(subject_id),
    });

    if (searchParams) {
      console.log('searchParams: ', searchParams);

      const regex = new RegExp(searchParams, 'i');

      query = query.where({
        $or: [
          { first_name: { $regex: regex } },
          { last_name: { $regex: regex } },
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
    console.log('count: ', count);

    query = query.sort({ createdAt: -1 });

    if (page !== undefined && limit !== undefined && count !== 0) {
      console.log('i am running here');
      const offset = (page - 1) * limit;

      query = query.skip(offset).limit(limit);

      pages = Math.ceil(count / limit);
      console.log('count: ', count);
      console.log('pages: ', pages);

      if (page > pages) {
        throw new AppError('Page can not be found.', 404);
      }
    }

    // let count = await Teacher.countDocuments({
    //   subjects_capable_of_teaching: new mongoose.Types.ObjectId(subject_id),
    //   school: school,
    // });

    console.log('count: ', count);

    const findTeachers = await query.sort({ createdAt: -1 });

    if (!findTeachers) {
      throw new AppError('Teachers not found.', 404);
    }

    console.log('findTeachers: ', findTeachers);

    const teachersArray = findTeachers.map((teacher) => {
      const { password, ...others } = teacher.toJSON();
      return others;
    });

    const destructuredTeacher = teachersArray as UserWithoutPassword[];
    return {
      teacherObj: destructuredTeacher,
      totalPages: pages,
      totalCount: count,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something went wrong');
    }
  }
};

const fetchAllTeachers = async (
  page: number | undefined,
  limit: number | undefined,
  searchParams: string
): Promise<{
  teacherObj: UserWithoutPassword[];
  totalCount: number;
  totalPages: number;
}> => {
  try {
    let query = Teacher.find({}).populate(
      'teaching_assignment.class_id teaching_assignment.subject subjects_capable_of_teaching'
    );

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

    console.log('query:', query);

    if (!query) {
      throw new AppError('Teacher not found.', 404);
    }

    const count = await query.clone().countDocuments();
    let pages = 0;

    if (page !== undefined && limit !== undefined && count !== 0) {
      console.log('i am running here');
      const offset = (page - 1) * limit;

      query = query.skip(offset).limit(limit);

      pages = Math.ceil(count / limit);
      console.log('count: ', count);
      console.log('pages: ', pages);

      if (page > pages) {
        throw new AppError('Page can not be found.', 404);
      }
    }

    const findTeachers = await query
      .sort({ createdAt: -1 })
      .populate('class_managing');

    console.log('findTeachers:', findTeachers);

    if (!findTeachers || findTeachers.length === 0) {
      throw new AppError('Teachers not found.', 404);
    }

    const teachersArray = findTeachers.map((teacher) => {
      const { password, ...others } = teacher.toJSON();
      return others;
    });

    const destructuredTeacher = teachersArray as UserWithoutPassword[];

    console.log('destructuredTeacher:', destructuredTeacher);

    return {
      teacherObj: destructuredTeacher,
      totalPages: pages,
      totalCount: count,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something went wrong');
    }
  }
};

const onboardTeacher = async (
  payload: OnboardTeacherType
): Promise<UserReturn> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // if (payload.subject_ids.length > maxSubjectNum) {
    //   throw new AppError(
    //     `A teacher can only teacher maximum of ${maxSubjectNum} subjects.`,
    //     400
    //   );
    // }

    for (const subject of payload.subject_ids) {
      const findSubject = await Subject.findOne({
        _id: subject,
      }).session(session);

      if (!findSubject) {
        throw new AppError(`Subject with ID: ${subject} not found.`, 404);
      }
      console.log('findSubject:', findSubject);
    }

    const teacher = await Teacher.findById({
      _id: payload.teacher_id,
    }).session(session);

    if (!teacher) {
      throw new AppError('Teacher not found.', 404);
    }

    console.log('teacher:', teacher);

    if (teacher.is_verified !== true) {
      throw new AppError(
        'Teacher must verify his or her email before such teacher can be onboarded.',
        404
      );
    }

    // const currentSubjectNumber =
    //   teacher?.subjects_capable_of_teaching?.length || 0;

    // if (currentSubjectNumber + payload.subject_ids.length > maxSubjectNum) {
    //   const info = genderFunction(teacher);
    //   const canBeAdded = maxSubjectNum - currentSubjectNumber;
    //   throw new AppError(
    //     `Since a teacher can only teach maximum of ${maxSubjectNum} subject(s), ${info.title} ${teacher.first_name} ${teacher.last_name} with ID ${teacher._id} already has ${currentSubjectNumber} subjects and ${info.rep} can only get ${canBeAdded} number of subject(s) added.`,
    //     400
    //   );
    // }

    const existingSubjectIds = teacher.subjects_capable_of_teaching?.map(
      (subject) => subject.toString()
    );

    const duplicateSubjects = payload.subject_ids.filter((id) =>
      existingSubjectIds?.includes(id)
    );

    if (duplicateSubjects.length > 0) {
      throw new AppError(
        `Subjects with IDs ${duplicateSubjects.join(', ')} already exist`,
        400
      );
    }

    const findAndUpdateTeacher = await Teacher.findByIdAndUpdate(
      { _id: Object(payload.teacher_id) },
      {
        is_updated: true,
        $addToSet: {
          subjects_capable_of_teaching: {
            $each: payload.subject_ids.map((subject) => subject),
          },
        },
      },
      { new: true }
    )
      .session(session)
      .populate('subjects_capable_of_teaching');
    // .lean();

    if (!findAndUpdateTeacher) {
      throw new AppError('Teacher not found or unable to update teacher.', 400);
    }
    console.log('findAndUpdateTeacher:', findAndUpdateTeacher);

    const findSubjectAndUpdate = await Promise.all(
      payload.subject_ids.map((subject) =>
        Subject.findByIdAndUpdate(
          { _id: subject },
          {
            $addToSet: {
              teacher_ids: payload.teacher_id,
            },
          },
          { new: true }
        ).session(session)
      )
    );

    console.log('findSubjectAndUpdate', findSubjectAndUpdate);

    const { password, ...others } = findAndUpdateTeacher.toJSON();

    await session.commitTransaction();
    session.endSession();

    return others as UserReturn;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened.');
    }
  }
};

const classTeacherChange = async (payload: ClassTeacherChangeType) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { class_id, new_class_teacher_id } = payload;

    const classInfo = await Class.findById({
      _id: class_id,
    })
      .populate('class_teacher', '-password')
      .session(session);

    if (!classInfo) {
      throw new AppError(`Class with ID: ${class_id} does not exist.`, 404);
    }

    console.log('classInfo:', classInfo);

    // find the teacher and check if such teacher is managing a class already and throw error because a teacher can only manage one class at a time.
    const teacherInfo = await Teacher.findById({
      _id: new_class_teacher_id,
    })
      .populate('class_managing')
      .session(session);

    if (!teacherInfo) {
      throw new AppError(
        `Teacher with ID: ${new_class_teacher_id} can not be found.`,
        404
      );
    }

    console.log('teacherInfo:', teacherInfo);

    if (teacherInfo.class_managing) {
      const classTeacherManages =
        teacherInfo.class_managing as unknown as ClassDocument;

      throw new AppError(
        `Teacher with name ${capitalizeFirstLetter(
          teacherInfo.first_name
        )} ${capitalizeFirstLetter(
          teacherInfo.last_name
        )} is already a class teacher for ${classTeacherManages.name}`,
        400
      );
    }

    const previousTeacherInfo = await Teacher.findOne({
      class_managing: class_id,
    }).session(session);

    console.log('previousTeacherInfo:', previousTeacherInfo);

    classInfo.class_teacher = Object(new_class_teacher_id);
    teacherInfo.class_managing = classInfo._id;

    if (previousTeacherInfo) {
      previousTeacherInfo.class_managing = undefined;
      await previousTeacherInfo.save({ session });
    }

    await teacherInfo.save({ session });
    await classInfo.save({ session });

    console.log('classInfo:', classInfo);
    await session.commitTransaction();
    session.endSession();

    return classInfo;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const changingTeacherToSubject = async (
  payload: ClassSubjectTeacherChangeType
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { subject, class_id, new_teacher_id } = payload;

    const classInfo = await Class.findById({
      _id: class_id,
    }).session(session);
    if (!classInfo) {
      throw new AppError('Class not found.', 404);
    }

    console.log('classInfo:', classInfo);

    const teacherInfo = await Teacher.findById({
      _id: new_teacher_id,
    }).session(session);

    if (!teacherInfo) {
      throw new AppError('Teacher not found.', 404);
    }

    console.log('teacherInfo:', teacherInfo);

    if (teacherInfo.is_updated !== true) {
      throw new AppError(
        'This teacher needs to be onboarded before being assigned to teach any subject.',
        400
      );
    }

    const possibleMiddleName = teacherInfo.middle_name
      ? `${teacherInfo.middle_name}`
      : '';

    const middleName = capitalizeFirstLetter(possibleMiddleName);
    const firstName = capitalizeFirstLetter(teacherInfo.first_name);
    const lastName = teacherInfo.last_name.toUpperCase();
    const teacherFullName = `${lastName} ${firstName} ${middleName}`;

    const info = genderFunction(teacherInfo);

    // const currentNumber = teacherInfo?.teaching_assignment?.length || 0;

    // const limitCheckCount = currentNumber + 1;

    // if (limitCheckCount > maxClassTeachingAssignment) {
    //   const canBeAdded = maxClassTeachingAssignment - currentNumber;

    //   throw new AppError(
    //     `Since a teacher can only teach maximum of ${maxClassTeachingAssignment} classes, ${info.title} ${teacherFullName} has already been assigned ${currentNumber} of classes and ${info.rep} can only get ${canBeAdded} number of classes added.`,
    //     400
    //   );
    // }

    const subjectInfo = await Subject.findOne({
      name: subject?.toLowerCase(),
    }).session(session);

    if (!subjectInfo) {
      throw new AppError('Subject not found.', 404);
    }

    console.log('subjectInfo:', subjectInfo);

    const checkSubject = teacherInfo.subjects_capable_of_teaching?.find(
      (subject) => {
        if (subject) {
          console.log('subject', subject);
          return subject.toString() === subjectInfo._id.toString();
        }
        return false;
      }
    );

    if (!checkSubject) {
      throw new AppError(
        `${teacherFullName}is not qualify to teach ${subject}.`,
        400
      );
    }

    console.log('checkSubject:', checkSubject);

    const isSubjectPartOfClass = classInfo.compulsory_subjects
      // .concat(classInfo.optional_subjects)
      .some((subject) => subject.toString() === subjectInfo._id.toString());

    if (!isSubjectPartOfClass) {
      throw new AppError('Subject not associated with this class.', 400);
    }

    const findTeacherAndSubject = await Class.findOne({
      _id: class_id,
      'teacher_subject_assignments.subject': subjectInfo._id,
    })
      .populate(
        'teacher_subject_assignments.subject teacher_subject_assignments.teacher'
      )
      .session(session);

    console.log('findTeacherAndSubject:', findTeacherAndSubject);

    if (findTeacherAndSubject) {
      const classSubjectDetails =
        findTeacherAndSubject?.teacher_subject_assignments.find((item) => {
          if (
            item.subject &&
            typeof item.subject === 'object' &&
            '_id' in item.subject
          ) {
            return (
              (item.subject as any)._id.toString() ===
              subjectInfo._id.toString()
            );
          }
          return false;
        });
      console.log('classSubjectDetails:', classSubjectDetails);

      if (classSubjectDetails) {
        if (
          (classSubjectDetails?.teacher as any)?._id.toString() ===
          new_teacher_id
        ) {
          throw new AppError(
            `This teacher has already been assigned to teach ${subject} in this class.`,
            400
          );
        }

        // Remove the subject and class from the formal teacher's assignments
        const formalTeacher = await Teacher.findById({
          _id: (classSubjectDetails.teacher as { _id: mongoose.Types.ObjectId })
            ._id,
        }).session(session);

        console.log('formalTeacher:', formalTeacher);

        if (formalTeacher) {
          formalTeacher.teaching_assignment =
            formalTeacher.teaching_assignment?.filter(
              (t: { subject: object; class_id: object }) =>
                t.subject.toString() !== subjectInfo._id.toString() ||
                t.class_id.toString() !== classInfo._id.toString()
            );

          await formalTeacher.save({ session });
        }

        classInfo.teacher_subject_assignments =
          classInfo.teacher_subject_assignments.map((item) =>
            item.subject &&
            item.subject.toString() === subjectInfo._id.toString()
              ? {
                  ...item,
                  teacher: new mongoose.Types.ObjectId(new_teacher_id),
                }
              : item
          ) as typeof classInfo.teacher_subject_assignments;

        await classInfo.save({ session });

        // Add the assignment to the new teacher
        const teacherObj: {
          subject: mongoose.Types.ObjectId;
          class_id: mongoose.Types.ObjectId;
        } = {
          subject: new mongoose.Types.ObjectId(subjectInfo._id.toString()),
          class_id: new mongoose.Types.ObjectId(classInfo._id.toString()),
        };

        teacherInfo.teaching_assignment?.push(teacherObj);

        await teacherInfo.save({ session });
      }
    }

    await classInfo.save({ session });

    const classDoc = classInfo as ClassDocument;

    const classObj = {
      classDoc,
      teacherFullName,
      subject: subject ? subject : '',
    };

    console.log('classObj:', classObj);

    await session.commitTransaction();
    session.endSession();
    return classObj;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.error(error);
      throw new Error('Something happened');
    }
  }
};

const fetchStudentsInClassOfferingTeacherSubject = async (
  payload: StudentSubjectType
) => {
  try {
    const {
      class_id,
      subject_id,
      userRole,
      userId,

      academic_session_id,
    } = payload;

    const classExist = await Class.findById({
      _id: class_id,
    })
      .populate(
        'teacher_subject_assignments.teacher teacher_subject_assignments.subject'
      )
      .lean();

    // console.log('classExist:', classExist);

    if (!classExist) {
      throw new AppError(`Class with ID: ${class_id} does not exist.`, 404);
    }

    const subjectExist = await Subject.findById({
      _id: subject_id,
    });

    if (!subjectExist) {
      throw new AppError(`Subject with ID: ${subject_id} does not exist.`, 404);
    }

    // console.log('subjectExist:', subjectExist);

    if (userRole === 'teacher') {
      const findTeacher = await Teacher.findById({
        _id: userId,
      });
      if (!findTeacher) {
        throw new AppError('Teacher not found.', 404);
      }

      // console.log('findTeacher:', findTeacher);

      // Check if teacher is assigned
      const isAssigned = classExist.teacher_subject_assignments.some((s) => {
        // return (
        //   Object(s.subject)?.equals(subjectExist._id) &&
        //   Object(s.teacher)?.equals(findTeacher._id.toString())
        // );

        return (
          s.subject?._id.toString() === subjectExist._id.toString() &&
          s.teacher?._id.toString() === findTeacher._id.toString()
        );
      });

      if (!isAssigned) {
        throw new AppError(
          `You are not the teacher assigned to teach ${subjectExist.name} in ${classExist.name}.`,
          400
        );
      }
    }

    const sessionExist = await Session.findById({
      _id: academic_session_id,
    });

    if (!sessionExist) {
      throw new AppError(
        `Session with ID: ${academic_session_id} does not exist.`,
        404
      );
    }

    const activeTerm = sessionExist.terms.find(
      (term) => term.is_active === true
    );

    // console.log('activeTerm:', activeTerm);

    const classDetails = await ClassEnrolment.findOne({
      class: classExist._id,
      academic_session_id: sessionExist._id,
    }).populate<{
      students: {
        student: StudentDocument;
        subjects_offered: { _id: mongoose.Types.ObjectId }[];
      }[];
    }>('students.student students.subjects_offered', '-password');
    // .lean();
    console.log('classDetails:', classDetails);

    if (!classDetails || !classDetails.students) {
      throw new AppError(
        `No students are enrolled in ${classExist.name} for the ${sessionExist.academic_session} academic session.`,
        404
      );
    }

    // console.log('filteredStudents:', filteredStudents);

    const studentOfferingSubject = await Promise.all(
      classDetails?.students
        .filter((s) => {
          return s.subjects_offered.some((p) => {
            if (!p || !p._id) return false; // Ensure `p` exists and has `_id`
            return p._id.toString() === subjectExist._id.toString();
          });
        })
        .map(async (student) => {
          const subjectIncluded = student.subjects_offered.find((p) =>
            p._id.equals(subjectExist._id)
          );

          const result = await Result.findOne({
            enrolment: classDetails._id,
            class: classExist._id,
            academic_session_id: sessionExist._id,
            // student: student.student,
            student: student.student._id,
          });

          // console.log('result:', result);

          const currentTermResult = result?.term_results.find(
            (term) => term.term === activeTerm?.name
          );

          // console.log('currentTermResult:', currentTermResult);

          const subjectResult = currentTermResult?.subject_results.find((s) => {
            const subject =
              s.subject.toString() === subjectExist?._id.toString();
            return subject;
          });

          // console.log('subjectResult:', subjectResult);

          return {
            ...student.student.toObject(),
            subject_result: subjectResult ? subjectResult : {},
            subjects_offered: subjectIncluded,
          };
        })
    );

    const subjectTeacherObj = classExist.teacher_subject_assignments.find(
      (s) =>
        Object(s?.subject as any)?._id.toString() ===
        subjectExist._id.toString()
    );

    // console.log('subjectTeacherObj:', subjectTeacherObj);

    const subjectObj = {
      students: studentOfferingSubject,
      subject: subjectTeacherObj?.subject,
      subject_teacher: subjectTeacherObj?.teacher,
      class_enrolment_id: classDetails._id,
    };

    return subjectObj;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened');
    }
  }
};

const fetchAllClassesTeacherTeachesByTeacherId = async (
  payload: TeacherSubjectType
) => {
  try {
    const { teacher_id, userRole, user_id } = payload;

    const userId = Object(user_id);

    if (userRole === 'teacher') {
      if (teacher_id !== userId.toString()) {
        throw new AppError(
          'You can only view the class and subject that belong to you as a teacher.',
          403
        );
      }
    }

    const teacher = await Teacher.findById({
      _id: teacher_id,
    }).populate<{
      teaching_assignment: {
        class_id: string;
        subject: SubjectDocument;
      }[];
    }>('teaching_assignment.class_id teaching_assignment.subject');

    if (!teacher) {
      throw new AppError(`Teacher with ID: ${teacher_id} does not exist.`, 404);
    }

    console.log('teacher:', teacher);

    const result = [];

    if (!teacher.teaching_assignment) {
      throw new AppError(
        'Teacher assignment does not exist for this teacher.',
        400
      );
    }

    const activeSession = await Session.findOne({
      is_active: true,
    });

    console.log('activeSession:', activeSession);

    for (const assignment of teacher?.teaching_assignment) {
      const { class_id, subject } = assignment;

      console.log('class_id:', class_id);
      console.log('subject:', subject);

      if (!subject || !subject._id) {
        throw new AppError('Invalid subject data.', 400);
      }

      const classEnrolment = await ClassEnrolment.find({
        class: class_id,
        academic_session_id: activeSession?._id,
      })
        .populate<
          {
            student: object;
            subjects_offered: Types.ObjectId[];
          }[]
        >('students.student')
        .lean();

      console.log('classEnrolment:', classEnrolment);

      const studentObj = classEnrolment.map((c) => c.students);

      const studentOfferingSubject = studentObj.map((students) => {
        return students
          .filter((entry) =>
            entry.subjects_offered.some(
              (a) => a.toString() === subject?._id.toString()
            )
          )
          .map((entry) => {
            const { subjects_offered, ...others } = entry;
            // .toObject();

            console.log('subjects_offered:', subjects_offered);
            return {
              ...others,
              subjects_offered: [subject._id],
            };
          });
      });

      console.log('studentOfferingSubject:', studentOfferingSubject);

      result.push({
        class_id,
        subject,
        students: studentOfferingSubject,
      });
    }

    console.log('result:', result);

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened');
    }
  }
};

const fetchStudentsOfferingTeacherSubjectUsingClassId = async (
  payload: StudentClassPayloadType
) => {
  try {
    const { class_id, userId, userRole } = payload;

    const classExist = await Class.findById({
      _id: class_id,
    });

    if (!classExist) {
      throw new AppError(`Class with ID: ${class_id} does not exist.`, 404);
    }

    console.log('classExist', classExist);

    let studentArray = [];

    if (userRole === 'teacher') {
      const teacher = await Teacher.findById({
        _id: userId,
      });

      if (!teacher) {
        throw new AppError(`Teacher with ID: ${userId} does not exist.`, 404);
      }

      console.log('teacher', teacher);

      const subjectExistInTeacher = teacher.teaching_assignment?.find((c) => {
        return c.class_id.toString() === classExist._id.toString();
      });

      const teacherSubject = classExist.teacher_subject_assignments.find(
        (s) => {
          return s.teacher?.toString() === teacher._id.toString();
        }
      );
      console.log('teacherSubject:', teacherSubject);
      // console.log('subjectExistInTeacher:', subjectExistInTeacher);

      if (!teacherSubject || !subjectExistInTeacher) {
        throw new AppError(
          'You are not the teacher assigned to teach this subject in this class.',
          403
        );
      }

      const subjectExist = await Subject.findById({
        _id: subjectExistInTeacher.subject,
      });

      console.log('subjectExist:', subjectExist);

      if (!subjectExist) {
        throw new AppError(
          `Subject with ID: ${subjectExistInTeacher} does not exist.`,
          404
        );
      }

      const activeSession = await Session.findOne({
        is_active: true,
      });

      if (!activeSession) {
        throw new AppError(`Active session does not exist.`, 404);
      }

      console.log('activeSession', activeSession);

      const classEnrolment = await ClassEnrolment.findOne({
        academic_session_id: activeSession._id,
        class: class_id,
      }).populate('students.student', '-password');

      if (!classEnrolment) {
        throw new AppError('No active class enrolment.', 404);
      }

      for (const student of classEnrolment?.students) {
        const isEnrolled = student.subjects_offered.some(
          (subject) =>
            subject._id.toString() === teacherSubject.subject.toString()
        );

        if (isEnrolled) {
          studentArray.push(student);
        }
      }
    }

    console.log('studentArray', studentArray);

    return studentArray;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened');
    }
  }
};

const fetchAllStudentsInClassByClassId = async (
  payload: StudentClassByIdPayloadType
) => {
  try {
    const { class_id, userId, userRole, academic_session_id } = payload;

    const classExist = await Class.findById({
      _id: class_id,
    });

    if (!classExist) {
      throw new AppError(`Class with ID: ${class_id} does not exist.`, 404);
    }

    console.log('classExist:', classExist);

    if (userRole === 'teacher') {
      const teacher = await Teacher.findById({
        _id: userId,
      });

      if (!teacher) {
        throw new AppError(`Teacher with ID: ${userId} does not exist.`, 404);
      }

      console.log('teacher:', teacher);

      if (teacher._id.toString() !== classExist.class_teacher?.toString()) {
        throw new AppError(
          `You are not the class teacher of ${classExist.name}.`,
          403
        );
      }
    }

    const activeSession = await Session.findById({
      _id: academic_session_id,
    });

    if (!activeSession) {
      throw new AppError(`Active session does not exist.`, 404);
    }

    console.log('activeSession:', activeSession);

    const latestClassEnrolment = await ClassEnrolment.findOne({
      class: classExist._id,
      academic_session_id: activeSession._id,
    }).populate('students.student', '-password');

    if (!latestClassEnrolment) {
      throw new AppError(
        `There is no active class enrolment for ${classExist.name} in the ${activeSession.academic_session} session.`,
        404
      );
    }

    console.log('latestClassEnrolment:', latestClassEnrolment);

    return latestClassEnrolment;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened');
    }
  }
};

const fetchStudentsInClassThatTeacherManages = async (
  page: number | 1,
  limit: number | 10,
  searchParams: string,
  payload: StudentClassByIdPayloadType
) => {
  try {
    const { class_id, userId, userRole, academic_session_id, teacher_id } =
      payload;

    const classExist = await Class.findById({
      _id: class_id,
    });

    if (!classExist) {
      throw new AppError(`Class with ID: ${class_id} does not exist.`, 404);
    }

    console.log('classExist:', classExist);

    if (userRole === 'teacher') {
      const teacher = await Teacher.findById({
        _id: userId,
      });

      if (!teacher) {
        throw new AppError(`Teacher with ID: ${userId} does not exist.`, 404);
      }

      console.log('teacher:', teacher);

      if (
        teacher._id.toString() !== classExist.class_teacher?.toString() ||
        teacher.class_managing?.toString() !== classExist._id.toString()
      ) {
        throw new AppError(
          `You are not the class teacher of ${classExist.name}.`,
          403
        );
      }
    }

    const activeSession = await Session.findById({
      _id: academic_session_id,
    });

    if (!activeSession) {
      throw new AppError(`Session does not exist.`, 404);
    }

    console.log('activeSession:', activeSession);

    const latestClassEnrolment = await ClassEnrolment.findOne({
      class: classExist._id,
      academic_session_id: activeSession._id,
    }).populate('students.student', '-password');

    if (!latestClassEnrolment) {
      throw new AppError(
        `There is no active class enrolment for ${classExist.name} in the ${activeSession.academic_session} session.`,
        404
      );
    }

    console.log('latestClassEnrolment:', latestClassEnrolment);

    let students = latestClassEnrolment.students.map(
      (s) => s.student as unknown as UserDocument
    );
    if (searchParams) {
      const search = searchParams.toLowerCase();
      students = students.filter(
        (student) =>
          student.first_name.toLowerCase().includes(search) ||
          student.last_name.toLowerCase().includes(search) ||
          student.email.toLowerCase().includes(search) ||
          student.middle_name?.toLowerCase().includes(search)
      );
    }

    const total = students.length;
    const skip = (page - 1) * limit;
    const paginatedStudents = students.slice(skip, skip + limit);

    return {
      students: paginatedStudents,
      pagination: {
        totalCount: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
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

const fetchClassTeacherManagesByTeacherId = async (
  payload: ClassTeacherManagesPayloadType
) => {
  try {
    const { teacher_id } = payload;

    const teacher = Object(teacher_id);

    const teacherExist = await Teacher.findById({
      _id: teacher,
    });

    if (!teacherExist) {
      throw new AppError('Teacher not found.', 404);
    }

    const myStatus = genderFunction(teacherExist);

    if (!teacherExist.class_managing) {
      throw new AppError(
        `${myStatus.title} ${capitalizeFirstLetter(
          teacherExist.first_name
        )} ${capitalizeFirstLetter(
          teacherExist.last_name
        )} has not been assigned to manage any class.`,
        400
      );
    }

    console.log('teacherExist:', teacherExist);

    const classManaging = await Class.findById({
      _id: teacherExist.class_managing,
    });

    if (!classManaging) {
      throw new AppError('Class managing not found.', 404);
    }
    console.log('classManaging:', classManaging);

    return classManaging;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened');
    }
  }
};

export {
  fetchClassTeacherManagesByTeacherId,
  fetchStudentsInClassThatTeacherManages,
  fetchAllStudentsInClassByClassId,
  fetchStudentsOfferingTeacherSubjectUsingClassId,
  fetchAllClassesTeacherTeachesByTeacherId,
  fetchStudentsInClassOfferingTeacherSubject,
  changingTeacherToSubject,
  classTeacherChange,
  onboardTeacher,
  fetchAllTeachers,
  fetchTeachersBySubjectId,
  getTeacherDetailsById,
  classTeacherAssignedEndpoint,
  assigningTeacherToSubject,
};
