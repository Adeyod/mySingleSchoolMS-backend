import { AccountDetailsType } from '../constants/types';
import SchoolAccount from '../models/school_account.model';
import { AppError } from '../utils/app.error';
import { maxSchoolAccountNumbers } from '../utils/code';

const schoolAccountsCreation = async (payload: AccountDetailsType) => {
  try {
    const { account_details_array } = payload;

    const schoolAccountExist = await SchoolAccount.findOne();

    const uniqueAccounts = new Set();
    const duplicateAccount = new Set();

    account_details_array.forEach((account) => {
      const key = `${account.account_number}-${account.bank_name}`;
      if (uniqueAccounts.has(key)) {
        duplicateAccount.add(key);
      } else {
        uniqueAccounts.add(key);
      }
    });

    if (duplicateAccount.size > 0) {
      throw new AppError(
        `Duplicate accounts found: ${Array.from(duplicateAccount).join(', ')}`,
        400
      );
    }

    let accounts;

    if (schoolAccountExist) {
      const schoolAccountLength = schoolAccountExist?.accounts.length;
      if (schoolAccountLength === maxSchoolAccountNumbers) {
        throw new AppError(
          `A school can only have maximum of ${maxSchoolAccountNumbers} accounts.`,
          400
        );
      }

      if (
        schoolAccountLength + account_details_array.length >
        maxSchoolAccountNumbers
      ) {
        throw new AppError(
          `A school can only have maximum of ${maxSchoolAccountNumbers} accounts.`,
          400
        );
      }

      const existingAccountNumber = schoolAccountExist.accounts.filter(
        (account) => {
          return account_details_array.some(
            (a) =>
              a.account_number === account.account_number &&
              a.bank_name === account.bank_name
          );
        }
      );

      console.log('existingAccountNumber:', existingAccountNumber);
      if (existingAccountNumber.length > 0) {
        const accNumbers = existingAccountNumber.map((r) => r.account_number);
        throw new AppError(
          `The following account numbers: ${accNumbers.join(
            ', '
          )} already exist.`,
          400
        );
      }

      schoolAccountExist.accounts.push(...account_details_array);
      accounts = await schoolAccountExist.save();
    } else {
      const newSchoolAccounts = await new SchoolAccount({
        accounts: account_details_array,
      }).save();
      accounts = newSchoolAccounts;
    }

    return accounts;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened');
    }
  }
};

const fetchMySchoolAccounts = async () => {
  try {
    const schoolAccountExist = await SchoolAccount.findOne();

    if (!schoolAccountExist) {
      throw new AppError('Account does not exists.', 404);
    }

    return schoolAccountExist;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened');
    }
  }
};

export { schoolAccountsCreation, fetchMySchoolAccounts };
