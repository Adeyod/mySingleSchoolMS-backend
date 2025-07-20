import mongoose from 'mongoose';
import { enrolmentEnum } from '../constants/enum';
import {
  ClassEnrolmentDocument,
  GetClassStudentsType,
  StudentEnrolmentType,
} from '../constants/types';
import Class from '../models/class.model';
import ClassEnrolment from '../models/classes_enrolment.model';
import Session from '../models/session.model';
import Student from '../models/students.model';
import { AppError } from '../utils/app.error';
import { createResult } from '../repository/result.repository';

const enrolStudentToClass = async (
  payload: StudentEnrolmentType
): Promise<ClassEnrolmentDocument> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      student_id,
      class_id,
      level,
      academic_session_id,
      term,
      subjects_to_offer_array,
    } = payload;

    const studentSubscribed = await Student.findOne({
      _id: student_id,
    }).session(session);

    if (!studentSubscribed) {
      throw new AppError(`Student not found.`, 404);
    }

    if (studentSubscribed.new_session_subscription !== true) {
      throw new AppError(
        `Student named: ${studentSubscribed.first_name} ${studentSubscribed.last_name} has not yet subscribed to new session. Please let the student subscribe first before enrollment.`,
        400
      );
    }

    const isSessionActive = await Session.findById({
      _id: academic_session_id,
    }).session(session);

    if (!isSessionActive) {
      throw new AppError('This session does not exist', 404);
    }

    if (isSessionActive?.is_active !== true) {
      throw new AppError('You can only enrol to an active session.', 400);
    }

    const activeEnrolment = await ClassEnrolment.findOne({
      'students.student': student_id,
      academic_session_id,
      is_active: true,
    }).session(session);

    if (activeEnrolment) {
      const actualClass = await Class.findById({
        _id: activeEnrolment.class,
      }).session(session);

      throw new AppError(
        `Student is already enrolled in ${actualClass?.name} class for this session.`,
        400
      );
      // }
    }

    const compulsorySubjects = await Class.findById({ _id: class_id }).session(
      session
    );

    if (!compulsorySubjects?.compulsory_subjects?.length) {
      throw new AppError('Subjects not found for this class.', 404);
    }

    const flattenedSubjects = compulsorySubjects?.compulsory_subjects.map(
      (subject) => subject
    );

    const flattenedSelectedSubjects = subjects_to_offer_array.map((s) => s);
    console.log('flattenedSelectedSubjects:', flattenedSelectedSubjects);

    const hasInvalidSubjects = flattenedSelectedSubjects.filter(
      (id) =>
        !flattenedSubjects.map((s) => s.toString()).includes(id.toString())
    );

    console.log('hasInvalidSubjects:', hasInvalidSubjects);

    if (hasInvalidSubjects.length > 0) {
      throw new AppError(
        `The subjects with the following IDs: ${hasInvalidSubjects.join(
          ', '
        )} is not part of the subjects available to be offered in this class.`,
        400
      );
    }

    let result;

    const actualClassEnrolment = await ClassEnrolment.findOne({
      academic_session_id,
      class: class_id,
    }).session(session);

    const studentObj = {
      student: new mongoose.Types.ObjectId(student_id),
      term,
      subjects_offered: flattenedSelectedSubjects,
    };

    if (!actualClassEnrolment) {
      result = new ClassEnrolment({
        students: [studentObj],
        class: class_id,
        academic_session_id: academic_session_id,
        level: level,
        is_active: true,
        status: enrolmentEnum[0],
      });
      await result.save({ session });
    } else {
      actualClassEnrolment.students.push(studentObj);
      result = actualClassEnrolment;
      console.log('result: ', result);

      await ClassEnrolment.updateOne(
        { _id: actualClassEnrolment._id },
        {
          $push: {
            students: studentObj,
          },
        },
        { session }
      );
      console.log('result 2: ', result);
      result = await ClassEnrolment.findById(actualClassEnrolment._id).session(
        session
      );
    }

    // UPDATE THE STUDENT DOCUMENT BY ATTACHING THE CLASS ID AND ACADEMIC SESSION TO THE STUDENT DOCUMENT
    const updateStudent = await Student.findByIdAndUpdate(
      { _id: student_id },
      {
        current_class: {
          class_id: class_id,
        },
        current_class_level: level,
        active_class_enrolment: true,
      },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return result as ClassEnrolmentDocument;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw new AppError(`${error.message}`, 400);
    } else {
      console.error(error);
      throw new Error('Something went wrong');
    }
  }
};

const enrolManyStudentsToClass = async (
  payload: StudentEnrolmentType
): Promise<ClassEnrolmentDocument> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { student_ids, class_id, level, academic_session_id, term } = payload;

    const studentsWithoutSubscription = await Student.find({
      _id: { $in: student_ids },
      new_session_subscription: { $ne: true },
    }).session(session);

    if (studentsWithoutSubscription.length > 0) {
      const studentNames = studentsWithoutSubscription.map(
        (student) => `${student.first_name} ${student.last_name}`
      );
      throw new AppError(
        `The following students: ${studentNames} have not yet subscribed to the new session. Please let them subscribe first before you enroll them to the new session.`,
        400
      );
    }

    const isSessionActive = await Session.findById({
      _id: academic_session_id,
    }).session(session);

    if (!isSessionActive) {
      throw new AppError('This session does not exist', 404);
    }

    if (isSessionActive?.is_active !== true) {
      throw new AppError('You can only enrol to an active session.', 400);
    }

    const alreadyEnrolledStudents = await ClassEnrolment.find({
      students: {
        $elemMatch: {
          student: { $in: student_ids },
        },
      },
      is_active: true,
      academic_session_id: academic_session_id,
    }).session(session);

    // console.log('alreadyEnrolledStudents:', alreadyEnrolledStudents);

    if (alreadyEnrolledStudents.length > 0) {
      const enrolledStudentIds = alreadyEnrolledStudents.flatMap((enrolment) =>
        enrolment.students.map((student) => student.student.toString())
      );
      const conflictingStudents =
        student_ids?.filter((id) => enrolledStudentIds.includes(id)) || [];

      const students = await Promise.all(
        conflictingStudents.map(async (s) => {
          const student = await Student.findById({
            _id: s,
          });

          if (student) {
            return `${student.first_name} ${student.last_name}`;
          }
          return 'Unknown student';
        })
      );

      // I WILL NEED TO CHANGE THE IDS INSIDE THE ERROR TO NAME OF STUDENTS INVOLVED
      throw new AppError(
        `The following students are already enrolled in this class for the session: ${students?.join(
          ', '
        )}`,
        400
      );
    }

    const compulsorySubjects = await Class.findById({ _id: class_id }).session(
      session
    );

    if (!compulsorySubjects?.compulsory_subjects?.length) {
      throw new AppError('Compulsory subjects not found for this class.', 404);
    }

    const flattenedSubjects = compulsorySubjects?.compulsory_subjects.map(
      (subject) => new mongoose.Types.ObjectId(subject)
    );

    // console.log(
    //   'compulsorySubjects?.compulsory_subjects',
    //   compulsorySubjects?.compulsory_subjects
    // );

    const studentsToEnrol = student_ids?.map((student_id) => ({
      student: Object(student_id),
      term,
      subjects_offered: flattenedSubjects,
    }));

    // console.log('studentsToEnrol', studentsToEnrol);
    if (!studentsToEnrol) {
      throw new AppError('Error mapping over student IDs', 400);
    }

    let result;
    const actualClassEnrolment = await ClassEnrolment.findOne({
      academic_session_id,
      class: class_id,
    }).session(session);

    if (!actualClassEnrolment) {
      result = new ClassEnrolment({
        students: studentsToEnrol,
        class: class_id,
        academic_session_id,
        level,
        term,
        status: enrolmentEnum[0],
        is_active: true,
      });
    } else {
      const newEnrolment = studentsToEnrol.map((s) => {
        actualClassEnrolment.students.push(s);
      });
      // console.log('newEnrolment', newEnrolment);
      result = actualClassEnrolment;
    }

    // console.log(actualClassEnrolment instanceof mongoose.Document); // Should log "true"

    await result.save({ session });
    console.log('result', result);

    const bulkUpdateOps = student_ids?.map((student_id) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(student_id) },
        update: {
          current_class: {
            class_id: class_id,
            academic_session: academic_session_id,
          },

          current_class_level: level,
          active_class_enrolment: true,
        },
      },
    }));

    if (!bulkUpdateOps) {
      throw new AppError('No students found for all the students.', 404);
    }

    if (bulkUpdateOps.length > 0) {
      await Student.bulkWrite(bulkUpdateOps, { session });
    }

    await session.commitTransaction();
    session.endSession();

    return result as ClassEnrolmentDocument;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw new AppError(`${error.message}`, 400);
    } else {
      console.error(error);
      throw new Error('Something went wrong');
    }
  }
};

const fetchSingleEnrollment = async (
  id: string
): Promise<ClassEnrolmentDocument> => {
  try {
    const enrollment = await ClassEnrolment.findById({ _id: id }).populate(
      'students.student students.subjects_offered academic_session_id class',
      '-password'
    );

    if (!enrollment) {
      throw new AppError('Enrollment can not be found.', 404);
    }

    return enrollment as ClassEnrolmentDocument;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something went wrong');
    }
  }
};

const fetchAllEnrollments = async (
  page: number | undefined,
  limit: number | undefined,
  searchParams: string
) => {
  try {
    let query = ClassEnrolment.find().populate('class');

    if (searchParams) {
      const regex = new RegExp(searchParams, 'i');

      query = query.where({
        $or: [
          { academic_session_id: { $regex: regex } },
          { level: { $regex: regex } },
        ],
      });
    }

    if (!query) {
      throw new AppError('Enrollment not found.', 404);
    }
    const count = await query.clone().countDocuments();
    let pages = 0;

    if (page !== undefined && limit !== undefined && count !== 0) {
      const offset = (page - 1) * limit;

      query = query
        .skip(offset)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('academic_session_id');

      pages = Math.ceil(count / limit);

      if (page > pages) {
        throw new AppError('Page can not be found.', 404);
      }
    }

    const result = await query;

    if (!result || result.length === 0) {
      throw new AppError('No enrollment found.', 404);
    }

    return { result, totalPages: pages, totalCount: count };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

const fetchEnrollmentsBySession = async (
  session_id: string,
  page: number | undefined,
  limit: number | undefined,
  searchParams: string
) => {
  try {
    let query = ClassEnrolment.find({
      academic_session_id: session_id,
    }).populate('class');

    if (searchParams) {
      const regex = new RegExp(searchParams, 'i');

      query = query.where({
        $or: [{ academic_session_id: { $regex: regex } }],
      });
    }

    if (!query) {
      throw new AppError('Enrollment not found.', 404);
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
    const result = await query;

    if (!result || result.length === 0) {
      throw new AppError('No enrollments found for this session.', 404);
    }

    return { result, totalPages: pages, totalCount: count };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

const fetchAllActiveClassEnrollments = async (): Promise<
  ClassEnrolmentDocument[]
> => {
  try {
    const response = await ClassEnrolment.find({
      is_active: true,
    }).populate('class');

    if (!response || response.length === 0) {
      throw new AppError('Could not find active class enrollments.', 404);
    }

    return response as ClassEnrolmentDocument[];
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened.');
    }
  }
};

const fetchAllStudentsInAClass = async (
  payload: GetClassStudentsType
): Promise<{ classDoc: ClassEnrolmentDocument; class_name: string }> => {
  try {
    const { session_id, class_id, userRole, userId } = payload;

    const classExist = await Class.findById({
      _id: class_id,
    });

    if (!classExist) {
      throw new AppError(`Class with ID: ${class_id} does not exist.`, 404);
    }

    if (userRole === 'teacher') {
      if (classExist.class_teacher !== userId) {
        throw new AppError(
          `You are not the class teacher of ${classExist.name} and as such you are not allowed to view this resource.`,
          403
        );
      }
    }

    const sessionExist = await Session.findById({
      _id: session_id,
    });

    if (!sessionExist) {
      throw new AppError(`Session with ID: ${session_id} does not exist.`, 404);
    }

    const enrolledStudents = await ClassEnrolment.findOne({
      class: classExist._id,
      academic_session_id: sessionExist._id,
    });

    if (!enrolledStudents) {
      throw new AppError(
        `Can not find any enrollment into ${classExist.name} in the ${sessionExist.academic_session} academic session.`,
        404
      );
    }

    const classDoc = enrolledStudents as ClassEnrolmentDocument;

    return {
      classDoc,
      class_name: classExist.name,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened.');
    }
  }
};

const fetchAllStudentsInAClassInActiveSession = async (
  payload: GetClassStudentsType
): Promise<{ classDoc: ClassEnrolmentDocument; class_name: string }> => {
  try {
    const { session_id, class_id, userRole, userId } = payload;

    const classExist = await Class.findById({
      _id: class_id,
    });

    if (!classExist) {
      throw new AppError(`Class with ID: ${class_id} does not exist.`, 404);
    }

    if (userRole === 'teacher') {
      console.log('classExist:', classExist);
      if (classExist.class_teacher !== userId) {
        throw new AppError(
          `You are not the class teacher of ${classExist.name} and as such you are not allowed to view this resource.`,
          403
        );
      }
    }

    const sessionExist = await Session.findById({
      _id: session_id,
    });

    if (!sessionExist) {
      throw new AppError(`Session with ID: ${session_id} does not exist.`, 404);
    }

    if (sessionExist.is_active !== true) {
      throw new AppError(
        `Session with ID: ${session_id} is no more active and you can only use this resource when the session is active.`,
        403
      );
    }

    const enrolledStudents = await ClassEnrolment.findOne({
      class: classExist._id,
      academic_session_id: sessionExist._id,
    });

    if (!enrolledStudents) {
      throw new AppError(
        `Can not find any enrollment into ${classExist.name} in the ${sessionExist.academic_session} academic session.`,
        404
      );
    }

    const classDoc = enrolledStudents as ClassEnrolmentDocument;

    return {
      classDoc,
      class_name: classExist.name,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened.');
    }
  }
};

export {
  fetchAllStudentsInAClassInActiveSession,
  fetchAllStudentsInAClass,
  fetchAllActiveClassEnrollments,
  enrolStudentToClass,
  fetchSingleEnrollment,
  fetchAllEnrollments,
  fetchEnrollmentsBySession,
  enrolManyStudentsToClass,
};
