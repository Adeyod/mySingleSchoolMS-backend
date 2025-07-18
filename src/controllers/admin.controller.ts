import { AppError } from '../utils/app.error';
import catchErrors from '../utils/tryCatch';
import {
  fetchAdminByAdminId,
  fetchAllAdmins,
  fetchMySchoolSummary,
} from '../services/admin.service';
// import mongoose from 'mongoose';
// import { saveLog } from '../logs/log.service';

const getAllAdmins = catchErrors(async (req, res) => {
  // const start = Date.now();

  const result = await fetchAllAdmins();

  if (!result) {
    throw new AppError('Unable to get admin of school.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'School admin fetched successfully.',
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
    message: 'School admin fetched successfully.',
    success: true,
    status: 200,
    admin: result,
  });
});

const getAdminByAdminId = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { admin_id } = req.params;

  const result = await fetchAdminByAdminId(admin_id);

  if (!result) {
    throw new AppError('Unable to get admin of school.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'School admin fetched successfully.',
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
    message: 'School admin fetched successfully.',
    success: true,
    status: 200,
    admin: result,
  });
});

const getMySchoolSummary = catchErrors(async (req, res) => {
  // const start = Date.now();

  const userRole = req.user?.userRole;

  if (!userRole) {
    throw new AppError('Please login to continue.', 400);
  }
  const result = await fetchMySchoolSummary(userRole);

  if (!result) {
    throw new AppError('Unable to get school users summary.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'School summary fetched successfully.',
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
    message: 'School summary fetched successfully.',
    success: true,
    status: 200,
    summary: result,
  });
});

export { getMySchoolSummary, getAllAdmins, getAdminByAdminId };
