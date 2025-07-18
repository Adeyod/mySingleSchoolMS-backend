import express from 'express';
import {
  classTeacherMarkAttendance,
  createAttendanceDocumentForAllClassEnrolment,
  getAttendanceDocumentUsingClassIdAndSessionId,
} from '../controllers/attendance.controller';
import { permission } from '../middleware/authorization';
import { verifyAccessToken } from '../middleware/jwtAuth';

const router = express.Router();

router.use(verifyAccessToken);
router.post(
  '/create-attendance-document/:academic_session_id',
  permission(['admin', 'super_admin']),
  createAttendanceDocumentForAllClassEnrolment
);

router.get(
  '/get-attendance-document/:academic_session_id/:class_id',
  permission(['admin', 'super_admin', 'teacher']),
  getAttendanceDocumentUsingClassIdAndSessionId
);

router.put(
  '/mark-attendance-document/:attendance_id',
  classTeacherMarkAttendance
);

export default router;
