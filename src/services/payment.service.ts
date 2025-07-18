// import mongoose from 'mongoose';
// import {
//   BusPaymentType,
//   StudentFeePaymentType,
//   PaymentDocument,
//   ApproveStudentPayloadType,
//   PaystackPayloadType,
//   WaitingForConfirmationType,
//   PaymentDataType,
//   StudentPaymentHistoryType,
//   PaymentHistoryDataType,
//   UserDocument,
// } from '../constants/types';
// import Fee from '../models/fees.model';
// import Payment from '../models/payment.model';
// import Student from '../models/students.model';
// import { AppError } from '../utils/app.error';
// import Session from '../models/session.model';
// import GeneralFee from '../models/general_fee.model';
// import AddressGroup from '../models/address_grouping.model';
// import { paymentEnum, paymentStatusEnum } from '../constants/enum';
// import {
//   paystackCallBack,
//   paystackInitialization,
//   paystackWebHook,
// } from '../utils/paystack';
// import { calculateAndUpdateStudentPaymentDocuments } from '../repository/payment.repository';
// import { Request, Response } from 'express';

// const studentBankFeePayment = async (
//   payload: StudentFeePaymentType
// ): Promise<PaymentDocument> => {
//   try {
//     const {
//       student_id,
//       session_id,
//       term,
//       amount_paying,
//       teller_number,
//       bank_name,
//       userId,
//       userRole,
//     } = payload;

//     const student = await Student.findById({
//       _id: student_id,
//     });

//     if (!student) {
//       throw new AppError(`Student not found.`, 404);
//     }

//     if (userRole === 'parent' && userId) {
//       if (!student.parent_id?.includes(userId)) {
//         throw new AppError(
//           `You are not a parent to ${student.first_name} ${student.last_name}.`,
//           403
//         );
//       }
//     }

//     const findPaymentDocument = await Payment.findOne({
//       student: student_id,
//       session: session_id,
//       term,
//     });

//     if (!findPaymentDocument) {
//       throw new AppError('No payment record found', 404);
//     }

//     if (findPaymentDocument.is_submit_response === false) {
//       throw new AppError(
//         'You need to inform us if you are subscribing to school bus for this term or not.',
//         400
//       );
//     }

//     if (findPaymentDocument.is_payment_complete === true) {
//       throw new AppError(
//         'Payment for this term has already being completed.',
//         400
//       );
//     }

//     if (!findPaymentDocument.remaining_amount) {
//       throw new AppError('Remaining amount field is null.', 400);
//     }

//     const paymentPayload = {
//       amount_paid: amount_paying,
//       date_paid: new Date(),
//       payment_method: paymentEnum[1],
//       transaction_id: teller_number,
//       bank_name: bank_name,
//     };

//     findPaymentDocument.waiting_for_confirmation.push(paymentPayload);

//     await findPaymentDocument.save();

//     return findPaymentDocument as PaymentDocument;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened.');
//     }
//   }
// };

// const studentCashFeePayment = async (payload: StudentFeePaymentType) => {
//   try {
//     const { student_id, session_id, term, amount_paying, payment_method } =
//       payload;

//     const currentTermPayment = await Payment.findOne({
//       student: student_id,
//       session: session_id,
//       term: term,
//     });

//     if (!currentTermPayment) {
//       throw new AppError('No payment record found for the current term.', 404);
//     }

//     if (currentTermPayment && currentTermPayment.is_submit_response === false) {
//       throw new AppError(
//         'You need to inform us if you are subscribing to school bus for this term or not.',
//         400
//       );
//     }

//     const result = await calculateAndUpdateStudentPaymentDocuments(
//       payload,
//       'cash'
//     );
//     const student = await Student.findById({
//       _id: student_id,
//     });

//     if (!student) {
//       throw new AppError('Student not found.', 404);
//     }

//     const { password, ...others } = student.toObject();

//     const obj = {
//       paymentDoc: result,
//       student: others,
//     };

//     return obj;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened.');
//     }
//   }
// };

// const studentCardFeePayment = async (payload: StudentFeePaymentType) => {
//   try {
//     const { student_id, session_id, term, amount_paying } = payload;
//     const studentEmail = await Student.findById({
//       _id: student_id,
//     });

//     if (!studentEmail) {
//       throw new AppError('Student not found.', 404);
//     }

//     if (studentEmail.outstanding_balance === undefined) {
//       throw new AppError(
//         'Outstanding balance is not defined for this student.',
//         400
//       );
//     }

//     const findPaymentDocument = await Payment.findOne({
//       student: student_id,
//       session: session_id,
//       term,
//     });

//     if (!findPaymentDocument) {
//       throw new AppError('No payment document found.', 404);
//     }

//     if (
//       findPaymentDocument.remaining_amount === null ||
//       findPaymentDocument.remaining_amount === undefined
//     ) {
//       throw new AppError(
//         'Remaining amount is not defined for the payment document.',
//         400
//       );
//     }

//     if (findPaymentDocument.is_submit_response === false) {
//       throw new AppError(
//         'You need to inform us if you are subscribing to school bus for this term or not.',
//         400
//       );
//     }

//     const totalAmountToPay =
//       studentEmail?.outstanding_balance + findPaymentDocument?.remaining_amount;

//     if (amount_paying > totalAmountToPay) {
//       throw new AppError(
//         'You are trying to pay more than what you are supposed to pay.',
//         400
//       );
//     }

//     if (findPaymentDocument.is_payment_complete === true) {
//       throw new AppError(
//         'Payment for this term has already being completed.',
//         400
//       );
//     }

//     if (!findPaymentDocument.remaining_amount) {
//       throw new AppError('Remaining amount field is null.', 400);
//     }

//     const paymentInfo = {
//       student_id: student_id,
//       student_email: studentEmail?.email,
//       amount: amount_paying,
//       session_id: session_id,
//       term: term,
//       payment_document_id: findPaymentDocument._id,
//     };

//     const paystackResult = await paystackInitialization(paymentInfo);

//     const paymentPayload = {
//       amount_paid: paystackResult.data.amount_paid,
//       date_paid: paystackResult.data.date_paid,
//       payment_method: paymentEnum[2],
//       transaction_id: paystackResult.data.transaction_id,
//       message: paystackResult.data.message,
//     };

//     findPaymentDocument.waiting_for_confirmation.push(paymentPayload);

//     await findPaymentDocument.save();

//     console.log('findPaymentDocument', findPaymentDocument);

//     return paystackResult;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.error(error);
//       throw new Error('Something happened');
//     }
//   }
// };

// const addSchoolBusToStudentPaymentDocument = async (
//   payload: BusPaymentType
// ): Promise<PaymentDocument> => {
//   try {
//     const {
//       student_id,
//       session_id,
//       term,
//       is_using,
//       // route,
//       trip_type,
//       parent_id,
//     } = payload;

//     const studentDoc = await Student.findById({
//       _id: student_id,
//     });

//     if (parent_id) {
//       console.log('parent_id:', parent_id);

//       if (
//         !studentDoc?.parent_id
//           ?.map((id) => id.toString())
//           .includes(parent_id.toString())
//       ) {
//         throw new AppError('You can only update your child documents.', 400);
//       }
//     }

//     const checkActiveTerm = await Session.findOne({
//       _id: session_id,
//       is_active: true,
//     });

//     if (!checkActiveTerm) {
//       throw new AppError('Session is not active or does not exist.', 400);
//     }

//     const isTermActive = checkActiveTerm.terms.some(
//       (sessionTerm) =>
//         sessionTerm.name === term && sessionTerm.is_active === true
//     );

//     if (!isTermActive) {
//       throw new AppError(
//         'The term is either inactive or does not exist for the active session.',
//         404
//       );
//     }

//     const studentPaymentDocument = await Payment.findOne({
//       student: student_id,
//       session: session_id,
//       term: term,
//     });

//     if (!studentPaymentDocument) {
//       throw new AppError('Student payment document not found.', 404);
//     }

//     if (!studentDoc) {
//       throw new AppError('Student not found.', 404);
//     }

//     const preventDoubleSaves = await Payment.findOne({
//       student: student_id,
//       class: studentDoc.current_class?.class_id,
//       session: session_id,
//       term: term,
//     });

//     if (preventDoubleSaves?.is_submit_response === true) {
//       throw new AppError('You have already submitted.', 400);
//     }

//     let studentPaymentDoc;

//     if (is_using === false) {
//       studentPaymentDoc = await Payment.findOneAndUpdate(
//         {
//           student: student_id,
//           class: studentDoc.current_class?.class_id,
//           session: session_id,
//           term: term,
//         },
//         {
//           is_submit_response: true,
//         },
//         { new: true }
//       );
//     } else {
//       if (!studentDoc.home_address || !studentDoc.close_bus_stop) {
//         throw new AppError(
//           'Please update your profile to provide us with your home address and the nearest bus stop.',
//           400
//         );
//       }

//       if (!studentDoc.profile_image?.url) {
//         throw new AppError(
//           'Please upload your profile image as this will be needed to know the student subscribing to school bus.',
//           400
//         );
//       }

//       // I NEED TO CREATE ENDPOINT WHERE STUDENTS CAN DROP HOME ADDRESS, CLOSE BUS STOP AND UPLOAD IMAGE
//       // THIS IS NEEDED TO ACCURATELY MAKE BUS PAYMENT UPDATE WORK

//       const addressDocument = await AddressGroup.find();
//       if (!addressDocument) {
//         throw new AppError('No address document yet.', 404);
//       }

//       const isCloseGroup = addressDocument[0].close_group.find(
//         (p) => p.street === studentDoc.close_bus_stop
//       );
//       const fetchBusFee = await GeneralFee.findOne();

//       let amount;
//       let route;
//       if (isCloseGroup) {
//         if (trip_type === 'both_trips') {
//           amount = fetchBusFee?.school_bus?.close_group?.both_trips;
//         } else {
//           amount = fetchBusFee?.school_bus?.close_group?.single_trip;
//           route = payload.route;
//           console.log('route', route);
//         }
//       }

//       if (!isCloseGroup) {
//         if (trip_type === 'both_trips') {
//           amount = fetchBusFee?.school_bus?.far_group?.both_trips;
//         } else {
//           amount = fetchBusFee?.school_bus?.far_group?.single_trip;
//           route = payload.route;
//           console.log('route', route);
//         }
//       }

//       studentPaymentDoc = await Payment.findOneAndUpdate(
//         {
//           student: student_id,
//           class: studentDoc.current_class?.class_id,
//           session: session_id,
//           term: term,
//         },
//         {
//           is_submit_response: true,
//           $set: {
//             'fees_breakdown.school_bus': {
//               bus_fee: amount,
//               is_using: true,
//               route: trip_type === 'single_trip' ? route : undefined,
//               trip_type: trip_type,
//             },
//           },
//           $inc: { total_amount: amount, remaining_amount: amount },
//         },
//         { new: true }
//       );
//     }

//     return studentPaymentDoc as PaymentDocument;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.error(error);
//       throw new Error('Something happened.');
//     }
//   }
// };

// const createSchoolFeePaymentDocumentForStudents = async (
//   session_id: string,
//   term: string
// ) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     const activeSession = await Session.findOne({
//       _id: session_id,
//       is_active: true,
//     }).session(session);

//     if (!activeSession) {
//       throw new AppError(
//         'Payment can only be created in an active session. Please create a new session and term before proceeding.',
//         400
//       );
//     }

//     const activeTermCheck = activeSession.terms.find((t) => t.name === term);

//     if (activeTermCheck?.is_active !== true) {
//       throw new AppError(
//         'Payment can  only be created in an active term.',
//         400
//       );
//     }

//     const allStudents = await Student.find().session(session);

//     if (!allStudents) {
//       throw new AppError('No students found yet.', 404);
//     }

//     const allSchoolFees = await Fee.find().session(session);

//     if (!allSchoolFees || allSchoolFees.length === 0) {
//       throw new AppError('No school fees found yet.', 404);
//     }

//     const unenrolledStudents = allStudents.filter(
//       (student) =>
//         !student.current_class?.class_id ||
//         student.active_class_enrolment === false
//     );
//     const enrolledStudents = allStudents.filter(
//       (student) =>
//         student.current_class?.class_id ||
//         student.active_class_enrolment === true
//     );

//     /**
//      * FROM ALL STUDENTS, SEPARATE THOSE THAT HAVE PAYMENT DOCUMENT FOR THE TERM FROM THOSE THAT DO NOT HAVE
//      */

//     const studentsWithPaymentDocument: UserDocument[] = [];
//     const studentsWithoutPaymentDocument: UserDocument[] = [];

//     await Promise.all(
//       enrolledStudents.map(async (s) => {
//         const hasPayment = await Payment.findOne({
//           session: session_id,
//           term: term,
//           student: s._id,
//         });

//         if (hasPayment) {
//           studentsWithPaymentDocument.push(s);
//         } else {
//           studentsWithoutPaymentDocument.push(s);
//         }
//       })
//     );

//     if (
//       !studentsWithoutPaymentDocument ||
//       studentsWithoutPaymentDocument.length <= 0
//     ) {
//       throw new AppError(
//         `All enrolled students already have payment document for ${term.replace(
//           '_',
//           ' '
//         )} of ${activeSession.academic_session} session`,
//         400
//       );
//     }

//     const bulkOperations = [];

//     for (const student of studentsWithoutPaymentDocument) {
//       if (!student.current_class_level) {
//         console.warn(
//           `Student with ID ${student._id} and name: ${student.first_name} ${student.last_name} has no current class level field: ${student.current_class_level}`
//         );
//         continue;
//       }

//       const feeForClassLevel = allSchoolFees.find(
//         (fee) =>
//           fee.level.toString() === student.current_class_level?.toString()
//       );

//       if (!feeForClassLevel) {
//         console.warn(
//           `No school fee found for class level: ${student.current_class_level}`
//         );
//         continue;
//       }

//       bulkOperations.push({
//         insertOne: {
//           document: {
//             student: student._id,
//             class: student.current_class?.class_id,
//             session: session_id,
//             term: term,
//             fees_breakdown: {
//               school_fees: feeForClassLevel.school_fees,
//             },
//             total_amount: feeForClassLevel.school_fees,
//             remaining_amount: feeForClassLevel.school_fees,
//           },
//         },
//       });
//     }

//     if (bulkOperations.length === 0) {
//       throw new AppError(
//         'No payment documents created. Ensure all students have corresponding fee.',
//         404
//       );
//     }

//     const paymentDocuments = await Payment.bulkWrite(bulkOperations, {
//       session,
//     });

//     await session.commitTransaction();
//     session.endSession();

//     let msg = '';

//     if (unenrolledStudents.length > 0) {
//       msg = `${
//         unenrolledStudents.length
//       } students are yet to be enrolled into classes for the ${term.replace(
//         '_',
//         ' '
//       )} of ${activeSession.academic_session} session.`;
//     }

//     return {
//       message: `${paymentDocuments.insertedCount} payment documents created successfully. ${msg}`,
//       paymentDocuments,
//     };
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.error(error);
//       throw new Error('Something happened');
//     }
//   }
// };

// const approveStudentBankPayment = async (
//   payload: ApproveStudentPayloadType
// ) => {
//   const { transaction_id, bank_name, payment_id, bursar_id, amount_paid } =
//     payload;
//   try {
//     const findPayment = await Payment.findOne({
//       waiting_for_confirmation: {
//         $elemMatch: {
//           _id: payment_id,
//         },
//       },
//     });

//     if (!findPayment) {
//       throw new AppError('Payment not found.', 404);
//     }

//     const actualTransaction = findPayment.waiting_for_confirmation.find(
//       (p) => p.transaction_id === transaction_id
//     );

//     if (!actualTransaction) {
//       throw new AppError(`Transaction with ${transaction_id} not found`, 404);
//     }

//     if (!actualTransaction.amount_paid) {
//       throw new AppError('Amount paid is null.', 400);
//     }

//     if (actualTransaction.amount_paid !== amount_paid) {
//       throw new AppError('Amount paid does not match.', 400);
//     }

//     if (actualTransaction.bank_name !== bank_name) {
//       throw new AppError('Bank name does not match.', 400);
//     }

//     if (!actualTransaction.transaction_id) {
//       throw new AppError('Transaction ID not present.', 400);
//     }

//     const receipt = {
//       amount_paid: actualTransaction.amount_paid,
//       date_paid: actualTransaction.date_paid,
//       payment_method: actualTransaction.payment_method,
//       transaction_id: actualTransaction.transaction_id,
//       bank_name: actualTransaction.bank_name,
//       status: paymentStatusEnum[1],
//       _id: actualTransaction._id,
//     };

//     const payload = {
//       student_id: findPayment.student.toString(),
//       session_id: findPayment.session.toString(),
//       term: findPayment.term,
//       amount_paying: actualTransaction?.amount_paid,
//       bank_name,
//       teller_number: actualTransaction.transaction_id,
//       staff_who_approve: bursar_id,
//       payment_method: 'bank',
//     };

//     const result = await calculateAndUpdateStudentPaymentDocuments(
//       payload,
//       'bank'
//     );

//     if (!result) {
//       throw new AppError('Unable to update student payment.', 400);
//     }

//     const transactionObj = {
//       result,
//       receipt,
//     };
//     return transactionObj;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.error(error);
//       throw new Error('Something happened');
//     }
//   }
// };

// const fetchStudentOutstandingPaymentDoc = async (student_id: string) => {
//   try {
//     const currentTerm = await Session.findOne({
//       is_active: true,
//     });

//     const activeTerm = currentTerm?.terms.find(
//       (term) => term.is_active === true
//     );

//     const outstandingPayments = await Payment.find({
//       student: student_id,
//       remaining_amount: { $gt: 0 },
//       $or: [
//         { session: { $ne: currentTerm?._id } },
//         { term: { $ne: activeTerm?.name } },
//       ],
//     });

//     outstandingPayments.map((p) => {
//       console.log('remaining_amount', p.remaining_amount);
//     });

//     return outstandingPayments;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened');
//     }
//   }
// };

// const fetchStudentSinglePaymentDoc = async (
//   student_id: string,
//   payment_id: string
// ) => {
//   try {
//     const response = await Payment.findOne({
//       _id: payment_id,
//       student: student_id,
//     });

//     if (!response) {
//       throw new AppError('Payment not found', 404);
//     }

//     return response;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened');
//     }
//   }
// };

// const paystackCallBackService = async (payload: PaystackPayloadType) => {
//   try {
//     const paystackResult = await paystackCallBack(payload);
//     if (!paystackResult) {
//       throw new AppError('Error processing paystack payment', 400);
//     }

//     console.log('paystackResult Log:', paystackResult);

//     return paystackResult;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.error(error);
//       throw new Error('Something happened');
//     }
//   }
// };

// const processPaystackWebHook = async (req: Request, res: Response) => {
//   const response = await paystackWebHook(req, res);

//   return response;
// };

// const fetchCurrentTermPaymentDocuments = async (
//   page: number | undefined,
//   limit: number | undefined,
//   searchParams: string
// ): Promise<{
//   resultArray: PaymentDocument[];
//   totalPages: number;
//   totalCount: number;
// }> => {
//   try {
//     const activeSession = await Session.findOne({
//       is_active: true,
//     });

//     const activeTerm = activeSession?.terms.find(
//       (term) => term.is_active === true
//     );

//     let query = Payment.find({
//       session: activeSession?._id,
//       term: activeTerm?.name,
//     });

//     if (searchParams) {
//       const regex = new RegExp(searchParams, 'i');
//       const isNumber = !isNaN(Number(searchParams));

//       query = query.where({
//         $or: [
//           { term: { $regex: regex } },
//           isNumber ? { total_amount: { $regex: regex } } : undefined,
//         ].filter(Boolean),
//       });
//     }

//     if (!query) {
//       throw new AppError('Payment not found.', 404);
//     }

//     const count = await query.clone().countDocuments();
//     let pages = 0;

//     if (page !== undefined && limit !== undefined && count !== 0) {
//       const offset = (page - 1) * limit;

//       query = query.skip(offset).limit(limit).sort({ createdAt: -1 });

//       pages = Math.ceil(count / limit);

//       if (page > pages) {
//         throw new AppError('Page can not be found.', 404);
//       }
//     }

//     const response = await query;

//     if (!response || response.length === 0) {
//       throw new AppError('No active term payment found.', 404);
//     }

//     const paymentDoc = response as PaymentDocument[];

//     return { resultArray: paymentDoc, totalPages: pages, totalCount: count };
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened.');
//     }
//   }
// };

// const fetchAPaymentNeedingApprovalById = async (
//   payment_id: string
// ): Promise<WaitingForConfirmationType> => {
//   try {
//     const response = await Payment.find({
//       'waiting_for_confirmation.0': { $exists: true },
//     });

//     if (!response) {
//       throw new AppError('Payment not found.', 404);
//     }

//     const result = response
//       ?.map((payment) =>
//         payment.waiting_for_confirmation.find(
//           (p) => p._id.toString() === payment_id
//         )
//       )
//       .filter(Boolean);

//     if (!result) {
//       throw new AppError('Payment not found.', 404);
//     }

//     return result[0] as WaitingForConfirmationType;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened');
//     }
//   }
// };

// const fetchAllPaymentsNeedingApproval = async (
//   page: number | undefined,
//   limit: number | undefined,
//   searchParams: string
// ): Promise<{
//   resultArray: WaitingForConfirmationType[];
//   totalCount: number;
//   totalPages: number;
// }> => {
//   try {
//     let query = Payment.find({
//       'waiting_for_confirmation.0': { $exists: true },
//     });

//     if (searchParams) {
//       const regex = new RegExp(searchParams, 'i');
//       const isNumber = !isNaN(Number(searchParams));

//       query = query.where({
//         waiting_for_confirmation: {
//           $elemMatch: {
//             $or: [
//               {
//                 payment_method: {
//                   $regex: regex,
//                 },
//               },
//               {
//                 bank_name: {
//                   $regex: regex,
//                 },
//               },
//               isNumber
//                 ? {
//                     amount_paid: {
//                       $regex: regex,
//                     },
//                   }
//                 : undefined,
//               {
//                 transaction_id: {
//                   $regex: regex,
//                 },
//               },
//               {
//                 status: {
//                   $regex: regex,
//                 },
//               },
//             ].filter(Boolean),
//           },
//         },
//       });
//     }

//     if (!query) {
//       throw new AppError('Payment not found.', 404);
//     }

//     const count = await query.clone().countDocuments(); // Clone query to avoid execution conflict
//     let pages = 0;

//     if (page !== undefined && limit !== undefined && count !== 0) {
//       const offset = (page - 1) * limit;

//       query = query.skip(offset).limit(limit).sort({ createdAt: -1 });

//       pages = Math.ceil(count / limit);

//       if (page > pages) {
//         throw new AppError('Page can not be found.', 404);
//       }
//     }

//     const result = await query;

//     if (!result || result.length === 0) {
//       throw new AppError('Payment not found.', 404);
//     }

//     const expectedReturn = result
//       .map(
//         (payment) => (
//           payment._id,
//           payment.waiting_for_confirmation.filter(
//             (p) => p.payment_method === 'bank'
//           )
//         )
//       )
//       .flat();

//     const paymentDoc = expectedReturn as WaitingForConfirmationType[];

//     return { resultArray: paymentDoc, totalPages: pages, totalCount: count };
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.log(error);
//       throw new Error('Something happened.');
//     }
//   }
// };

// const fetchAllStudentPaymentDocumentsByStudentId = async (
//   payload: StudentPaymentHistoryType,
//   page: number | undefined,
//   limit: number | undefined,
//   searchParams: string
// ): Promise<{
//   resultArray: PaymentDocument[];
//   totalPages: number;
//   totalCount: number;
// }> => {
//   try {
//     const { student_id, userRole, userId } = payload;

//     if (userRole === 'parent') {
//       const studentDoc = await Student.findById({
//         _id: student_id,
//       });

//       if (!studentDoc?.parent_id?.includes(userId)) {
//         throw new AppError('You are not a parent to this student.', 400);
//       }
//     }

//     let query = Payment.find({
//       student: student_id,
//     });

//     if (searchParams) {
//       const regex = new RegExp(searchParams, 'i');
//       const isNumber = !isNaN(Number(searchParams));

//       query = query.where({
//         $or: [
//           { term: { $regex: regex } },
//           isNumber ? { total_amount: Number(searchParams) } : undefined,
//         ].filter(Boolean),
//       });
//     }

//     if (!query) {
//       throw new AppError('Payments not found.', 404);
//     }

//     const count = await query.clone().countDocuments();
//     let pages = 0;

//     if (page !== undefined && limit !== undefined && count !== 0) {
//       const offset = (page - 1) * limit;

//       query = query.skip(offset).limit(limit).sort({ createdAt: -1 });

//       pages = Math.ceil(count / limit);

//       if (page > pages) {
//         throw new AppError('Page can not be found.', 404);
//       }
//     }

//     const response = await query;

//     if (!response || response.length === 0) {
//       throw new AppError('Student payment documents not found.', 404);
//     }

//     const paymentDoc = response as PaymentDocument[];

//     return { resultArray: paymentDoc, totalPages: pages, totalCount: count };
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened');
//     }
//   }
// };

// const fetchAllPaymentDocuments = async (
//   page: number | undefined,
//   limit: number | undefined,
//   searchParams: string
// ): Promise<{
//   resultArray: PaymentDocument[];
//   totalCount: number;
//   totalPages: number;
// }> => {
//   try {
//     let query = Payment.find().populate('student class session', '-password');

//     if (searchParams) {
//       const regex = new RegExp(searchParams, 'i');
//       const isNumber = !isNaN(Number(searchParams));

//       // ALLOW SEARCH FOR STUDENT NAME CLASS AND SESSION
//       query = query.where({
//         $or: [
//           { term: { $regex: regex } },
//           isNumber ? { total_amount: Number(searchParams) } : undefined,
//         ].filter(Boolean),
//       });
//     }

//     if (!query) {
//       throw new AppError('Payments not found.', 404);
//     }

//     const count = await query.clone().countDocuments();

//     let pages = 0;

//     if (page !== undefined && limit !== undefined && count !== 0) {
//       const offset = (page - 1) * limit;

//       query = query.skip(offset).limit(limit).sort({ createdAt: -1 });

//       pages = Math.ceil(count / limit);

//       if (page > pages) {
//         throw new AppError('Page can not be found', 404);
//       }
//     }
//     const response = await query;

//     if (!response || response.length === 0) {
//       throw new AppError('Payments not found.', 404);
//     }

//     const paymentDoc = response as PaymentDocument[];

//     return { resultArray: paymentDoc, totalPages: pages, totalCount: count };
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened');
//     }
//   }
// };

// const fetchAllPaymentsApprovedByBursarId = async (
//   bursar_id: string,
//   page: number | undefined,
//   limit: number | undefined,
//   searchParams: string
// ): Promise<{
//   resultArray: WaitingForConfirmationType[];
//   totalCount: number;
//   totalPages: number;
// }> => {
//   try {
//     let query = Payment.find({
//       payment_summary: {
//         $elemMatch: {
//           staff_who_approve: bursar_id,
//         },
//       },
//     }).populate('payment_summary.staff_who_approve', '-password');

//     if (searchParams) {
//       const regex = new RegExp(searchParams, 'i');

//       query = query.where({
//         $or: [{ payment_method: { $regex: regex } }],
//       });
//     }

//     if (!query) {
//       throw new AppError('Payment not found.', 404);
//     }

//     const count = await query.clone().countDocuments();

//     let pages = 0;

//     if (page !== undefined && limit !== undefined && count !== 0) {
//       const offset = (page - 1) * limit;

//       query = query.skip(offset).limit(limit).sort({ createdAt: -1 });

//       pages = Math.ceil(count / limit);

//       if (page > pages) {
//         throw new AppError('Page not found', 404);
//       }
//     }
//     const response = await query;

//     if (!response || response.length === 0) {
//       throw new AppError('Payments not found.', 404);
//     }

//     const expectedReturn = response
//       .map((payment) =>
//         payment.payment_summary.filter(
//           (p) => p?.staff_who_approve?._id.toString() === bursar_id
//         )
//       )
//       .flat();

//     const paymentDoc = expectedReturn as WaitingForConfirmationType[];

//     return { resultArray: paymentDoc, totalCount: count, totalPages: pages };
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened');
//     }
//   }
// };

// const fetchPaymentDetailsByPaymentId = async (
//   payload: PaymentDataType
// ): Promise<PaymentDocument> => {
//   try {
//     const { payment_id, userId, userRole } = payload;

//     const paymentDetails = await Payment.findById({
//       _id: payment_id,
//     });

//     if (!paymentDetails) {
//       throw new AppError(
//         `Payment document with ID: ${payment_id} not found.`,
//         404
//       );
//     }

//     if (userRole === 'student') {
//       if (paymentDetails.student !== userId) {
//         throw new AppError(
//           `Payment document with ID: ${payment_id} does not belong to you.`,
//           403
//         );
//       }
//     } else if (userRole === 'parent') {
//       const student = await Student.findById({
//         _id: paymentDetails.student,
//       });

//       if (!student?.parent_id?.includes(userId)) {
//         throw new AppError(
//           `You are not a parent to the student that owns this payment document.`,
//           403
//         );
//       }
//     }

//     return paymentDetails as PaymentDocument;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened');
//     }
//   }
// };

// const fetchAllPaymentSummaryFailedAndSuccessful =
//   async (): // page: number | undefined,
//   // limit: number | undefined,
//   // searchParams: string
//   Promise<{
//     // totalCount: number;
//     // totalPages: number;
//     paymentObj: PaymentHistoryDataType[];
//   }> => {
//     try {
//       // const matchStage: any = {};

//       // if (searchParams) {
//       //   const regex = new RegExp(searchParams, 'i');
//       //   matchStage.$or = [
//       //     { 'payment_summary.payment_method': regex },
//       //     { 'payment_summary.transaction_id': regex },
//       //     { 'payment_summary.bank_name': regex },
//       //     { 'payment_summary.status': regex },
//       //     { 'waiting_for_confirmation.payment_method': regex },
//       //     { 'waiting_for_confirmation.transaction_id': regex },
//       //     { 'waiting_for_confirmation.status': regex },
//       //     { 'waiting_for_confirmation.bank_name': regex },
//       //     { 'waiting_for_confirmation.message': regex },
//       //   ];
//       // }

//       // const countPipeline = [
//       //   { $match: matchStage },
//       //   {
//       //     $project: {
//       //       transaction_history: {
//       //         $setUnion: ['$payment_summary', '$waiting_for_confirmation'],
//       //       },
//       //     },
//       //   },
//       //   { $unwind: '$transaction_history' },
//       //   { $count: 'count' },
//       // ];

//       // const countResult = await Payment.aggregate(countPipeline);
//       // const count = countResult[0]?.count || 0;

//       // let pages = 0;
//       // let pages = Math.ceil(count / (limit || 10));

//       // if (count === 0) {
//       //   return { paymentObj: [], totalCount: count, totalPages: pages };
//       // }

//       // if (limit) {
//       // pages = Math.ceil(count / limit);
//       // console.log('Total count of transactions:', count);
//       // console.log('Total pages calculated:', pages);
//       // if (page && page > pages) {
//       //   throw new AppError('Page can no be found.', 404);
//       // }
//       // // }

//       const pipeline: any[] = [];
//       // const pipeline: any[] = [{ $match: matchStage }];

//       // if (page !== undefined && limit !== undefined) {
//       // const offset = (page - 1) * limit;
//       // const offset = (page - 1) * (limit || 10);
//       // console.log(`Page: ${page}, Limit: ${limit}, Offset: ${offset}`);
//       // if (offset >= count) {
//       //   console.log('offset is greater than count');
//       //   return { paymentObj: [], totalCount: count, totalPages: pages };
//       // }
//       // pipeline.push(
//       //   { $sort: { createdAt: -1 } },
//       //   { $skip: offset },
//       //   { $limit: limit }
//       // );
//       // console.log(`Page: ${page}, Limit: ${limit}, Offset: ${offset}`);
//       // console.log(`Pipeline: ${JSON.stringify(pipeline, null, 2)}`);
//       // }

//       // project only the required fields
//       pipeline.push({
//         $project: {
//           _id: 1,
//           payment_summary: 1,
//           waiting_for_confirmation: 1,
//           transaction_history: {
//             $setUnion: [
//               { $ifNull: ['$payment_summary', []] },
//               { $ifNull: ['$waiting_for_confirmation', []] },
//             ],
//           },
//         },
//       });

//       const payments = await Payment.aggregate(pipeline);

//       const objPay = payments
//         .flatMap((p) => p.transaction_history || [])
//         .filter((t) => t && t.date_paid)
//         .sort(
//           (a, b) =>
//             new Date(b.date_paid).getTime() - new Date(a.date_paid).getTime()
//         );

//       return {
//         paymentObj: objPay as PaymentHistoryDataType[],
//         // totalCount: count,
//         // totalPages: pages,
//       };
//     } catch (error) {
//       if (error instanceof AppError) {
//         throw new AppError(error.message, error.statusCode);
//       } else {
//         console.log(error);
//         throw new Error('Something happened');
//       }
//     }
//   };

// // const fetchPaymentTransactionHistoryByStudentId = async (
// //   page: number | undefined,
// //   limit: number | undefined,
// //   searchParams: string,
// //   payload: StudentPaymentHistoryType
// // ): Promise<{
// //   totalCount: number;
// //   totalPages: number;
// //   paymentObj: PaymentHistoryDataType[];
// // }> => {
// //   try {
// //     const { student_id, userId, userRole } = payload;

// //     // Verify parent relationship if userRole is 'parent'
// //     if (student_id !== userId.toString() && userRole === 'parent') {
// //       const student = await Student.findById({ _id: student_id });
// //       if (student) {
// //         if (!student.parent_id?.includes(userId)) {
// //           throw new AppError(
// //             `You are not a parent to ${student.first_name} ${student.last_name}.`,
// //             403
// //           );
// //         }
// //       }
// //     }

// //     // Build the match stage
// //     const matchStage: any = {
// //       student: new mongoose.Types.ObjectId(student_id),
// //     };

// //     // Add search filters
// //     if (searchParams) {
// //       const regex = new RegExp(searchParams, 'i');
// //       const numericSearchParam = parseFloat(searchParams);

// //       const $orConditions: any[] = [
// //         { 'payment_summary.payment_method': regex },
// //         { 'payment_summary.transaction_id': regex },
// //         { 'payment_summary.status': regex },
// //         { 'payment_summary.bank_name': regex },
// //         { 'waiting_for_confirmation.payment_method': regex },
// //         { 'waiting_for_confirmation.transaction_id': regex },
// //         { 'waiting_for_confirmation.status': regex },
// //         { 'waiting_for_confirmation.bank_name': regex },
// //       ];

// //       // Add numeric conditions if searchParams is a valid number
// //       if (!isNaN(numericSearchParam)) {
// //         $orConditions.push(
// //           { 'payment_summary.amount_paid': numericSearchParam },
// //           { 'waiting_for_confirmation.amount_paid': numericSearchParam }
// //         );
// //       }

// //       matchStage.$or = $orConditions;
// //     }

// //     // Count total documents
// //     const countPromise = Payment.aggregate([
// //       { $match: matchStage },
// //       { $count: 'totalCount' },
// //     ]);

// //     // Add pagination and sorting
// //     const pipeline: any[] = [
// //       { $match: matchStage },
// //       { $sort: { createdAt: -1 } }, // Sort by creation date descending
// //     ];

// //     if (page !== undefined && limit !== undefined) {
// //       const offset = (page - 1) * limit;
// //       pipeline.push({ $skip: offset }, { $limit: limit });
// //     }

// //     // Project only required fields
// //     pipeline.push({
// //       $project: {
// //         _id: 1,
// //         transaction_history: {
// //           $setUnion: ['$payment_summary', '$waiting_for_confirmation'],
// //         },
// //       },
// //     });

// //     const [countResult, payments] = await Promise.all([
// //       countPromise,
// //       Payment.aggregate(pipeline).sort({ date_paid: -1 }),
// //     ]);

// //     const objPay = payments
// //       .flatMap((p) => p.transaction_history)
// //       .sort(
// //         (a, b) =>
// //           new Date(b.date_paid).getTime() - new Date(a.date_paid).getTime()
// //       );

// //     const totalCount = countResult[0]?.totalCount || 0;
// //     const totalPages = limit ? Math.ceil(totalCount / limit) : 1;

// //     if (page && page > totalPages) {
// //       throw new AppError('Page can not be found.', 404);
// //     }

// //     return {
// //       paymentObj: objPay as PaymentHistoryDataType[],
// //       totalCount,
// //       totalPages,
// //     };
// //   } catch (error) {
// //     if (error instanceof AppError) {
// //       throw new AppError(error.message, error.statusCode);
// //     } else {
// //       throw new Error('Something happened');
// //     }
// //   }
// // };

// /**
//  * PARAMETERS NEEDED TO CALCULATE SUBJECT POSITION GRADING
//  * SUBJECT_ID
//  * ACADEMIC SESSION ID
//  * TERM
//  * CLASS ID
//  * STUDENT OBJECT IN AN ARRAY LIKE THIS
//  * STUDENT_OBJECT:{
//  * TOTAL_SCORE,
//  * STUDENT ID
//  * }[]
//  */

// const fetchPaymentTransactionHistoryByStudentId = async (
//   payload: StudentPaymentHistoryType
// ): Promise<{
//   // totalCount: number;
//   paymentObj: PaymentHistoryDataType[];
// }> => {
//   try {
//     const { student_id, userId, userRole } = payload;

//     // Verify parent relationship if userRole is 'parent'
//     if (student_id !== userId.toString() && userRole === 'parent') {
//       const student = await Student.findById({ _id: student_id });
//       if (student) {
//         if (!student.parent_id?.includes(userId)) {
//           throw new AppError(
//             `You are not a parent to ${student.first_name} ${student.last_name}.`,
//             403
//           );
//         }
//       }
//     }

//     // Build the match stage
//     const matchStage: any = {
//       student: new mongoose.Types.ObjectId(student_id),
//     };

//     // Count total documents
//     const countPromise = Payment.aggregate([
//       { $match: matchStage },
//       { $count: 'totalCount' },
//     ]);

//     // Remove pagination and sorting for fetching all documents
//     const pipeline: any[] = [
//       { $match: matchStage },
//       { $sort: { createdAt: -1 } }, // Sort by creation date descending
//       {
//         $project: {
//           _id: 1,
//           transaction_history: {
//             $setUnion: ['$payment_summary', '$waiting_for_confirmation'],
//           },
//         },
//       },
//     ];

//     // Run aggregation
//     const [countResult, payments] = await Promise.all([
//       countPromise,
//       Payment.aggregate(pipeline),
//     ]);

//     const objPay = payments
//       .flatMap((p) => p.transaction_history)
//       .sort(
//         (a, b) =>
//           new Date(b.date_paid).getTime() - new Date(a.date_paid).getTime()
//       );

//     // const totalCount = countResult[0]?.totalCount || 0;

//     return {
//       paymentObj: objPay as PaymentHistoryDataType[],
//       // totalCount,
//     };
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened');
//     }
//   }
// };

// export {
//   fetchPaymentTransactionHistoryByStudentId,
//   fetchPaymentDetailsByPaymentId,
//   fetchAllPaymentSummaryFailedAndSuccessful,
//   fetchAllPaymentsApprovedByBursarId,
//   fetchAllStudentPaymentDocumentsByStudentId,
//   fetchAllPaymentsNeedingApproval,
//   fetchCurrentTermPaymentDocuments,
//   processPaystackWebHook,
//   fetchStudentSinglePaymentDoc,
//   paystackCallBackService,
//   fetchStudentOutstandingPaymentDoc,
//   approveStudentBankPayment,
//   addSchoolBusToStudentPaymentDocument,
//   createSchoolFeePaymentDocumentForStudents,
//   studentCashFeePayment,
//   studentCardFeePayment,
//   studentBankFeePayment,
//   fetchAllPaymentDocuments,
//   fetchAPaymentNeedingApprovalById,
// };

////////////////////////////////////////////////////////////////////////
import mongoose from 'mongoose';
import { AppError } from '../utils/app.error';
import Session from '../models/session.model';
import Student from '../models/students.model';
import Fee from '../models/fees.model';
import {
  AddFeeToStudentPaymentDocType,
  AddingFeeToPaymentPayload,
  PaymentDataType,
  PaymentDocument,
  PaymentHistoryDataType,
  StudentPaymentHistoryType,
  UserDocument,
  PaymentPayloadType,
  PaymentPriorityType,
  AccountDetailsType,
} from '../constants/types';
import Payment from '../models/payment.model';
import { addFeeToStudentPaymentDoc } from '../repository/payment.repository';
import PaymentPriority from '../models/payment_priority.model';
import SchoolAccount from '../models/school_account.model';
import { Request, Response } from 'express';
import { bankWebhook } from '../utils/bank';
// import BusSubscription from '../models/bus_subscription.model';

const createSchoolFeePaymentDocumentForStudents = async (
  session_id: string,
  term: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const activeSession = await Session.findOne({
      _id: session_id,
      is_active: true,
    }).session(session);

    if (!activeSession) {
      throw new AppError(
        'Payment can only be created in an active session. Please create a new session and term before proceeding.',
        400
      );
    }

    // console.log('SERVICE activeSession:', activeSession);

    const activeTermCheck = activeSession.terms.find((t) => t.name === term);

    if (activeTermCheck?.is_active !== true) {
      throw new AppError(
        'Payment can  only be created in an active term.',
        400
      );
    }

    // console.log('SERVICE activeTermCheck:', activeTermCheck);

    const allStudents = await Student.find().session(session);

    if (!allStudents) {
      throw new AppError('No students found yet.', 404);
    }

    // console.log('SERVICE allStudents:', allStudents);

    const allSchoolFees = await Fee.find().session(session);

    if (!allSchoolFees || allSchoolFees.length === 0) {
      throw new AppError('No school fees found yet.', 404);
    }

    // console.log('SERVICE allSchoolFees:', allSchoolFees);

    const unenrolledStudents = allStudents.filter(
      (student) =>
        !student.current_class?.class_id ||
        student.active_class_enrolment === false
    );

    const enrolledStudents = allStudents.filter(
      (student) =>
        student.current_class?.class_id ||
        student.active_class_enrolment === true
    );

    // console.log('SERVICE enrolledStudents:', enrolledStudents);

    /**
     * FROM ALL STUDENTS, SEPARATE THOSE THAT HAVE PAYMENT DOCUMENT FOR THE TERM FROM THOSE THAT DO NOT HAVE
     */

    const studentsWithPaymentDocument: UserDocument[] = [];
    const studentsWithoutPaymentDocument: UserDocument[] = [];

    await Promise.all(
      enrolledStudents.map(async (s) => {
        const hasPayment = await Payment.findOne({
          session: session_id,
          term: term,
          student: s._id,
        });

        if (hasPayment) {
          studentsWithPaymentDocument.push(s);
        } else {
          studentsWithoutPaymentDocument.push(s);
        }
      })
    );

    console.log(
      'SERVICE studentsWithoutPaymentDocument:',
      studentsWithoutPaymentDocument
    );

    if (
      !studentsWithoutPaymentDocument ||
      studentsWithoutPaymentDocument.length <= 0
    ) {
      throw new AppError(
        `All enrolled students already have payment document for ${term.replace(
          '_',
          ' '
        )} of ${activeSession.academic_session} session`,
        400
      );
    }

    const bulkOperations = [];

    for (const student of studentsWithoutPaymentDocument) {
      if (!student.current_class_level) {
        console.warn(
          `Student with ID ${student._id} and name: ${student.first_name} ${student.last_name} has no current class level field: ${student.current_class_level}`
        );
        continue;
      }

      const feeForClassLevel = allSchoolFees.find(
        (fee) =>
          fee.level.toString() === student.current_class_level?.toString()
      );

      if (!feeForClassLevel) {
        console.warn(
          `No school fee found for class level: ${student.current_class_level}`
        );
        continue;
      }

      let fees_breakdown: {
        fee_name: string;
        amount: number;
        receiving_account: mongoose.Types.ObjectId;
      }[] = [];
      // let fees_breakdown: { fee_name: string; amount: number }[] = [
      //   {
      //     fee_name: 'School_fees',
      //     amount: feeForClassLevel.school_fees,
      //   },
      // ];

      if (Array.isArray(feeForClassLevel.mandatory_fees)) {
        feeForClassLevel.mandatory_fees.forEach((fee) => {
          fees_breakdown.push({
            fee_name: fee.fee_name,
            amount: fee.amount,
            receiving_account: fee.receiving_account,
          });
        });
      }

      if (Array.isArray(feeForClassLevel.optional_fees)) {
        feeForClassLevel.optional_fees.forEach((fee) => {
          if (
            Array.isArray(fee.applicable_classes) &&
            fee.applicable_classes.some(
              (classId) =>
                classId.toString() ===
                student.current_class?.class_id.toString()
            )
          ) {
            fees_breakdown.push({
              fee_name: fee.fee_name,
              amount: fee.amount,
              receiving_account: fee.receiving_account,
            });
          }
        });
      }

      const total_amount = fees_breakdown.reduce(
        (sum, fee) => sum + fee.amount,
        0
      );
      console.log('SERVICE total_amount:', total_amount);

      bulkOperations.push({
        insertOne: {
          document: {
            student: student._id,
            class: student.current_class?.class_id,
            class_level: student.current_class_level,
            session: session_id,
            term: term,
            fees_breakdown,
            total_amount: total_amount,
            remaining_amount: total_amount,
          },
        },
      });
    }

    if (bulkOperations.length === 0) {
      throw new AppError(
        'No payment documents created. Ensure all students have corresponding fee.',
        404
      );
    }

    const paymentDocuments = await Payment.bulkWrite(bulkOperations, {
      session,
    });

    let msg = '';

    if (unenrolledStudents.length > 0) {
      msg = `${
        unenrolledStudents.length
      } students are yet to be enrolled into classes for the ${term.replace(
        '_',
        ' '
      )} of ${activeSession.academic_session} session.`;
    }

    await session.commitTransaction();
    session.endSession();

    return {
      message: `${paymentDocuments.insertedCount} payment documents created successfully. ${msg}`,
      paymentDocuments,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.error(error);
      throw new Error('Something happened');
    }
  }
};

// for adding fee to individual student by clicking on edit student
const addingFeeToStudentPaymentDocument = async (
  payload: AddingFeeToPaymentPayload
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { fee_name, amount, student_id, receiving_acc_id } = payload;

    const studentId = Object(student_id);

    const schoolSession = await Session.findOne({
      is_active: true,
    }).session(session);

    if (!schoolSession) {
      throw new AppError('There is no active session.', 400);
    }

    const activeTerm = schoolSession.terms.find(
      (term) => term.is_active === true
    );

    console.log('activeTerm:', activeTerm);
    if (!activeTerm) {
      throw new AppError(
        'There is no active term where the payment document can be updated.',
        400
      );
    }

    const payload2: AddFeeToStudentPaymentDocType = {
      session_id: schoolSession?._id,
      termName: activeTerm?.name,
      studentId: studentId,
      session: session,
      fee_name: fee_name,
      amount: amount,
      receiving_acc_id,
    };

    const addPayment = await addFeeToStudentPaymentDoc(payload2);

    await session.commitTransaction();
    session.endSession();
    return addPayment;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.error(error);
      throw new Error(`Something happened: ${error}`);
    }
  }
};

const fetchAllStudentPaymentDocumentsByStudentId = async (
  payload: StudentPaymentHistoryType,
  page: number | undefined,
  limit: number | undefined,
  searchParams: string
): Promise<{
  resultArray: PaymentDocument[];
  totalPages: number;
  totalCount: number;
}> => {
  try {
    const { student_id, userRole, userId } = payload;

    if (userRole === 'parent') {
      const studentDoc = await Student.findOne({
        _id: student_id,
      });

      if (!studentDoc?.parent_id?.includes(userId)) {
        throw new AppError('You are not a parent to this student.', 400);
      }
    }

    let query = Payment.find({
      student: student_id,
    });

    if (searchParams) {
      const regex = new RegExp(searchParams, 'i');
      const isNumber = !isNaN(Number(searchParams));

      query = query.where({
        $or: [
          { term: { $regex: regex } },
          isNumber ? { total_amount: Number(searchParams) } : undefined,
        ].filter(Boolean),
      });
    }

    if (!query) {
      throw new AppError('Payments not found.', 404);
    }

    const count = await query.clone().countDocuments();
    let pages = 0;

    if (page !== undefined && limit !== undefined && count !== 0) {
      const offset = (page - 1) * limit;

      query = query.skip(offset).limit(limit);

      pages = Math.ceil(count / limit);

      if (page > pages) {
        throw new AppError('Page can not be found.', 404);
      }
    }

    const response = await query.sort({ createdAt: -1 });

    if (!response || response.length === 0) {
      throw new AppError('Student payment documents not found.', 404);
    }

    const paymentDoc = response as PaymentDocument[];

    return { resultArray: paymentDoc, totalPages: pages, totalCount: count };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchAllPaymentDocuments = async (
  page: number | undefined,
  limit: number | undefined,
  searchParams: string
): Promise<{
  resultArray: PaymentDocument[];
  totalCount: number;
  totalPages: number;
}> => {
  try {
    let query = Payment.find().populate('student class session', '-password');

    if (searchParams) {
      const regex = new RegExp(searchParams, 'i');
      const isNumber = !isNaN(Number(searchParams));

      // ALLOW SEARCH FOR STUDENT NAME CLASS AND SESSION
      query = query.where({
        $or: [
          { term: { $regex: regex } },
          isNumber ? { total_amount: Number(searchParams) } : undefined,
        ].filter(Boolean),
      });
    }

    if (!query) {
      throw new AppError('Payments not found.', 404);
    }

    const count = await query.clone().countDocuments();

    let pages = 0;

    if (page !== undefined && limit !== undefined && count !== 0) {
      const offset = (page - 1) * limit;

      query = query.skip(offset).limit(limit);

      pages = Math.ceil(count / limit);

      if (page > pages) {
        throw new AppError('Page can not be found', 404);
      }
    }
    const response = await query.sort({ createdAt: -1 });

    if (!response || response.length === 0) {
      throw new AppError('Payments not found.', 404);
    }

    const paymentDoc = response as PaymentDocument[];

    return { resultArray: paymentDoc, totalPages: pages, totalCount: count };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchStudentOutstandingPaymentDoc = async (student_id: string) => {
  try {
    const currentTerm = await Session.findOne({
      is_active: true,
    });

    const activeTerm = currentTerm?.terms.find(
      (term) => term.is_active === true
    );

    const outstandingPayments = await Payment.find({
      student: student_id,
      remaining_amount: { $gt: 0 },
      $or: [
        { session: { $ne: currentTerm?._id } },
        { term: { $ne: activeTerm?.name } },
      ],
    });

    outstandingPayments.map((p) => {
      console.log('remaining_amount', p.remaining_amount);
    });

    return outstandingPayments;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchCurrentTermPaymentDocuments = async (
  page: number | undefined,
  limit: number | undefined,
  searchParams: string
): Promise<{
  resultArray: PaymentDocument[];
  totalPages: number;
  totalCount: number;
}> => {
  try {
    const activeSession = await Session.findOne({
      is_active: true,
    });

    const activeTerm = activeSession?.terms.find(
      (term) => term.is_active === true
    );

    let query = Payment.find({
      session: activeSession?._id,
      term: activeTerm?.name,
    });

    if (searchParams) {
      const regex = new RegExp(searchParams, 'i');
      const isNumber = !isNaN(Number(searchParams));

      query = query.where({
        $or: [
          { term: { $regex: regex } },
          isNumber ? { total_amount: { $regex: regex } } : undefined,
        ].filter(Boolean),
      });
    }

    if (!query) {
      throw new AppError('Payment not found.', 404);
    }

    const count = await query.clone().countDocuments();
    let pages = 0;

    if (page !== undefined && limit !== undefined && count !== 0) {
      const offset = (page - 1) * limit;

      query = query.skip(offset).limit(limit);

      pages = Math.ceil(count / limit);

      if (page > pages) {
        throw new AppError('Page can not be found.', 404);
      }
    }

    const response = await query.sort({ createdAt: -1 });

    if (!response || response.length === 0) {
      throw new AppError('No active term payment found.', 404);
    }

    const paymentDoc = response as PaymentDocument[];

    return { resultArray: paymentDoc, totalPages: pages, totalCount: count };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened.');
    }
  }
};

const fetchPaymentTransactionHistoryByStudentId = async (
  payload: StudentPaymentHistoryType
): Promise<{
  // totalCount: number;
  paymentObj: PaymentHistoryDataType[];
}> => {
  try {
    const { student_id, userId, userRole } = payload;

    // Verify parent relationship if userRole is 'parent'
    if (student_id !== userId.toString() && userRole === 'parent') {
      const student = await Student.findOne({
        _id: student_id,
      });
      if (student) {
        if (!student.parent_id?.includes(userId)) {
          throw new AppError(
            `You are not a parent to ${student.first_name} ${student.last_name}.`,
            403
          );
        }
      }
    }

    // Build the match stage
    const matchStage: any = {
      student: new mongoose.Types.ObjectId(student_id),
    };

    // Count total documents
    const countPromise = Payment.aggregate([
      { $match: matchStage },
      { $count: 'totalCount' },
    ]);

    // Remove pagination and sorting for fetching all documents
    const pipeline: any[] = [
      { $match: matchStage },
      { $sort: { createdAt: -1 } }, // Sort by creation date descending
      {
        $project: {
          _id: 1,
          transaction_history: {
            $setUnion: ['$payment_summary', '$waiting_for_confirmation'],
          },
        },
      },
    ];

    // Run aggregation
    const [countResult, payments] = await Promise.all([
      countPromise,
      Payment.aggregate(pipeline),
    ]);

    const objPay = payments
      .flatMap((p) => p.transaction_history)
      .sort(
        (a, b) =>
          new Date(b.date_paid).getTime() - new Date(a.date_paid).getTime()
      );

    // const totalCount = countResult[0]?.totalCount || 0;

    return {
      paymentObj: objPay as PaymentHistoryDataType[],
      // totalCount,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchPaymentDetailsByPaymentId = async (
  payload: PaymentDataType
): Promise<PaymentDocument> => {
  try {
    const { payment_id, userId, userRole } = payload;

    const paymentDetails = await Payment.findOne({
      _id: payment_id,
    });

    if (!paymentDetails) {
      throw new AppError(
        `Payment document with ID: ${payment_id} not found.`,
        404
      );
    }

    if (userRole === 'student') {
      if (paymentDetails.student !== userId) {
        throw new AppError(
          `Payment document with ID: ${payment_id} does not belong to you.`,
          403
        );
      }
    } else if (userRole === 'parent') {
      const student = await Student.findOne({
        _id: paymentDetails.student,
      });

      if (!student?.parent_id?.includes(userId)) {
        throw new AppError(
          `You are not a parent to the student that owns this payment document.`,
          403
        );
      }
    }

    return paymentDetails as PaymentDocument;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchStudentSinglePaymentDoc = async (
  student_id: string,
  payment_id: string
) => {
  try {
    const response = await Payment.findOne({
      _id: payment_id,
      student: student_id,
    });

    if (!response) {
      throw new AppError('Payment not found', 404);
    }

    return response;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchAllPaymentSummaryFailedAndSuccessful =
  async (): // page: number | undefined,
  // limit: number | undefined,
  // searchParams: string
  Promise<{
    // totalCount: number;
    // totalPages: number;
    paymentObj: PaymentHistoryDataType[];
  }> => {
    try {
      // const matchStage: any = {};

      // if (searchParams) {
      //   const regex = new RegExp(searchParams, 'i');
      //   matchStage.$or = [
      //     { 'payment_summary.payment_method': regex },
      //     { 'payment_summary.transaction_id': regex },
      //     { 'payment_summary.bank_name': regex },
      //     { 'payment_summary.status': regex },
      //     { 'waiting_for_confirmation.payment_method': regex },
      //     { 'waiting_for_confirmation.transaction_id': regex },
      //     { 'waiting_for_confirmation.status': regex },
      //     { 'waiting_for_confirmation.bank_name': regex },
      //     { 'waiting_for_confirmation.message': regex },
      //   ];
      // }

      // const countPipeline = [
      //   { $match: matchStage },
      //   {
      //     $project: {
      //       transaction_history: {
      //         $setUnion: ['$payment_summary', '$waiting_for_confirmation'],
      //       },
      //     },
      //   },
      //   { $unwind: '$transaction_history' },
      //   { $count: 'count' },
      // ];

      // const countResult = await Payment.aggregate(countPipeline);
      // const count = countResult[0]?.count || 0;

      // let pages = 0;
      // let pages = Math.ceil(count / (limit || 10));

      // if (count === 0) {
      //   return { paymentObj: [], totalCount: count, totalPages: pages };
      // }

      // if (limit) {
      // pages = Math.ceil(count / limit);
      // console.log('Total count of transactions:', count);
      // console.log('Total pages calculated:', pages);
      // if (page && page > pages) {
      //   throw new AppError('Page can no be found.', 404);
      // }
      // // }

      const pipeline: any[] = [];
      // const pipeline: any[] = [{ $match: matchStage }];

      // if (page !== undefined && limit !== undefined) {
      // const offset = (page - 1) * limit;
      // const offset = (page - 1) * (limit || 10);
      // console.log(`Page: ${page}, Limit: ${limit}, Offset: ${offset}`);
      // if (offset >= count) {
      //   console.log('offset is greater than count');
      //   return { paymentObj: [], totalCount: count, totalPages: pages };
      // }
      // pipeline.push(
      //   { $sort: { createdAt: -1 } },
      //   { $skip: offset },
      //   { $limit: limit }
      // );
      // console.log(`Page: ${page}, Limit: ${limit}, Offset: ${offset}`);
      // console.log(`Pipeline: ${JSON.stringify(pipeline, null, 2)}`);
      // }

      // project only the required fields
      pipeline.push({
        $project: {
          _id: 1,
          payment_summary: 1,
          waiting_for_confirmation: 1,
          transaction_history: {
            $setUnion: [
              { $ifNull: ['$payment_summary', []] },
              { $ifNull: ['$waiting_for_confirmation', []] },
            ],
          },
        },
      });

      const payments = await Payment.aggregate(pipeline);

      const objPay = payments
        .flatMap((p) => p.transaction_history || [])
        .filter((t) => t && t.date_paid)
        .sort(
          (a, b) =>
            new Date(b.date_paid).getTime() - new Date(a.date_paid).getTime()
        );

      return {
        paymentObj: objPay as PaymentHistoryDataType[],
        // totalCount: count,
        // totalPages: pages,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw new AppError(error.message, error.statusCode);
      } else {
        console.log(error);
        throw new Error('Something happened');
      }
    }
  };

const paymentPriorityCreation = async (payload: PaymentPriorityType) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { priority_order } = payload;

    const paymentPriorityExist = await PaymentPriority.findOne({}).session(
      session
    );

    if (paymentPriorityExist) {
      throw new AppError('School has already set payment priority.', 400);
    }

    const newPaymentPriority = await new PaymentPriority({
      priority_order: priority_order,
    }).save({ session });

    await session.commitTransaction();
    session.endSession();
    return newPaymentPriority;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened');
    }
  }
};

const fetchPaymentPriorityForMySchool = async () => {
  try {
    const paymentPriorityExist = await PaymentPriority.findOne({});

    if (!paymentPriorityExist) {
      throw new AppError('Payment priority not found.', 404);
    }

    return paymentPriorityExist;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened');
    }
  }
};

// const processPayment = async(payload: PaymentPayloadType)=>{

//   const {school_id, student_id, amount_paid} = payload
//   const school = Object(school_id)
//   const student = Object(student_id)

//   const paymentPreference = await PaymentPreference

// const studentPayment = await Payment.findOne({
//   student: student,
//   school: school,

// })

// }

const studentWalletDepositProcessing = async (req: Request, res: Response) => {
  try {
    const response = await bankWebhook(req, res);
    return response;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened');
    }
  }
};

export {
  studentWalletDepositProcessing,
  fetchPaymentPriorityForMySchool,
  paymentPriorityCreation,
  fetchAllPaymentSummaryFailedAndSuccessful,
  fetchStudentSinglePaymentDoc,
  fetchPaymentDetailsByPaymentId,
  fetchPaymentTransactionHistoryByStudentId,
  fetchCurrentTermPaymentDocuments,
  fetchStudentOutstandingPaymentDoc,
  fetchAllPaymentDocuments,
  fetchAllStudentPaymentDocumentsByStudentId,
  addingFeeToStudentPaymentDocument,
  createSchoolFeePaymentDocumentForStudents,
};
