import express from 'express';
import {
  createPaymentDocumentForAllStudent,
  makeCardPayment,
  getAllStudentPaymentDocumentsByStudentId,
  approveBankPaymentWithId,
  getAllPaymentDocuments,
  getAllOutstandingPaymentDocumentsOfStudent,
  getCurrentTermPaymentDocuments,
  getPaymentTransactionHistoryByStudentId,
  getPaymentDetailsByPaymentId,
  getAPaymentDocumentOfStudentByStudentIdAndPaymentId,
  getAllPaymentSummaryFailedAndSuccessful,
  getPaystackCallBack,
  getPaystackWebHook,
  getAPaymentNeedingApprovalById,
  getAllPaymentsNeedingApproval,
  getAllPaymentsApprovedByBursarId,
} from '../controllers/payment.controller';
import { verifyAccessToken } from '../middleware/jwtAuth';
import { permission } from '../middleware/authorization';

const router = express.Router();

/*
*ENDPOINTS
 UPDATE PAYMENT(INCASE SCHOOL FEES CHANGES)
 CREATE AN ENDPOINT TO ALLOW ADMIN TO CREATE SCHOOL FEE PAYMENT DOCUMENT FOR SELECTED STUDENTS WHICH WILL NOT CREATE FOR ALL STUDENTS SO AS TO AVOID MULTIPLE PAYMENT DOCUMENTS FROM BEING CREATED FOR STUDENT PER TERM.

 read about discriminator in mongoDB
 */

// FETCH PAYMENT DOCUMENT BY PAYMENT ID(DONE)
// ENDPOINT TO RETURN ONLY PAYMENT SUMMARY AND WAITING FOR CONFIRMATION ARRAY FOR THE WHOLE SCHOOL(ADMIN, SUPER ADMIN)(DONE)
// getAllPaymentSummaryFailedAndSuccessfulResponse EDIT THIS FOR THE COMMENT UP(DONE)
// FETCH ALL PAYMENT TRANSACTION HISTORY OF STUDENT USING STUDENT ID(PAYMENT SUMMARY AND AWAITING CONFIRMATION)(DONE)

// FILTER AMOUNT, ID AND DATE PAID

router.post('/paystack-web-hook', getPaystackWebHook);

router.use(verifyAccessToken);

router.get('/paystack-call-back/:reference/:student_id', getPaystackCallBack);

router.get(
  '/get-payment-by-payment-id/:payment_id',
  permission(['super_admin', 'parent', 'student', 'admin']),
  getPaymentDetailsByPaymentId
);

router.get(
  '/get-payment-transaction-history-of-student/:student_id',
  permission(['super_admin', 'parent', 'student', 'admin']),
  getPaymentTransactionHistoryByStudentId
);

router.post(
  '/create-payment-document-with-only-school-fees/:session_id',
  permission(['super_admin']),
  createPaymentDocumentForAllStudent
);

router.get(
  '/get-current-term-payment-documents',
  permission(['super_admin', 'admin']),
  getCurrentTermPaymentDocuments
);

router.get(
  '/get-all-payment-documents',
  permission(['super_admin', 'admin']),
  getAllPaymentDocuments
);

router.get(
  '/get-all-payments-approved-by-bursar/:bursar_id',
  permission(['super_admin']),
  getAllPaymentsApprovedByBursarId
);

router.get(
  '/get-student-payment-documents/:student_id',
  permission(['super_admin', 'admin', 'student', 'old_student', 'parent']),
  getAllStudentPaymentDocumentsByStudentId
);

router.get(
  '/get-payment-document-needing-approval/:payment_id',
  permission(['super_admin', 'admin']),
  getAPaymentNeedingApprovalById
);

router.get(
  '/get-all-payments-needing-approval',
  permission(['super_admin', 'admin']),
  getAllPaymentsNeedingApproval
);

router.get(
  '/get-all-payment-summary-fail-and-success',
  permission(['super_admin', 'admin']),
  getAllPaymentSummaryFailedAndSuccessful
);

router.get(
  '/get-a-payment-document-of-a-student/:student_id/:payment_id',
  permission(['super_admin', 'admin', 'parent', 'student']),
  getAPaymentDocumentOfStudentByStudentIdAndPaymentId
);

router.get(
  '/get-all-outstanding-payment-documents-of-a-student/:student_id',
  permission(['super_admin', 'admin', 'parent', 'student']),
  getAllOutstandingPaymentDocumentsOfStudent
);

router.put(
  '/approve-bank-payment/:payment_id',
  permission(['super_admin', 'admin']),
  approveBankPaymentWithId
);

router.post(
  '/make-card-payment/:session_id/:student_id',
  permission(['super_admin', 'admin', 'parent', 'student']),
  makeCardPayment
);

export default router;
