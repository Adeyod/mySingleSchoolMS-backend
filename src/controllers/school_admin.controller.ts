import { AppError } from '../utils/app.error';
import catchErrors from '../utils/tryCatch';
import {
  fetchAdminByAdminId,
  fetchAllAdmins,
  fetchMySchoolSummary,
} from '../services/school_admin.service';
import mongoose from 'mongoose';

const getAllAdmins = catchErrors(async (req, res) => {
  const result = await fetchAllAdmins();

  if (!result) {
    throw new AppError('Unable to get admin of school.', 400);
  }

  return res.status(200).json({
    message: 'Admin fetched successfully.',
    success: true,
    status: 200,
    school_admin: result,
  });
});

const getAdminByAdminId = catchErrors(async (req, res) => {
  const { admin_id } = req.params;

  const result = await fetchAdminByAdminId(admin_id);

  if (!result) {
    throw new AppError('Unable to get admin of school.', 400);
  }

  return res.status(200).json({
    message: 'Admin fetched successfully.',
    success: true,
    status: 200,
    school_admin: result,
  });
});

const getMySchoolSummary = catchErrors(async (req, res) => {
  const userRole = req.user?.userRole;

  if (!userRole) {
    throw new AppError(
      'This endpoint is only accessible to school owners and school admins.',
      400
    );
  }

  const result = await fetchMySchoolSummary(userRole);

  if (!result) {
    throw new AppError('Unable to get school users summary.', 400);
  }

  return res.status(200).json({
    message: 'School summary fetched successfully.',
    success: true,
    status: 200,
    school_summary: result,
  });
});

export { getMySchoolSummary, getAllAdmins, getAdminByAdminId };
