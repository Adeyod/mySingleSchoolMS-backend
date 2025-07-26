import express from 'express';
import {
  createTermExamDocument,
  setSubjectCbtObjQuestionsForAClass,
  createTermClassExamTimetable,
  startSubjectCbtObjExamForAClass,
  classTeacherAuthorizeStudentsToWriteSubjectCbt,
  updateSubjectCbtObjExamAnswersForAClass,
  updateSubjectCbtObjExamRemainingTimeForAClass,
  submitSubjectCbtObjExamForAClass,
  getTermExamDocument,
  getTermClassExamTimetable,
  
  getAllExamDocument,
  getExamDocumentById,
  setSubjectCbtTheroyQuestionsForAClass,
  getAllClassExamTimetables,
} from '../controllers/cbt.controller';
// import requireFeatureAccess from '../middleware/featureAccess';
import { permission } from '../middleware/authorization';
// import getSchoolId from '../middleware/getSchoolId';
// import schoolSubDomain from '../middleware/subDomain';
import { verifyAccessToken } from '../middleware/jwtAuth';

const router = express.Router();

router.use(verifyAccessToken);
// router.use(schoolSubDomain);
// router.use(getSchoolId);
router.post(
  '/create-term-exam-document/:academic_session_id/:term',
  // requireFeatureAccess(['objective_exam', 'theory_exam'], 'any'),
  permission(['super_admin']),
  createTermExamDocument
);

router.get(
  '/all-exam-documents',
  // requireFeatureAccess(['objective_exam', 'theory_exam'], 'any'),
  permission(['super_admin']),
  getAllExamDocument
);

router.get(
  '/get-exam-document-by-id/:exam_document_id',
  // requireFeatureAccess(['objective_exam', 'theory_exam'], 'any'),
  permission(['super_admin', 'teacher', 'student', 'admin']),
  getExamDocumentById
);

router.get(
  '/get-term-exam-document/:academic_session_id/:term',
  // requireFeatureAccess(['objective_exam', 'theory_exam'], 'any'),
  permission(['super_admin', 'teacher', 'student', 'admin']),
  getTermExamDocument
);

// rely on term to fetch exam id
router.post(
  '/create-term-class-exam-timetable/:academic_session_id/:class_id',
  // requireFeatureAccess(['objective_exam', 'theory_exam'], 'any'),
  permission(['super_admin', 'admin']),
  createTermClassExamTimetable
);

router.get(
  '/get-term-class-exam-timetable/:academic_session_id/:class_id/:term',
  // requireFeatureAccess(['objective_exam', 'theory_exam'], 'any'),
  permission(['teacher', 'student', 'admin', 'super_admin', 'parent']),
  getTermClassExamTimetable
);

router.get(
  '/get-term-class-exam-timetable/:class_id',
  // requireFeatureAccess(['objective_exam', 'theory_exam'], 'any'),
  permission(['teacher', 'student', 'admin', 'super_admin', 'parent']),
  getAllClassExamTimetables
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
  startSubjectCbtObjExamForAClass
);

router.put(
  '/update-obj-exam-answers/:cbt_result_id/:exam_id',
  // requireFeatureAccess(['objective_exam']),
  permission(['student']),
  updateSubjectCbtObjExamAnswersForAClass
);

router.put(
  '/update-obj-exam-remaining-time/:cbt_result_id/:exam_id',
  // requireFeatureAccess(['objective_exam']),
  permission(['student']),
  updateSubjectCbtObjExamRemainingTimeForAClass
);

router.put(
  '/submit-obj-exam/:cbt_result_id/:exam_id',
  // requireFeatureAccess(['objective_exam']),
  permission(['student']),
  submitSubjectCbtObjExamForAClass
);

router.post(
  '/set-theory-questions/:academic_session_id/:class_id',
  // requireFeatureAccess(['theory_exam']),
  permission(['teacher']),
  setSubjectCbtTheroyQuestionsForAClass
);

export default router;
