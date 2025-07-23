// import {
//   schoolFeesCreation,
//   schoolBusFeeCreation,
//   schoolFeesUpdating,
//   schoolBusFeeUpdating,
//   fetchAllSchoolFees,
//   fetchASchoolFee,
//   fetchSchoolBusByGroup,
//   fetchSchoolBus,
// } from '../services/fee.service';
// import { subjectCreation } from '../services/subject.service';
// import { AppError } from '../utils/app.error';
// import catchErrors from '../utils/tryCatch';
// import { schoolBusValidation, schoolFeesValidation } from '../utils/validation';

// const createSchoolFees = catchErrors(async (req, res) => {
//   const { class_level, amount } = req.body;

//   if (!class_level || !amount) {
//     throw new AppError('Class level, arms and amount must be provided.', 400);
//   }

//   const validateInput = schoolFeesValidation(amount);
//   if (validateInput.error) {
//     throw new AppError(`${validateInput.error}`, 400);
//   }

//   const { success, value } = validateInput;

//   const result = await schoolFeesCreation(class_level, value);

//   if (!result) {
//     throw new AppError('Unable to create school fees.', 400);
//   }

//   console.log('result:', result);

//   return res.status(201).json({
//     message: `${class_level} school fees created successfully`,
//     success: true,
//     status: 201,
//     school_fees: result,
//   });
// });

// const createSchoolBusFee = catchErrors(async (req, res) => {
//   const { close_group, far_group } = req.body;

//   if (!close_group || !far_group) {
//     throw new AppError(
//       'Please provide values for close group and far group.',
//       400
//     );
//   }

//   const payload = {
//     close_group,
//     far_group,
//   };

//   const validateInput = schoolBusValidation(payload);

//   if (validateInput.error) {
//     throw new AppError(`${validateInput.error}`, 400);
//   }

//   const { success, value } = validateInput;

//   const result = await schoolBusFeeCreation(value);

//   if (!result) {
//     throw new AppError('Unable to create school bus fees.', 400);
//   }

//   return res.status(201).json({
//     message: 'School Bus fees created successfully',
//     success: true,
//     status: 201,
//     bus_fee: result,
//   });
// });

// const updateSchoolFeesById = catchErrors(async (req, res) => {
//   const { fee_id } = req.params;
//   const { amount } = req.body;

//   if (!fee_id) {
//     throw new AppError('Please provide fee ID to proceed', 400);
//   }

//   if (!amount) {
//     throw new AppError('Please provide amount to proceed', 400);
//   }

//   const validateInput = schoolFeesValidation(amount);
//   if (validateInput.error) {
//     throw new AppError(`${validateInput.error}`, 400);
//   }

//   const { success, value } = validateInput;

//   const result = await schoolFeesUpdating(fee_id, value);

//   if (!result) {
//     throw new AppError('Unable to update school fees.', 400);
//   }

//   return res.status(200).json({
//     message: `${result.level} school fees updated successfully`,
//     success: true,
//     status: 200,
//     school_fees: result,
//   });
// });

// const updateSchoolBusFee = catchErrors(async (req, res) => {
//   const { id } = req.params;

//   if (!id) {
//     throw new AppError('Please provide ID to proceed', 400);
//   }

//   const { close_group, far_group } = req.body;

//   if (!close_group || !far_group) {
//     throw new AppError(
//       'Please provide values for close group and far group.',
//       400
//     );
//   }

//   const payload = {
//     close_group,
//     far_group,
//   };

//   const validateInput = schoolBusValidation(payload);

//   if (validateInput.error) {
//     throw new AppError(`${validateInput.error}`, 400);
//   }

//   const { success, value } = validateInput;

//   const input = {
//     close_group: value.close_group,
//     far_group: value.far_group,
//     id,
//   };

//   const result = await schoolBusFeeUpdating(input);

//   if (!result) {
//     throw new AppError('Unable to update school bus fees.', 400);
//   }

//   return res.status(200).json({
//     message: 'School Bus fees updated successfully',
//     success: true,
//     status: 200,
//     bus_fee: result,
//   });
// });

// const getAllSchoolFees = catchErrors(async (req, res) => {
//   const result = await fetchAllSchoolFees();

//   if (!result) {
//     throw new AppError('Unable to fetch all school fees.', 400);
//   }

//   return res.status(200).json({
//     message: 'All school fees fetched successfully.',
//     success: true,
//     status: 200,
//     school_fees: result,
//   });
// });

// const getASchoolFeeById = catchErrors(async (req, res) => {
//   const { school_fee_id } = req.params;

//   if (!school_fee_id) {
//     throw new AppError('School fee id not provided.', 400);
//   }

//   const result = await fetchASchoolFee(school_fee_id);

//   if (!result) {
//     throw new AppError('Unable to find School fee', 400);
//   }

//   return res.status(200).json({
//     message: 'School fee fetched successfully.',
//     success: true,
//     status: 200,
//     school_fee: result,
//   });
// });

// const getSchoolBusByGroup = catchErrors(async (req, res) => {
//   const { group } = req.body;

//   if (!group) {
//     throw new AppError('You must provide a group name to continue.', 400);
//   }

//   const result = await fetchSchoolBusByGroup(group);

//   if (!result) {
//     throw new AppError('Unable to fetch the school bus.', 400);
//   }

//   return res.status(200).json({
//     message: 'School Bus fetched successfully.',
//     success: true,
//     status: 200,
//     bus: result.school_bus,
//   });
// });

// const getSchoolBus = catchErrors(async (req, res) => {
//   const result = await fetchSchoolBus();

//   if (!result) {
//     throw new AppError('Unable to fetch the school bus.', 400);
//   }

//   return res.status(200).json({
//     message: 'School Bus fetched successfully.',
//     success: true,
//     status: 200,
//     bus: result,
//   });
// });
// const getASchoolFeeByLevel = catchErrors(async (req, res) => {});
// // const createSchoolFees = catchErrors(async(req, res)=>{})

// export {
//   getSchoolBus,
//   getSchoolBusByGroup,
//   createSchoolFees,
//   createSchoolBusFee,
//   updateSchoolBusFee,
//   updateSchoolFeesById,
//   getAllSchoolFees,
//   getASchoolFeeById,
//   getASchoolFeeByLevel,
// };

////////////////////////////////////////////////////////////////
import mongoose from 'mongoose';
import { FeePayloadType } from '../constants/types';
import {
  fetchAllSchoolFeesPerTerm,
  fetchASchoolFee,
  fetchASchoolFeeByLevelAndTerm,
  mandatoryFeesAddition,
  mandatoryFeesCreation,
  optionalFeesAddition,
  optionalFeesCreation,
  schoolFeesCreation,
  fetchSchoolFees,
  fetchTermFees,
  fetchAllMandatoryFees,
  fetchAllOptionalFees,
  fetchTermMandatoryFees,
  fetchTermOptionalFees,
} from '../services/fee.service';
import { AppError } from '../utils/app.error';
import catchErrors from '../utils/tryCatch';
import {
  optionalFeesValidation,
  schoolBusValidation,
  schoolFeesValidation,
} from '../utils/validation';
// import { saveLog } from '../logs/log.service';

const createSchoolFees = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { fee_array, receiving_acc_id } = req.body;

  if (fee_array.length === 0) {
    throw new AppError('Class levels, and amounts must be provided.', 400);
  }

  if (fee_array.length < 6) {
    throw new AppError('Please provide school fees for all levels.', 400);
  }

  if (fee_array.length > 6) {
    throw new AppError('Please provide school fees for only 6 levels.', 400);
  }

  if (!receiving_acc_id) {
    throw new AppError(
      'Please choose an account number that the fee is going to be paid into.',
      400
    );
  }

  for (const fee of fee_array) {
    const validationResult = schoolFeesValidation(fee.amount);
    if (validationResult.error) {
      throw new AppError(`${validationResult.error}`, 400);
    }
  }

  const result = await schoolFeesCreation(fee_array, receiving_acc_id);

  if (!result) {
    throw new AppError('Unable to create school fees.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: `School fees created successfully`,
  //   service: 'klazik schools',
  //   method: req.method,
  //   route: req.originalUrl,
  //   status_code: 200,
  //   user_id: req.user?.userId,
  //   user_role: req.user?.userRole,
  //   ip: req.ip || 'unknown',
  //   duration_ms: duration,
  //   stack: undefined,
  //   school_id: req.user?.school_id
  //     ? new mongoose.Types.ObjectId(req.user.school_id)
  //     : undefined,
  // };

  // await saveLog(savelogPayload);

  return res.status(201).json({
    message: `School fees created successfully`,
    success: true,
    status: 201,
    school_fees: result,
  });
});

const getAllSchoolFeesPerTerm = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { term, academic_session_id } = req.body;

  if (!term || !academic_session_id) {
    throw new AppError(
      'Please provide term and academic session ID to proceed.',
      400
    );
  }

  const result = await fetchAllSchoolFeesPerTerm(term, academic_session_id);

  if (!result) {
    throw new AppError('Unable to fetch all school fees.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'All school fees fetched successfully.',
  //   service: 'klazik schools',
  //   method: req.method,
  //   route: req.originalUrl,
  //   status_code: 200,
  //   user_id: req.user?.userId,
  //   user_role: req.user?.userRole,
  //   ip: req.ip || 'unknown',
  //   duration_ms: duration,
  //   stack: undefined,
  //   school_id: req.user?.school_id
  //     ? new mongoose.Types.ObjectId(req.user.school_id)
  //     : undefined,
  // };

  // await saveLog(savelogPayload);

  return res.status(200).json({
    message: 'All school fees fetched successfully.',
    success: true,
    status: 200,
    school_fees: result,
  });
});

const getASchoolFeeById = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { school_fee_id } = req.params;

  if (!school_fee_id) {
    throw new AppError('School fee id not provided.', 400);
  }

  const result = await fetchASchoolFee(school_fee_id);

  if (!result) {
    throw new AppError('Unable to find School fee', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'School fee fetched successfully.',
  //   service: 'klazik schools',
  //   method: req.method,
  //   route: req.originalUrl,
  //   status_code: 200,
  //   user_id: req.user?.userId,
  //   user_role: req.user?.userRole,
  //   ip: req.ip || 'unknown',
  //   duration_ms: duration,
  //   stack: undefined,
  //   school_id: req.user?.school_id
  //     ? new mongoose.Types.ObjectId(req.user.school_id)
  //     : undefined,
  // };

  // await saveLog(savelogPayload);

  return res.status(200).json({
    message: 'School fee fetched successfully.',
    success: true,
    status: 200,
    school_fee: result,
  });
});

const getASchoolFeeByLevelAndTerm = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { term, academic_session_id } = req.body;

  if (!term || !academic_session_id) {
    throw new AppError(
      'Please provide term and academic session ID to proceed.',
      400
    );
  }

  const result = await fetchASchoolFeeByLevelAndTerm(academic_session_id, term);

  if (!result) {
    throw new AppError('Unable to find School fee', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'School fee fetched successfully.',
  //   service: 'klazik schools',
  //   method: req.method,
  //   route: req.originalUrl,
  //   status_code: 200,
  //   user_id: req.user?.userId,
  //   user_role: req.user?.userRole,
  //   ip: req.ip || 'unknown',
  //   duration_ms: duration,
  //   stack: undefined,
  //   school_id: req.user?.school_id
  //     ? new mongoose.Types.ObjectId(req.user.school_id)
  //     : undefined,
  // };

  // await saveLog(savelogPayload);

  return res.status(200).json({
    message: 'School fee fetched successfully.',
    success: true,
    status: 200,
    school_fee: result,
  });
});

const createOptionalFees = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { fee_name, applicable_classes, amount, receiving_acc_id } = req.body;

  if (!receiving_acc_id) {
    throw new AppError(
      'Please choose an account number that the fee is going to be paid into.',
      400
    );
  }

  const requiredFields = {
    fee_name,
    applicable_classes,
    amount,
  };
  const missingField = Object.entries(requiredFields).find(
    ([key, value]) => !value
  );

  if (missingField) {
    throw new AppError(
      `Please provide ${missingField[0].replace('_', ' ')} to proceed.`,
      400
    );
  }

  const validateInput = optionalFeesValidation(amount, fee_name);

  if (validateInput.error) {
    throw new AppError(`${validateInput.error}`, 400);
  }

  const { success, value } = validateInput;

  const payload = {
    fee_name: value.fee_name,
    applicable_classes,
    amount: value.amount,
    receiving_acc_id,
  };

  const result = await optionalFeesCreation(payload);

  if (!result) {
    throw new AppError('Unable to create fees.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: `fees added successfully`,
  //   service: 'klazik schools',
  //   method: req.method,
  //   route: req.originalUrl,
  //   status_code: 200,
  //   user_id: req.user?.userId,
  //   user_role: req.user?.userRole,
  //   ip: req.ip || 'unknown',
  //   duration_ms: duration,
  //   stack: undefined,
  //   school_id: req.user?.school_id
  //     ? new mongoose.Types.ObjectId(req.user.school_id)
  //     : undefined,
  // };

  // await saveLog(savelogPayload);

  return res.status(201).json({
    message: `fees added successfully`,
    success: true,
    status: 201,
    fees: result,
  });
});

const createMandatoryFees = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { fee_name, amount, receiving_acc_id } = req.body;

  if (!receiving_acc_id) {
    throw new AppError(
      'Please choose an account number that the fee is going to be paid into.',
      400
    );
  }

  const requiredFields = {
    fee_name,
    amount,
  };
  const missingField = Object.entries(requiredFields).find(
    ([key, value]) => !value
  );

  if (missingField) {
    throw new AppError(
      `Please provide ${missingField[0].replace('_', ' ')} to proceed.`,
      400
    );
  }

  const validateInput = optionalFeesValidation(amount, fee_name);

  if (validateInput.error) {
    throw new AppError(`${validateInput.error}`, 400);
  }

  const { success, value } = validateInput;

  const payload = {
    fee_name: value.fee_name,
    amount: value.amount,
    receiving_acc_id,
  };

  const result = await mandatoryFeesCreation(payload);

  if (!result) {
    throw new AppError('Unable to create fees.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: `fees added successfully`,
  //   service: 'klazik schools',
  //   method: req.method,
  //   route: req.originalUrl,
  //   status_code: 200,
  //   user_id: req.user?.userId,
  //   user_role: req.user?.userRole,
  //   ip: req.ip || 'unknown',
  //   duration_ms: duration,
  //   stack: undefined,
  //   school_id: req.user?.school_id
  //     ? new mongoose.Types.ObjectId(req.user.school_id)
  //     : undefined,
  // };

  // await saveLog(savelogPayload);

  return res.status(201).json({
    message: `fees added successfully`,
    success: true,
    status: 201,
    fees: result,
  });
});

const addMandatoryFeeDuringTerm = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { fee_name, amount, term, receiving_acc_id } = req.body;

  if (!receiving_acc_id) {
    throw new AppError(
      'Please choose an account number that the fee is going to be paid into.',
      400
    );
  }

  const requiredFields = {
    fee_name,
    amount,
    term,
  };
  const missingField = Object.entries(requiredFields).find(
    ([key, value]) => !value
  );

  if (missingField) {
    throw new AppError(
      `Please provide ${missingField[0].replace('_', ' ')} to proceed.`,
      400
    );
  }

  const validateInput = optionalFeesValidation(amount, fee_name);

  if (validateInput.error) {
    throw new AppError(`${validateInput.error}`, 400);
  }

  const { success, value } = validateInput;

  const payload = {
    fee_name: value.fee_name,
    amount: value.amount,
    term,
    receiving_acc_id,
  };

  const result = await mandatoryFeesAddition(payload);

  if (!result) {
    throw new AppError('Unable to create fees.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: `fees added successfully`,
  //   service: 'klazik schools',
  //   method: req.method,
  //   route: req.originalUrl,
  //   status_code: 200,
  //   user_id: req.user?.userId,
  //   user_role: req.user?.userRole,
  //   ip: req.ip || 'unknown',
  //   duration_ms: duration,
  //   stack: undefined,
  //   school_id: req.user?.school_id
  //     ? new mongoose.Types.ObjectId(req.user.school_id)
  //     : undefined,
  // };

  // await saveLog(savelogPayload);

  return res.status(201).json({
    message: `fees added successfully`,
    success: true,
    status: 201,
    fees: result,
  });
});

const addOptionalFeeDuringTerm = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { fee_name, applicable_classes, amount, receiving_acc_id, term } =
    req.body;

  if (!receiving_acc_id) {
    throw new AppError(
      'Please choose an account number that the fee is going to be paid into.',
      400
    );
  }

  const requiredFields = {
    fee_name,
    applicable_classes,
    amount,
    term,
  };
  const missingField = Object.entries(requiredFields).find(
    ([key, value]) => !value
  );

  if (missingField) {
    throw new AppError(
      `Please provide ${missingField[0].replace('_', ' ')} to proceed.`,
      400
    );
  }

  const validateInput = optionalFeesValidation(amount, fee_name);

  if (validateInput.error) {
    throw new AppError(`${validateInput.error}`, 400);
  }

  const { success, value } = validateInput;

  const payload = {
    fee_name: value.fee_name,
    applicable_classes,
    amount: value.amount,
    receiving_acc_id,
    term,
  };

  const result = await optionalFeesAddition(payload);

  if (!result) {
    throw new AppError('Unable to create fees.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: `fees added successfully`,
  //   service: 'klazik schools',
  //   method: req.method,
  //   route: req.originalUrl,
  //   status_code: 200,
  //   user_id: req.user?.userId,
  //   user_role: req.user?.userRole,
  //   ip: req.ip || 'unknown',
  //   duration_ms: duration,
  //   stack: undefined,
  //   school_id: req.user?.school_id
  //     ? new mongoose.Types.ObjectId(req.user.school_id)
  //     : undefined,
  // };

  // await saveLog(savelogPayload);

  return res.status(201).json({
    message: `fees added successfully`,
    success: true,
    status: 201,
    fees: result,
  });
});

const getSchoolFees = catchErrors(async (req, res) => {
  // const start = Date.now();

  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const session =
    typeof req.query.session === 'string' ? req.query.session : '';
  const term = typeof req.query.term === 'string' ? req.query.term : '';

  const searchQuery =
    typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

  const result = await fetchSchoolFees(page, limit, searchQuery, session, term);

  if (!result) {
    throw new AppError('Unable to fetch fees.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'School fees fetched successfully.',
  //   service: 'klazik schools',
  //   method: req.method,
  //   route: req.originalUrl,
  //   status_code: 200,
  //   user_id: req.user?.userId,
  //   user_role: req.user?.userRole,
  //   ip: req.ip || 'unknown',
  //   duration_ms: duration,
  //   stack: undefined,
  //   school_id: req.user?.school_id
  //     ? new mongoose.Types.ObjectId(req.user.school_id)
  //     : undefined,
  // };

  // await saveLog(savelogPayload);

  return res.status(200).json({
    message: 'School fees fetched successfully.',
    success: true,
    status: 200,
    school_fees: result,
  });
});

const getTermFees = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { academic_session_id, term } = req.params;

  if (!academic_session_id) {
    throw new AppError('Please provide academic session ID to proceed.', 400);
  }

  if (!term) {
    throw new AppError('Please provide term to proceed.', 400);
  }

  const result = await fetchTermFees(academic_session_id, term);

  if (!result) {
    throw new AppError('Unable to fetch fees.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Fees fetched successfully.',
  //   service: 'klazik schools',
  //   method: req.method,
  //   route: req.originalUrl,
  //   status_code: 200,
  //   user_id: req.user?.userId,
  //   user_role: req.user?.userRole,
  //   ip: req.ip || 'unknown',
  //   duration_ms: duration,
  //   stack: undefined,
  //   school_id: req.user?.school_id
  //     ? new mongoose.Types.ObjectId(req.user.school_id)
  //     : undefined,
  // };

  // await saveLog(savelogPayload);

  return res.status(200).json({
    message: 'Fees fetched successfully.',
    success: true,
    status: 200,
    school_fees: result,
  });
});

const getAllMandatoryFees = catchErrors(async (req, res) => {
  // const start = Date.now();

  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const session =
    typeof req.query.session === 'string' ? req.query.session : '';
  const term = typeof req.query.term === 'string' ? req.query.term : '';

  const searchQuery =
    typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

  const result = await fetchAllMandatoryFees(
    page,
    limit,
    searchQuery,
    session,
    term
  );

  if (!result) {
    throw new AppError('Unable to fetch fees.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Mandatory fees fetched successfully.',
  //   service: 'klazik schools',
  //   method: req.method,
  //   route: req.originalUrl,
  //   status_code: 200,
  //   user_id: req.user?.userId,
  //   user_role: req.user?.userRole,
  //   ip: req.ip || 'unknown',
  //   duration_ms: duration,
  //   stack: undefined,
  //   school_id: req.user?.school_id
  //     ? new mongoose.Types.ObjectId(req.user.school_id)
  //     : undefined,
  // };

  // await saveLog(savelogPayload);

  return res.status(200).json({
    message: 'Mandatory fees fetched successfully.',
    success: true,
    status: 200,
    mandatory_fees: result,
  });
});

const getAllOptionalFees = catchErrors(async (req, res) => {
  // const start = Date.now();

  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const session =
    typeof req.query.session === 'string' ? req.query.session : '';
  const term = typeof req.query.term === 'string' ? req.query.term : '';

  const searchQuery =
    typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

  const result = await fetchAllOptionalFees(
    page,
    limit,
    searchQuery,
    session,
    term
  );

  if (!result) {
    throw new AppError('Unable to fetch fees.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Optional fees fetched successfully.',
  //   service: 'klazik schools',
  //   method: req.method,
  //   route: req.originalUrl,
  //   status_code: 200,
  //   user_id: req.user?.userId,
  //   user_role: req.user?.userRole,
  //   ip: req.ip || 'unknown',
  //   duration_ms: duration,
  //   stack: undefined,
  //   school_id: req.user?.school_id
  //     ? new mongoose.Types.ObjectId(req.user.school_id)
  //     : undefined,
  // };

  // await saveLog(savelogPayload);

  return res.status(200).json({
    message: 'Optional fees fetched successfully.',
    success: true,
    status: 200,
    optional_fees: result,
  });
});

const getTermMandatoryFees = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { academic_session_id, term } = req.params;

  if (!academic_session_id) {
    throw new AppError('Please provide academic session ID to proceed.', 400);
  }

  if (!term) {
    throw new AppError('Please provide term to proceed.', 400);
  }

  const result = await fetchTermMandatoryFees(academic_session_id, term);

  if (!result) {
    throw new AppError('Unable to fetch mandatory fees for this term.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Mandatory fees fetched successfully.',
  //   service: 'klazik schools',
  //   method: req.method,
  //   route: req.originalUrl,
  //   status_code: 200,
  //   user_id: req.user?.userId,
  //   user_role: req.user?.userRole,
  //   ip: req.ip || 'unknown',
  //   duration_ms: duration,
  //   stack: undefined,
  //   school_id: req.user?.school_id
  //     ? new mongoose.Types.ObjectId(req.user.school_id)
  //     : undefined,
  // };

  // await saveLog(savelogPayload);

  return res.status(200).json({
    message: 'Mandatory fees fetched successfully.',
    success: true,
    status: 200,
    mandatory_fees: result,
  });
});

const getTermOptionalFees = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { academic_session_id, term } = req.params;

  if (!academic_session_id) {
    throw new AppError('Please provide academic session ID to proceed.', 400);
  }

  if (!term) {
    throw new AppError('Please provide term to proceed.', 400);
  }

  const result = await fetchTermOptionalFees(academic_session_id, term);

  if (!result) {
    throw new AppError('Unable to fetch optional fees for this term.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Optional fees fetched successfully.',
  //   service: 'klazik schools',
  //   method: req.method,
  //   route: req.originalUrl,
  //   status_code: 200,
  //   user_id: req.user?.userId,
  //   user_role: req.user?.userRole,
  //   ip: req.ip || 'unknown',
  //   duration_ms: duration,
  //   stack: undefined,
  //   school_id: req.user?.school_id
  //     ? new mongoose.Types.ObjectId(req.user.school_id)
  //     : undefined,
  // };

  // await saveLog(savelogPayload);

  return res.status(200).json({
    message: 'Optional fees fetched successfully.',
    success: true,
    status: 200,
    optional_fees: result,
  });
});

const updateSchoolFeesById = catchErrors(async (req, res) => {});
const getSchoolBusByGroup = catchErrors(async (req, res) => {});
const getSchoolBus = catchErrors(async (req, res) => {});

export {
  getSchoolFees,
  addMandatoryFeeDuringTerm,
  addOptionalFeeDuringTerm,
  createSchoolFees,
  updateSchoolFeesById,
  getAllSchoolFeesPerTerm,
  createOptionalFees,
  createMandatoryFees,
  getASchoolFeeById,
  getASchoolFeeByLevelAndTerm,
  getSchoolBusByGroup,
  getSchoolBus,
  getTermFees,
  getAllMandatoryFees,
  getAllOptionalFees,
  getTermMandatoryFees,
  getTermOptionalFees,
};
