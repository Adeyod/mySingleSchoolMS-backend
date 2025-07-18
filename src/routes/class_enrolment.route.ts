import express from 'express';
import { verifyAccessToken } from '../middleware/jwtAuth';
import { permission } from '../middleware/authorization';
import {
  studentEnrolmentToClass,
  getASingleEnrollmentById,
  getAllEnrollments,
  getAllActiveClassEnrollments,
  getAllSessionEnrollmentsBySessionId,
  getAllStudentsInAClass,
  getAllStudentsInAClassInActiveSession,
  manyStudentsEnrolmentToClass,
} from '../controllers/class_enrolment.controller';

const router = express.Router();

router.use(verifyAccessToken);

router.get(
  '/get-a-single-class-enrollment/:id',
  permission(['admin', 'super_admin']),
  getASingleEnrollmentById
);

router.get(
  '/get-all-students-in-a-class/:class_id/:session_id',
  permission(['admin', 'super_admin', 'teacher']),
  getAllStudentsInAClass
);

router.get(
  '/get-all-students-in-a-class-in-active-session/:class_id/:session_id',
  permission(['admin', 'super_admin', 'teacher']),
  getAllStudentsInAClassInActiveSession
);

router.get(
  '/get-all-class-enrollments',
  permission(['admin', 'super_admin']),
  getAllEnrollments
);

router.get(
  '/get-all-active-class-enrollments',
  permission(['admin', 'super_admin']),
  getAllActiveClassEnrollments
);

router.get(
  '/get-all-class-enrollments/:session_id',
  permission(['admin', 'super_admin']),
  getAllSessionEnrollmentsBySessionId
);

router.post(
  '/enrol-student-to-class',
  permission(['admin', 'super_admin']),
  studentEnrolmentToClass
);

router.post(
  '/enrol-many-students-to-class',
  permission(['admin', 'super_admin']),
  manyStudentsEnrolmentToClass
);

export default router;
