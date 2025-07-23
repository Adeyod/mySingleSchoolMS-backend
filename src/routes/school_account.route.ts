import express from 'express';
import {
  createSchoolAccounts,
  getMySchoolAccounts,
} from '../controllers/school_account.controller';
import { verifyAccessToken } from '../middleware/jwtAuth';
import { permission } from '../middleware/authorization';

const router = express.Router();

router.use(verifyAccessToken);

router.post(
  '/create-school-accounts',
  permission(['super_admin']),
  createSchoolAccounts
);

router.get(
  '/get-my-school-accounts',
  permission(['super_admin', 'parent', 'student', 'admin']),
  getMySchoolAccounts
);

export default router;
