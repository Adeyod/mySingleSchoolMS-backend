// import { NextFunction, Request, Response } from 'express';
// import mongoose, { Document, ObjectId, Schema, Types } from 'mongoose';

// type SubjectType = {
//   subject: ObjectId;
//   total_score: number;
//   first_test_score: number;
//   second_test_score: number;
//   exam_score: number;
//   grade: string;
// };

// type TermObj = {
//   term: string;
//   cumulative_score: number;
//   subject_results: SubjectType[];
// };

// interface PopulatedClass {
//   _id: ObjectId;
//   level: number;
//   compulsory_subjects: ObjectId[]; // or the actual type of your subjects
// }

// type ResultWithClass = {
//   enrolment: ObjectId;
//   student: ObjectId;
//   class: PopulatedClass;
//   class_teacher: ObjectId;
//   academic_session_id: ObjectId;
//   term_results: TermObj[];
//   final_cumulative_score: Number;
//   final_status: string;
//   position: number;
// };

// type AsyncHandler = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => Promise<any>;

// type ComparePassType = {
//   password: string;
//   confirm_password: string;
// };

// type LinkStudentType = {
//   first_name: string;
//   last_name: string;
// };

// type UserObj = LinkStudentType & {
//   middle_name?: string;
//   gender: string;
//   phone?: string;
//   dob?: Date;
//   employment_date?: Date;
//   email: string;
// };

// type EmailJobData = {
//   email: string;
//   child_email?: string;
//   first_name: string;
//   child_name?: string;
//   token?: string;
//   title?: string;
//   academic_session?: string;
//   option?: string;
//   message?: string;
//   type:
//     | 'email-verification'
//     | 'forgot-password'
//     | 'child-linkage'
//     | 'session-subscription';
// };

// type ChangePasswordType = {
//   token: string;
//   password: string;
// };

// type VerificationType = {
//   token: string;
//   super_admin_id?: object | null;
//   admin_id?: object | null;
//   non_teaching_id?: object | null;
//   old_student_id?: object | null;
//   parent_id?: object | null;
//   student_id?: object | null;
//   teacher_id?: object | null;
//   purpose: string;
//   role: string;
//   created_at: NativeDate;
// } & Document;

// type VerificationDocument = Document & Partial<VerificationType>;

// type PaystackPayloadType = {
//   reference: string;
//   student_id: string;
// };

// type UserWithoutPassword = Omit<UserDocument, 'password'>;

// type UserDocument = UserObj & {
//   _id: object;
//   password: string;
//   role: string;
//   is_verified?: boolean;
//   is_chosen_major?: boolean;
//   new_session_subscription?: boolean;
//   home_address?: string;
//   close_bus_stop?: string;
//   is_updated: boolean;
//   status?: string;
//   admission_session?: string;
//   current_arm?: string;
//   stream?: string;
//   current_class_level?: string;
//   alumni_status?: string;
//   subjects_capable_of_teaching?: {
//     subject: Schema.Types.ObjectId;
//   }[];

//   teaching_assignment?: {
//     subject: object;
//     class_id: object;
//   }[];
//   employment_details?: {
//     company_name: string;
//     position: string;
//   };
//   graduation_session?: string;
//   parent_id?: object[];
//   outstanding_balance?: number;
//   profile_image?: {
//     url: string;
//     public_url: string;
//   };
//   children?: object[];
//   class_managing?: object;
//   session: string;
//   admission_number: string;
//   cumulative_score?: number;
//   overall_position?: number;
//   current_class?: {
//     class_id: object;
//     // academic_session: string;
//   };
//   active_class_enrolment: boolean;
// } & Document;

// type PaymentDocument = {
//   student: object;
//   class: object;
//   session: object;
//   term: string;
//   fees_breakdown: {
//     school_fees: number;
//     school_bus?: {
//       is_using: boolean;
//       trip_type?: string;
//       route?: string;
//       bus_fee: number;
//     } | null;
//   } | null;
//   total_amount: number;
//   is_payment_complete: boolean;
//   is_submit_response: boolean;
//   remaining_amount: number;
//   payment_summary: PaymentSummaryType[];
//   waiting_for_confirmation: WaitingForConfirmationType[];
// };

// type StudentWithPaymentType = UserWithoutPassword & {
//   latest_payment_document: PaymentDocument | null;
// };

// type User = ComparePassType & UserObj;
// type LoginResponseType = {
//   refreshToken: string;
//   accessToken: string;
//   user: UserObj;
// };

// type EmailType = {
//   email: string;
//   first_name: string;
//   token?: string;
//   title?: string;
//   message?: string;
//   child_name?: string;
//   child_email?: string;
//   academic_session?: string;
// };

// type ExcludeParentAndStudent = {
//   phone: string;
//   middle_name: string;
//   dob: Date;
//   employment_date?: Date;
// };

// type PayloadForLoginInput = {
//   email: string;
//   password: string;
// };

// type ParentType = {
//   phone: string;
//   middle_name: string;
// };

// type OldStudentValidationType = {
//   phone?: string;
//   middle_name: string;
//   dob: Date;
//   admission_session: Date;
//   graduation_session?: Date;
// };

// type SchoolBusValidationType = {
//   close_group: {
//     both_trips: number;
//     single_trip: number;
//   };
//   far_group: {
//     both_trips: number;
//     single_trip: number;
//   };
// };

// type VerifyUserType = {
//   role: string;
//   token: string;
//   admin_id?: object | null;
//   super_admin_id?: object | null;
//   non_teaching_id?: object | null;
//   student_id?: object | null;
//   old_student_id?: object | null;
//   teacher_id?: object | null;
//   parent_id?: object | null;
//   createdAt?: Date;
// } & Document;

// type RefreshTokenType = {
//   token: string;
//   user_id: object;
//   role: string;
//   created_at: Date;
//   _id?: mongoose.Types.ObjectId;
// };

// type UserInJwt = {
//   userId: object;
//   userEmail: string;
//   userRole: string;
//   iat: number;
//   exp: number;
// };

// declare global {
//   namespace Express {
//     interface Request {
//       user?: UserInJwt;
//     }
//   }
// }

// type StudentLinkingType = {
//   admission_number: string;
//   first_name: string;
//   last_name: string;
//   parent_id: object;
// };

// type NotificationProp = {
//   title: string;
//   user_id?: object;
//   message: string;
// };

// type NotificationDocument = NotificationProp & {
//   id: string;
//   is_read: boolean;
//   created_at: string;
//   updated_at: string;
//   receiver: string;
//   is_viewed: boolean;
//   is_archived: boolean;
// };

// type TermDocument = {
//   _id?: object;
//   name: string;
//   start_date: Date;
//   end_date: Date;
//   is_active?: boolean;
// };

// type SessionDocument = Document & {
//   academic_session: string;
//   terms: TermDocument[];
//   is_active: boolean;
//   is_promotion_done: boolean;
// };

// type TermCreationType = TermDocument & {
//   session_id: string;
// };

// type SessionValidationType = {
//   academic_session: string;
// };

// type StudentCumScoreType = {
//   studentId: string;
//   sessionId: string;
//   term: string;
//   studentClass: string;
// };

// type GradingType = {
//   enrolment: object;
//   student: object;
//   class: object;
//   subject: object;
//   teacher: object;
//   session: object;
//   term: object;
//   first_test_score: number;
//   second_test_score: number;
//   exam_score: number;
//   total_score: number | null;
//   position: number | null;
//   grade: string | null;
// };

// type CreateSubjectType = {
//   name: string;
//   description: string;
// };

// type SubjectCreationType = CreateSubjectType & {
//   sections: {
//     tier: string;
//     is_compulsory: boolean;
//   };
//   stream: string;
// };

// type ClassCreationType = {
//   name: string;
//   level: string;
//   section: string;
//   description: string;
//   arms: string[];
//   streams: string[];
//   compulsory_subjects: string[];
//   optional_subjects: string[];
// };

// type TeacherSubjectAssignment = {
//   teacher: object;
//   subject: object;
// };

// type ClassDocument = {
//   name: string;
//   level: string;
//   section: string;
//   description?: string;
//   arms: string[];
//   streams: string[];
//   compulsory_subjects: object[];
//   optional_subjects: object[];
//   class_teacher?: object;
//   teacher_subject_assignments: TeacherSubjectAssignment[];
// };

// type StudentEnrolmentType = {
//   student_id?: string;
//   student_ids?: string[];
//   class_id: string;
//   academic_session_id: string;
//   term: string;
//   level: string;
// };

// type PerformanceType = {
//   subject: object;
//   score: number;
// };

// type AttendanceType = {
//   date: Date;
//   status: string;
//   student: object;
// };

// type StudentObjType = {
//   student: object;
//   term: string;
//   subjects_offered: object[];
// };

// type ClassEnrolmentDocument = {
//   _id: object;
//   students: StudentObjType[];
//   class: object;
//   academic_session_id: object;
//   // term: string;
//   stream: string;
//   // compulsory_subjects: object[];
//   // optional_subjects: object[];
//   performance: PerformanceType[];
//   test_scores: PerformanceType[];
//   exam_scores: PerformanceType[];
//   attendance: AttendanceType[];
// };

// type SchoolBusPayloadType = {
//   id?: string;
//   close_group: {
//     both_trips: number;
//     single_trip: number;
//   };

//   far_group: {
//     both_trips: number;
//     single_trip: number;
//   };
// };

// type SchoolBusDocument = {
//   _id: object;
//   school_bus?: SchoolBusPayloadType;
//   createdAt: Date;
//   updatedAt: Date;
// };

// type SchoolFeesDocument = {
//   _id: ObjectId;
//   level: string;
//   school_fees: number;
//   applicable_classes: ObjectId[];
//   class_specific_fees: {
//     fee_name: string;
//     amount: number;
//     applicable_classes: { class: ObjectId }[];
//   }[];
//   createdAt: Date;
//   updatedAt: Date;
// };

// type StudentFeePaymentType = {
//   student_id: string;
//   session_id: string;
//   staff_who_approve?: object;
//   term: string;
//   amount_paying: number;
//   teller_number?: string;
//   bank_name?: string;
//   payment_method?: string;
//   userId?: object;
//   userRole?: string;
// };

// type BusPaymentType = {
//   route?: string;
//   student_id: string;
//   parent_id?: string;
//   session_id: string;
//   term: string;
//   is_using: boolean;
//   trip_type?: string;
// };

// type PaymentSummaryType = {
//   amount_paid: number;
//   date_paid: Date;
//   payment_method: string;
//   transaction_id: string;
//   status: string;
//   staff_who_approve?: object;
// };

// type WaitingForConfirmationType = {
//   amount_paid: number;
//   date_paid: Date;
//   payment_method: string;
//   transaction_id: string;
//   bank_name: string;
//   status: string;
//   staff_who_approve?: object;
//   _id: object;
// };

// type StudentUpdateType = {
//   home_address: string;
//   close_bus_stop: string;
//   student_id: string;
//   parent_id?: string;
//   userRole?: string;
// };

// type FilePath = string;
// type FolderName = string;
// type CloudinaryType =
//   | {
//       url: string;
//       public_url: string;
//     }
//   | undefined;

// type CashPaymentType = {
//   student_id: string;
//   session_id: string;
//   term: string;
//   amount_paying: number;
//   class_id: string;
// };

// type BankPaymentType = CashPaymentType & {
//   bank_name: string;
//   teller_number: number;
// };

// type AddressValidationType = {
//   home_address: string;
//   close_bus_stop: string;
// };

// type PaystackSchoolPaymentType = {
//   student_id: string;
//   student_email: string;
//   amount: number;
//   session_id: string;
//   term: string;
//   payment_document_id: object;
// };

// type ApproveStudentPayloadType = {
//   amount_paid: number;
//   transaction_id: string;
//   bank_name: string;
//   payment_id: string;
//   bursar_id: object;
// };

// type BankApprovalType = {
//   amount_paid: number;
//   transaction_id: string;
//   bank_name: string;
// };

// type CommonParamForResultCreation = {
//   class_enrolment_id: object;
//   class_id: object;
//   academic_session_id: object;
// };

// type ResultCreationType = CommonParamForResultCreation & {
//   student_id: object;
// };

// type MultipleResultCreationType = CommonParamForResultCreation & {
//   student_ids: object[];
// };

// type OnboardTeacherType = {
//   teacher_id: string;
//   subject_ids: string[];
// };

// type SubjectResult = {
//   subject: ObjectId;
//   subject_teacher: ObjectId;
//   total_score: number;
//   first_test_score: number | null;
//   second_test_score: number | null;
//   exam_score: number | null;
//   grade?: string;
// };

// type TermResult = {
//   _id: mongoose.Types.ObjectId;
//   term: string;
//   cumulative_score: number;
//   class_position: string;
//   subject_results: SubjectResult[];
// };

// type ScoreParamType = {
//   term: string;
//   student_id: string;
//   session_id: string;
//   teacher_id: string;
//   score: number;
//   subject_id: string;
//   score_type: string;
//   // score_type: 'first_term' | 'second_term' | 'exam';
//   class_enrolment_id: string;
//   class_id: string;
// };

// type StudentScoreObj = {
//   student_id: string;
//   score: number;
// };

// type TotalSumType = {
//   first_test_score: number;
//   second_test_score: number;
//   exam_score: number;
// };

// type MultipleScoreParamType = {
//   term: string;
//   result_objs: StudentScoreObj[];
//   session_id: string;
//   teacher_id: string;
//   subject_id: string;
//   score_type: string;
//   // score_type: 'first_term' | 'second_term' | 'exam';
//   class_enrolment_id: string;
//   class_id: string;
// };

// type ResultDocument = {
//   _id: mongoose.Types.ObjectId;
//   createdAt: Date;
//   updatedAt: Date;
//   enrolment: object;
//   student: object;
//   class: object;
//   class_teacher: object;
//   academic_session_id: object;
//   term_results: TermResult[];
//   final_cumulative_score: number;
//   final_status: string | null;
//   position: number;
// };

// type StudentResultPopulatedType = ResultDocument & { student: UserDocument };

// type ResultObjType = { grade: string; total: number };

// type SubjectResultType = {
//   subject: object;
//   subject_teacher: object;
//   total_score: number;
//   first_test_score: number;
//   second_test_score: number;
//   exam_score: number;
//   _id: object;
//   grade: string;
//   subject_position: string;
// };

// type ClassPositionCalType = {
//   studentId: object;
//   first_name: string;
//   last_name: string;
//   allCummulatives: TermResult;
//   // allCummulatives: {
//   //   term: string;
//   //   cumulative_score: number;
//   //   class_position: string;
//   //   subject_results: SubjectResultType[];
//   //   _id: Types.ObjectId;
//   // };
// };

// type ScorePayload = OptionalJwtUserObjType & {
//   class_id: string;
//   academic_session_id: string;
//   subject_id: string;
//   term: string;
// };

// type OptionalSubjectProcessingType = JwtUserObjType & {
//   student_id: string;
//   optional_subjects_chosen_ids: string[];
//   class_id: string;
// };

// type ClassTeacherChangeType = {
//   class_id: string;
//   new_class_teacher_id: string;
// };

// type ParentObjType = {
//   email: string;
//   first_name: string;
//   last_name: string;
// };

// type StudentNotificationType = {
//   email: string;
//   first_name: string;
//   last_name: string;
//   parent_id: ParentObjType[];
// };

// type SessionSubscriptionType = {
//   student_id: string;
//   academic_session_id: string;
//   parent_id?: object;
//   userRole?: string;
//   new_session_subscription_status: boolean;
// };

// type ClassSubjectTeacherChangeType = {
//   subject: string;
//   class_id: string;
//   new_teacher_id: string;
// };

// type GetClassStudentsType = OptionalJwtUserObjType & {
//   session_id: string;
//   class_id: string;
// };

// type StudentSubjectType = OptionalJwtUserObjType & {
//   class_id: string;
//   subject_id: string;
//   academic_session_id: string;
// };

// type StudentPopulatedType = {
//   _id: Types.ObjectId;
//   first_name: string;
//   last_name: string;
//   gender: string;
// };

// type SubjectPopulatedType = {
//   _id: Types.ObjectId;
//   name: string;
//   description: string;
//   teacher_ids: object[];
// };

// type ClassSubjectTeacherType = {
//   teacher_id: Types.ObjectId;
//   class: ClassDocument;
//   subject_id: Types.ObjectId;
// };

// type JwtUserObjType = {
//   userId: object;
//   userRole: string;
// };

// type OptionalJwtUserObjType = {
//   userId?: object;
//   userRole?: string;
// };

// type PaymentDataType = JwtUserObjType & {
//   payment_id: string;
// };

// type TeacherSubjectType = JwtUserObjType & {
//   teacher_id: string;
// };

// type TeacherToSubjectType = {
//   subject?: string;
//   class_id: string;
//   teacher_id: string;
// };

// type TeacherValidationType = {
//   first_name: string;
//   last_name: string;
//   middle_name: string;
// };

// type StudentPaymentHistoryType = JwtUserObjType & {
//   student_id: string;
// };

// type StudentClassPayloadType = JwtUserObjType & {
//   class_id: string;
// };

// type StudentClassByIdPayloadType = StudentClassPayloadType & {
//   academic_session_id: string;
//   teacher_id?: string;
// };

// type PaymentHistoryDataType = {
//   _id: Types.ObjectId;
//   // payment_summary: PaymentSummaryType[];
//   // waiting_for_confirmation: WaitingForConfirmationType[];
//   transaction_history: WaitingForConfirmationType[];
// };

// type SubjectDocument = {
//   _id: Types.ObjectId;
//   name: string;
//   code: string;
//   description: string;
//   stream: string;
//   sections: {
//     tier: string;
//     is_compulsory: boolean;
//   }[];
//   class_ids: object[];
//   teacher_ids: object[];
// };

// type GetTeacherByIdType = {
//   teacher_id: string;
//   session?: mongoose.ClientSession;
// };

// type GetStudentByIdType = {
//   student_id: string;
//   session?: mongoose.ClientSession;
// };

// type SingleStudentScorePayload = StudentResultTermType & {
//   class_id: string;
//   // academic_session_id: string;
//   // student_id: string;
//   subject_id: string;
//   // term: string;
// };

// type StudentResultTermType = JwtUserObjType & {
//   student_id: string;
//   academic_session_id: string;
//   term: string;
// };
// type StudentResultSessionType = JwtUserObjType & {
//   student_id: string;
//   academic_session_id: string;
// };

// type StudentSubjectPositionType = JwtUserObjType & {
//   class_enrolment_id: string;
//   subject_id: string;
// };

// type ClassResultsType = {
//   class_id: string;
//   userId: object;
//   userRole: string;
//   academic_session_id: string;
//   term: string;
// };

// type LogoutPayload = {
//   access_token: string;
//   refresh_token: string;
// };

// export {
//   LogoutPayload,
//   ClassPositionCalType,
//   StudentClassByIdPayloadType,
//   ClassResultsType,
//   StudentWithPaymentType,
//   StudentClassPayloadType,
//   StudentSubjectPositionType,
//   StudentResultSessionType,
//   StudentResultTermType,
//   SingleStudentScorePayload,
//   SubjectPopulatedType,
//   GetStudentByIdType,
//   GetTeacherByIdType,
//   SubjectDocument,
//   TeacherSubjectType,
//   PaymentHistoryDataType,
//   StudentPaymentHistoryType,
//   PaymentDataType,
//   ClassSubjectTeacherType,
//   StudentPopulatedType,
//   StudentSubjectType,
//   GetClassStudentsType,
//   ClassSubjectTeacherChangeType,
//   SessionSubscriptionType,
//   StudentNotificationType,
//   ParentObjType,
//   ClassTeacherChangeType,
//   OptionalSubjectProcessingType,
//   AttendanceMarkingType,
//   AttendanceDocument,
//   FetchAttendanceType,
//   ClassMapDocType,
//   MultipleResultCreationType,
//   ScorePayload,
//   ResultObjType,
//   TotalSumType,
//   ResultDocument,
//   MultipleScoreParamType,
//   ScoreParamType,
//   TermResult,
//   SubjectResult,
//   OnboardTeacherType,
//   ResultCreationType,
//   WaitingForConfirmationType,
//   PaystackPayloadType,
//   BankApprovalType,
//   ApproveStudentPayloadType,
//   PaystackSchoolPaymentType,
//   AddressValidationType,
//   BankPaymentType,
//   CashPaymentType,
//   FilePath,
//   FolderName,
//   CloudinaryType,
//   StudentUpdateType,
//   PaymentDocument,
//   BusPaymentType,
//   StudentFeePaymentType,
//   SchoolBusValidationType,
//   SchoolFeesDocument,
//   SchoolBusDocument,
//   SchoolBusPayloadType,
//   UserWithoutPassword,
//   TeacherToSubjectType,
//   TeacherValidationType,
//   ClassDocument,
//   ClassEnrolmentDocument,
//   StudentEnrolmentType,
//   ClassCreationType,
//   SubjectCreationType,
//   CreateSubjectType,
//   GradingType,
//   StudentCumScoreType,
//   SessionValidationType,
//   TermCreationType,
//   SessionDocument,
//   TermDocument,
//   NotificationProp,
//   NotificationDocument,
//   StudentLinkingType,
//   LinkStudentType,
//   UserInJwt,
//   VerificationDocument,
//   VerificationType,
//   VerifyUserType,
//   ResultWithClass,
//   EmailType,
//   ParentType,
//   OldStudentValidationType,
//   AsyncHandler,
//   SubjectResultType,
//   User,
//   ComparePassType,
//   PayloadForLoginInput,
//   ExcludeParentAndStudent,
//   UserDocument,
//   UserObj,
//   EmailJobData,
//   LoginResponseType,
//   RefreshTokenType,
//   ChangePasswordType,
//   StudentResultPopulatedType,
// };

///////////////////////////////////////////////////////////
import { NextFunction, Request, Response } from 'express';
import mongoose, { Document, ObjectId, Schema } from 'mongoose';
import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: UserInJwt;
    }
  }
}

// interface CustomRequest extends Request {
//   school_id?: string;
//   subdomain?: string;
// }

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

// type AsyncHandler = (
//   req: CustomRequest,
//   res: Response,
//   next: NextFunction
// ) => Promise<any>;

type ComparePassType = {
  password: string;
  confirm_password: string;
};

type LinkStudentType = {
  first_name: string;
  last_name: string;
};

type UserObj = LinkStudentType & {
  middle_name?: string;
  gender: string;
  phone?: string;
  dob?: Date;
  employment_date?: Date;
  email: string;
  password: string;
};

type SchoolUserType = UserObj & {
  school_id: mongoose.Types.ObjectId;
};

type UserDocument = Document &
  UserObj & {
    _id: mongoose.Types.ObjectId;
    bus_category_id?: mongoose.Types.ObjectId;
    password: string;
    role: string;
    is_verified?: boolean;
    redundant?: boolean;
    wallet_account_obj?: StudentAccountType;
    is_chosen_major?: boolean;
    new_session_subscription?: boolean;
    home_address?: string;
    close_bus_stop?: string;
    is_updated: boolean;
    status?: string;
    admission_session?: string;
    current_arm?: string;
    stream?: string;
    current_class_level?: string;
    alumni_status?: string;
    subjects_capable_of_teaching?: {
      subject: mongoose.Types.ObjectId;
    }[];

    teaching_assignment?: {
      subject: mongoose.Types.ObjectId;
      class_id: mongoose.Types.ObjectId;
    }[];
    employment_details?: {
      company_name: string;
      position: string;
    };
    graduation_session?: string;
    parent_id?: mongoose.Types.ObjectId[];
    outstanding_balance?: number;
    profile_image?: {
      url: string;
      public_url: string;
    };
    children?: mongoose.Types.ObjectId[];
    class_managing?: mongoose.Types.ObjectId;
    session: string;
    admission_number: string;
    cumulative_score?: number;
    overall_position?: number;
    current_class?: {
      class_id: mongoose.Types.ObjectId;
      // academic_session: string;
    };
    active_class_enrolment: boolean;
  };

type UserReturn = Omit<UserDocument, 'password'>;

type RegistrationServiceType = UserDocument & {
  userRole: string;
};

type VerificationType = {
  token: string;
  // school_id?: mongoose.Types.ObjectId | null;
  super_admin_id?: mongoose.Types.ObjectId | null;
  admin_id?: mongoose.Types.ObjectId | null;
  non_teaching_id?: mongoose.Types.ObjectId | null;
  parent_id?: mongoose.Types.ObjectId | null;
  student_id?: mongoose.Types.ObjectId | null;
  teacher_id?: mongoose.Types.ObjectId | null;
  purpose: string;
  role: string;
  created_at: Date;
} & Document;

type VerificationDocument = Document & Partial<VerificationType>;

type StudentRegistration = LinkStudentType &
  PayloadForLoginInput & {
    middle_name: string;
    gender: string;
    // school: mongoose.Types.ObjectId;
    dob: Date;
    admission_session: string;
    admission_number: string | number;
    role: string;
  };

type PayloadForLoginInput = {
  email: string;
  password: string;
};

type LoginResponseType = {
  refreshToken: string;
  accessToken: string;
  user: UserObj;
};

type ParentType = {
  phone?: string;
  middle_name: string;
};

type ExcludeParentAndStudent = {
  phone?: string;
  middle_name: string;
  dob?: Date;
  employment_date?: Date;
};

type AdmissionValidationType = {
  admission_session: string;
  admission_number: string | number;
  dob: Date;
};

type TeacherValidationType = {
  first_name: string;
  last_name: string;
  middle_name: string;
};

type SchoolBusValidationType = {
  close_group: {
    both_trips: number;
    single_trip: number;
  };
  far_group: {
    both_trips: number;
    single_trip: number;
  };
};

type CashPaymentType = {
  student_id: string;
  session_id: string;
  term: string;
  amount_paying: number;
  class_id: string;
};

type AddressValidationType = {
  home_address: string;
  // close_bus_stop: string;
};

type BankPaymentType = CashPaymentType & {
  bank_name: string;
  teller_number: number;
};

type NegotiatedFeesType = {
  negotiated_school_charge: number;
  negotiated_transaction_charge: number;
};

type BankApprovalType = {
  amount_paid: number;
  transaction_id: string;
  bank_name: string;
};

type LogoType = {
  url: string;
  public_url?: string;
};

type SchoolCreationPayloadType = {
  // _id: ObjectId;
  school_name: string;
  subdomain: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email?: string;
  website?: string;
};

type SchoolType = Document &
  SchoolCreationPayloadType & {
    _id: mongoose.Types.ObjectId;
    negotiated_school_charge_per_student?: number;
    negotiated_school_payment_transaction_charge_per_transaction?: number;
    logo?: LogoType;
    school_image?: LogoType;
    principal_signature_per_term: {
      academic_session_id: mongoose.Types.ObjectId;
      term: string;
      url: string;
      public_url: string;
    }[];
    subscription: {
      plan: 'basic' | 'essential' | 'pro' | 'advanced';
      subscribed_at: Date;
    };
    bus_service_available: boolean;
    has_bank_accounts: boolean;
    has_payment_priority_setting: boolean;
    has_result_setting: boolean;
    school_owner?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
  };

type StudentValidationType = {
  phone?: string;
  middle_name: string;
  dob: Date;
  admission_session: Date;
  graduation_session?: Date;
};

type SchoolCreationValidationType = {
  school_name: string;
  subdomain: string;
  address: string;
  country: string;
  phone: number;
  city: string;
  state: string;
  email?: string;
  website?: string;
};

type User = ComparePassType & UserObj;

type ImageType = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
};

type FilePath = string;
type FolderName = string;
type CloudinaryType =
  | {
      url: string;
      public_url: string;
    }
  | undefined;

type TokenType = {
  user_id: mongoose.Types.ObjectId;
  school_id?: mongoose.Types.ObjectId;
  role: string;
};

type CompanyTokenType = {
  user_id: mongoose.Types.ObjectId;
  role: string;
};

type VerifyUserType = {
  user_id: mongoose.Types.ObjectId;
  role: string;
  token: number;
};

// type VerifyUserType = {
//   role: string;
//   token: string;
//   admin_id?: object | null;
//   super_admin_id?: object | null;
//   non_teaching_id?: object | null;
//   student_id?: object | null;
//   old_student_id?: object | null;
//   teacher_id?: object | null;
//   parent_id?: object | null;
//   createdAt?: Date;
// } & Document;

type EmailJobData = {
  email: string;
  child_email?: string;
  first_name: string;
  child_name?: string;
  token?: string;
  title?: string;
  academic_session?: string;
  option?: string;
  message?: string;
  school_name?: string;
  city?: string;
  state?: string;
  country?: string;
  type:
    | 'email-verification'
    | 'school-creation'
    | 'forgot-password'
    | 'child-linkage'
    | 'session-subscription';
};

type EmailType = {
  email: string;
  first_name?: string;
  token?: string;
  title?: string;
  message?: string;
  child_name?: string;
  child_email?: string;
  academic_session?: string;
  school_name?: string;
  city?: string;
  state?: string;
  country?: string;
};

type EmailQueue = {
  first_name: string;
  school_name: string;
  school_city: string;
  school_state: string;
  school_country: string;
  email: string;
  token?: string;
  title?: string;
  message?: string;
};

type CompanyEmailQueue = {
  first_name: string;
  email: string;
  token: string;
};

type UserInJwt = {
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  userRole: string;
  iat: number;
  exp: number;
};

type ResultSettingComponentType = {
  name: string;
  percentage: number;
  column: number;
};

type ExamComponentType = {
  exam_name: string;
  component: {
    key: string;
    name: string;
    percentage: number;
  }[];
};

type GradingAndRemarkType = {
  value: number;
  grade: string;
  remark: string;
};

type ResultSettingDocument = {
  _id: mongoose.Types.ObjectId;
  // school: mongoose.Types.ObjectId;
  components: ResultSettingComponentType[];
  exam_components: ExamComponentType;
  grading_and_remark: GradingAndRemarkType[];
  level: string;
};

type ScoreType = {
  score_name: string;
  score: number;
  key?: string;
};

type ExamScoreType = ScoreType & { key: string };

type GradingObjType = {
  value: number;
  grade: string;
  remark: string;
};

type ScoreAndGradingType = {
  score: ScoreType[];
  gradingObj: GradingObjType[];
  current_term: string;
};

type SubjectResult = {
  // school: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  subject_teacher: mongoose.Types.ObjectId;
  total_score: number;
  scores: ScoreType[];
  exam_object: ExamScoreType[];
  grade?: string;
  remark?: string;
  subject_position: string;
  cumulative_average: number;
  last_term_cumulative: number;
};

type TermResult = {
  // school: mongoose.Types.ObjectId;
  // _id: mongoose.Types.ObjectId;
  term: string;
  cumulative_score: number;
  class_position: string;
  subject_results: SubjectResult[];
};

type ResultDocument = {
  // school: mongoose.Types.ObjectId;
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  enrolment: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  class_teacher: mongoose.Types.ObjectId;
  academic_session_id: mongoose.Types.ObjectId;
  term_results: TermResult[];
  final_cumulative_score: number;
  final_status: string | null;
  position: number;
  remark: string;
};

type TermDocument = {
  // school: mongoose.Types.ObjectId;
  _id?: mongoose.Types.ObjectId;
  name: string;
  start_date: Date;
  end_date: Date;
  is_active?: boolean;
};

type SubjectTermResult = {
  term: string;
  total_score: number;
  last_term_cumulative: number;
  cumulative_average: number;
  exam_object: ExamScoreType[];
  scores: ScoreType[];
  subject_position: string;
  grade?: string;
  remark?: string;
  // cumulative_score: number;
  class_position: string;
};

type SubjectResultDocument = Document & {
  enrolment: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  session: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  subject_teacher: mongoose.Types.ObjectId;
  term_results: SubjectTermResult[];
  createdAt: Date;
  updatedAt: Date;
};

type SessionDocument = Document & {
  _id: mongoose.Types.ObjectId;
  // school: mongoose.Types.ObjectId;
  academic_session: string;
  terms: TermDocument[];
  is_active: boolean;
  is_promotion_done: boolean;
  is_subscription_mail_sent: boolean;
};

type TermCreationType = TermDocument & {
  session_id: string;
  // school: mongoose.Types.ObjectId;
};

type ChangePasswordType = {
  token: string;
  password: string;
};

type RefreshTokenType = {
  _id?: mongoose.Types.ObjectId;
  token: string;
  user_id: mongoose.Types.ObjectId;
  role: string;
  created_at: Date;
};

type CreateSubjectType = {
  name: string;
  description: string;
};

type CreateClassType = CreateSubjectType & {
  section: string;
  level: string;
};

type SubjectCreationType = CreateSubjectType & {
  // sections: {
  //   tier: string;
  //   is_compulsory: boolean;
  // };
  // stream: string;
  // school: mongoose.Types.ObjectId;
};

type SubjectFetchingPayload = {
  subject_id: string;
  // school: string;
};

type LogoutPayload = {
  access_token: string;
  refresh_token: string;
};

type ClassCreationType = {
  // school: mongoose.Types.ObjectId;
  name: string;
  level: string;
  section: string;
  description: string;
  arms: string[];
  // streams: string[];
  compulsory_subjects: string[];
  // optional_subjects: string[];
};

type TeacherSubjectAssignment = {
  teacher: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
};

type ClassDocument = Document & {
  _id: mongoose.Types.ObjectId;
  name: string;
  level: string;
  section: string;
  description?: string;
  arms: string[];
  compulsory_subjects: mongoose.Types.ObjectId[];
  class_teacher?: mongoose.Types.ObjectId;
  teacher_subject_assignments: TeacherSubjectAssignment[];
};

type GetClassPayloadType = {
  class_id: string;
};

type StudentEnrolmentType = {
  student_id?: string;
  student_ids?: string[];
  class_id: string;
  // school: mongoose.Types.ObjectId;
  academic_session_id: string;
  term: string;
  level: string;
  subjects_to_offer_array: mongoose.Types.ObjectId[];
};

type PerformanceType = {
  subject: object;
  score: number;
};

type AttendanceType = {
  date: Date;
  status: string;
  student: object;
};

type SubjectOfferedType = {
  _id: mongoose.Types.ObjectId;
  school: mongoose.Types.ObjectId;
  name: string;
  description: string;
  sections: {
    tier: string;
    is_compulsory: boolean;
    _id: mongoose.Types.ObjectId;
  }[];
  class_ids: mongoose.Types.ObjectId[];
  teacher_ids: mongoose.Types.ObjectId[];
};
type StudentObjType = {
  student: mongoose.Types.ObjectId;
  term: string;
  subjects_offered: mongoose.Types.ObjectId[];
};

type ClassEnrolmentDocument = {
  _id: mongoose.Types.ObjectId;
  students: StudentObjType[];
  class: mongoose.Types.ObjectId;
  academic_session_id: mongoose.Types.ObjectId;
  level: string;
  term: string;
  stream: string;
  is_active: boolean;
  all_subjects_offered_in_the_class: mongoose.Types.ObjectId[];
  status: string;
  // compulsory_subjects: object[];
  // optional_subjects: object[];
  performance: PerformanceType[];
  test_scores: PerformanceType[];
  exam_scores: PerformanceType[];
  attendance: AttendanceType[];
};

type CommonParamForResultCreation = {
  class_enrolment_id: mongoose.Types.ObjectId;
  class_id: mongoose.Types.ObjectId;
  academic_session_id: mongoose.Types.ObjectId;
  // school: mongoose.Types.ObjectId;
};

type ResultCreationType = CommonParamForResultCreation & {
  student_id: mongoose.Types.ObjectId;
};

type MultipleResultCreationType = CommonParamForResultCreation & {
  student_ids: mongoose.Types.ObjectId[];
};

type UserWithoutPassword = Omit<UserDocument, 'password'>;

type StudentUpdateType = {
  home_address: string;
  student_id: string;
  parent_id?: string;
  userRole?: string;
  // school_id: string;
};

type PaymentSummaryType = {
  amount_paid: number;
  date_paid: Date;
  payment_method: string;
  transaction_id: string;
  status: string;
  staff_who_approve?: mongoose.Types.ObjectId;
  fees_payment_breakdown: FeeBreakdownType[];
};

type WaitingForConfirmationType = {
  amount_paid: number;
  date_paid: Date;
  payment_method: string;
  transaction_id: string;
  bank_name: string;
  fees_payment_breakdown: FeeBreakdownType[];
  status: string;
  staff_who_approve?: mongoose.Types.ObjectId;
  _id: mongoose.Types.ObjectId;
};

type FeeBreakdownType = {
  fee_name: string;
  amount: number;
  receiving_account: mongoose.Types.ObjectId;
};

type PaymentDocument = {
  student: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  class_level: string;
  session: mongoose.Types.ObjectId;
  // school: mongoose.Types.ObjectId;
  term: string;
  fees_breakdown: FeeBreakdownType[];
  total_amount: number;
  is_payment_complete: boolean;
  is_submit_response: boolean;
  remaining_amount: number;
  payment_summary: PaymentSummaryType[];
  waiting_for_confirmation: WaitingForConfirmationType[];
};

type StudentWithPaymentType = UserWithoutPassword & {
  latest_payment_document: PaymentDocument | null;
};

type StudentLinkingType = {
  admission_number: string;
  first_name: string;
  last_name: string;
  parent_id: mongoose.Types.ObjectId;
  // school_id: string;
};

type NotificationProp = {
  title: string;
  user_id?: mongoose.Types.ObjectId;
  message: string;
  // school: mongoose.Types.ObjectId;
};

type NotificationDocument = NotificationProp & {
  id: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  receiver: string;
  is_viewed: boolean;
  is_archived: boolean;
};

type ParentObjType = {
  email: string;
  first_name: string;
  last_name: string;
  school: mongoose.Types.ObjectId;
};

type StudentNotificationType = {
  school: mongoose.Types.ObjectId;
  email: string;
  first_name: string;
  last_name: string;
  parent_id: ParentObjType[];
};

type SessionSubscriptionType = {
  student_ids_array: string[];
  academic_session_id: string;
  userRole?: string;
  // school_id: string;
};

type StudentSessionSubscriptionType = {
  student_id: string;
  // school_id: string;
  academic_session_id: string;
  parent_id: mongoose.Types.ObjectId;
  userRole: string;
  new_session_subscription_status: boolean;
};

type OptionalJwtUserObjType = {
  userId?: mongoose.Types.ObjectId;
  userRole?: string;
};

type GetClassStudentsType = OptionalJwtUserObjType & {
  session_id: string;
  class_id: string;
  // school_id: string;
};

type OptionalFeeType = MandatoryFeeType & {
  applicable_classes: mongoose.Types.ObjectId[];
};

type MandatoryFeeType = {
  fee_name: string;
  amount: number;
  receiving_account: mongoose.Types.ObjectId;
};

type SchoolFeesDocument = {
  _id: mongoose.Types.ObjectId;
  level: string;
  term: string;
  // school: mongoose.Types.ObjectId;
  academic_session_id: mongoose.Types.ObjectId;
  school_fees: number;
  optional_fees: {
    fee_name: string;
    amount: number;
    applicable_classes: { class: mongoose.Types.ObjectId }[];
    receiving_account: mongoose.Types.ObjectId;
  }[];
  mandatory_fees: MandatoryFeeType[];
  createdAt: Date;
  updatedAt: Date;
};

type SchoolBusPayloadType = {
  id?: string;
  close_group: {
    both_trips: number;
    single_trip: number;
  };

  far_group: {
    both_trips: number;
    single_trip: number;
  };
};

type SchoolBusDocument = {
  _id: mongoose.Types.ObjectId;
  school_bus?: SchoolBusPayloadType;
  createdAt: Date;
  updatedAt: Date;
};

type MandatoryFeePayloadType = {
  term?: string;
  receiving_acc_id: string;
  amount: number;
  fee_name: string;
};

type OptionalFeePayloadType = MandatoryFeePayloadType & {
  applicable_classes: [];
};

type OptionalFeeAdditionType = Omit<OptionalFeePayloadType, 'term'>;

type FeePayloadType = {
  amount: number;
  class_level: string;
};

type AddingFeeToPaymentPayload = {
  fee_name: string;
  amount: number;
  // school_id: string;
  receiving_acc_id: string;
  student_id: string;
};

type OptionalFeeProcessingType = {
  uniqueClasses: ClassDocument[];
  fee_name: string;
  receiving_acc_id: string;
  amount: number;
  term: string;
  academic_session_id: mongoose.Types.ObjectId;
};

type PaymentPayloadOptionalFeeType = {
  applicable_classes: mongoose.Types.ObjectId[];
  // school: mongoose.Types.ObjectId;
  academic_session_id: mongoose.Types.ObjectId;
  termName: string;
  session: mongoose.ClientSession;
  fee_name: string;
  amount: number;
  receiving_acc_id: string;
};

type AddFeeToStudentPaymentDocType = {
  // school: mongoose.Types.ObjectId;
  session_id: mongoose.Types.ObjectId;
  termName: string;
  receiving_acc_id: string;
  studentId: mongoose.Types.ObjectId;
  session: mongoose.ClientSession;
  fee_name: string;
  amount: number;
};

type MandatoryFeeProcessingType = {
  gLevels: SchoolFeesDocument[];
  fee_name: string;
  receiving_acc_id: string;
  amount: number;
  // school: mongoose.Types.ObjectId;
  termName: string;
  academic_session_id: mongoose.Types.ObjectId;
  session: mongoose.ClientSession;
};

type PaymentPayloadMandatoryFeeType = {
  // school: mongoose.Types.ObjectId;
  academic_session_id: mongoose.Types.ObjectId;
  termName: string;
  receiving_acc_id: string;
  session: mongoose.ClientSession;
  fee_name: string;
  amount: number;
};

type JwtUserObjType = {
  userId: mongoose.Types.ObjectId;
  userRole: string;
  // school_id: string;
};

type JwtUserObjType2 = {
  user_id: string;
  userRole: string;
  // school_id: string;
};

type StudentClassPayloadType = JwtUserObjType & {
  class_id: string;
};

type StudentPaymentHistoryType = JwtUserObjType & {
  student_id: string;
};

type PaymentHistoryDataType = {
  _id: mongoose.Types.ObjectId;
  // payment_summary: PaymentSummaryType[];
  // waiting_for_confirmation: WaitingForConfirmationType[];
  transaction_history: WaitingForConfirmationType[];
};

type PaymentDataType = JwtUserObjType & {
  payment_id: string;
};

type ScoreParamType = {
  term: string;
  student_id: string;
  session_id: string;
  teacher_id: string;
  score: number;
  subject_id: string;
  score_name: string;
  class_enrolment_id: string;
  class_id: string;
  // school_id: string;
};

type ScoreRecordingParamType = ScoreParamType & {
  session: mongoose.ClientSession;
};

type CumScoreParamType = {
  term: string;
  student_id: string;
  session_id: string;
  teacher_id: string;
  score: number;
  subject_id: string;
  class_enrolment_id: string;
  class_id: string;
  // school_id: string;
  session: mongoose.ClientSession;
};

type ResultObjType = {
  grade: string;
  total: number;
  remark: string;
};

type TeacherToSubjectType = {
  subject?: string;
  class_id: string;
  teacher_id: string;
  // school_id: string;
};

type SubjectDocument = {
  _id: ObjectId;
  name: string;
  code: string;
  description: string;
  stream: string;
  sections: {
    tier: string;
    is_compulsory: boolean;
  }[];
  class_ids: mongoose.Types.ObjectId[];
  teacher_ids: mongoose.Types.ObjectId[];
};

type OnboardTeacherType = {
  teacher_id: string;
  subject_ids: string[];
  // school_id: string;
};

type ClassTeacherChangeType = {
  class_id: string;
  new_class_teacher_id: string;
  // school_id: string;
};

type ClassSubjectTeacherChangeType = {
  subject: string;
  class_id: string;
  new_teacher_id: string;
  // school_id: string;
};

type StudentSubjectType = OptionalJwtUserObjType & {
  class_id: string;
  subject_id: string;
  academic_session_id: string;
  // school_id: string;
};

type TeacherSubjectType = JwtUserObjType2 & {
  teacher_id: string;
};

type StudentClassByIdPayloadType = StudentClassPayloadType & {
  academic_session_id: string;
  teacher_id?: string;
};

interface StudentDocument extends Document {
  _id: mongoose.Types.ObjectId;
  first_name: string;
  last_name: string;
  subjects_offered: SubjectOfferedType[];
}

type AddingNegotiatedChargesType = NegotiatedFeesType & {
  school_id: string;
};

type StudentScoreObj = {
  student_id: string;
  score: number;
};

type StudentExamScoreObj = {
  student_id: string;
  score_array: {
    score_name: string;
    score_value: number;
  }[];
};

type MultipleScoreParamType = {
  term: string;
  result_objs: StudentScoreObj[];
  session_id: string;
  teacher_id: string;
  subject_id: string;
  score_name: string;
  // score_type: 'first_term' | 'second_term' | 'exam';
  class_enrolment_id: string;
  class_id: string;
  // school_id: string;
};

type MultipleExamScoreParamType = {
  term: string;
  result_objs: StudentExamScoreObj[];
  session_id: string;
  teacher_id: string;
  subject_id: string;
  score_name: string;
  class_enrolment_id: string;
  class_id: string;
  // school_id: string;
};

type MultipleLastCumParamType = {
  term: string;
  last_term_cumulative_objs: StudentScoreObj[];
  session_id: string;
  teacher_id: string;
  subject_id: string;
  class_enrolment_id: string;
  class_id: string;
  // school_id: string;
};

type ScorePayload = OptionalJwtUserObjType & {
  class_id: string;
  academic_session_id: string;
  subject_id: string;
  term: string;
  // school_id: string;
};

type StudentPopulatedType = {
  _id: mongoose.Types.ObjectId;
  first_name: string;
  last_name: string;
  gender: string;
};

type SingleStudentScorePayload = StudentResultTermType & {
  class_id: string;
  // academic_session_id: string;
  // student_id: string;
  subject_id: string;
  // term: string;
};

type GetStudentByIdType = {
  student_id: string;
  session?: mongoose.ClientSession;
  // school: mongoose.Types.ObjectId;
};

type GetTeacherByIdType = {
  teacher_id: string;
  session?: mongoose.ClientSession;
  // school: mongoose.Types.ObjectId;
};

type SubjectPopulatedType = {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  teacher_ids: mongoose.Types.ObjectId[];
};

type StudentResultTermType = JwtUserObjType & {
  student_id: string;
  academic_session_id: string;
  term: string;
};

type StudentResultSessionType = JwtUserObjType & {
  student_id: string;
  academic_session_id: string;
};

type ClassResultsType = {
  class_id: string;
  userId: mongoose.Types.ObjectId;
  userRole: string;
  academic_session_id: string;
  term: string;
  // school_id: string;
};

type BusFee = {
  to: number;
  fro: number;
  to_and_fro: number;
};

type BusCategoryType = {
  name: string;
  bus_fee: BusFee;
  school: mongoose.Types.ObjectId;
  bus_stops: string[];
};

type BusSubscriptionType = {
  student: mongoose.Types.ObjectId;
  bus_category: mongoose.Types.ObjectId;
  bus_subscription_type: 'none' | 'to' | 'fro' | 'to_and_fro';
  bus_fee: number;
  school: mongoose.Types.ObjectId;
  term: string;
  session: mongoose.Types.ObjectId;
};

type BusFeeValidationType = {
  name: string;
  addresses_array: string[];
  to: number;
  fro: number;
  to_and_fro: number;
};

type StudentSchoolBusSubType = {
  student_id: string;
  session_id: string;
  term: string;
  parent_id?: string;
  bus_subscription_type: string;
  bus_stop?: string;
  school_id: string;
};

type BusPayloadType = BusFeeValidationType & {
  school_id: string;
};

type OptionalSubjectProcessingType = JwtUserObjType & {
  student_id: string;
  optional_subjects_chosen_ids: string[];
  class_id: string;
};

type PaymentPayloadType = {
  student_id: string;
  amount_paid: number;
  school_id: string;
};

type PriorityType = {
  fee_name: string;
  priority_number: number;
};

type PaymentPriorityType = {
  // school: mongoose.Types.ObjectId;
  priority_order: PriorityType[];
};

type AccountType = {
  _id: mongoose.Types.ObjectId;
  account_number: string;
  bank_name: string;
  account_name: string;
};

type StudentAccountType = Omit<AccountType, '_id'> & {
  balance: number;
};

type SchoolAccountType = AccountType;

type AccountDetailsType = {
  school: mongoose.Types.ObjectId;
  account_details_array: AccountType[];
};

type AccountObjectType = AccountType & {
  _id: mongoose.Types.ObjectId;
};

// type AccountObjectType = SchoolAccountType & {
//   _id: mongoose.Types.ObjectId;
// };

type CustomerCreationPayloadType = {
  student_email: string;
  student_first_name: string;
  student_last_name: string;
  student_school_id: string;
  student_id: string;
};

type StudentWalletObjType = {
  phoneNumber: string;
  email: string;
  nin: string;
};

type SubjectIdObjType = {
  subject_id: string;
  is_compulsory: boolean;
};

type SubjectAdditionType = {
  class_id: string;
  subject_ids_array: string[];
  // school_id: string;
};

type SubjectRemovalType = {
  class_id: string;
  subject_ids_array: string[];
  // school_id: string;
};

type AllStudentResultsPayloadType = {
  student_id: string;
  // school_id: string;
  result_id?: string;
};

type StudentSubjectPositionType = {
  class_enrolment_id: string;
  subject_id: string;
  userId: mongoose.Types.ObjectId;
  userRole: string;
  // school_id: string;
};

type StudentResultPopulatedType = ResultDocument & { student: UserDocument };

type SubjectResultType = {
  subject: object;
  subject_teacher: object;
  total_score: number;
  last_term_cumulative: number;
  cumulative_average: number;
  scores: ScoreType[];
  subject_position: string;
  grade: string;
  remark: string;
  _id: mongoose.Types.ObjectId;
};

type ClassPositionCalType = {
  studentId: object;
  first_name: string;
  last_name: string;
  allCummulatives: TermResult;
};

type ClassLevelCreationPayloadType = {
  school_id: string;
  class_level_array: string[];
};

type ClassSubjectFetchPayload = {
  // school_id: string;
  class_id: string;
};

type ClassTeacherManagesPayloadType = {
  // school_id: string;
  teacher_id: string;
};

type ContactUsDocument = Document & ContactUsType;

type ContactUsType = {
  first_name: string;
  last_name: string;
  school_name?: string;
  email: string;
  message: string;
};

type FeatureKeyType =
  | 'result_processing'
  | 'objective_exam'
  | 'manual_attendance'
  | 'theory_exam'
  | 'payment_processing'
  | 'qr_attendance'
  | 'advance_analytics'
  | 'student_class_real_time_video';

type AccessModeType = 'any' | 'all';

type ExamDocumentCreationType = {
  title: string;
  academic_session_id: string;
  term: string;
  min_obj_questions: number;
  expected_obj_number_of_options: number;
  max_obj_questions: number;
  number_of_questions_per_student: number;
};

type CbtExamDocument = {
  is_active: boolean;
  // school: mongoose.Types.ObjectId;
  academic_session_id: mongoose.Types.ObjectId;
  term: string;
  title: string;
  min_obj_questions: number;
  expected_obj_number_of_options: number;
  max_obj_questions: number;
  number_of_questions_per_student: number;
};

type ClassLevelArrayType = {
  class_level_array: string[];
};

type ObjQuestionType = {
  question_number: number;
  question_text: string;
  options: string[];
  correct_answer: string;
  score: number;
};

type TimetableArrayType = {
  subject_id: string;
  start_time: Date;
  duration: number;
}[];

type SubjectObjQuestionDocumentCreationType = {
  teacher_id: mongoose.Types.ObjectId;
  academic_session_id: string;
  class_id: string;
  questions_array: ObjQuestionType[];
  term: string;
  subject_id: string;
};

type ExamInputFieldsType = {
  min_obj_questions: number;
  max_obj_questions: number;
  expected_obj_number_of_options: number;
  title: string;
  number_of_questions_per_student: number;
};

type ExamStartingType = {
  academic_session_id: string;
  subject_id: string;
  class_id: string;
  student_id: mongoose.Types.ObjectId;
  term: string;
};

type ResultDocType = {
  _id: mongoose.Types.ObjectId;
  obj_total_time_allocated: number;
  obj_time_left: number;
  sanitizedQuestions: Omit<
    ShuffledObjQuestionsDocument,
    'question_original_number, correct_answer'
  >[];
};

type ExamUpdateCommonType = {
  cbt_result_id: string;
  exam_id: string;
  student_id: mongoose.Types.ObjectId;
};

type ExamUpdateType = ExamUpdateCommonType & {
  result_doc: Omit<
    ShuffledObjQuestionsDocument,
    'question_original_number, correct_answer, question_shuffled_number, question_original_number'
  >[];
};

type ExamTimeUpdateType = ExamUpdateCommonType & {
  remaining_time: number;
};

type ExamEndedType = ExamUpdateCommonType & {
  trigger_type: 'manual' | 'time_up' | 'cutoff';
  result_doc: ResultDocType;
};

type GetClassExamTimetablePayloadType = {
  academic_session_id: string;
  class_id: string;
  term: string;
};

type ClassExamTimetablePayloadType = {
  // exam_id: string;
  academic_session_id: string;
  class_id: string;
  teacher_id: mongoose.Types.ObjectId;
  term: string;
  timetable: TimetableArrayType;
};

// type SingleSubjectTimetableDocument = {
//   subject_id: mongoose.Types.ObjectId;
//   // subject_teacher: mongoose.Types.ObjectId;
//   start_time: Date;
//   duration: number;
//   theory_start_time: Date;
//   theory_duration: number;
// };

type ClassExamTimetableDocument = Document & {
  // school: mongoose.Types.ObjectId;
  exam_id: mongoose.Types.ObjectId;
  academic_session_id: mongoose.Types.ObjectId;
  class_id: mongoose.Types.ObjectId;
  term: string;
  scheduled_subjects: SingleSubjectTimetableDocument[];
};

type TheoryQuestionDocument = {
  question_number: number;
  question_text: string;
  score: number;
  student_score: number;
};

type ObjQuestionsDocument = TheoryQuestionDocument & {
  _id: mongoose.Types.ObjectId;
  options: string[];
  correct_answer: string;
};

type ShuffledObjQuestionsDocument = Omit<
  TheoryQuestionDocument,
  'question_number'
> & {
  _id: mongoose.Types.ObjectId;
  question_shuffled_number: number;
  question_original_number: number;
  options: string[];
  selected_answer: string;
  correct_answer: string;
};

type ShuffledTheoryQuestionsDocument = TheoryQuestionDocument & {
  selected_answer: string;
};

type SingleSubjectTimetableDocument = {
  subject_id: mongoose.Types.ObjectId;
  // subject_teacher: mongoose.Types.ObjectId;
  start_time: Date;
  duration: number;
  theory_start_time: Date;
  theory_duration: number;
  is_subject_question_set: boolean;
  has_subject_grace_period_ended: boolean;
  exam_subject_status: string;
  authorized_students: mongoose.Types.ObjectId[];
  students_that_have_started: mongoose.Types.ObjectId[];
  students_that_have_submitted: mongoose.Types.ObjectId[];
};

type CbtQuestionDocument = Document & {
  exam_id: mongoose.Types.ObjectId;
  level: string;
  academic_session_id: mongoose.Types.ObjectId;
  allowed_students: mongoose.Types.ObjectId[];
  class_id: mongoose.Types.ObjectId;
  subject_id: mongoose.Types.ObjectId;
  obj_questions: ObjQuestionsDocument[];
  obj_start_time: Date;
  obj_final_cutoff_time: Date;
  obj_initial_cutoff_time: Date;
  theory_start_time: Date;
  theory_initial_cutoff_time: Date;
  theory_final_cutoff_time: Date;
  obj_total_time_allocated: number;
  theory_total_time_allocated: number;
  theory_questions: TheoryQuestionDocument[];
  teacher_id: mongoose.Types.ObjectId;
  term: string;
  exam_subject_status: string;
};

type CbtResultDocument = Document & {
  // school: mongoose.Types.ObjectId;
  subject_teacher: mongoose.Types.ObjectId;
  exam_id: mongoose.Types.ObjectId;
  level: string;
  academic_session_id: mongoose.Types.ObjectId;
  class_id: mongoose.Types.ObjectId;
  enrolment: mongoose.Types.ObjectId;
  subject_id: mongoose.Types.ObjectId;
  student_id: mongoose.Types.ObjectId;
  shuffled_obj_questions: ShuffledObjQuestionsDocument[];
  shuffled_theory_questions: ShuffledTheoryQuestionsDocument[];
  obj_total_time_allocated: number;
  obj_final_cutoff_time: Date;
  obj_trigger_type: string;
  obj_start_time: Date;
  obj_time_left: number;
  obj_started_at: Date;
  obj_submitted_at: Date;
  objective_total_score: number;
  percent_score: number;
  theory_total_score: number;
  total_score: number;
  obj_status: string;
  theory_status: string;
  term: string;
};

type CbtCutoffDocument = Document & {
  // school: mongoose.Types.ObjectId;
  first_cutoff_minutes: number;
  last_cutoff_minutes: number;
};

type CbtCutoffPayload = {
  first_cutoff_minutes: number;
  last_cutoff_minutes: number;
};

type CutoffMinutesCreationPayload = CbtCutoffPayload & {
  school_id: string;
};

type LogDocument = Document & {
  level: string;
  user_role?: string;
  message: string;
  service: string;
  stack?: string;
  method: string;
  route: string;
  status_code: number;
  user_id?: mongoose.Types.ObjectId;
  school_id?: mongoose.Types.ObjectId;
  ip: string;
  duration_ms: number;
};

type LogPayloadType = {
  level: string;
  message: string;
  user_role?: string;
  service?: string;
  stack?: string;
  method?: string;
  route?: string;
  status_code: number;
  user_id?: mongoose.Types.ObjectId;
  school_id?: mongoose.Types.ObjectId;
  ip: string;
  duration_ms: number;
};

type ExamAuthorizationPayloadType = {
  subject_id: string;
  term: string;
  academic_session_id: string;
  class_id: string;
  teacher_id: mongoose.Types.ObjectId;
  students_id_array: mongoose.Types.ObjectId[];
};

type ExamDocumentPayload = {
  academic_session_id: string;
  term: string;
};

type FetchAttendanceType = {
  academic_session_id: string;
  class_id: string;
  teacher_id?: object;
  role?: string;
};

type StudentArrayType = {
  date: Date;
  students: StudentAttendanceArrayType[];
};

type AttendanceMarkingType = {
  attendance_id: string;
  teacher_id: object;
  attendance_array: {
    date: Date;
    students: StudentAttendanceArrayType[];
  };
};

type AttendanceDocument = {
  _id: object;
  class: object;
  class_enrolment: object;
  class_teacher: object;
  session: object;
  first_term_attendance: StudentArrayType[];
  second_term_attendance: StudentArrayType[];
  third_term_attendance: StudentArrayType[];
};

type StudentAttendanceArrayType = {
  status: string;
  student: object;
};

type ClassMapDocType = {
  _id: Types.ObjectId;
  class_teacher?: Types.ObjectId | null;
};

export {
  ExamEndedType,
  ExamUpdateType,
  ExamAuthorizationPayloadType,
  LogPayloadType,
  LogDocument,
  CutoffMinutesCreationPayload,
  CbtCutoffPayload,
  CbtCutoffDocument,
  CbtResultDocument,
  CbtQuestionDocument,
  ClassExamTimetableDocument,
  ClassExamTimetablePayloadType,
  TimetableArrayType,
  ExamStartingType,
  ExamInputFieldsType,
  ObjQuestionType,
  SubjectObjQuestionDocumentCreationType,
  ClassLevelArrayType,
  CbtExamDocument,
  ExamDocumentCreationType,
  AccessModeType,
  FeatureKeyType,
  ContactUsType,
  ContactUsDocument,
  ClassTeacherManagesPayloadType,
  ClassSubjectFetchPayload,
  ClassLevelCreationPayloadType,
  ScoreRecordingParamType,
  ClassPositionCalType,
  SubjectResultType,
  ExamTimeUpdateType,
  StudentResultPopulatedType,
  StudentSubjectPositionType,
  CumScoreParamType,
  MultipleLastCumParamType,
  AllStudentResultsPayloadType,
  OptionalFeeType,
  SubjectRemovalType,
  SubjectResultDocument,
  SubjectAdditionType,
  MandatoryFeeType,
  StudentWalletObjType,
  StudentAccountType,
  CustomerCreationPayloadType,
  AccountType,
  AccountObjectType,
  AccountDetailsType,
  PaymentPriorityType,
  SchoolAccountType,
  PaymentPayloadType,
  OptionalSubjectProcessingType,
  StudentSchoolBusSubType,
  BusPayloadType,
  BusFeeValidationType,
  BusSubscriptionType,
  BusCategoryType,
  ClassResultsType,
  StudentResultSessionType,
  StudentResultTermType,
  SubjectPopulatedType,
  GetTeacherByIdType,
  GetStudentByIdType,
  SingleStudentScorePayload,
  StudentPopulatedType,
  ScorePayload,
  MultipleScoreParamType,
  AddingNegotiatedChargesType,
  NegotiatedFeesType,
  StudentDocument,
  SubjectOfferedType,
  UserReturn,
  ExamDocumentPayload,
  StudentClassByIdPayloadType,
  StudentClassPayloadType,
  TeacherSubjectType,
  StudentSubjectType,
  ClassSubjectTeacherChangeType,
  ClassTeacherChangeType,
  OnboardTeacherType,
  SubjectDocument,
  TeacherToSubjectType,
  GradingAndRemarkType,
  ScoreAndGradingType,
  ResultObjType,
  ScoreType,
  TermResult,
  ScoreParamType,
  ResultSettingDocument,
  ResultSettingComponentType,
  RegistrationServiceType,
  PaymentDataType,
  PaymentHistoryDataType,
  PaymentDocument,
  StudentPaymentHistoryType,
  PaymentPayloadMandatoryFeeType,
  MandatoryFeeProcessingType,
  AddFeeToStudentPaymentDocType,
  PaymentPayloadOptionalFeeType,
  OptionalFeeProcessingType,
  OptionalFeeAdditionType,
  AddingFeeToPaymentPayload,
  MandatoryFeePayloadType,
  FeePayloadType,
  OptionalFeePayloadType,
  SchoolBusDocument,
  SchoolFeesDocument,
  MultipleResultCreationType,
  GetClassStudentsType,
  SessionSubscriptionType,
  StudentSessionSubscriptionType,
  ParentObjType,
  StudentNotificationType,
  NotificationDocument,
  NotificationProp,
  StudentLinkingType,
  StudentWithPaymentType,
  StudentUpdateType,
  UserWithoutPassword,
  ResultCreationType,
  ClassEnrolmentDocument,
  StudentEnrolmentType,
  CreateClassType,
  GetClassPayloadType,
  ClassDocument,
  ClassCreationType,
  LogoutPayload,
  SubjectFetchingPayload,
  SubjectCreationType,
  RefreshTokenType,
  ChangePasswordType,
  CompanyTokenType,
  CompanyEmailQueue,
  SessionDocument,
  ResultDocument,
  UserInJwt,
  StudentRegistration,
  EmailQueue,
  VerifyUserType,
  EmailType,
  EmailJobData,
  TokenType,
  VerificationType,
  SchoolUserType,
  ImageType,
  SchoolCreationPayloadType,
  FilePath,
  FolderName,
  CloudinaryType,
  SchoolCreationValidationType,
  SchoolType,
  StudentValidationType,
  CashPaymentType,
  BankApprovalType,
  BankPaymentType,
  AddressValidationType,
  TeacherValidationType,
  SchoolBusValidationType,
  ExcludeParentAndStudent,
  TermDocument,
  TermCreationType,
  ParentType,
  PayloadForLoginInput,
  LinkStudentType,
  AsyncHandler,
  AdmissionValidationType,
  User,
  GetClassExamTimetablePayloadType,
  ComparePassType,
  CreateSubjectType,
  UserDocument,
  LoginResponseType,
  VerificationDocument,
  // CustomRequest,
  MultipleExamScoreParamType,
  AttendanceDocument,
  AttendanceMarkingType,
  ClassMapDocType,
  FetchAttendanceType,
};
