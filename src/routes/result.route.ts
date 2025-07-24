import express from 'express';
import {
  getResultSettings,
  getLevelResultSetting,
  recordStudentScorePerTerm,
  getAllSubjectResultOfStudentsInClass,
  getStudentSubjectResultInAClass,
  getStudentTermResult,
  getStudentSessionResults,
  getAllStudentResultsInClassForActiveTermByClassId,
  getStudentResultByResultId,
  getAllResultsOfAStudent,
  calculateStudentsClassPosition,
  subjectPositionGradingInClass,
  recordAllStudentsLastTermCumPerTerm,
  recordAllStudentsExamScoresPerTerm,
  recordAllStudentsScoresPerTerm,
  // getResultSetting,
} from '../controllers/result.controller';
import { verifyAccessToken } from '../middleware/jwtAuth';
import { permission } from '../middleware/authorization';

const router = express.Router();

router.use(verifyAccessToken);

router.get(
  '/get-result-setting',
  permission(['teacher', 'admin', 'super_admin', 'student', 'parent']),
  getResultSettings
);

router.get(
  '/get-level-result-setting-in-a-school/:level',
  permission(['teacher', 'admin', 'super_admin', 'student', 'parent']),
  getLevelResultSetting
);

// router.get(
//   '/get-result-setting-in-a-school',
//   permission(['teacher', 'admin', 'super_admin', 'student', 'parent']),
//   getResultSetting
// );

router.get(
  '/get-all-results-of-a-student/:student_id',
  permission(['teacher', 'admin', 'super_admin', 'student', 'parent']),
  getAllResultsOfAStudent
  // populate subject and subject teacher
);

router.get(
  '/get-student-result-by-result_id/:student_id/:result_id',
  permission(['teacher', 'admin', 'super_admin', 'student', 'parent']),
  getStudentResultByResultId
  // populate subject and subject teacher
);

router.put(
  '/record-student-score-per-term',
  permission(['teacher']),
  recordStudentScorePerTerm
);

router.put(
  '/record-all-students-score-per-term',
  permission(['teacher']),
  recordAllStudentsScoresPerTerm
);

router.put(
  '/record-all-students-last-term-cum',
  permission(['teacher']),
  recordAllStudentsLastTermCumPerTerm
);

router.put(
  '/record-all-students-exam-score-per-term',
  permission(['teacher']),
  recordAllStudentsExamScoresPerTerm
);

router.post(
  '/get-all-scores-per-subject',
  permission(['teacher', 'admin', 'super_admin']),
  getAllSubjectResultOfStudentsInClass
);

router.post(
  '/get-student-subject-result',
  permission(['teacher', 'admin', 'super_admin', 'student', 'parent']),
  getStudentSubjectResultInAClass
);

router.get(
  '/get-student-term-result/:student_id/:academic_session_id/:term',
  permission(['teacher', 'admin', 'super_admin', 'student', 'parent']),
  getStudentTermResult
  // populate subject and subject teacher
);

router.get(
  '/get-student-session-results/:student_id/:academic_session_id',
  permission(['teacher', 'admin', 'super_admin', 'student', 'parent']),
  getStudentSessionResults
);

router.put(
  '/subject-position-grading-in-class/:class_enrolment_id/:subject_id',
  permission(['teacher']),
  subjectPositionGradingInClass
);

router.put(
  '/students-class-position/:class_id',
  permission(['teacher']),
  calculateStudentsClassPosition
);

router.get(
  '/all-student-results-in-class-for-the-session/:class_id/:academic_session_id/:term',
  permission(['teacher', 'admin', 'super_admin']),
  getAllStudentResultsInClassForActiveTermByClassId
);

// teacher onboarding
// ENDPOINT TO GET RESULT OF A SINGLE STUDENT

/**
 * FETCH A STUDENT RESULT
 * FETCH SINGLE SUBJECT RESULT OF A CLASS FOR THE SUBJECT TEACHER. WE FETCH ALL THE STUDENTS THAT FALL INTO THAT CLASS USING CLASS ID, ENROLLMENT, ACADEMIC SESSION
 * FETCH RESULT THAT SHOWS ALL STUDE
 */

// router.post('/record-exam', recordStudentExamPerTerm);

export default router;
