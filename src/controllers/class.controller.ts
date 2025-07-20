// import {
//   classCreation,
//   fetchAClassById,
//   fetchAllClasses,
// } from '../services/class.service';
// import { AppError, JoiError } from '../utils/app.error';
// import catchErrors from '../utils/tryCatch';
// import { joiValidation } from '../utils/validation';

// const createAClass = catchErrors(async (req, res) => {
//   const { name, description, level, arms, compulsory_subjects, section } =
//     req.body;

//   const payload = { name, description, level, section };

//   const result = joiValidation(payload, 'create-class');

//   if (!result) {
//     throw new JoiError('Error validating class creation');
//   }

//   const { success, value } = result;

//   const param = {
//     name,
//     description: value.description.toLowerCase(),
//     level,
//     arms,
//     compulsory_subjects,
//     section,
//   };
//   const info = await classCreation(param);

//   if (!info) {
//     throw new AppError('Error creating class', 400);
//   }

//   return res.status(200).json({
//     message: 'Class created successfully',
//     success: true,
//     status: 200,
//     class: info,
//   });
// });

// const getAllClasses = catchErrors(async (req, res) => {
//   const info = await fetchAllClasses();

//   if (!info) {
//     throw new AppError('Error fetching classes', 400);
//   }

//   return res.status(200).json({
//     length: info.length,
//     message: 'Classes fetched successfully',
//     success: true,
//     status: 200,
//     classes: info,
//   });
// });

// const getAClassById = catchErrors(async (req, res) => {
//   const { class_id } = req.params;
//   const info = await fetchAClassById(class_id);

//   if (!info) {
//     throw new AppError('Error fetching classes', 400);
//   }

//   return res.status(200).json({
//     message: 'Class fetched successfully',
//     success: true,
//     status: 200,
//     class: info,
//   });
// });

// export { createAClass, getAllClasses, getAClassById };

//////////////////////////////////////
import mongoose from 'mongoose';
import {
  classCreation,
  fetchAClassById,
  fetchAllClasses,
  subjectsAdditionToAClass,
  subjectsRemovalFromClass,
  fetchMySchoolClassLevel,
} from '../services/class.service';
import { AppError, JoiError } from '../utils/app.error';
import catchErrors from '../utils/tryCatch';
import { joiValidation } from '../utils/validation';
// import { saveLog } from '../logs/log.service';

// UPDATING CLASS TO ADD OR REMOVE SUBJECT FROM A CLASS WILL ONLY BE POSSIBLE WHEN THERE IS NO ACTIVE ENROLLMENT

const createAClass = catchErrors(async (req, res) => {
  // const start = Date.now();

  // REMOVE STREAMS AND OPTIONAL SUBJECTS
  const {
    name,
    description,
    level,
    arms,
    // streams,
    compulsory_subjects,
    // optional_subjects,
    section,
  } = req.body;

  console.log('req.body:', req.body);

  const payload = { name, description, level, section };

  const result = joiValidation(payload, 'create-class');

  if (!result) {
    throw new JoiError('Error validating class creation');
  }

  const { success, value } = result;

  const param = {
    name,
    description: value.description.toLowerCase(),
    level,
    // arms,
    // streams,
    compulsory_subjects,
    // optional_subjects,
    section,
  };
  const info = await classCreation(param);

  if (!info) {
    throw new AppError('Error creating class', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Class created successfully',
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
    message: 'Class created successfully',
    success: true,
    status: 201,
    class: info,
  });
});

const getAllClasses = catchErrors(async (req, res) => {
  // const start = Date.now();

  const info = await fetchAllClasses();

  if (!info) {
    throw new AppError('Error fetching classes', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Classes fetched successfully',
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
    length: info.length,
    message: 'Classes fetched successfully',
    success: true,
    status: 200,
    classes: info,
  });
});

const getAClassById = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { class_id } = req.params;

  const info = await fetchAClassById({ class_id });

  if (!info) {
    throw new AppError('Error fetching classes', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Class fetched successfully',
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
    message: 'Class fetched successfully',
    success: true,
    status: 200,
    class: info,
  });
});

const addSubjectsToAClass = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { subject_ids_array } = req.body;
  const { class_id } = req.params;

  if (!class_id) {
    throw new AppError('Class ID is required.', 400);
  }

  if (!subject_ids_array || subject_ids_array.length === 0) {
    throw new AppError(
      'Please select subjects that you want to add to this class.',
      400
    );
  }

  const payload = {
    class_id,
    subject_ids_array,
  };

  const result = await subjectsAdditionToAClass(payload);

  if (!result) {
    throw new AppError('Unable to add subjects to this class.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Subjects added to class successfully.',
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
    message: 'Subjects added to class successfully.',
    success: true,
    status: 200,
    class: result,
  });
});

const removeSubjectsToAClass = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { subject_ids_array } = req.body;
  const { class_id } = req.params;

  if (!class_id) {
    throw new AppError('Class ID is required.', 400);
  }

  if (!subject_ids_array || subject_ids_array.length === 0) {
    throw new AppError(
      'Please select subjects that you want to remove to this class.',
      400
    );
  }

  const payload = {
    class_id,
    subject_ids_array,
  };

  const result = await subjectsRemovalFromClass(payload);

  if (!result) {
    throw new AppError('Unable to remove subjects from this class.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Subjects removed from class successfully.',
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
    message: 'Subjects removed from class successfully.',
    success: true,
    status: 200,
    class: result,
  });
});

const getSchoolClassLevel = catchErrors(async (req, res) => {
  // const start = Date.now();

  const result = await fetchMySchoolClassLevel();

  if (!result) {
    throw new AppError('Unable to fetch class level.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Class level fetched successfully.',
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
    message: 'Class level fetched successfully.',
    success: true,
    status: 200,
    class_level: result,
  });
});

export {
  getSchoolClassLevel,
  removeSubjectsToAClass,
  addSubjectsToAClass,
  createAClass,
  getAClassById,
  getAllClasses,
};
