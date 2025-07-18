import express from 'express';
import { verifyAccessToken } from '../middleware/jwtAuth';
import { permission } from '../middleware/authorization';
import {
  getAStudentById,
  updateStudentDetails,
  getAllStudents,
  getAllStudentsOnAClassLevel,
  linkStudentWithParent,
  studentsSubscribeToNewSession,
  adminUpdateStudentSessionSubscription,
  studentOrParentUpdateStudentSessionSubscription,
  getStudentsThatSubscribedToNewSession,
  getNewStudentsThatHasNoClassEnrolmentBefore,
  getStudentsThatAreYetToSubscribedToNewSession,

  // calculateStudentCumulativeScoreForAllSubjectsPerTerm,
} from '../controllers/student.controller';
import uploadFile from '../middleware/multer';

const router = express.Router();

router.use(verifyAccessToken);
router.post(
  '/link-student',
  permission(['parent', 'admin', 'super_admin']),
  linkStudentWithParent
);

router.put(
  '/student-subscribe-to-new-session/:student_id/:academic_session_id',
  permission(['parent', 'student']),
  studentOrParentUpdateStudentSessionSubscription
);

router.put(
  '/update-student-to-subscribe-to-new-session/:academic_session_id',
  permission(['admin', 'super_admin']),
  adminUpdateStudentSessionSubscription
);

// router.post(
//   '/calculate-student-cumulative',
//   permission(['teacher']),
//   calculateStudentCumulativeScoreForAllSubjectsPerTerm
// );

// Get all students, get student by id
router.get(
  '/get-all-students',
  permission(['admin', 'super_admin']),
  getAllStudents
);

router.get(
  '/get-a-student/:student_id',
  permission(['admin', 'super_admin', 'student', 'teacher']),
  getAStudentById
);

router.put(
  '/update-student-details/:student_id',
  permission(['parent', 'student']),
  uploadFile.single('image'),
  updateStudentDetails
);

router.get(
  '/get-all-student-using-class-level/:level',
  permission(['admin', 'super_admin']),
  getAllStudentsOnAClassLevel
);

/**
 * 1) send notification to all students email and a parent email to check their account and subscribe to new session
  2) student subscribe to new session
  3) show admin those students that has subscribed to new session in a class using their previous class ID
  4) admin will be able to select them in group, we will only show the next class for admin to choose.
 
 */

router.get(
  '/get-students-that-subscribed-to-new-session/:level',

  permission(['admin', 'super_admin']),
  getStudentsThatSubscribedToNewSession
);

router.post(
  '/notify-students-to-subscribe-to-new-session',
  permission(['admin', 'super_admin']),
  studentsSubscribeToNewSession
);

// router.put(
//   '/update-student-to-subscribe-to-new-session/:student_id/:academic_session_id',
//   permission(['student', 'parent', 'super_admin']),
//   updateStudentSessionSubscription
// );

router.get(
  '/get-new-students',
  permission(['admin', 'super_admin']),
  getNewStudentsThatHasNoClassEnrolmentBefore
);

router.get(
  '/get-students-yet-to-subscribe-to-new-session',
  permission(['admin', 'super_admin']),
  getStudentsThatAreYetToSubscribedToNewSession
);

export default router;
