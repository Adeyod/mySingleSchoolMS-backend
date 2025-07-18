import axios from 'axios';
import { Request, Response } from 'express';
import { AccountType, StudentWalletObjType } from '../constants/types';

const bankWebhook = async (req: Request, res: Response) => {
  try {
    // Process wallet deposit here provided bank return is successful.

    // Also check if the student has outstanding payment and use
    // it to pay for the outstanding fee.
    // If no outstanding, check if there is payment document for
    // the student and pay for the fees there.
    // THE OTHER THING TO DO IS TO PROCESS PAYMENT ALSO WHEN
    // PAYMENT DOCUMENT IS CREATED. ALL STUDENTS THAT HAVE MONEY
    // INSIDE THEIR WALLET WILL BE SELECTED AND WE USE THE WALLET
    // BALANCE TO PAY FOR THE FEES THAT IT CAN COVER.
    return res;
  } catch (error) {
    console.log(error);
  }
};

const generateWalletAccountForStudent = async (
  studentObj: StudentWalletObjType
) => {
  try {
    const ACCESS_KEY = '';
    const data = {
      phoneNumber: studentObj.phoneNumber,
      email: studentObj.email,
      nin: studentObj.nin,
    };
    const url = `https://apiplayground.alat.ng/wallet-creation/api/CustomerAccount/GenerateWalletAccountForPartnerships/Request`;
    const response = await axios.post(
      url,
      { data },
      {
        headers: {
          access: ACCESS_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    return response;
  } catch (error) {
    console.log(error);
  }
};

const accountValidationForTransfer = async (
  accountObj: any
  // accountObj: AccountType
) => {
  try {
    const access = 'MY_CHANNEL_ID';
    const accountNumber = accountObj.account_number;

    const url = `https://apiplayground.alat.ng/debit-wallet/api/Shared/AccountNameEnquiry/Wallet/${accountNumber}`;

    const response = await axios.get(url, {
      headers: {
        access: access,
      },
    });

    return response;
  } catch (error) {
    console.log(error);
  }
};

export {
  bankWebhook,
  generateWalletAccountForStudent,
  accountValidationForTransfer,
};

/**
 * FIRST CREATE ACCOUNT FOR EACH STUDENT WHERE MONEY WILL BE
 * TRANSFERRED TO.
 *
 * CREATE A FUNCTION THAT LISTEN TO WEBHOOK FOR ACCOUNT CREDITING
 * SO AS TO BE ABLE TO UPDATE THE WALLET ACCOUNT OF SUCH STUDENT
 * WITH THE AMOUNT CREDITED.
 *
 * PROCESS FEE PAYMENT IMMEDIATELY STUDENT ACCOUNT IS CREDITED
 * PROVIDED THERE IS PAYMENT DOCUMENT FOR THE STUDENT THAT THE
 * is_payment_complete IS FALSE
 *
 * FOR SITUATION WHERE THERE IS NO OUTSTANDING FEE NOR THERE IS
 * NO PAYMENT DOCUMENT FOR THE CURRENT TERM YET AND MONEY IS
 * CREDITED, WE NEED TO PROCESS FEE PAYMENT IMMEDIATELY PAYMENT
 * DOCUMENT IS CREATED. AS SUCH WHEN PAYMENT DOCUMENT IS CREATED,
 * WE FETCH STUDENTS THAT THEIR WALLET ACCOUNT BALANCE IS NOT 0
 * AND PROCESS THEIR FEE PAYMENT
 *
 */
