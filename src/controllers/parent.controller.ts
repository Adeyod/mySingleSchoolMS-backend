// import {
//   getManyStudentDetails,
//   getStudentDetails,
//   fetchAllParents,
//   fetchParentById,
// } from '../services/parent.service';
// import { AppError } from '../utils/app.error';
// import catchErrors from '../utils/tryCatch';

// const fetchALinkedStudent = catchErrors(async (req, res) => {
//   const { student_id } = req.params;
//   if (!student_id) {
//     throw new AppError('Student ID is required to fetch student details.', 404);
//   }
//   const parent_id = req.user?.userId;

//   if (!parent_id) {
//     throw new AppError('Parent ID is required to fetch student details.', 404);
//   }

//   const response = await getStudentDetails(student_id, parent_id);

//   if (!response) {
//     throw new AppError('Unable to get student details.', 404);
//   }

//   return res.status(200).json({
//     message: 'Student details fetched successfully',
//     success: true,
//     status: 200,
//     student: response,
//   });
// });

// const fetchAllLinkedStudents = catchErrors(async (req, res) => {
//   const { parent_id } = req.params;

//   const userId = req.user?.userId;
//   if (!parent_id) {
//     throw new AppError('Parent ID is required to fetch student details.', 404);
//   }

//   if (userId && userId.toString() !== parent_id) {
//     throw new AppError(`ID passed does not match the current user ID.`, 400);
//   }

//   const result = await getManyStudentDetails(parent_id);

//   if (!result) {
//     throw new AppError('Unable to get students details.', 404);
//   }

//   return res.status(200).json({
//     message: 'Students details fetched successfully',
//     success: true,
//     status: 200,
//     students: result,
//   });
// });

// const getParentById = catchErrors(async (req, res) => {
//   const { parent_id } = req.params;
//   if (!parent_id) {
//     throw new AppError('Parent ID is required.', 404);
//   }

//   const userId = req.user?.userId;
//   const userRole = req.user?.userRole;

//   if (!userId) {
//     throw new AppError('Please login to proceed.', 404);
//   }

//   if (userRole === 'parent') {
//     if (userId.toString() !== parent_id) {
//       throw new AppError('You are only allowed to view your own account.', 400);
//     }
//   }

//   const response = await fetchParentById(parent_id);

//   if (!response) {
//     throw new AppError('Unable to get parent.', 404);
//   }

//   return res.status(200).json({
//     message: 'Parent fetched successfully',
//     success: true,
//     status: 200,
//     parent: response,
//   });
// });

// const getAllParents = catchErrors(async (req, res) => {
//   const page = req.query.page ? Number(req.query.page) : undefined;
//   const limit = req.query.limit ? Number(req.query.limit) : undefined;

//   const searchQuery =
//     typeof req.query.searchParams === 'string' ? req.query.searchParams : '';
//   const result = await fetchAllParents(page, limit, searchQuery);

//   if (!result) {
//     throw new AppError('Unable to get parents.', 404);
//   }

//   return res.status(200).json({
//     message: 'Parents fetched successfully',
//     success: true,
//     status: 200,
//     parents: result,
//   });
// });

// const getAllChildResults = catchErrors(async (req, res) => {});

// export {
//   getAllChildResults,
//   fetchALinkedStudent,
//   fetchAllLinkedStudents,
//   getParentById,
//   getAllParents,
// };

//////////////////////////////////////////
import mongoose from 'mongoose';
import {
  fetchAllParents,
  fetchParentById,
  getManyStudentDetails,
  getStudentDetails,
} from '../services/parent.service';
import { AppError } from '../utils/app.error';
import catchErrors from '../utils/tryCatch';
// import { saveLog } from '../logs/log.service';

const fetchALinkedStudent = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { student_id } = req.params;

  if (!student_id) {
    throw new AppError('Student ID is required to fetch student details.', 404);
  }
  const parent_id = req.user?.userId;

  if (!parent_id) {
    throw new AppError('Parent ID is required to fetch student details.', 404);
  }

  const response = await getStudentDetails(student_id, parent_id);

  if (!response) {
    throw new AppError('Unable to get student details.', 404);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Student details fetched successfully',
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
    message: 'Student details fetched successfully',
    success: true,
    status: 200,
    student: response,
  });
});

const fetchAllLinkedStudents = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { parent_id } = req.params;

  const userId = req.user?.userId;
  if (!parent_id) {
    throw new AppError('Parent ID is required to fetch student details.', 404);
  }

  if (userId && userId.toString() !== parent_id) {
    throw new AppError(`ID passed does not match the current user ID.`, 400);
  }

  const result = await getManyStudentDetails(parent_id);

  if (!result) {
    throw new AppError('Unable to get students details.', 404);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Students details fetched successfully',
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
    message: 'Students details fetched successfully',
    success: true,
    status: 200,
    students: result,
  });
});

const getParentById = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { parent_id } = req.params;

  if (!parent_id) {
    throw new AppError('Parent ID is required.', 404);
  }

  const userId = req.user?.userId;
  const userRole = req.user?.userRole;

  if (!userId) {
    throw new AppError('Please login to proceed.', 404);
  }

  if (userRole === 'parent') {
    if (userId.toString() !== parent_id) {
      throw new AppError('You are only allowed to view your own account.', 400);
    }
  }

  const response = await fetchParentById(parent_id);

  if (!response) {
    throw new AppError('Unable to get parent.', 404);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Parent fetched successfully',
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
    message: 'Parent fetched successfully',
    success: true,
    status: 200,
    parent: response,
  });
});

const getAllParents = catchErrors(async (req, res) => {
  // const start = Date.now();

  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const searchQuery =
    typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

  const result = await fetchAllParents(page, limit, searchQuery);

  if (!result) {
    throw new AppError('Unable to get parents.', 404);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Parents fetched successfully',
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

  console.log('Parents:', result);

  return res.status(200).json({
    message: 'Parents fetched successfully',
    success: true,
    status: 200,
    parents: result,
  });
});

const getAllChildResults = catchErrors(async (req, res) => {});

export {
  fetchALinkedStudent,
  fetchAllLinkedStudents,
  getParentById,
  getAllParents,
  getAllChildResults,
};
