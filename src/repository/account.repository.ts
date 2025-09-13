import {
  partyRoleEnum,
  transactionChannelEnum,
  transactionStatusEnum,
  transactionTypeEnum,
} from '../constants/enum';
import { CreditAccountPayloadType } from '../constants/types';
import StudentAccount from '../models/student_account.model';
import Student from '../models/students.model';
import { Transaction } from '../models/transaction.model';
import { AppError } from '../utils/app.error';
import { normalizeAmount } from '../utils/functions';

const creditStudentAccount = async (payload: CreditAccountPayloadType) => {
  try {
    const {
      type,
      student_email,
      sessionID,
      nameEnquiryRef,
      beneficiaryAccountName,
      beneficiaryAccountNumber,
      originatorAccountName,
      originatorAccountNumber,
      narration,
      paymentReference,
      status,
      amount,
      collectionAccountNumber,
    } = payload;

    const studentExist = await Student.findOne({
      email: student_email,
    });

    if (!studentExist) {
      throw new AppError('Student not found.', 404);
    }

    const studentAccountExist = await StudentAccount.findOne({
      student_id: studentExist._id,
      account_number: beneficiaryAccountNumber,
    });

    if (!studentAccountExist) {
      throw new AppError('Student account not found.', 404);
    }

    const transactionExist = await Transaction.findOne({
      payment_reference: paymentReference,
    });

    if (transactionExist) {
      throw new AppError(
        `Transaction with paymentReference: ${paymentReference} has already been recorded.`,
        400
      );
    } else {
      const formattedAmount = normalizeAmount(amount);
      studentAccountExist.account_balance += formattedAmount;
      await studentAccountExist.save();

      const newTransaction = new Transaction({
        account: beneficiaryAccountNumber,
        student: studentAccountExist.account_name,
        type: transactionTypeEnum[0],
        amount: formattedAmount,
        narration: narration,
        status: transactionStatusEnum[1],
        payment_reference: paymentReference,
        party: {
          name: originatorAccountName,
          account_number: originatorAccountNumber,
          role: partyRoleEnum[0],
        },
        balance_after: studentAccountExist.account_balance,
        channel: transactionChannelEnum[0],
      });

      await newTransaction.save();

      return newTransaction;
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.error(error);
      throw new Error('Something happened');
    }
  }
};

export { creditStudentAccount };
