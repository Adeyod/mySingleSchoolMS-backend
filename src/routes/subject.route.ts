import express from 'express';
import { verifyAccessToken } from '../middleware/jwtAuth';
import { permission } from '../middleware/authorization';
import {
  createASubject,
  getAllSubjects,
  getASubjectById,
  getAllJssSubjects,
  getAllSssCompulsorySubjects,
  getAllOptionalSubjects,
  // chooseOptionalSubjects,
  getAllClassSubjectsByClassId,
} from '../controllers/subject.controller';

const router = express.Router();

router.use(verifyAccessToken);
router.post(
  '/create-a-subject',
  permission(['admin', 'super_admin']),
  createASubject
);
router.get(
  '/get-all-jss-subjects',
  permission(['admin', 'super_admin']),
  getAllJssSubjects
);

router.get(
  '/get-all-class-subjects/:class_id',
  permission(['admin', 'super_admin']),
  getAllClassSubjectsByClassId
);

router.get(
  '/get-all-compulsory-subjects',
  permission(['admin', 'super_admin']),
  getAllSssCompulsorySubjects
);

router.get(
  '/get-all-optional-subjects',
  permission(['admin', 'super_admin']),
  getAllOptionalSubjects
);

router.get(
  '/get-all-subjects',
  permission(['admin', 'super_admin']),
  getAllSubjects
);

router.get(
  '/get-a-subject/:subject_id',
  permission(['admin', 'super_admin']),
  getASubjectById
);

// router.post(
//   '/choose-optional-subject/:student_id/:class_id',
//   permission(['parent', 'student']),
//   chooseOptionalSubjects
// );

export default router;
