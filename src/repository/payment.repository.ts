// import { paymentStatusEnum } from '../constants/enum';
// import { PaystackPayloadType, StudentFeePaymentType } from '../constants/types';
// import Payment from '../models/payment.model';
// import Session from '../models/session.model';
// import Student from '../models/students.model';
// import { AppError } from '../utils/app.error';

// const calculateAndUpdateStudentPaymentDocuments = async (
//   payload: StudentFeePaymentType
// ) => {
//   try {
//     const studentDoc = await Student.findById({ _id: payload.student_id });

//     if (!studentDoc) {
//       throw new AppError('Student not found.', 404);
//     }

//     // Ensure outstanding_balance is defined
//     studentDoc.outstanding_balance = studentDoc.outstanding_balance ?? 0;

//     const termOrder = ['first_term', 'second_term', 'third_term'];

//     // Fetch all overdue payments (those from previous terms)
//     const overduePayments = await Payment.find({
//       student: payload.student_id,
//       remaining_amount: { $gt: 0 },
//       term: { $ne: payload.term }, // exclude the current term
//     });
//     // .sort({ session: 1, term: 1 });

//     overduePayments.sort((a, b) => {
//       if (a.session !== b.session) {
//         return a.session.toString().localeCompare(b.session.toString());
//       }

//       return termOrder.indexOf(a.term) - termOrder.indexOf(b.term);
//     });

//     let remainingAmountToPay = payload.amount_paying;

//     // Process overdue payments if any exist
//     if (overduePayments.length > 0) {
//       for (const payment of overduePayments) {
//         if (remainingAmountToPay <= 0) break;
//         console.log('this is the point here');

//         const remaining_amount = payment.remaining_amount ?? 0;

//         // If the remaining amount to pay is more than or equal to the overdue payment
//         if (remainingAmountToPay >= remaining_amount) {
//           // Pay off the full overdue balance
//           remainingAmountToPay -= remaining_amount;

//           studentDoc.outstanding_balance -= remaining_amount; // Deduct from outstanding balance
//           payment.remaining_amount = 0; // Mark this payment as complete
//           payment.is_payment_complete = true;
//         } else {
//           // Partial payment towards overdue balance
//           payment.remaining_amount = remaining_amount - remainingAmountToPay;

//           studentDoc.outstanding_balance -= remainingAmountToPay; // Deduct from outstanding balance
//           remainingAmountToPay = 0; // Fully used
//         }

//         await payment.save();
//       }
//     }

//     // If there's still remaining amount to pay, pay for the current term
//     if (remainingAmountToPay > 0) {
//       const currentTermPayment = await Payment.findOne({
//         student: payload.student_id,
//         session: payload.session_id,
//         term: payload.term,
//       });
//       console.log('currentTermPayment', currentTermPayment);

//       if (!currentTermPayment) {
//         throw new AppError('No payment record found for the current term', 404);
//       }

//       if (currentTermPayment.is_payment_complete) {
//         throw new AppError(
//           'Payment for this term has already been completed.',
//           400
//         );
//       }

//       if (!currentTermPayment.remaining_amount) {
//         throw new AppError('Remaining amount field is null.', 400);
//       }
//       console.log('i get here');

//       if (remainingAmountToPay > currentTermPayment.remaining_amount) {
//         throw new AppError(
//           'Amount planning to pay is more than what you are expected to pay for this term.',
//           400
//         );
//       }

//       // Pay for the current term with any remaining balance
//       currentTermPayment.remaining_amount -= remainingAmountToPay;
//       console.log(
//         'currentTermPayment.remaining_amount',
//         currentTermPayment.remaining_amount
//       );

//       if (currentTermPayment.remaining_amount <= 0) {
//         currentTermPayment.is_payment_complete = true;
//         console.log(
//           'currentTermPayment.is_payment_complete',
//           currentTermPayment.is_payment_complete
//         );
//         currentTermPayment.remaining_amount = 0;
//       }

//       console.log('currentTermPayment saving');
//       await currentTermPayment.save();
//     }

//     // Save the updated student document
//     await studentDoc.save();
//     console.log('studentDoc saving');

//     return { message: 'Payment successfully processed' };
//   } catch (error) {
//     if (error instanceof AppError) {
//       console.log('AppError', error);
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.error(error);
//       throw new Error('Something happened.');
//     }
//   }
// };

// const calculateAndUpdateStudentPaymentDocuments = async (
//   payload: StudentFeePaymentType
// ) => {
//   try {
//     const studentDoc = await Student.findById({ _id: payload.student_id });

//     if (!studentDoc) {
//       throw new AppError('Student not found.', 404);
//     }

//     // Ensure outstanding_balance is defined
//     studentDoc.outstanding_balance = studentDoc.outstanding_balance ?? 0;

//     const termOrder = ['first_term', 'second_term', 'third_term'];

//     // Fetch and sort overdue payments by session and term
//     const overduePayments = await Payment.find({
//       student: payload.student_id,
//       remaining_amount: { $gt: 0 },
//       term: { $ne: payload.term }, // exclude the current term
//     });

//     overduePayments.sort((a, b) => {
//       // Sort by session first
//       if (a.session !== b.session) {
//         return a.session.toString().localeCompare(b.session.toString());
//       }
//       // Then sort by term order
//       return termOrder.indexOf(a.term) - termOrder.indexOf(b.term);
//     });

//     let remainingAmountToPay = payload.amount_paying;

//     // Process overdue payments
//     for (const payment of overduePayments) {
//       if (remainingAmountToPay <= 0) break;

//       const remainingAmount = payment.remaining_amount ?? 0;

//       if (remainingAmountToPay >= remainingAmount) {
//         // Full payment for this term
//         remainingAmountToPay -= remainingAmount;
//         studentDoc.outstanding_balance -= remainingAmount;
//         payment.remaining_amount = 0;
//         payment.is_payment_complete = true;
//       } else {
//         // Partial payment for this term
//         payment.remaining_amount = remainingAmount - remainingAmountToPay;
//         studentDoc.outstanding_balance -= remainingAmountToPay;
//         remainingAmountToPay = 0;
//       }

//       await payment.save();
//     }

//     // Handle payment for the current term if there's remaining amount
//     if (remainingAmountToPay > 0) {
//       const currentTermPayment = await Payment.findOne({
//         student: payload.student_id,
//         session: payload.session_id,
//         term: payload.term,
//       });

//       if (!currentTermPayment) {
//         throw new AppError('No payment record found for the current term', 404);
//       }

//       if (currentTermPayment.is_payment_complete) {
//         throw new AppError(
//           'Payment for this term has already been completed.',
//           400
//         );
//       }

//       if (!currentTermPayment.remaining_amount) {
//         throw new AppError('Remaining amount field is null.', 400);
//       }

//       if (remainingAmountToPay > currentTermPayment.remaining_amount) {
//         throw new AppError(
//           'Amount planning to pay is more than what you are expected to pay for this term.',
//           400
//         );
//       }

//       currentTermPayment.remaining_amount -= remainingAmountToPay;

//       if (currentTermPayment.remaining_amount <= 0) {
//         currentTermPayment.is_payment_complete = true;
//         currentTermPayment.remaining_amount = 0;
//       }

//       await currentTermPayment.save();
//     }

//     // Save the updated student document
//     await studentDoc.save();

//     return { message: 'Payment successfully processed' };
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.error(error);
//       throw new Error('Something happened.');
//     }
//   }
// };

// const calculateAndUpdateStudentPaymentDocuments = async (
//   payload: StudentFeePaymentType,
//   payment_type: 'cash' | 'bank' | 'card'
// ) => {
//   try {
//     // Find the student document
//     const studentDoc = await Student.findById({ _id: payload.student_id });

//     console.log('payment_type', payment_type);

//     if (!studentDoc) {
//       throw new AppError('Student not found.', 404);
//     }

//     // Initialize outstanding balance if undefined
//     studentDoc.outstanding_balance = studentDoc.outstanding_balance ?? 0;

//     // Define the term order for sorting
//     const termOrder = ['first_term', 'second_term', 'third_term'];

//     // Fetch overdue payments excluding the current term
//     const overduePayments = await Payment.find({
//       student: payload.student_id,
//       remaining_amount: { $gt: 0 },
//       $or: [
//         { session: { $ne: payload.session_id } },
//         { term: { $ne: payload.term } },
//       ],
//     });

//     console.log('overduePayments:', overduePayments);

//     // Sort overdue payments by session and term
//     overduePayments.sort((a, b) => {
//       // Sort by session first
//       if (a.session !== b.session) {
//         return a.session.toString().localeCompare(b.session.toString());
//       }
//       // Then sort by term order
//       return termOrder.indexOf(a.term) - termOrder.indexOf(b.term);
//     });

//     // Log sorted overdue payments for debugging
//     console.log(
//       'Sorted overdue payments:',
//       overduePayments.map((p) => ({
//         session: p.session,
//         term: p.term,
//         remaining_amount: p.remaining_amount,
//       }))
//     );

//     let remainingAmountToPay = payload.amount_paying;

//     const currentTermPayment = await Payment.findOne({
//       student: payload.student_id,
//       session: payload.session_id,
//       term: payload.term,
//     });

//     if (overduePayments.length === 0) {
//       if (!currentTermPayment) {
//         throw new AppError(
//           'No payment record found for the current term.',
//           404
//         );
//       }

//       if (currentTermPayment.is_payment_complete) {
//         throw new AppError(
//           'Payment for this term has already been completed.',
//           400
//         );
//       }

//       if (!currentTermPayment.remaining_amount) {
//         throw new AppError('Remaining amount field is null.', 400);
//       }

//       if (remainingAmountToPay > currentTermPayment.remaining_amount) {
//         throw new AppError(
//           'Amount planning to pay is more than what is expected for this term.',
//           400
//         );
//       }

//       // Deduct from the current term payment
//       currentTermPayment.remaining_amount -= remainingAmountToPay;

//       const doc = {
//         amount_paid: remainingAmountToPay,
//         date_paid: new Date(),
//         transaction_id: payload.teller_number && payload.teller_number,
//         bank_name: payload.bank_name && payload.bank_name,
//         staff_who_approve:
//           payload.staff_who_approve && payload.staff_who_approve,
//         status: paymentStatusEnum[1],
//         payment_method: payload.payment_method,
//       };
//       currentTermPayment.payment_summary.push(doc);

//       if (payment_type === 'bank' || payment_type === 'card') {
//         currentTermPayment.waiting_for_confirmation.pull(
//           currentTermPayment.waiting_for_confirmation.find(
//             (p) => p.transaction_id === payload.teller_number
//           )
//         );
//       }

//       if (currentTermPayment.remaining_amount <= 0) {
//         currentTermPayment.is_payment_complete = true;
//         currentTermPayment.remaining_amount = 0;
//       }

//       // Save current term payment
//       await currentTermPayment.save();
//       console.log('currentTermPayment:', currentTermPayment);

//       return currentTermPayment;
//     }

//     // Process overdue payments
//     let lastProcessedPayment = null;

//     for (const payment of overduePayments) {
//       if (remainingAmountToPay <= 0) break;

//       // Ensure remaining_amount is defined
//       const remainingAmount = payment.remaining_amount ?? 0;

//       if (remainingAmount > 0) {
//         if (remainingAmountToPay >= remainingAmount) {
//           // Pay off this term fully
//           remainingAmountToPay -= remainingAmount;
//           studentDoc.outstanding_balance -= remainingAmount;
//           payment.remaining_amount = 0;

//           const doc = {
//             amount_paid: remainingAmount,
//             date_paid: new Date(),
//             transaction_id: payload.teller_number && payload.teller_number,
//             status: paymentStatusEnum[1],
//             payment_method: payload.payment_method,
//             bank_name: payload.bank_name && payload.bank_name,
//             staff_who_approve:
//               payload.staff_who_approve && payload.staff_who_approve,
//           };
//           payment.payment_summary.push(doc);
//           payment.is_payment_complete = true;

//         } else {
//           // Partially pay this term
//           payment.remaining_amount = remainingAmount - remainingAmountToPay;

//           const doc = {
//             amount_paid: remainingAmountToPay,
//             date_paid: new Date(),
//             transaction_id: payload.teller_number && payload.teller_number,
//             status: paymentStatusEnum[1],
//             payment_method: payload.payment_method,
//             bank_name: payload.bank_name && payload.bank_name,
//             staff_who_approve:
//               payload.staff_who_approve && payload.staff_who_approve,
//           };
//           payment.payment_summary.push(doc);

//           // payment.remaining_amount -= remainingAmountToPay;
//           studentDoc.outstanding_balance -= remainingAmountToPay;
//           remainingAmountToPay = 0; // Fully utilized
//         }

//         // Save payment after update
//         await payment.save();
//         lastProcessedPayment = payment;
//         if (payment_type === 'bank' || payment_type === 'card') {
//           // FETCH THE PAYMENT info from waiting_for_approval and remove it
//           if (!currentTermPayment) {
//             throw new AppError(
//               'No payment record found for the current term.',
//               404
//             );
//           }

//           currentTermPayment.waiting_for_confirmation.pull(
//             currentTermPayment.waiting_for_confirmation.find(
//               (p) => p.transaction_id === payload.teller_number
//             )
//           );

//           await currentTermPayment.save();
//         }
//         // Log payment updates
//         console.log(
//           `Processed term: ${payment.term}, Remaining amount: ${payment.remaining_amount}`
//         );
//       }
//     }

//     // Handle payment for the current term if there's remaining amount
//     if (remainingAmountToPay > 0) {
//       const currentTermPayment = await Payment.findOne({
//         student: payload.student_id,
//         session: payload.session_id,
//         term: payload.term,
//       });

//       if (!currentTermPayment) {
//         throw new AppError(
//           'No payment record found for the current term.',
//           404
//         );
//       }

//       if (currentTermPayment.is_payment_complete) {
//         throw new AppError(
//           'Payment for this term has already been completed.',
//           400
//         );
//       }

//       if (!currentTermPayment.remaining_amount) {
//         throw new AppError('Remaining amount field is null.', 400);
//       }

//       if (remainingAmountToPay > currentTermPayment.remaining_amount) {
//         throw new AppError(
//           'Amount planning to pay is more than what is expected for this term.',
//           400
//         );
//       }

//       // Deduct from the current term payment
//       currentTermPayment.remaining_amount -= remainingAmountToPay;

//       const doc = {
//         amount_paid: remainingAmountToPay,
//         date_paid: new Date(),
//         transaction_id: payload.teller_number && payload.teller_number,
//         status: paymentStatusEnum[1],
//         payment_method: payload.payment_method,
//         bank_name: payload.bank_name && payload.bank_name,
//         staff_who_approve:
//           payload.staff_who_approve && payload.staff_who_approve,
//       };

//       if (payment_type === 'bank' || payment_type === 'card') {
//         currentTermPayment.waiting_for_confirmation.pull(
//           currentTermPayment.waiting_for_confirmation.find(
//             (p) => p.transaction_id === payload.teller_number
//           )
//         );
//       }

//       currentTermPayment.payment_summary.push(doc);

//       if (currentTermPayment.remaining_amount <= 0) {
//         currentTermPayment.is_payment_complete = true;
//         currentTermPayment.remaining_amount = 0;
//       }

//       // Save current term payment
//       await currentTermPayment.save();
//       lastProcessedPayment = currentTermPayment;

//       console.log(
//         `Processed current term: ${currentTermPayment.term}, Remaining amount: ${currentTermPayment.remaining_amount}`
//       );
//     }

//     // Save the updated student document
//     await studentDoc.save();

//     return lastProcessedPayment;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.error(error);
//       throw new Error('Something went wrong while processing payment.');
//     }
//   }
// };

// const commonPaystackFunction = async (
//   payload: PaystackPayloadType,
//   payment_type: 'cash' | 'bank' | 'card'
// ) => {
//   try {
//     const activeSession = await Session.findOne({
//       is_active: true,
//     });

//     const activeTerm = activeSession?.terms.find(
//       (term) => term.is_active === true
//     );

//     const response = await Payment.findOne({
//       student: payload.student_id,
//       session: activeSession?._id,
//       term: activeTerm?.name,
//     });

//     // console.log('response inside common paystack:', payload);
//     // console.log('response inside common paystack:', response);

//     if (!response) {
//       throw new AppError('Payment document not found.', 404);
//     }

//     const studentPaymentDoc = response.waiting_for_confirmation.find((p) => {
//       console.log('p.transaction_id:', p.transaction_id);
//       return p.transaction_id === payload.reference;
//     });

//     console.log('studentPaymentDoc:', studentPaymentDoc);

//     if (studentPaymentDoc) {
//       console.log('Call back is running');
//       // CALL THE FUNCTION THAT PROCESSES CASH PAYMENT
//       if (
//         !studentPaymentDoc ||
//         !studentPaymentDoc.amount_paid ||
//         !studentPaymentDoc.transaction_id ||
//         !studentPaymentDoc.payment_method
//       ) {
//         throw new AppError('document not found.', 400);
//       }

//       const payload2 = {
//         student_id: response.student.toString(),
//         session_id: response.session.toString(),
//         term: response.term,
//         amount_paying: studentPaymentDoc?.amount_paid,
//         teller_number: studentPaymentDoc?.transaction_id,
//         payment_method: studentPaymentDoc?.payment_method,
//       };
//       // console.log('payload2:', payload2);

//       const result = await calculateAndUpdateStudentPaymentDocuments(
//         payload2,
//         payment_type
//       );

//       const receipt = {
//         amount_paid: studentPaymentDoc?.amount_paid,
//         date_paid: studentPaymentDoc.date_paid,
//         payment_method: studentPaymentDoc.payment_method,
//         transaction_id: studentPaymentDoc.transaction_id,
//         status: paymentStatusEnum[1],
//         _id: studentPaymentDoc._id,
//       };

//       console.log('commonPaystackFunction Log:', receipt);

//       const resultObj = {
//         receipt,
//         result,
//       };
//       return resultObj;
//       /**
//        * juwon@gmail.com, 678bdaa6304881bea12e1f90
//        * kayodemfm@yahoo.com, 678a7478e82c1287c85d011a
//        * ifatide@gmail.com, 678a752fe82c1287c85d013c
//        */
//     } else {
//       // THIS MEANS THAT WEBHOOK HAS DONE THE PROCESSING
//       console.log('Webhook is running');
//       const getFromPaymentSummary = response.payment_summary.find((p) => {
//         p.transaction_id = payload.reference;
//       });

//       console.log('getFromPaymentSummary:', getFromPaymentSummary);

//       return getFromPaymentSummary;
//     }
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened');
//     }
//   }
// };

// export { calculateAndUpdateStudentPaymentDocuments, commonPaystackFunction };

import mongoose, { ObjectId } from 'mongoose';
import ClassEnrolment from '../models/classes_enrolment.model';
import {
  AddFeeToStudentPaymentDocType,
  PaymentPayloadMandatoryFeeType,
  PaymentPayloadOptionalFeeType,
} from '../constants/types';
import Payment from '../models/payment.model';
import { AppError } from '../utils/app.error';
import SchoolAccount from '../models/school_account.model';

// use to add optional fee to payment document when the fee is needed to be added during the term
const optionalFeeAdditionToPaymentDocuments = async (
  payload: PaymentPayloadOptionalFeeType
) => {
  const {
    applicable_classes,
    academic_session_id,
    termName,
    session,
    fee_name,
    amount,
    receiving_acc_id,
  } = payload;

  const students = [];
  for (const classId of applicable_classes) {
    const classEnrolment = await ClassEnrolment.findOne({
      class: classId,
      academic_session_id: academic_session_id,
    }).session(session);

    if (classEnrolment) {
      for (const student of classEnrolment.students) {
        const studentPayload = {
          session_id: academic_session_id,
          termName: termName,
          studentId: student.student,
          session: session,
          fee_name: fee_name,
          amount: amount,
          receiving_acc_id,
        };

        const result = await addFeeToStudentPaymentDoc(studentPayload);
        students.push(result);
      }
    }
  }

  console.log('optionalFeeAdditionToPaymentDocuments payment repo:', students);
  return students;
};

const mandatoryFeeAdditionToPaymentDocuments = async (
  payload: PaymentPayloadMandatoryFeeType
) => {
  const {
    academic_session_id,
    termName,
    session,
    fee_name,
    amount,
    receiving_acc_id,
  } = payload;
  const classEnrolment = await ClassEnrolment.find({
    academic_session_id: academic_session_id,
  }).session(session);

  const students = [];
  for (const c of classEnrolment) {
    for (const student of c?.students || []) {
      const studentPayload = {
        session_id: academic_session_id,
        termName: termName,
        studentId: student.student,
        session: session,
        fee_name: fee_name,
        amount: amount,
        receiving_acc_id,
      };
      const result = await addFeeToStudentPaymentDoc(studentPayload);
      students.push(result);
    }
  }

  console.log('mandatoryFeeAdditionToPaymentDocuments payment repo:', students);
  // return students
};

// extract this function since i will be using it in several places
const addFeeToStudentPaymentDoc = async (
  payload: AddFeeToStudentPaymentDocType
) => {
  const {
    session_id,
    termName,
    studentId,
    session,
    fee_name,
    receiving_acc_id,
    amount,
  } = payload;
  try {
    const paymentDocExist = await Payment.findOne({
      session: session_id,
      term: termName,
      student: studentId,
    }).session(session);

    if (!paymentDocExist) {
      throw new AppError(
        'No payment document found for the student for the current term.',
        404
      );
    }

    const feeNameExist = paymentDocExist.fees_breakdown.find(
      (fee) => fee.fee_name === fee_name
    );

    if (feeNameExist) {
      throw new AppError(
        `Fee with the name ${fee_name} has been added before and can not be re-added.`,
        403
      );
    }

    const receivingAccount = Object(receiving_acc_id);

    const accountExist = await SchoolAccount.findById({
      _id: receivingAccount,
    });

    console.log('accountExist:', accountExist);

    if (!accountExist) {
      throw new AppError('Account number not found.', 404);
    }

    const feeObj = {
      fee_name: fee_name,
      amount: amount,
      receiving_account: receivingAccount,
    };

    paymentDocExist?.fees_breakdown?.push(feeObj);
    paymentDocExist.total_amount += feeObj.amount;
    paymentDocExist.remaining_amount += feeObj.amount;

    await paymentDocExist.save({ session });
    console.log('addFeeToStudentPaymentDoc', paymentDocExist);
    return paymentDocExist;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.error(error);
      throw new Error('Something happened');
    }
  }
};

const processFeePayment = async (studentPaymentObj: string) => {
  try {
    // Get student document
    // Get school payment preference
    // Get first preference based on the fee that is peculiar to the student
    // Get the school account that the money is supposed to be paid into
    // Make payment.
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.error(error);
      throw new Error('Something happened');
    }
  }
};

export {
  processFeePayment,
  mandatoryFeeAdditionToPaymentDocuments,
  optionalFeeAdditionToPaymentDocuments,
  addFeeToStudentPaymentDoc,
};
