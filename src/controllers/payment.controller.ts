// import {
//   studentCashFeePayment,
//   studentCardFeePayment,
//   studentBankFeePayment,
//   createSchoolFeePaymentDocumentForStudents,
//   addSchoolBusToStudentPaymentDocument,
//   approveStudentBankPayment,
//   fetchStudentOutstandingPaymentDoc,
//   fetchStudentSinglePaymentDoc,
//   paystackCallBackService,
//   processPaystackWebHook,
//   fetchCurrentTermPaymentDocuments,
//   fetchAllPaymentsNeedingApproval,
//   fetchAPaymentNeedingApprovalById,
//   fetchAllStudentPaymentDocumentsByStudentId,
//   fetchAllPaymentDocuments,
//   fetchAllPaymentsApprovedByBursarId,
//   fetchAllPaymentSummaryFailedAndSuccessful,
//   fetchPaymentDetailsByPaymentId,
//   fetchPaymentTransactionHistoryByStudentId,
// } from '../services/payment.service';
// import { AppError } from '../utils/app.error';
// import catchErrors from '../utils/tryCatch';
// import {
//   bankPaymentValidation,
//   cashPaymentValidation,
//   bankApprovalValidation,
// } from '../utils/validation';

// const createPaymentDocumentForAllStudent = catchErrors(async (req, res) => {
//   const { term } = req.body;
//   const { session_id } = req.params;

//   if (!session_id || !term) {
//     throw new AppError('Session ID and term must be provided.', 400);
//   }

//   const result = await createSchoolFeePaymentDocumentForStudents(
//     session_id,
//     term
//   );

//   if (!result) {
//     throw new AppError('Unable to process payment request.', 400);
//   }

//   // NOTIFICATION MAIL AND IN-APP NOTIFICATION CAN BE SENT TO STUDENT AND PARENTS HERE

//   return res.status(201).json({
//     success: true,
//     message: result.message,
//     status: 201,
//     payment: result.paymentDocuments,
//   });
// });

// const makeCashPayment = catchErrors(async (req, res) => {
//   const { student_id, session_id } = req.params;
//   const { term, amount_paying, class_id, payment_method } = req.body;
//   if (
//     !student_id ||
//     !session_id ||
//     !term ||
//     !amount_paying ||
//     !class_id ||
//     !payment_method
//   ) {
//     throw new AppError(
//       'Please provide student ID, payment method amount to be paid, class ID, session ID and term to proceed.',
//       400
//     );
//   }
//   const payload = {
//     student_id,
//     session_id,
//     term,
//     amount_paying,
//     class_id,
//   };

//   const validateInput = cashPaymentValidation(payload);

//   const { success, value } = validateInput;

//   const paymentInput = {
//     student_id: value.student_id,
//     session_id: value.session_id,
//     term: value.term,
//     amount_paying: value.amount_paying,
//     class_id: value.class_id,
//     payment_method,
//   };

//   const result = await studentCashFeePayment(paymentInput);
//   if (!result) {
//     throw new AppError('Unable to process payment request.', 400);
//   }

//   return res.status(200).json({
//     success: true,
//     message: `Payment of ${amount_paying} was successfully processed for ${result.student.first_name} ${result.student.last_name}`,
//     status: 200,
//     payment: result,
//   });
// });

// const makeBankPayment = catchErrors(async (req, res) => {
//   const { student_id, session_id } = req.params;
//   const { term, amount_paying, class_id, teller_number, bank_name } = req.body;

//   const userId = req.user?.userId;
//   const userRole = req.user?.userRole;

//   const requiredFields = {
//     student_id,
//     session_id,
//     term,
//     amount_paying,
//     class_id,
//     teller_number,
//     bank_name,
//   };
//   const missingField = Object.entries(requiredFields).find(
//     ([key, value]) => !value
//   );

//   if (missingField) {
//     throw new AppError(
//       `Please provide ${missingField[0].replace('_', ' ')} to proceed.`,
//       400
//     );
//   }
//   const payload = {
//     student_id,
//     session_id,
//     term,
//     amount_paying,
//     class_id,
//     teller_number,
//     bank_name,
//   };

//   const validateInput = bankPaymentValidation(payload);

//   const { success, value } = validateInput;

//   if (!userId || !userRole) {
//     throw new AppError('Please login to continue.', 400);
//   }

//   const paymentInput = {
//     student_id: value.student_id,
//     session_id: value.session_id,
//     term: value.term,
//     amount_paying: value.amount_paying,
//     class_id: value.class_id,
//     teller_number: value.teller_number,
//     bank_name: value.bank_name,
//     userId,
//     userRole,
//   };

//   const result = await studentBankFeePayment(paymentInput);

//   if (!result) {
//     throw new AppError('Unable to process payment request.', 400);
//   }

//   return res.status(200).json({
//     success: true,
//     message: `Your payment is pending as this needed to be confirmed from the bank. You will be notified very soon. Thank you very much.`,
//     status: 200,
//     payment: result,
//   });
// });

// const makeCardPayment = catchErrors(async (req, res) => {
//   const { student_id, session_id } = req.params;
//   const { term, amount_paying, class_id } = req.body;
//   if (!student_id || !session_id || !term || !amount_paying || !class_id) {
//     throw new AppError(
//       'Please provide student ID, amount to be paid, class ID, session ID and term to proceed.',
//       400
//     );
//   }

//   console.log('payload body', req.body);
//   console.log('payload params', req.params);
//   const payload = {
//     student_id,
//     session_id,
//     term,
//     amount_paying,
//     class_id,
//   };

//   const validateInput = cashPaymentValidation(payload);

//   const { success, value } = validateInput;

//   console.log('validateInput', validateInput);

//   const paymentInput = {
//     student_id: value.student_id,
//     session_id: value.session_id,
//     term: value.term,
//     amount_paying: value.amount_paying,
//     class_id: value.class_id,
//   };

//   const result = await studentCardFeePayment(paymentInput);
//   console.log('result', result);

//   if (!result) {
//     throw new AppError('Unable to process payment request.', 400);
//   }
//   return res.status(200).json({
//     success: true,
//     message: `Your payment is pending as this needed to be confirmed. You will be notified very soon. Thank you very much.`,
//     status: 200,
//     payment: result.response.data.data,
//   });
// });

// const studentSubscribeToSchoolBusById = catchErrors(async (req, res) => {
//   const { student_id, session_id } = req.params;
//   const { term, is_using, trip_type, route } = req.body;
//   const userRole = req.user?.userRole;

//   const parent_id =
//     userRole === 'parent' ? req.user?.userId.toString() : undefined;

//   if (userRole === 'parent' && !parent_id) {
//     console.error('Parent ID not found');
//     throw new AppError('Parent ID not found.', 400);
//   }

//   let payload;

//   if (is_using === false) {
//     payload = {
//       is_using,
//       student_id,
//       session_id,
//       term,
//       parent_id,
//     };
//   } else {
//     if (!student_id || !session_id || !term || !is_using || !trip_type) {
//       throw new AppError(
//         'Please provide the following information to proceed: trip type, choose whether you are using bus or not, student ID, session ID and term.',
//         400
//       );
//     }

//     if (trip_type === 'single_trip') {
//       if (!route) {
//         throw new AppError(
//           'Choosing a single trip requires you to pick from either morning or afternoon route.',
//           400
//         );
//       }
//     }

//     payload = {
//       student_id,
//       session_id,
//       term,
//       is_using,
//       trip_type,
//       parent_id,
//       route: route && route,
//     };
//   }

//   const result = await addSchoolBusToStudentPaymentDocument(payload);
//   if (!result) {
//     throw new AppError('Unable to process payment request.', 400);
//   }
//   return res.status(200).json({
//     message: 'Bus subscription completed successfully.',
//     success: true,
//     status: 200,
//     payment: result,
//   });
// });

// const approveBankPaymentWithId = catchErrors(async (req, res) => {
//   const { payment_id } = req.params;
//   const { amount_paid, transaction_id, bank_name } = req.body;
//   const bursar_id = req.user?.userId;

//   if (!bursar_id) {
//     throw new AppError('Please login to continue.', 400);
//   }

//   if (!payment_id) {
//     throw new AppError('Payment ID is required to proceed.', 400);
//   }

//   const payload = {
//     amount_paid,
//     transaction_id,
//     bank_name,
//   };

//   const validateInput = bankApprovalValidation(payload);

//   const { success, value } = validateInput;

//   const paymentPayload = {
//     transaction_id: value.transaction_id,
//     bank_name: value.bank_name,
//     payment_id,
//     bursar_id,
//     amount_paid,
//   };
//   const result = await approveStudentBankPayment(paymentPayload);
//   if (!result) {
//     throw new AppError('Unable to approve student bank payment.', 400);
//   }

//   return res.status(200).json({
//     message: 'Student payment was successfully approved.',
//     status: 200,
//     success: true,
//     payment: result.receipt,
//   });
// });

// const getPaystackCallBack = catchErrors(async (req, res) => {
//   const { student_id, reference } = req.params;

//   if (!student_id || !reference) {
//     throw new AppError(`Student ID or reference not specified`, 400);
//   }

//   const payload = { student_id, reference };

//   const result = await paystackCallBackService(payload);

//   console.log('controller Log:', result);

//   if (!result) {
//     throw new AppError('Unable to process paystack payment.', 400);
//   }

//   return res.status(200).json({
//     message: 'Payment successfully processed.',
//     status: 200,
//     success: true,
//     payment_response: result,
//   });
// });

// const getPaystackWebHook = catchErrors(async (req, res) => {
//   const paystackResponse = await processPaystackWebHook(req, res);

//   // console.log('webhook controller paystackResponse', paystackResponse);

//   return res.json({
//     message: 'Payment processed successfully',
//     success: true,
//     payment: paystackResponse,
//   });
// });

// const getAllOutstandingPaymentDocumentsOfStudent = catchErrors(
//   async (req, res) => {
//     const { student_id } = req.params;

//     if (!student_id) {
//       throw new AppError('Student ID not specified.', 400);
//     }

//     const result = await fetchStudentOutstandingPaymentDoc(student_id);

//     if (!result) {
//       throw new AppError(
//         'Unable to get student outstanding payment documents.',
//         400
//       );
//     }

//     return res.status(200).json({
//       message: 'Student Outstanding Payment Documents fetched successfully.',
//       status: 200,
//       success: true,
//       student_outstanding_payment_documents: result,
//     });
//   }
// );

// const getAPaymentDocumentOfStudentByStudentIdAndPaymentId = catchErrors(
//   async (req, res) => {
//     const { student_id, payment_id } = req.params;

//     if (!student_id || !payment_id) {
//       throw new AppError('Student ID and Payment ID are required.', 400);
//     }

//     const result = await fetchStudentSinglePaymentDoc(student_id, payment_id);

//     if (!result) {
//       throw new AppError('Unable to get student payment document.', 400);
//     }

//     return res.status(200).json({
//       message: 'Payment document fetched successfully.',
//       success: true,
//       status: 200,
//       payment_doc: result,
//     });
//   }
// );

// const getAPaymentNeedingApprovalById = catchErrors(async (req, res) => {
//   const { payment_id } = req.params;

//   if (!payment_id) {
//     throw new AppError('Payment ID required.', 404);
//   }

//   const result = await fetchAPaymentNeedingApprovalById(payment_id);

//   if (!result) {
//     throw new AppError('Unable to fetch payment for approval.', 404);
//   }

//   return res.status(200).json({
//     message: 'Payment fetched successfully.',
//     success: true,
//     status: 200,
//     payment: result,
//   });
// });

// const getCurrentTermPaymentDocuments = catchErrors(async (req, res) => {
//   const page = Number(req.query.page) || 1;
//   const limit = Number(req.query.limit) || 10;
//   const searchQuery =
//     typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

//   const result = await fetchCurrentTermPaymentDocuments(
//     page,
//     limit,
//     searchQuery
//   );

//   if (!result) {
//     throw new AppError('Unable to fetch current term payment documents.', 400);
//   }

//   return res.status(200).json({
//     message: 'Current term payment documents fetched successfully.',
//     success: true,
//     status: 200,
//     payment_documents: result,
//   });
// });

// const getAllPaymentsNeedingApproval = catchErrors(async (req, res) => {
//   const page = req.query.page ? Number(req.query.page) : undefined;
//   const limit = req.query.limit ? Number(req.query.limit) : undefined;

//   const searchQuery =
//     typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

//   const result = await fetchAllPaymentsNeedingApproval(
//     page,
//     limit,
//     searchQuery
//   );

//   if (!result) {
//     throw new AppError(
//       'unable to fetch all payment documents needing approval.',
//       400
//     );
//   }

//   return res.status(200).json({
//     message: 'All payment documents waiting for approval fetched successfully.',
//     success: true,
//     status: 200,
//     payment_documents: result,
//   });
// });

// const getAllStudentPaymentDocumentsByStudentId = catchErrors(
//   async (req, res) => {
//     const page = req.query.page ? Number(req.query.page) : undefined;
//     const limit = req.query.limit ? Number(req.query.limit) : undefined;

//     const searchQuery =
//       typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

//     const { student_id } = req.params;

//     const userId = req.user?.userId;
//     const userRole = req.user?.userRole;

//     if (!userId || !userRole) {
//       throw new AppError('Please login to proceed.', 400);
//     }

//     if (!student_id) {
//       throw new AppError('Student ID is required.', 400);
//     }

//     if (userRole === 'student') {
//       if (userId.toString() !== student_id) {
//         throw new AppError('Please provide correct student ID.', 400);
//       }
//     }

//     const payload = {
//       student_id,
//       userRole,
//       userId,
//     };
//     const result = await fetchAllStudentPaymentDocumentsByStudentId(
//       payload,
//       page,
//       limit,
//       searchQuery
//     );

//     if (!result) {
//       throw new AppError('Unable to fetch all student payment documents.', 400);
//     }

//     return res.status(200).json({
//       message: 'Student payment documents fetched successfully.',
//       success: true,
//       status: 200,
//       payment_history: result,
//     });
//   }
// );

// const getAllPaymentDocuments = catchErrors(async (req, res) => {
//   const page = req.query.page ? Number(req.query.page) : undefined;
//   const limit = req.query.limit ? Number(req.query.limit) : undefined;

//   const searchQuery =
//     typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

//   const result = await fetchAllPaymentDocuments(page, limit, searchQuery);

//   if (!result) {
//     throw new AppError('Unable to fetch all payment documents.', 400);
//   }

//   return res.status(200).json({
//     message: 'All payment documents fetched successfully.',
//     status: 200,
//     success: true,
//     payments_history: result,
//   });
// });

// const getAllPaymentsApprovedByBursarId = catchErrors(async (req, res) => {
//   const page = req.query.page ? Number(req.query.page) : undefined;
//   const limit = req.query.limit ? Number(req.query.limit) : undefined;

//   const searchQuery =
//     typeof req.query.searchParams === 'string' ? req.query.searchParams : '';
//   const { bursar_id } = req.params;

//   if (!bursar_id) {
//     throw new AppError('Please provide a valid bursar_id to continue.', 400);
//   }

//   const result = await fetchAllPaymentsApprovedByBursarId(
//     bursar_id,
//     page,
//     limit,
//     searchQuery
//   );

//   if (!result) {
//     throw new AppError(
//       'Unable to fetch all payments approved by this bursar.',
//       400
//     );
//   }

//   return res.status(200).json({
//     message: 'All payments approved by this bursar fetched successfully',
//     success: true,
//     status: 200,
//     payment_documents: result,
//   });
// });

// const getAllPaymentSummaryFailedAndSuccessful = catchErrors(
//   async (req, res) => {
//     // const page = req.query.page ? Number(req.query.page) : undefined;
//     // const limit = req.query.limit ? Number(req.query.limit) : undefined;
//     // const searchQuery =
//     //   typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

//     const result = await fetchAllPaymentSummaryFailedAndSuccessful();
//     // page,
//     // limit,
//     // searchQuery

//     if (!result) {
//       throw new AppError('Unable to fetch all payment summary.', 400);
//     }

//     return res.status(200).json({
//       message: 'Payment summary was fetched successfully.',
//       success: true,
//       status: 200,
//       payment_summary: result,
//     });
//   }
// );

// const getPaymentDetailsByPaymentId = catchErrors(async (req, res) => {
//   const { payment_id } = req.params;
//   const userId = req.user?.userId;
//   const userRole = req.user?.userRole;

//   if (!payment_id) {
//     throw new AppError('Payment ID is required to proceed.', 400);
//   }

//   if (!userId || !userRole) {
//     throw new AppError('Please login to proceed.', 400);
//   }

//   const payload = {
//     payment_id,
//     userId,
//     userRole,
//   };

//   const result = await fetchPaymentDetailsByPaymentId(payload);

//   if (!result) {
//     throw new AppError('Unable to fetch payment details.', 400);
//   }

//   return res.status(200).json({
//     message: 'Payment details fetched successfully.',
//     success: true,
//     status: 200,
//     payment_details: result,
//   });
// });

// const getPaymentTransactionHistoryByStudentId = catchErrors(
//   async (req, res) => {
//     const { student_id } = req.params;
//     // const page = req.query.page ? Number(req.query.page) : undefined;
//     // const limit = req.query.limit ? Number(req.query.limit) : undefined;
//     // const searchQuery =
//     //   typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

//     const userId = req.user?.userId;
//     const userRole = req.user?.userRole;

//     if (!student_id) {
//       throw new AppError('Please provide a valid Student ID', 403);
//     }

//     if (!userId || !userRole) {
//       throw new AppError('Please login as a user to proceed.', 400);
//     }

//     const payload = {
//       student_id,
//       userRole,
//       userId,
//     };

//     const result = await fetchPaymentTransactionHistoryByStudentId(
//       // page,
//       // limit,
//       // searchQuery,
//       payload
//     );

//     if (!result) {
//       throw new AppError(
//         'Unable to fetch payment transaction history for this student',
//         400
//       );
//     }

//     return res.status(200).json({
//       message: 'Payment transaction history fetched successfully.',
//       success: true,
//       status: 200,
//       payment_history: result,
//     });
//   }
// );

// export {
//   getPaymentTransactionHistoryByStudentId,
//   getPaymentDetailsByPaymentId,
//   getAllPaymentsApprovedByBursarId,
//   getAllStudentPaymentDocumentsByStudentId,
//   getCurrentTermPaymentDocuments,
//   getAPaymentNeedingApprovalById,
//   getAllPaymentsNeedingApproval,
//   getPaystackWebHook,
//   getAPaymentDocumentOfStudentByStudentIdAndPaymentId,
//   getPaystackCallBack,
//   approveBankPaymentWithId,
//   studentSubscribeToSchoolBusById,
//   createPaymentDocumentForAllStudent,
//   makeCardPayment,
//   makeBankPayment,
//   makeCashPayment,
//   getAllPaymentDocuments,
//   getAllPaymentSummaryFailedAndSuccessful,
//   getAllOutstandingPaymentDocumentsOfStudent,
// };

////////////////////////////////////////////////////////////
import mongoose from 'mongoose';
import {
  addingFeeToStudentPaymentDocument,
  createSchoolFeePaymentDocumentForStudents,
  fetchAllPaymentDocuments,
  fetchAllPaymentSummaryFailedAndSuccessful,
  fetchAllStudentPaymentDocumentsByStudentId,
  fetchCurrentTermPaymentDocuments,
  fetchPaymentDetailsByPaymentId,
  fetchPaymentTransactionHistoryByStudentId,
  fetchStudentOutstandingPaymentDoc,
  fetchStudentSinglePaymentDoc,
  paymentPriorityCreation,
  fetchPaymentPriorityForMySchool,
  studentWalletDepositProcessing,
} from '../services/payment.service';
import { AppError } from '../utils/app.error';
// import { company_subdomain } from '../utils/code';
import { validatePriorityOrder } from '../utils/functions';
import catchErrors from '../utils/tryCatch';
import {
  joiAccountArrayValidation,
  joiPriorityOrderValidation,
  optionalFeesValidation,
} from '../utils/validation';
// import { saveLog } from '../logs/log.service';

const createPaymentDocumentForAllStudent = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { term } = req.body;
  const { session_id } = req.params;

  if (!session_id || !term) {
    throw new AppError('Session ID and term must be provided.', 400);
  }

  const result = await createSchoolFeePaymentDocumentForStudents(
    session_id,
    term
  );

  if (!result) {
    throw new AppError('Unable to process payment request.', 400);
  }

  // NOTIFICATION MAIL AND IN-APP NOTIFICATION CAN BE SENT TO STUDENT AND PARENTS HERE

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: result.message,
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
    success: true,
    message: result.message,
    status: 201,
    payment: result.paymentDocuments,
  });
});

const addFeeToStudentPaymentDocument = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { student_id, fee_name, amount, receiving_acc_id } = req.body;

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
    student_id,
    receiving_acc_id,
  };

  const result = await addingFeeToStudentPaymentDocument(payload);

  if (!result) {
    throw new AppError('Unable to create fees.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: `Student individual fee added successfully`,
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
    message: `Student individual fee added successfully`,
    success: true,
    status: 201,
    fees: result,
  });
});

const getAllStudentPaymentDocumentsByStudentId = catchErrors(
  async (req, res) => {
    // const start = Date.now();

    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const searchQuery =
      typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

    const { student_id } = req.params;

    const userId = req.user?.userId;
    const userRole = req.user?.userRole;

    if (!userId || !userRole) {
      throw new AppError('Please login to proceed.', 400);
    }

    if (!student_id) {
      throw new AppError('Student ID is required.', 400);
    }

    if (userRole === 'student') {
      if (userId.toString() !== student_id) {
        throw new AppError('Please provide correct student ID.', 400);
      }
    }

    const payload = {
      userId: Object(userId),
      userRole,
      student_id,
    };
    const result = await fetchAllStudentPaymentDocumentsByStudentId(
      payload,
      page,
      limit,
      searchQuery
    );

    if (!result) {
      throw new AppError('Unable to fetch all student payment documents.', 400);
    }

    // const duration = Date.now() - start;

    // const savelogPayload = {
    //   level: 'info',
    //   message: 'Student payment documents fetched successfully.',
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
      message: 'Student payment documents fetched successfully.',
      success: true,
      status: 200,
      payment_history: result,
    });
  }
);

const getAllPaymentDocuments = catchErrors(async (req, res) => {
  // const start = Date.now();

  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const searchQuery =
    typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

  const result = await fetchAllPaymentDocuments(page, limit, searchQuery);

  if (!result) {
    throw new AppError('Unable to fetch all payment documents.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'All payment documents fetched successfully.',
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
    message: 'All payment documents fetched successfully.',
    status: 200,
    success: true,
    payments_history: result,
  });
});

const getAllOutstandingPaymentDocumentsOfStudent = catchErrors(
  async (req, res) => {
    // const start = Date.now();

    const { student_id } = req.params;

    if (!student_id) {
      throw new AppError('Student ID not specified.', 400);
    }

    const result = await fetchStudentOutstandingPaymentDoc(student_id);

    if (!result) {
      throw new AppError(
        'Unable to get student outstanding payment documents.',
        400
      );
    }

    // const duration = Date.now() - start;

    // const savelogPayload = {
    //   level: 'info',
    //   message: 'Student Outstanding Payment Documents fetched successfully.',
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
      message: 'Student Outstanding Payment Documents fetched successfully.',
      status: 200,
      success: true,
      student_outstanding_payment_documents: result,
    });
  }
);

const getCurrentTermPaymentDocuments = catchErrors(async (req, res) => {
  // const start = Date.now();

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const searchQuery =
    typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

  const result = await fetchCurrentTermPaymentDocuments(
    page,
    limit,
    searchQuery
  );

  if (!result) {
    throw new AppError('Unable to fetch current term payment documents.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Current term payment documents fetched successfully.',
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
    message: 'Current term payment documents fetched successfully.',
    success: true,
    status: 200,
    payment_documents: result,
  });
});

const getPaymentTransactionHistoryByStudentId = catchErrors(
  async (req, res) => {
    // const start = Date.now();

    const { student_id } = req.params;
    // const page = req.query.page ? Number(req.query.page) : undefined;
    // const limit = req.query.limit ? Number(req.query.limit) : undefined;
    // const searchQuery =
    //   typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

    const userId = req.user?.userId;
    const userRole = req.user?.userRole;

    if (!student_id) {
      throw new AppError('Please provide a valid Student ID', 403);
    }

    if (!userId || !userRole) {
      throw new AppError('Please login as a user to proceed.', 400);
    }

    const payload = {
      student_id,
      userRole,
      userId: Object(userId),
    };

    const result = await fetchPaymentTransactionHistoryByStudentId(
      // page,
      // limit,
      // searchQuery,
      payload
    );

    if (!result) {
      throw new AppError(
        'Unable to fetch payment transaction history for this student',
        400
      );
    }

    // const duration = Date.now() - start;

    // const savelogPayload = {
    //   level: 'info',
    //   message: 'Payment transaction history fetched successfully.',
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
      message: 'Payment transaction history fetched successfully.',
      success: true,
      status: 200,
      payment_history: result,
    });
  }
);

const getPaymentDetailsByPaymentId = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { payment_id } = req.params;
  const userId = req.user?.userId;
  const userRole = req.user?.userRole;

  if (!payment_id) {
    throw new AppError('Payment ID is required to proceed.', 400);
  }

  if (!userId || !userRole) {
    throw new AppError('Please login to proceed.', 400);
  }

  const payload = {
    payment_id,
    userId: Object(userId),
    userRole,
  };

  const result = await fetchPaymentDetailsByPaymentId(payload);

  if (!result) {
    throw new AppError('Unable to fetch payment details.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Payment details fetched successfully.',
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
    message: 'Payment details fetched successfully.',
    success: true,
    status: 200,
    payment_details: result,
  });
});

const getAPaymentDocumentOfStudentByStudentIdAndPaymentId = catchErrors(
  async (req, res) => {
    // const start = Date.now();

    const { student_id, payment_id } = req.params;

    if (!student_id || !payment_id) {
      throw new AppError('Student ID and Payment ID are required.', 400);
    }

    const result = await fetchStudentSinglePaymentDoc(student_id, payment_id);

    if (!result) {
      throw new AppError('Unable to get student payment document.', 400);
    }

    // const duration = Date.now() - start;

    // const savelogPayload = {
    //   level: 'info',
    //   message: 'Payment document fetched successfully.',
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
      message: 'Payment document fetched successfully.',
      success: true,
      status: 200,
      payment_doc: result,
    });
  }
);

const getAllPaymentSummaryFailedAndSuccessful = catchErrors(
  async (req, res) => {
    // const start = Date.now();

    // const page = req.query.page ? Number(req.query.page) : undefined;
    // const limit = req.query.limit ? Number(req.query.limit) : undefined;
    // const searchQuery =
    //   typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

    const result = await fetchAllPaymentSummaryFailedAndSuccessful();
    // page,
    // limit,
    // searchQuery

    if (!result) {
      throw new AppError('Unable to fetch all payment summary.', 400);
    }

    // const duration = Date.now() - start;

    // const savelogPayload = {
    //   level: 'info',
    //   message: 'Payment summary was fetched successfully.',
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
      message: 'Payment summary was fetched successfully.',
      success: true,
      status: 200,
      payment_summary: result,
    });
  }
);

const createPaymentPriority = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { priority_order } = req.body;

  const userRole = req.user?.userRole;

  if (!priority_order || priority_order.length === 0) {
    throw new AppError('Priority order is required.', 400);
  }

  const priorityValidation = joiPriorityOrderValidation(priority_order);

  if (!priorityValidation) {
    throw new AppError('Error validating priority order', 400);
  }

  const { success, value } = priorityValidation;

  const payload = {
    priority_order,
  };

  const validateOrder = validatePriorityOrder(priority_order);

  if (!validateOrder) {
    throw new AppError('Unable to validate priority order.', 400);
  }

  const result = await paymentPriorityCreation(payload);

  if (!result) {
    throw new AppError('Unable to create payment priority document.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Payment priority created successfully',
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
    message: 'Payment priority created successfully',
    success: true,
    status: 201,
    priorityDoc: result,
  });
});

const getPaymentPriority = catchErrors(async (req, res) => {
  // const start = Date.now();

  const result = await fetchPaymentPriorityForMySchool();

  if (!result) {
    throw new AppError('Unable to fetch payment priority document.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Payment priority document fetched successfully.',
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
    message: 'Payment priority document fetched successfully.',
    status: 200,
    success: true,
    payment_priority: result,
  });
});

const processStudentWalletDepositWebhook = catchErrors(async (req, res) => {
  // const start = Date.now();

  const result = await studentWalletDepositProcessing(req, res);

  if (!result) {
    throw new AppError('Unable to process wallet deposit.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Wallet credited successfully.',
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
    message: 'Wallet credited successfully.',
    success: true,
    status: 200,
  });
});

const makeCardPayment = catchErrors(async (req, res) => {});

const approveBankPaymentWithId = catchErrors(async (req, res) => {});
const getPaystackCallBack = catchErrors(async (req, res) => {});
const getPaystackWebHook = catchErrors(async (req, res) => {});
const getAPaymentNeedingApprovalById = catchErrors(async (req, res) => {});
const getAllPaymentsNeedingApproval = catchErrors(async (req, res) => {});
const getAllPaymentsApprovedByBursarId = catchErrors(async (req, res) => {});

export {
  processStudentWalletDepositWebhook,
  getPaymentPriority,
  createPaymentPriority,
  createPaymentDocumentForAllStudent,
  addFeeToStudentPaymentDocument,
  makeCardPayment,
  getAllStudentPaymentDocumentsByStudentId,
  getAllPaymentDocuments,
  getAllOutstandingPaymentDocumentsOfStudent,
  getCurrentTermPaymentDocuments,
  getPaymentTransactionHistoryByStudentId,
  getPaymentDetailsByPaymentId,
  getAPaymentDocumentOfStudentByStudentIdAndPaymentId,
  getAllPaymentSummaryFailedAndSuccessful,
  ////////////////////////////////////////////////////
  approveBankPaymentWithId,
  getPaystackCallBack,
  getPaystackWebHook,
  getAPaymentNeedingApprovalById,
  getAllPaymentsNeedingApproval,
  getAllPaymentsApprovedByBursarId,
};
