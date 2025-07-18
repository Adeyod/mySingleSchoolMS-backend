// import express from 'express';
// import { verifyAccessToken } from '../middleware/jwtAuth';
// import { permission } from '../middleware/authorization';

// const router = express.Router();

// // router.get('/get-a-job', getAJob);

// export default router;

////////////////////////////////////////////
import express from 'express';

import {
  getAllAdmins,
  getAdminByAdminId,
  getMySchoolSummary,
} from '../controllers/admin.controller';
import { verifyAccessToken } from '../middleware/jwtAuth';
import { permission } from '../middleware/authorization';

const router = express.Router();

router.use(verifyAccessToken);
router.get('/get-all-admins', permission(['super_admin']), getAllAdmins);

router.get(
  '/get-admin/:admin_id',
  permission(['super_admin']),
  getAdminByAdminId
);

router.get(
  '/get-my-school-summary',
  permission(['super_admin', 'admin']),
  getMySchoolSummary
);

export default router;
