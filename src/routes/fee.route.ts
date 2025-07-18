// import express from 'express';
// import { verifyAccessToken } from '../middleware/jwtAuth';
// import { permission } from '../middleware/authorization';
// import {
//   createSchoolFees,
//   getAllSchoolFees,
//   getASchoolFeeById,
//   createSchoolBusFee,
//   updateSchoolBusFee,
//   updateSchoolFeesById,
//   getASchoolFeeByLevel,
//   getSchoolBusByGroup,
//   getSchoolBus,
// } from '../controllers/fee.controller';

// const router = express.Router();

// router.use(verifyAccessToken);
// router.post(
//   '/create-school-fees',
//   permission(['admin', 'super_admin']),
//   createSchoolFees
// );

// router.post(
//   '/create-school-bus-fee',
//   permission(['admin', 'super_admin']),
//   createSchoolBusFee
// );
// router.put(
//   '/update-school-bus-fee/:id',
//   permission(['admin', 'super_admin']),
//   updateSchoolBusFee
// );
// router.put(
//   '/update-school-fee/:fee_id',
//   permission(['admin', 'super_admin']),
//   updateSchoolFeesById
// );

// router.get(
//   '/get-all-school-fees',
//   permission(['admin', 'super_admin']),
//   getAllSchoolFees
// );

// router.get('/school-bus-by-group', getSchoolBusByGroup);
// router.get('/get-school-bus', getSchoolBus);
// router.get(
//   '/get-school-fee/:school_fee_id',
//   permission(['admin', 'super_admin', 'parent', 'student']),
//   getASchoolFeeById
// );
// router.get(
//   '/get-school-fee/:level',
//   permission(['admin', 'super_admin', 'parent', 'student']),
//   getASchoolFeeByLevel
// );

// // router.put(
// //   '/end-session/:session_id',
// //   permission(['admin', 'super_admin']),
// //   endASessionBySessionId
// // );

// export default router;

///////////////////////////////////////////
import express from 'express';
import { verifyAccessToken } from '../middleware/jwtAuth';
import {
  // checkFeatureAccessForSchool,
  permission,
} from '../middleware/authorization';
import {
  createSchoolFees,
  getAllSchoolFeesPerTerm,
  getASchoolFeeById,
  getASchoolFeeByLevelAndTerm,
  createOptionalFees,
  createMandatoryFees,
  addMandatoryFeeDuringTerm,
  addOptionalFeeDuringTerm,
  getSchoolFees,
  getTermFees,
  getAllMandatoryFees,
  getAllOptionalFees,
  getTermMandatoryFees,
  getTermOptionalFees,
  ///////////////////////////////////
  updateSchoolFeesById,
  getSchoolBusByGroup,
  getSchoolBus,
} from '../controllers/fee.controller';

const router = express.Router();

router.use(verifyAccessToken);
router.post(
  '/create-school-fees',
  permission(['admin', 'super_admin']),
  createSchoolFees
);

router.put(
  '/add-optional-fees-during-term',
  permission(['admin', 'super_admin']),
  addOptionalFeeDuringTerm
);

router.put(
  '/add-mandatory-fees-during-term',
  permission(['admin', 'super_admin']),
  addMandatoryFeeDuringTerm
);
router.put(
  '/create-optional-fees',
  permission(['admin', 'super_admin']),
  createOptionalFees
);
router.put(
  '/create-mandatory-fees',
  permission(['admin', 'super_admin']),
  createMandatoryFees
);

router.put(
  '/update-school-fee/:fee_id',
  permission(['admin', 'super_admin']),
  updateSchoolFeesById
);

router.get(
  '/get-all-school-fees',
  permission(['admin', 'super_admin']),
  // checkFeatureAccessForSchool('payment'),
  getAllSchoolFeesPerTerm
);

router.get('/school-bus-by-group', getSchoolBusByGroup);
router.get(
  '/get-school-fees',
  permission(['admin', 'super_admin', 'student', 'parent']),
  getSchoolFees
);
router.get(
  '/get-term-fees/:academic_session_id/:term',
  permission(['admin', 'super_admin', 'student', 'parent']),
  getTermFees
);

router.get(
  '/get-all-mandatory-fees',
  permission(['admin', 'super_admin', 'student', 'parent']),
  getAllMandatoryFees
);

router.get(
  '/get-all-optional-fees',
  permission(['admin', 'super_admin', 'student', 'parent']),
  getAllOptionalFees
);

router.get(
  '/get-term-mandatory-fees/:academic_session_id/:term',
  permission(['admin', 'super_admin', 'student', 'parent']),
  getTermMandatoryFees
);

router.get(
  '/get-term-optional-fees/:academic_session_id/:term',
  permission(['admin', 'super_admin', 'student', 'parent']),
  getTermOptionalFees
);
router.get('/get-school-bus', getSchoolBus);

router.get(
  '/get-school-fee/:school_fee_id',
  permission(['admin', 'super_admin', 'parent', 'student']),
  getASchoolFeeById
);
router.get(
  '/get-school-fee/:level',
  permission(['admin', 'super_admin', 'parent', 'student']),
  getASchoolFeeByLevelAndTerm
);

// router.put(
//   '/end-session/:session_id',
//   permission(['admin', 'super_admin']),
//   endASessionBySessionId
// );

export default router;
