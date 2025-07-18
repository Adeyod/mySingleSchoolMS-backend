import mongoose from 'mongoose';
import {
  AttendanceDocument,
  AttendanceMarkingType,
  ClassMapDocType,
  FetchAttendanceType,
} from '../constants/types';
import Attendance from '../models/attendance.model';
import Class from '../models/class.model';
import ClassEnrolment from '../models/classes_enrolment.model';
import Session from '../models/session.model';
import { AppError } from '../utils/app.error';

const attendanceDocumentForAllClassEnrolmentCreation = async (
  academic_session_id: string
) => {
  // const session = await mongoose.startSession()
  // session.startTransaction();
  try {
    // Validate session existence and status
    const sessionExist = await Session.findById(academic_session_id);
    if (!sessionExist) {
      throw new AppError('Session does not exist.', 404);
    }
    if (!sessionExist.is_active) {
      throw new AppError(
        'Session is not active. You can only create attendance for an active session.',
        400
      );
    }

    // Fetch all class enrollments for the session
    const classEnrollments = await ClassEnrolment.find({
      academic_session_id,
    }).lean();

    if (!classEnrollments.length) {
      throw new AppError(
        'There are no class enrollments for this session yet.',
        400
      );
    }

    // Fetch all classes in one query
    const classIds = classEnrollments.map((enrolment) => enrolment.class);
    const classes = await Class.find({ _id: { $in: classIds } }).lean();
    const classMap: Record<string, ClassMapDocType> = classes.reduce(
      (map, classDoc) => {
        map[classDoc._id.toString()] = classDoc;
        return map;
      },
      {} as Record<string, ClassMapDocType>
    );

    // Fetch existing attendance documents for the session
    const existingAttendances = await Attendance.find({
      class_enrolment: { $in: classEnrollments.map((en) => en._id) },
      session: academic_session_id,
    }).lean();
    const existingMap = new Set(
      existingAttendances.map((attendance) =>
        attendance.class_enrolment.toString()
      )
    );

    // Prepare new attendance documents
    const newAttendances = [];
    for (const enrolment of classEnrollments) {
      if (!existingMap.has(enrolment._id.toString())) {
        const classDetails = classMap[enrolment.class.toString()];

        newAttendances.push({
          class: enrolment.class,
          class_enrolment: enrolment._id,
          class_teacher: classDetails?.class_teacher || null,
          session: academic_session_id,
          first_term_attendance: [],
          second_term_attendance: [],
          third_term_attendance: [],
        });
      }
    }

    // Insert new attendance documents in bulk
    const savedAttendances =
      newAttendances.length > 0
        ? await Attendance.insertMany(newAttendances)
        : [];

    return {
      message: 'Attendance creation process completed.',
      created: savedAttendances.length,
      existing: existingAttendances.length,
      savedAttendances,
      existingAttendances,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error(
        'Something went wrong while creating attendance documents.'
      );
    }
  }
};

const fetchAttendanceDocumentUsingClassIdAndSessionId = async (
  payload: FetchAttendanceType
): Promise<AttendanceDocument> => {
  try {
    const attendance = await Attendance.findOne({
      class: payload.class_id,
      academic_session_id: payload.academic_session_id,
    });

    if (!attendance) {
      throw new AppError('Attendance not found.', 404);
    }

    if (payload.role && payload.role === 'teacher') {
      if (attendance.class_teacher !== payload.teacher_id) {
        throw new AppError(
          'You can only get attendance for the class where you are the class teacher.',
          400
        );
      }
    }

    return attendance as AttendanceDocument;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const attendanceMarking = async (payload: AttendanceMarkingType) => {
  try {
    const studentsArray = payload.attendance_array.students.map((item) =>
      item.student.toString()
    );

    const attendanceDoc = await Attendance.findById({
      _id: new mongoose.Types.ObjectId(payload.attendance_id),
    });

    if (!attendanceDoc) {
      throw new AppError('Attendance not found.', 404);
    }

    if (
      attendanceDoc.class_teacher.toString() !== payload.teacher_id.toString()
    ) {
      throw new AppError(
        'You are the class teacher for this class and it is only the class teacher that can mark the class attendance.',
        400
      );
    }

    const getSession = await Session.findById({
      _id: attendanceDoc.session,
    });

    if (!getSession) {
      throw new AppError('Academic session not found.', 404);
    }

    const activeTerm = getSession.terms.find((term) => term.is_active === true);

    if (!activeTerm) {
      throw new AppError(
        'You can only mark attendance in an active term.',
        400
      );
    }

    const classEnrolmentExist = await ClassEnrolment.findById({
      _id: attendanceDoc.class_enrolment,
    });

    if (!classEnrolmentExist) {
      throw new AppError(
        'There is no class enrollment for this attendance.',
        400
      );
    }

    const enrolledStudentIds = classEnrolmentExist.students.map((s) =>
      s.student.toString()
    );

    const allPresent = studentsArray.every((id) =>
      enrolledStudentIds.includes(id)
    );

    if (!allPresent) {
      throw new AppError(
        'Some students in the attendance data are not enrolled in this class.',
        400
      );
    }

    let attendanceArray;
    const attendanceDate = payload.attendance_array.date;

    if (activeTerm.name === 'first_term') {
      attendanceArray = attendanceDoc.first_term_attendance;
    } else if (activeTerm.name === 'second_term') {
      attendanceArray = attendanceDoc.second_term_attendance;
    } else if (activeTerm.name === 'third_term') {
      attendanceArray = attendanceDoc.third_term_attendance;
    } else {
      throw new AppError('Invalid term name', 400);
    }

    const dateExists = attendanceArray.some(
      (record) =>
        new Date(record.date).toISOString() ===
        new Date(attendanceDate).toISOString()
    );

    if (dateExists) {
      throw new AppError(
        `Attendance for ${attendanceDate} has already been recorded.`,
        400
      );
    }

    attendanceArray.push(payload.attendance_array);

    await attendanceDoc.save();

    return attendanceDoc;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

export {
  attendanceMarking,
  fetchAttendanceDocumentUsingClassIdAndSessionId,
  attendanceDocumentForAllClassEnrolmentCreation,
};
