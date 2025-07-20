import express from 'express';
import { verifyAccessToken } from '../middleware/jwtAuth';
import { permission } from '../middleware/authorization';
import {
  createAClass,
  getAllClasses,
  getAClassById,
  addSubjectsToAClass,
  removeSubjectsToAClass,
  getSchoolClassLevel,
} from '../controllers/class.controller';

const router = express.Router();

router.use(verifyAccessToken);
router.put(
  '/add-subjects-to-class/:class_id',
  permission(['admin', 'super_admin']),
  addSubjectsToAClass
);

router.get(
  '/get-school-class-level',
  permission(['admin', 'super_admin', 'parent', 'student', 'teacher']),
  getSchoolClassLevel
);

router.delete(
  '/remove-subjects-to-class/:class_id',
  permission(['admin', 'super_admin']),
  removeSubjectsToAClass
);

router.post(
  '/create-a-class',
  permission(['admin', 'super_admin']),
  createAClass
);
router.get(
  '/get-a-class/:class_id',
  permission(['admin', 'super_admin']),
  getAClassById
);

router.get('/get-classes', permission(['admin', 'super_admin']), getAllClasses);

export default router;
