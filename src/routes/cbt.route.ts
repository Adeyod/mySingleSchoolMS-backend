import express from 'express';
import {
  getCbtAssessmentDocumentById,
  getAllClassCbtAssessmentTimetables,
  getTermClassCbtAssessmentTimetables,
  getTermCbtAssessmentDocument,
  submitSubjectCbtObjCbtAssessmentForAClass,
  updateSubjectCbtObjCbtAssessmentAnswersForAClass,
  updateSubjectCbtObjCbtAssessmentRemainingTimeForAClass,
  classTeacherAuthorizeStudentsToWriteSubjectCbt,
  createTermClassCbtAssessmentTimetable,
  startSubjectCbtObjCbtAssessmentForAClass,
  setSubjectCbtObjQuestionsForAClass,
  createTermCbtAssessmentDocument,
  setSubjectCbtTheroyQuestionsForAClass,
  getAllCbtAssessmentDocument,
} from '../controllers/cbt.controller';
// import requireFeatureAccess from '../middleware/featureAccess';
import { permission } from '../middleware/authorization';
// import getSchoolId from '../middleware/getSchoolId';
// import schoolSubDomain from '../middleware/subDomain';
import { verifyAccessToken } from '../middleware/jwtAuth';
import { developerProtected } from '../middleware/developerProtected';

const router = express.Router();

router.use(verifyAccessToken);
router.post(
  '/create-term-exam-document/:academic_session_id/:term',
  // requireFeatureAccess(['objective_exam', 'theory_exam'], 'any'),
  permission(['super_admin']),
  developerProtected,
  createTermCbtAssessmentDocument
);

router.get(
  '/all-exam-documents',
  // requireFeatureAccess(['objective_exam', 'theory_exam'], 'any'),
  permission(['super_admin', 'teacher', 'admin']),
  getAllCbtAssessmentDocument
);

router.get(
  '/get-exam-document-by-id/:exam_document_id',
  // requireFeatureAccess(['objective_exam', 'theory_exam'], 'any'),
  permission(['super_admin', 'teacher', 'student', 'admin']),
  getCbtAssessmentDocumentById
);

router.get(
  '/get-term-exam-document/:academic_session_id/:term',
  // requireFeatureAccess(['objective_exam', 'theory_exam'], 'any'),
  permission(['super_admin', 'teacher', 'admin']),
  getTermCbtAssessmentDocument
);

// rely on term to fetch exam id
router.post(
  '/create-term-class-exam-timetable/:academic_session_id/:class_id',
  // requireFeatureAccess(['objective_exam', 'theory_exam'], 'any'),
  permission(['super_admin', 'admin']),
  developerProtected,
  createTermClassCbtAssessmentTimetable
);

router.get(
  '/get-term-class-exam-timetable/:academic_session_id/:class_id/:term',
  // requireFeatureAccess(['objective_exam', 'theory_exam'], 'any'),
  permission(['teacher', 'student', 'admin', 'super_admin', 'parent']),
  getTermClassCbtAssessmentTimetables
);

router.get(
  '/get-term-class-exam-timetable/:class_id',
  // requireFeatureAccess(['objective_exam', 'theory_exam'], 'any'),
  permission(['teacher', 'student', 'admin', 'super_admin', 'parent']),
  getAllClassCbtAssessmentTimetables
);

router.post(
  '/set-obj-questions/:academic_session_id/:class_id',
  // requireFeatureAccess(['objective_exam']),
  permission(['teacher']),
  setSubjectCbtObjQuestionsForAClass
);

router.post(
  '/class-teacher-authorize-students-to-do-subject-cbt/:subject_id/:academic_session_id/:class_id',
  // requireFeatureAccess(['objective_exam']),
  permission(['teacher']),
  classTeacherAuthorizeStudentsToWriteSubjectCbt
);

router.get(
  '/start-obj-exam/:subject_id/:academic_session_id/:class_id/:term',
  // requireFeatureAccess(['objective_exam']),
  permission(['student']),
  startSubjectCbtObjCbtAssessmentForAClass
);

router.put(
  '/update-obj-exam-answers/:cbt_result_id/:exam_id',
  // requireFeatureAccess(['objective_exam']),
  permission(['student']),
  updateSubjectCbtObjCbtAssessmentAnswersForAClass
);

router.put(
  '/update-obj-exam-remaining-time/:cbt_result_id/:exam_id',
  // requireFeatureAccess(['objective_exam']),
  permission(['student']),
  updateSubjectCbtObjCbtAssessmentRemainingTimeForAClass
);

router.put(
  '/submit-obj-exam/:cbt_result_id/:exam_id',
  // requireFeatureAccess(['objective_exam']),
  permission(['student']),
  submitSubjectCbtObjCbtAssessmentForAClass
);

router.post(
  '/set-theory-questions/:academic_session_id/:class_id',
  // requireFeatureAccess(['theory_exam']),
  permission(['teacher']),
  setSubjectCbtTheroyQuestionsForAClass
);

export default router;
