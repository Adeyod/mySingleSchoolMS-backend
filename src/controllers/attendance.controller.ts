import {
  attendanceDocumentForAllClassEnrolmentCreation,
  attendanceMarking,
  fetchAttendanceDocumentUsingClassIdAndSessionId,
} from '../services/attendance.service';
import { AppError } from '../utils/app.error';
import catchErrors from '../utils/tryCatch';

const createAttendanceDocumentForAllClassEnrolment = catchErrors(
  async (req, res) => {
    const { academic_session_id } = req.params;

    if (!academic_session_id) {
      throw new AppError('Please provide a valid session ID', 400);
    }
    const results = await attendanceDocumentForAllClassEnrolmentCreation(
      academic_session_id
    );

    if (!results) {
      throw new AppError(
        'Unable to create attendance documents for this session.',
        400
      );
    }

    return res.status(201).json({
      message: 'Attendance documents created for all classes for this session.',
      success: true,
      status: 201,
      attendance: results,
    });
  }
);

const getAttendanceDocumentUsingClassIdAndSessionId = catchErrors(
  async (req, res) => {
    const { academic_session_id, class_id } = req.params;

    const teacher_id = req.user?.userId;
    const role = req.user?.userRole;

    if (!academic_session_id || !class_id) {
      throw new AppError(
        'Please provide a valid academic session ID and class ID',
        400
      );
    }

    const payload = {
      academic_session_id,
      class_id,
      teacher_id: role === 'teacher' ? teacher_id : undefined,
      role: role === 'teacher' ? role : undefined,
    };

    const result = await fetchAttendanceDocumentUsingClassIdAndSessionId(
      payload
    );

    if (!result) {
      throw new AppError('Unable to fetch attendance document', 400);
    }

    return res.status(200).json({
      message: 'Attendance document successfully fetched.',
      success: true,
      status: 200,
      attendance_doc: result,
    });
  }
);

const classTeacherMarkAttendance = catchErrors(async (req, res) => {
  const { attendance_id } = req.params;
  const { attendance_array } = req.body;

  const teacher_id = req.user?.userId;

  if (!teacher_id || teacher_id === undefined) {
    throw new AppError('Please login.', 400);
  }

  if (!attendance_id) {
    throw new AppError('Please provide a valid attendance id to proceed.', 400);
  }

  if (!attendance_array || attendance_array.length === 0) {
    throw new AppError(
      'Please provide students attendance information that will be saved.',
      400
    );
  }

  const payload = {
    attendance_id,
    teacher_id,
    attendance_array,
  };

  const result = await attendanceMarking(payload);

  if (!result) {
    throw new AppError('Unable to mark attendance', 400);
  }

  return res.status(200).json({
    message: 'Attendance marked successfully.',
    success: true,
    status: 200,
    attendance: result,
  });
});

export {
  classTeacherMarkAttendance,
  getAttendanceDocumentUsingClassIdAndSessionId,
  createAttendanceDocumentForAllClassEnrolment,
};
