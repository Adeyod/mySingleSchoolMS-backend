import express from 'express';

import { verifyAccessToken } from '../middleware/jwtAuth';
import { permission } from '../middleware/authorization';
import {
  fetchALinkedStudent,
  fetchAllLinkedStudents,
  getParentById,
  getAllParents,
  getAllChildResults,
} from '../controllers/parent.controller';

const router = express.Router();

router.use(verifyAccessToken);
router.get(
  '/parent-fetch-student/:student_id',
  permission(['parent']),
  fetchALinkedStudent
);

router.get(
  '/parent-fetch-student-results/:student_id',
  permission(['parent']),
  getAllChildResults
);

router.get(
  '/get-a-parent/:parent_id',
  permission(['admin', 'super_admin', 'parent']),
  getParentById
);
router.get(
  '/get-all-parents',
  permission(['admin', 'super_admin']),
  getAllParents
);
router.get(
  '/parent-fetch-children/:parent_id',
  permission(['parent']),
  fetchAllLinkedStudents
);

// get a single student by id

export default router;
