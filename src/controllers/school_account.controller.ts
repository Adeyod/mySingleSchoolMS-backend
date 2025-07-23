import mongoose from 'mongoose';
import {
  fetchMySchoolAccounts,
  schoolAccountsCreation,
} from '../services/school_account.service';
import { AppError } from '../utils/app.error';
import { maxSchoolAccountNumbers } from '../utils/code';
import catchErrors from '../utils/tryCatch';
import { joiAccountArrayValidation } from '../utils/validation';

const createSchoolAccounts = catchErrors(async (req, res) => {
  const { account_details_array } = req.body;

  if (!account_details_array || account_details_array.length === 0) {
    throw new AppError('Account details is required.', 400);
  }

  if (account_details_array.length > maxSchoolAccountNumbers) {
    throw new AppError(
      `A school can only have ${maxSchoolAccountNumbers} accounts.`,
      400
    );
  }

  const accountArrayValidation = joiAccountArrayValidation(
    account_details_array
  );

  if (!accountArrayValidation) {
    throw new AppError('Unable to validate priority order.', 400);
  }

  const { success, value } = accountArrayValidation;
  console.log('value:', value);

  const payload = {
    account_details_array,
  };

  const result = await schoolAccountsCreation(payload);

  if (!result) {
    throw new AppError('Unable to create school accounts document.', 400);
  }

  return res.status(201).json({
    message: 'School accounts created successfully',
    success: true,
    status: 201,
    school_accounts: result,
  });
});

const getMySchoolAccounts = catchErrors(async (req, res) => {
  const result = await fetchMySchoolAccounts();

  if (!result) {
    throw new AppError('Unable to get school accounts.', 400);
  }

  return res.status(200).json({
    message: 'School accounts fetched successfully.',
    success: true,
    status: 200,
    accounts: result,
  });
});

export { createSchoolAccounts, getMySchoolAccounts };
