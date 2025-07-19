import express from 'express';
import {
  // addLogo,
  // addSchoolImage,
  createClassLevels,
  createCutoffMinutes,
  // addPrincipalSignAndDate,
  createResultSetting,
} from '../controllers/school.controller';
import uploadFile from '../middleware/multer';
import { verifyAccessToken } from '../middleware/jwtAuth';
import { permission } from '../middleware/authorization';

const router = express.Router();

router.use(verifyAccessToken);

router.post(
  '/create-school-class-levels',
  permission(['super_admin']),
  createClassLevels
);

router.post(
  '/create-school-cutoff-minutes',
  permission(['super_admin']),
  createCutoffMinutes
);

router.post(
  '/create-result-setting/:level',
  permission(['super_admin']),
  createResultSetting
);

// router.put(
//   '/add-school-logo',
//   permission(['super_admin']),
//   uploadFile.single('logo'),
//   addLogo
// );

// router.put(
//   '/add-school-image',
//   permission(['super_admin']),
//   uploadFile.single('school_image'),
//   addSchoolImage
// );

// router.put(
//   '/add-principal-sign-and-date-per-term/:academic_session_id/:term',
//   permission(['super_admin']),
//   uploadFile.single('principal_sign'),
//   addPrincipalSignAndDate
// );

export default router;
