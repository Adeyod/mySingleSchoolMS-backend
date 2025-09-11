// import Joi, { extend, object } from 'joi';
// import {
//   ComparePassType,
//   CreateSubjectType,
//   ExcludeParentAndStudent,
//   LinkStudentType,
//   OldStudentValidationType,
//   ParentType,
//   PayloadForLoginInput,
//   SessionValidationType,
//   TeacherValidationType,
//   SchoolBusValidationType,
//   TermDocument,
//   User,
//   BankPaymentType,
//   AddressValidationType,
//   CashPaymentType,
//   BankApprovalType,
// } from '../constants/types';
// import { JoiError } from './app.error';

// const forbiddenCharsRegex = /^[^|!{}()&=[\]===><>]+$/;
// const academicSessionRegex = /^\d{4}-\d{4}$/;
// const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
// // const dateRegex = /^\d{2}-\d{2}-\d{4}$/;

// const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// const phoneNumberPattern = /^[0-9+]{10,14}$/;

// const passwordRegex =
//   /^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,32}$/;

// const joiValidation = <
//   T extends
//     | User
//     | PayloadForLoginInput
//     | ComparePassType
//     | string
//     | LinkStudentType
//     | CreateSubjectType
// >(
//   payload: T,
//   validationType:
//     | 'register'
//     | 'login'
//     | 'reset-password'
//     | 'forgot-password'
//     | 'link-student'
//     | 'create-subject'
// ): { success: boolean; value: T } => {
//   let validationSchema;

//   switch (validationType) {
//     case 'register':
//       validationSchema = Joi.object({
//         first_name: Joi.string()
//           .min(3)
//           .required()
//           .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`))
//           .messages({
//             'string.min':
//               'First name length must be at least 3 characters long',
//             'string.empty': 'First name is required',
//             'string.pattern.base': 'Invalid characters in first name field',
//           }),

//         gender: Joi.string().required(),
//         last_name: Joi.string()
//           .min(3)
//           .required()
//           .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`))
//           .messages({
//             'string.empty': 'Last name is required',
//             'string.min': 'Last name length must be at least 3 characters long',
//             'string.pattern.base': 'Invalid characters in last name field',
//           }),
//         email: commonRules.email,
//         password: commonRules.password,
//         confirm_password: Joi.string()
//           .valid(Joi.ref('password'))
//           .required()
//           .messages({
//             'any.only': 'Password and confirm password do not match',
//           }),
//       });
//       break;

//     case 'link-student':
//       validationSchema = Joi.object({
//         first_name: Joi.string()
//           .min(3)
//           .required()
//           .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`))
//           .messages({
//             'string.min':
//               'First name length must be at least 3 characters long',
//             'string.empty': 'First name is required',
//             'string.pattern.base': 'Invalid characters in first name field',
//           }),

//         last_name: Joi.string()
//           .min(3)
//           .required()
//           .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`))
//           .messages({
//             'string.empty': 'Last name is required',
//             'string.min': 'Last name length must be at least 3 characters long',
//             'string.pattern.base': 'Invalid characters in last name field',
//           }),
//       });
//       break;
//     case 'create-subject':
//       validationSchema = Joi.object({
//         name: Joi.string()
//           .min(3)
//           .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`))
//           .messages({
//             'string.empty': 'Name is required',
//             'string.min': 'Name length must be at least 3 characters long',
//             'string.pattern.base': 'Invalid characters in name field',
//           }),

//         description: Joi.string()
//           .min(3)
//           .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`))
//           .messages({
//             'string.empty': 'Description is required',
//             'string.min':
//               'Description length must be at least 3 characters long',
//             'string.pattern.base': 'Invalid characters in description field',
//           }),
//       });
//       break;

//     case 'login':
//       validationSchema = Joi.object({
//         email: commonRules.email,
//         password: commonRules.password,
//       });
//       break;

//     case 'reset-password':
//       validationSchema = Joi.object({
//         password: commonRules.password,
//         confirm_password: Joi.string()
//           .valid(Joi.ref('password'))
//           .required()
//           .messages({
//             'string.empty': 'Confirm Password is required',
//             'any.only': 'Password and confirm password do not match',
//           }),
//       });
//       break;

//     case 'forgot-password':
//       validationSchema = Joi.object({
//         email: commonRules.email,
//       });

//       const { error, value } = validationSchema.validate({ email: payload });
//       if (error) {
//         console.error(error);
//         throw new JoiError(error.details[0].message);
//       }

//       return { success: true, value: value.email as T };
//       break;

//     default:
//       throw new Error('Invalid validation type');
//   }

//   const { error, value } = validationSchema.validate(payload);
//   if (error) {
//     console.error(error);
//     const statusCode = 422;

//     throw new JoiError(
//       error.details[0].message,
//       statusCode,
//       error.details[0].type
//     );
//   }

//   return { success: true, value: value as T };
// };

// const parentValidation = <T extends ParentType>(
//   payload: T
// ): { success: boolean; value?: T; error?: string } => {
//   const validationSchema = Joi.object({
//     phone: commonRules.phone,
//     middle_name: commonRules.middle_name,
//   });

//   const { error, value } = validationSchema.validate(payload);
//   if (error) {
//     return { success: false, error: error.details[0].message };
//   }

//   return { success: true, value };
// };

// const sessionValidation = <T extends string | TermDocument>(
//   payload: T,
//   type: 'session' | 'term'
// ): { success: boolean; value: T } => {
//   let validationSchema;
//   switch (type) {
//     case 'session':
//       validationSchema = Joi.object({
//         academic_session: Joi.string()
//           .required()
//           .pattern(academicSessionRegex)
//           .messages({
//             'string.empty': 'Academic session is required',
//             'string.pattern.base':
//               'Invalid characters in academic session field',
//           }),
//       });

//       //////////
//       const { error, value } = validationSchema.validate({
//         academic_session: payload,
//       });
//       if (error) {
//         console.error(error);
//         throw new JoiError(error.details[0].message);
//       }

//       return { success: true, value: value.academic_session as T };
//       break;

//     case 'term':
//       validationSchema = Joi.object({
//         name: Joi.string()
//           .required()
//           .required()
//           .valid('first_term', 'second_term', 'third_term')
//           .messages({
//             'string.empty': 'Term name is required',
//             'any.only':
//               '"Name" must be one of the following "first term" or "second term" or"third term"',
//           }),

//         start_date: Joi.string().required().pattern(dateRegex).messages({
//           'string.empty': 'Start date is required',
//           'string.pattern.base': 'Start date must be in the format "DD-MM-YY"',
//         }),

//         end_date: Joi.string().required().pattern(dateRegex).messages({
//           'string.empty': 'End date is required',
//           'string.pattern.base': 'End date must be in the format "DD-MM-YY"',
//         }),
//       });
//       break;
//     default:
//       throw new Error('Invalid validation type');
//   }

//   const { error, value } = validationSchema.validate(payload);
//   if (error) {
//     console.error(error);
//     const statusCode = 422;

//     throw new JoiError(
//       error.details[0].message,
//       statusCode,
//       error.details[0].type
//     );
//   }

//   return { success: true, value: value as T };
// };

// const staffValidation = <T extends ExcludeParentAndStudent>(
//   payload: T
// ): { success: boolean; value?: T; error?: string } => {
//   const validationSchema = Joi.object({
//     phone: commonRules.phone,

//     middle_name: commonRules.middle_name,
//     dob: commonRules.dob,
//     employment_date: Joi.date().iso().required(),
//   });

//   const { error, value } = validationSchema.validate(payload);

//   if (error) {
//     return { success: false, error: error.details[0].message };
//   }

//   return { success: true, value };
// };

// const superAdminValidation = <T extends ExcludeParentAndStudent>(
//   payload: T
// ): { success: boolean; value?: T; error?: string } => {
//   const validationSchema = Joi.object({
//     phone: commonRules.phone,
//     middle_name: commonRules.middle_name,
//     dob: commonRules.dob,
//   });

//   const { error, value } = validationSchema.validate(payload);

//   if (error) {
//     console.error('superAdminValidation error:', error.details[0].message);
//     return { success: false, error: error.details[0].message };
//   }

//   return { success: true, value };
// };

// const studentValidation = <T extends OldStudentValidationType>(
//   payload: T
// ): { success: boolean; value?: T; error?: string } => {
//   const validationSchema = Joi.object({
//     middle_name: commonRules.middle_name,
//     dob: commonRules.dob,
//     current_class_level: Joi.string(),
//     admission_session: Joi.string()
//       .required()
//       .pattern(academicSessionRegex)
//       .messages({
//         'string.empty': 'Admission session is required',
//         'string.pattern.base': 'Invalid characters in admission session field',
//       }),
//   });

//   const { error, value } = validationSchema.validate(payload);
//   if (error) {
//     return { success: false, error: error.details[0].message };
//   }

//   return { success: true, value };
// };

// const oldStudentValidation = <T extends OldStudentValidationType>(
//   payload: T
// ): { success: boolean; value?: any; error?: string } => {
//   const validationSchema = Joi.object({
//     phone: commonRules.phone,

//     middle_name: commonRules.middle_name,
//     dob: commonRules.dob,
//     admission_session: Joi.string()
//       .required()
//       .pattern(academicSessionRegex)
//       .messages({
//         'string.empty': 'Admission session is required',
//         'string.pattern.base': 'Invalid characters in admission session field',
//       }),

//     graduation_session: Joi.string()
//       .required()
//       .pattern(academicSessionRegex)
//       .messages({
//         'string.empty': 'Graduation session is required',
//         'string.pattern.base': 'Invalid characters in graduation session field',
//       }),
//   });

//   const { error, value } = validationSchema.validate(payload);
//   if (error) {
//     return { success: false, error: error.details[0].message };
//   }

//   return { success: true, value };
// };

// const teacherValidation = <T extends TeacherValidationType>(
//   payload: T
// ): { success: boolean; value?: any; error?: string } => {
//   const validationSchema = Joi.object({
//     first_name: Joi.string()
//       .min(3)
//       .required()
//       .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`))
//       .messages({
//         'string.min': 'First name length must be at least 3 characters long',
//         'string.empty': 'First name is required',
//         'string.pattern.base': 'Invalid characters in first name field',
//       }),

//     last_name: Joi.string()
//       .min(3)
//       .required()
//       .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`))
//       .messages({
//         'string.empty': 'Last name is required',
//         'string.min': 'Last name length must be at least 3 characters long',
//         'string.pattern.base': 'Invalid characters in last name field',
//       }),
//     middle_name: commonRules.middle_name,
//   });

//   const { error, value } = validationSchema.validate(payload);
//   if (error) {
//     return { success: false, error: error.details[0].message };
//   }
//   return { success: true, value };
// };

// const commonRules = {
//   phone: Joi.string().pattern(phoneNumberPattern).required().messages({
//     'string.empty': 'Phone number is required',
//     'string.pattern.base': 'Please provide a valid phone number',
//   }),
//   email: Joi.string().email().required().messages({
//     'string.empty': 'Email is required',
//     'string.email': 'Please provide a valid email address',
//   }),
//   password: Joi.string()
//     .min(8)
//     .max(32)
//     .required()
//     .pattern(passwordRegex)
//     .messages({
//       'string.empty': 'Password is required',
//       'string.min': 'Password must be at least 8 characters long',
//       'string.max': 'Password can not be longer than 32 characters',
//       'string.pattern.base':
//         'Password must contain at least one lowercase, one uppercase, one number and one special character',
//     }),
//   dob: Joi.date().less('now').iso().required().messages({
//     'date.less': 'Date of birth must be in the past',
//     'date.base': 'Date of birth must be a valid date',
//     'any.required': 'Date of birth is required',
//   }),
//   middle_name: Joi.string()
//     .optional()
//     .allow(null, '')
//     .trim()
//     .lowercase()
//     .min(3)
//     .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`))
//     .messages({
//       'string.min': 'Middle name length must be at least 3 characters long',
//       'string.pattern.base': 'Invalid characters in middle name field',
//     }),

//   both_trips: Joi.number().positive().required(),
//   single_trip: Joi.number().positive().required(),

//   student_id: Joi.string().length(24).hex().required(),
//   session_id: Joi.string().length(24).hex().required(),
//   bank_name: Joi.string().required(),
//   term: Joi.string().required(),
//   amount_paying: Joi.number().required(),
//   teller_number: Joi.string().required(),
//   class_id: Joi.string().length(24).hex().required(),
// };

// const addressValidation = <T extends AddressValidationType>(
//   payload: T
// ): { success: boolean; error?: string; value?: any } => {
//   const validationSchema = Joi.object({
//     home_address: Joi.string()
//       .pattern(/^[^{}<>[\]]*$/)
//       .required(),
//     close_bus_stop: Joi.string()
//       .pattern(/^[^{}<>[\]]*$/)
//       .required(),
//   });

//   const { error, value } = validationSchema.validate(payload);
//   if (error) {
//     return { success: false, error: error.details[0].message };
//   } else {
//     return { success: true, value };
//   }
// };

// const cashPaymentValidation = <T extends CashPaymentType>(
//   payload: T
// ): { success: boolean; error?: string; value?: any } => {
//   const validationSchema = Joi.object({
//     student_id: commonRules.student_id,
//     session_id: commonRules.session_id,
//     term: commonRules.term,
//     amount_paying: commonRules.amount_paying,
//     class_id: commonRules.class_id,
//   });

//   const { error, value } = validationSchema.validate(payload);
//   if (error) {
//     return { success: false, error: error.details[0].message };
//   } else {
//     return { success: true, value };
//   }
// };

// const bankApprovalValidation = <T extends BankApprovalType>(
//   payload: T
// ): { success: boolean; error?: string; value?: any } => {
//   const validationSchema = Joi.object({
//     bank_name: commonRules.bank_name,
//     amount_paid: commonRules.amount_paying,
//     transaction_id: commonRules.teller_number,
//   });

//   const { error, value } = validationSchema.validate(payload);
//   if (error) {
//     return { success: false, error: error.details[0].message };
//   } else {
//     return { success: true, value };
//   }
// };

// const bankPaymentValidation = <T extends BankPaymentType>(
//   payload: T
// ): { success: boolean; error?: string; value?: any } => {
//   const validationSchema = Joi.object({
//     student_id: commonRules.student_id,
//     session_id: commonRules.session_id,
//     term: commonRules.term,
//     amount_paying: commonRules.amount_paying,
//     class_id: commonRules.class_id,
//     bank_name: commonRules.bank_name,
//     teller_number: commonRules.teller_number,
//   });

//   const { error, value } = validationSchema.validate(payload);
//   if (error) {
//     return { success: false, error: error.details[0].message };
//   } else {
//     return { success: true, value };
//   }
// };

// const schoolFeesValidation = (
//   amount: number
// ): { success: boolean; value?: any; error?: string } => {
//   const validationSchema = Joi.number().positive().required();

//   const { error, value } = validationSchema.validate(amount);
//   if (error) {
//     return { success: false, error: error.details[0].message };
//   }

//   return { success: true, value };
// };

// const schoolBusValidation = <T extends SchoolBusValidationType>(
//   payload: T
// ): { success: boolean; value?: any; error?: string } => {
//   const validationSchema = Joi.object({
//     close_group: Joi.object({
//       both_trips: commonRules.both_trips,
//       single_trip: commonRules.single_trip,
//     }),
//     far_group: Joi.object({
//       both_trips: commonRules.both_trips,
//       single_trip: commonRules.single_trip,
//     }),
//   });

//   const { error, value } = validationSchema.validate(payload);
//   if (error) {
//     return { success: false, error: error.details[0].message };
//   }
//   return { success: true, value };
// };

// export {
//   bankPaymentValidation,
//   cashPaymentValidation,
//   addressValidation,
//   schoolFeesValidation,
//   schoolBusValidation,
//   teacherValidation,
//   sessionValidation,
//   joiValidation,
//   oldStudentValidation,
//   staffValidation,
//   parentValidation,
//   studentValidation,
//   superAdminValidation,
//   bankApprovalValidation,
// };

////////////////////////////////////////////////////

import Joi, { any, boolean, extend, object } from 'joi';
import {
  ComparePassType,
  CreateSubjectType,
  ExcludeParentAndStudent,
  LinkStudentType,
  ParentType,
  PayloadForLoginInput,
  TeacherValidationType,
  SchoolBusValidationType,
  TermDocument,
  User,
  BankPaymentType,
  AddressValidationType,
  CashPaymentType,
  BankApprovalType,
  StudentValidationType,
  SchoolCreationValidationType,
  AdmissionValidationType,
  CreateClassType,
  NegotiatedFeesType,
  BusFeeValidationType,
  ContactUsType,
  ClassLevelArrayType,
  ObjQuestionType,
  CbtAssessmentInputFieldsType,
  TimetableArrayType,
  CbtCutoffPayload,
  AssessmentDocumentType,
} from '../constants/types';
import { JoiError } from './app.error';

const forbiddenCharsRegex = /^[^|!{}()&=[\]===><>]+$/;
const forbiddenRegexForSubject = /^[^|!{}()&=[\]===><>.]+$/;
const academicSessionRegex = /^\d{4}-\d{4}$/;
// const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
// const dateRegex = /^\d{2}-\d{2}-\d{4}$/;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneNumberPattern = /^[0-9+]{10,14}$/;
const passwordRegex =
  /^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,32}$/;

const joiValidation = <
  T extends
    | User
    | PayloadForLoginInput
    | ComparePassType
    | string
    | LinkStudentType
    | CreateSubjectType
    | CreateClassType
>(
  payload: T,
  validationType:
    | 'register'
    | 'login'
    | 'reset-password'
    | 'forgot-password'
    | 'link-student'
    | 'create-subject'
    | 'create-class'
): { success: boolean; value: T } => {
  let validationSchema;

  switch (validationType) {
    case 'register':
      validationSchema = Joi.object({
        first_name: commonRules.first_name,
        middle_name: Joi.string().allow('').optional(),
        gender: Joi.string().required(),
        phone: commonRules.phone,
        last_name: Joi.string()
          .min(3)
          .required()
          .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`))
          .messages({
            'string.empty': 'Last name is required',
            'string.min': 'Last name length must be at least 3 characters long',
            'string.pattern.base': 'Invalid characters in last name field',
          }),
        email: commonRules.email,
        password: commonRules.password,
        confirm_password: Joi.string()
          .valid(Joi.ref('password'))
          .required()
          .messages({
            'any.only': 'Password and confirm password do not match',
          }),
      });
      break;

    case 'link-student':
      validationSchema = Joi.object({
        first_name: Joi.string()
          .min(3)
          .required()
          .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`))
          .messages({
            'string.min':
              'First name length must be at least 3 characters long',
            'string.empty': 'First name is required',
            'string.pattern.base': 'Invalid characters in first name field',
          }),

        last_name: Joi.string()
          .min(3)
          .required()
          .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`))
          .messages({
            'string.empty': 'Last name is required',
            'string.min': 'Last name length must be at least 3 characters long',
            'string.pattern.base': 'Invalid characters in last name field',
          }),
      });
      break;
    case 'create-subject':
      validationSchema = Joi.object({
        name: Joi.string()
          .min(3)
          .required()
          .pattern(new RegExp(`^[^${forbiddenRegexForSubject.source}]*$`))
          .messages({
            'string.empty': 'Name is required',
            'string.min': 'Name length must be at least 3 characters long',
            'string.pattern.base': 'Invalid characters in name field',
          }),

        description: Joi.string()
          .min(3)
          .required()
          .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`))
          .messages({
            'string.empty': 'Description is required',
            'string.min':
              'Description length must be at least 3 characters long',
            'string.pattern.base': 'Invalid characters in description field',
          }),
      });
      break;

    case 'create-class':
      validationSchema = Joi.object({
        name: Joi.string()
          .min(3)
          .required()
          .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`))
          .messages({
            'string.empty': 'Name is required',
            'string.min': 'Name length must be at least 3 characters long',
            'string.pattern.base': 'Invalid characters in name field',
          }),

        level: Joi.string()
          .min(2)
          .required()
          .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`))
          .messages({
            'string.empty': 'Level is required',
            'string.min': 'Level length must be at least 2 characters long',
            'string.pattern.base': 'Invalid characters in level field',
          }),

        section: Joi.string()
          .required()
          .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`))
          .messages({
            'string.empty': 'Section is required',
            'string.pattern.base': 'Invalid characters in section field',
          }),

        description: Joi.string()

          .min(3)
          .required()
          .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`))
          .messages({
            'string.empty': 'Description is required',
            'string.min':
              'Description length must be at least 3 characters long',
            'string.pattern.base': 'Invalid characters in description field',
          }),
      });
      break;

    case 'login':
      validationSchema = Joi.object({
        email: commonRules.email,
        password: commonRules.password,
      });
      break;

    case 'reset-password':
      validationSchema = Joi.object({
        password: commonRules.password,
        confirm_password: Joi.string()
          .valid(Joi.ref('password'))
          .required()
          .messages({
            'string.empty': 'Confirm Password is required',
            'any.only': 'Password and confirm password do not match',
          }),
      });
      break;

    case 'forgot-password':
      validationSchema = Joi.object({
        email: commonRules.email,
      });

      const { error, value } = validationSchema.validate({ email: payload });
      if (error) {
        console.error(error);
        throw new JoiError(error.details[0].message);
      }

      return { success: true, value: value.email as T };
      break;

    default:
      throw new Error('Invalid validation type');
  }

  const { error, value } = validationSchema.validate(payload);
  if (error) {
    console.error(error);
    const statusCode = 422;

    throw new JoiError(
      error.details[0].message,
      statusCode,
      error.details[0].type
    );
  }

  return { success: true, value: value as T };
};

const joiValidateContactUs = <T extends ContactUsType>(
  payload: T
): { success: boolean; value?: T; error?: string } => {
  const validationSchema = Joi.object({
    first_name: commonRules.first_name,
    email: commonRules.email,
    last_name: commonRules.last_name,
    school_name: Joi.string().optional().allow(null, ''),
    message: Joi.string()
      .required()
      .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`)),
  });

  const { error, value } = validationSchema.validate(payload);

  if (error) {
    return { success: false, error: error.details[0].message };
  }

  return { success: true, value: value as T };
};

const parentValidation = <T extends ParentType>(
  payload: T
): { success: boolean; value?: T; error?: string } => {
  const validationSchema = Joi.object({
    middle_name: commonRules.middle_name,
  });

  const { error, value } = validationSchema.validate(payload);
  if (error) {
    return { success: false, error: error.details[0].message };
  }

  return { success: true, value };
};

const sessionValidation = <T extends string | TermDocument>(
  payload: T,
  type: 'session' | 'term'
): { success: boolean; value: T } => {
  let validationSchema;
  switch (type) {
    case 'session':
      validationSchema = Joi.object({
        academic_session: Joi.string()
          .required()
          .pattern(academicSessionRegex)
          .messages({
            'string.empty': 'Academic session is required',
            'string.pattern.base':
              'Invalid characters in academic session field',
          }),
      });

      //////////
      const { error, value } = validationSchema.validate({
        academic_session: payload,
      });
      if (error) {
        console.error(error);
        throw new JoiError(error.details[0].message);
      }

      return { success: true, value: value.academic_session as T };
      break;

    case 'term':
      validationSchema = Joi.object({
        name: Joi.string()
          .required()
          .valid('first_term', 'second_term', 'third_term')
          .messages({
            'string.empty': 'Term name is required',
            'any.only':
              '"Name" must be one of the following "first term" or "second term" or"third term"',
          }),

        start_date: Joi.string().required().pattern(dateRegex).messages({
          'string.empty': 'Start date is required',
          'string.pattern.base': 'Start date must be in the format "DD-MM-YY"',
        }),

        end_date: Joi.string().required().pattern(dateRegex).messages({
          'string.empty': 'End date is required',
          'string.pattern.base': 'End date must be in the format "DD-MM-YY"',
        }),
      });
      break;
    default:
      throw new Error('Invalid validation type');
  }

  const { error, value } = validationSchema.validate(payload);
  if (error) {
    console.error(error);
    const statusCode = 422;

    throw new JoiError(
      error.details[0].message,
      statusCode,
      error.details[0].type
    );
  }

  return { success: true, value: value as T };
};

const staffValidation = <T extends ExcludeParentAndStudent>(
  payload: T
): { success: boolean; value?: T; error?: string } => {
  const validationSchema = Joi.object({
    middle_name: commonRules.middle_name,
    dob: commonRules.dob,
    employment_date: Joi.date().iso().required(),
  });

  const { error, value } = validationSchema.validate(payload);

  if (error) {
    return { success: false, error: error.details[0].message };
  }

  return { success: true, value };
};

const superAdminValidation = <T extends ExcludeParentAndStudent>(
  payload: T
): { success: boolean; value?: T; error?: string } => {
  const validationSchema = Joi.object({
    middle_name: commonRules.middle_name,
  });

  const { error, value } = validationSchema.validate(payload);

  if (error) {
    console.error('superAdminValidation error:', error.details[0].message);
    return { success: false, error: error.details[0].message };
  }

  return { success: true, value };
};

const admissionValidation = <T extends AdmissionValidationType>(
  payload: T
): { success: boolean; value?: T; error?: string } => {
  const validationSchema = Joi.object({
    admission_session: Joi.required(),
    admission_number: Joi.required(),
    dob: commonRules.dob,
  });

  const { error, value } = validationSchema.validate(payload);
  if (error) {
    return { success: false, error: error.details[0].message };
  }

  return { success: true, value };
};

const studentValidation = <T extends StudentValidationType>(
  payload: T
): { success: boolean; value?: T; error?: string } => {
  const validationSchema = Joi.object({
    dob: commonRules.dob,
    current_class_level: Joi.string(),
    middle_name: commonRules.middle_name,
    admission_session: Joi.string()
      .required()
      .pattern(academicSessionRegex)
      .messages({
        'string.empty': 'Admission session is required',
        'string.pattern.base': 'Invalid characters in admission session field',
      }),
  });

  const { error, value } = validationSchema.validate(payload);
  if (error) {
    return { success: false, error: error.details[0].message };
  }

  return { success: true, value };
};

const teacherValidation = <T extends TeacherValidationType>(
  payload: T
): { success: boolean; value?: any; error?: string } => {
  const validationSchema = Joi.object({
    first_name: Joi.string()
      .min(3)
      .required()
      .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`))
      .messages({
        'string.min': 'First name length must be at least 3 characters long',
        'string.empty': 'First name is required',
        'string.pattern.base': 'Invalid characters in first name field',
      }),

    last_name: Joi.string()
      .min(3)
      .required()
      .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`))
      .messages({
        'string.empty': 'Last name is required',
        'string.min': 'Last name length must be at least 3 characters long',
        'string.pattern.base': 'Invalid characters in last name field',
      }),
    middle_name: commonRules.middle_name,
  });

  const { error, value } = validationSchema.validate(payload);
  if (error) {
    return { success: false, error: error.details[0].message };
  }
  return { success: true, value };
};

const commonRules = {
  phone: Joi.string().pattern(phoneNumberPattern).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number',
  }),
  first_name: Joi.string()
    .min(3)
    .required()
    .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`))
    .messages({
      'string.min': 'First name length must be at least 3 characters long',
      'string.empty': 'First name is required',
      'string.pattern.base': 'Invalid characters in first name field',
    }),
  last_name: Joi.string()
    .min(3)
    .required()
    .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`))
    .messages({
      'string.min': 'Last name length must be at least 3 characters long',
      'string.empty': 'First name is required',
      'string.pattern.base': 'Invalid characters in last name field',
    }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
  }),
  password: Joi.string()
    .min(8)
    .max(32)
    .required()
    .pattern(passwordRegex)
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password can not be longer than 32 characters',
      'string.pattern.base':
        'Password must contain at least one lowercase, one uppercase, one number and one special character',
    }),
  dob: Joi.date().less('now').iso().required().messages({
    'date.less': 'Date of birth must be in the past',
    'date.base': 'Date of birth must be a valid date',
    'any.required': 'Date of birth is required',
  }),
  stringRequired: Joi.string()
    .pattern(/^[^{}<>[\]]*$/)
    .required()
    .messages({
      'string.empty': '{#label} is required.',
      'any.required': '{#label} is required',
    }),
  middle_name: Joi.string()
    .optional()
    .allow(null, '')
    .trim()
    .lowercase()
    .min(3)
    .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`))
    .messages({
      'string.min': 'Middle name length must be at least 3 characters long',
      'string.pattern.base': 'Invalid characters in middle name field',
    }),

  both_trips: Joi.number().positive().required(),
  single_trip: Joi.number().positive().required(),
  address: Joi.string()
    .pattern(/^[^{}<>[\]]*$/)
    .required(),
  student_id: Joi.string().length(24).hex().required(),
  session_id: Joi.string().length(24).hex().required(),
  bank_name: Joi.string().required(),
  term: Joi.string().required(),
  amount_paying: Joi.number().required(),
  teller_number: Joi.string().required(),
  class_id: Joi.string().length(24).hex().required(),
};

const addressValidation = (
  home_address: string
): { success: boolean; error?: string; value?: any } => {
  const validationSchema = Joi.object({
    home_address: Joi.string()
      .pattern(/^[^{}<>[\]]*$/)
      .required(),
  });

  const { error, value } = validationSchema.validate({ home_address });
  if (error) {
    return { success: false, error: error.details[0].message };
  } else {
    return { success: true, value };
  }
};

const cashPaymentValidation = <T extends CashPaymentType>(
  payload: T
): { success: boolean; error?: string; value?: any } => {
  const validationSchema = Joi.object({
    student_id: commonRules.student_id,
    session_id: commonRules.session_id,
    term: commonRules.term,
    amount_paying: commonRules.amount_paying,
    class_id: commonRules.class_id,
  });

  const { error, value } = validationSchema.validate(payload);
  if (error) {
    return { success: false, error: error.details[0].message };
  } else {
    return { success: true, value };
  }
};

const bankApprovalValidation = <T extends BankApprovalType>(
  payload: T
): { success: boolean; error?: string; value?: any } => {
  const validationSchema = Joi.object({
    bank_name: commonRules.bank_name,
    amount_paid: commonRules.amount_paying,
    transaction_id: commonRules.teller_number,
  });

  const { error, value } = validationSchema.validate(payload);
  if (error) {
    return { success: false, error: error.details[0].message };
  } else {
    return { success: true, value };
  }
};

const bankPaymentValidation = <T extends BankPaymentType>(
  payload: T
): { success: boolean; error?: string; value?: any } => {
  const validationSchema = Joi.object({
    student_id: commonRules.student_id,
    session_id: commonRules.session_id,
    term: commonRules.term,
    amount_paying: commonRules.amount_paying,
    class_id: commonRules.class_id,
    bank_name: commonRules.bank_name,
    teller_number: commonRules.teller_number,
  });

  const { error, value } = validationSchema.validate(payload);
  if (error) {
    return { success: false, error: error.details[0].message };
  } else {
    return { success: true, value };
  }
};

const schoolFeesValidation = (
  amount: number
): { success: boolean; value?: any; error?: string } => {
  const validationSchema = Joi.number().positive().required();

  const { error, value } = validationSchema.validate(amount);
  if (error) {
    return { success: false, error: error.details[0].message };
  }

  return { success: true, value };
};

const negotiatedFeesValidation = <T extends NegotiatedFeesType>(
  payload: T
): { success: boolean; value?: any; error?: string } => {
  const validationSchema = Joi.object({
    negotiated_school_charge: Joi.number().positive().required(),
    negotiated_transaction_charge: Joi.number().positive().required(),
  });

  const { error, value } = validationSchema.validate(payload);

  if (error) {
    return { success: false, error: error.details[0].message };
  }

  return { success: true, value };
};

const optionalFeesValidation = (
  amount: number,
  fee_name: string
): { success: boolean; value?: any; error?: string } => {
  const validationSchema = Joi.object({
    amount: Joi.number().positive().required(),
    fee_name: Joi.string()
      .pattern(/^[^{}<>[\]]*$/)
      .required(),
  });

  const { error, value } = validationSchema.validate({ amount, fee_name });
  if (error) {
    return { success: false, error: error.details[0].message };
  }

  return { success: true, value };
};

const schoolBusValidation = <T extends SchoolBusValidationType>(
  payload: T
): { success: boolean; value?: any; error?: string } => {
  const validationSchema = Joi.object({
    close_group: Joi.object({
      both_trips: commonRules.both_trips,
      single_trip: commonRules.single_trip,
    }),
    far_group: Joi.object({
      both_trips: commonRules.both_trips,
      single_trip: commonRules.single_trip,
    }),
  });

  const { error, value } = validationSchema.validate(payload);
  if (error) {
    return { success: false, error: error.details[0].message };
  }
  return { success: true, value };
};

const joiValidateClassLevelArray = <T extends ClassLevelArrayType>(
  payload: T
): { success: boolean; value?: any; error?: string } => {
  const validationSchema = Joi.object({
    class_level_array: Joi.array()
      .items(Joi.string().required())
      .min(1)
      .required(),
  });

  const { error, value } = validationSchema.validate(payload);

  if (error) {
    return { success: false, error: error.details[0].message };
  }
  return { success: true, value };
};

const schoolCreationValidation = <T extends SchoolCreationValidationType>(
  payload: T
): { success: boolean; value?: any; error?: string } => {
  const validationSchema = Joi.object({
    school_name: Joi.string().required(),
    subdomain: Joi.string().required(),
    address: commonRules.address,
    city: commonRules.stringRequired,
    state: commonRules.stringRequired,
    country: commonRules.stringRequired,
    phone: commonRules.phone,
    email: Joi.string().email().optional().allow(null, '').messages({
      'string.email': 'Please provide a valid email address',
    }),
    website: Joi.string().optional().allow(null, ''),
  }).unknown(true);

  const { error, value } = validationSchema.validate(payload);

  if (error) {
    console.log('Joi Validation Error:', error);
    console.log('Joi:', error.details[0].message);
    return { success: false, error: error.details[0].message };
  }
  return { success: true, value };
};

const joiBusFeeValidation = <T extends BusFeeValidationType>(
  payload: T
): { success: boolean; value?: any; error?: string } => {
  const validationSchema = Joi.object({
    name: Joi.string().required(),
    addresses_array: Joi.array()
      .items(Joi.string().required())
      .min(1)
      .required(),
    to: Joi.number().min(0).required(),
    fro: Joi.number().min(0).required(),
    to_and_fro: Joi.number().min(0).required(),
  });
  const { error, value } = validationSchema.validate(payload);
  if (error) {
    return { success: false, error: error.details[0].message };
  }
  return { success: true, value };
};

const joiPriorityOrderValidation = <
  T extends { priority_order: { fee_name: string; priority_number: number } }
>(
  payload: T
): { success: boolean; value?: any; error?: string } => {
  const validationSchema = Joi.object({
    priority_order: Joi.array()
      .items(
        Joi.object({
          fee_name: Joi.string().required(),
          priority_number: Joi.number().required(),
        })
      )
      .required(),
  });

  const { error, value } = validationSchema.validate(payload);
  if (error) {
    return { success: false, error: error.details[0].message };
  }
  return { success: true, value };
};

const joiAccountArrayValidation = <
  T extends {
    account_details_array: {
      account_number: string;
      account_name: string;
      bank_name: string;
    };
  }
>(
  payload: T
): { success: boolean; value?: any; error?: string } => {
  const validationSchema = Joi.object({
    account_details_array: Joi.array()
      .items(
        Joi.object({
          account_number: Joi.string().required(),
          account_name: Joi.string().required(),
          bank_name: Joi.string().required(),
        })
      )
      .required(),
  });

  const { error, value } = validationSchema.validate(payload);
  if (error) {
    return { success: false, error: error.details[0].message };
  }
  return { success: true, value };
};

const joiValidateExamInputFields = <T extends CbtAssessmentInputFieldsType>(
  payload: T
): { success: boolean; value?: any; error?: string } => {
  const validationSchema = Joi.object({
    assessment_type: commonRules.stringRequired.label('assessment_type'),
    min_obj_questions: Joi.number().required(),
    max_obj_questions: Joi.number().required(),
    expected_obj_number_of_options: Joi.number().required(),
    number_of_questions_per_student: Joi.number().required(),
  });

  const { error, value } = validationSchema.validate(payload, {
    errors: { wrap: { label: '' } },
  });

  if (error) {
    return { success: false, error: error.details[0].message };
  }
  return { success: true, value };
};

const singleQuestionSchema = Joi.object({
  question_number: Joi.number().required(),
  question_text: Joi.string().trim().required(),
  options: Joi.array().items(Joi.string().trim().required()).min(2).required(),
  correct_answer: Joi.string().trim().required(),
  score: Joi.number().required(),
})
  .custom((value: ObjQuestionType, helpers) => {
    const normalizedOptions = value.options.map((opt) =>
      opt.trim().toLowerCase()
    );
    const normalizedCorrectAnswer = value.correct_answer.trim().toLowerCase();

    if (!normalizedOptions.includes(normalizedCorrectAnswer)) {
      return helpers.error('any.invalidCorrectAnswer', {
        qNum: value.question_number,
      });
    }

    const uniqueOptions = new Set(normalizedOptions);
    if (uniqueOptions.size !== normalizedOptions.length) {
      return helpers.error('any.duplicateOptions', {
        qNum: value.question_number,
      });
    }
    return value;
  })
  .messages({
    'any.invalidCorrectAnswer':
      'Question {{#qNum}} has an invalid correct answer not present in options.',

    'any.duplicateOptions':
      'Question {{#qNum}} has duplicate options. Each option must be unique.',
  });

const joiValidateQuestionArray = (
  payload: ObjQuestionType[]
): {
  success: boolean;
  value?: any;
  error?: string;
} => {
  const schema = Joi.array().items(singleQuestionSchema).min(1).required();

  const { error, value } = schema.validate(payload);
  if (error) {
    return { success: false, error: error.details[0].message };
  }
  return { success: true, value };
};

const joiValidateAssessmentDocumentArray = (
  payload: AssessmentDocumentType[]
): {
  success: boolean;
  value?: any;
  error?: string;
} => {
  const schema = Joi.array()
    .items(singleAssessmentDocumentSchema)
    .min(1)
    .required()
    .custom((value: AssessmentDocumentType[], helpers) => {
      const levels = value.map((v) => v.level);
      const duplicates = levels.filter(
        (lvl, idx) => levels.indexOf(lvl) !== idx
      );

      if (duplicates.length > 0) {
        return helpers.error('any.invalid', {
          message: `Duplicate level(s) found: ${[...new Set(duplicates)].join(
            ', '
          )}`,
        });
      }

      return value;
    });
  const { error, value } = schema.validate(payload);
  if (error) {
    return { success: false, error: error.details[0].message };
  }
  return { success: true, value };
};

const singleAssessmentDocumentSchema = Joi.object({
  assessment_type: Joi.string().trim().required(),
  number_of_questions_per_student: Joi.number().required(),
  min_obj_questions: Joi.number().required(),
  max_obj_questions: Joi.number().required(),
  expected_obj_number_of_options: Joi.number().required(),
  level: Joi.string().trim().required(),
});

const singleTimetableSchema = Joi.object({
  subject_id: Joi.string().trim().required(),
  start_time: Joi.date().required(),
  duration: Joi.number().required(),
});

const joiValidateTimetableArray = (
  payload: TimetableArrayType[]
): {
  success: boolean;
  value?: any;
  error?: string;
} => {
  const schema = Joi.array().items(singleTimetableSchema).min(1).required();
  const { error, value } = schema.validate(payload);
  if (error) {
    return { success: false, error: error.details[0].message };
  }
  return { success: true, value };
};

const joiValidateCutoffs = (
  payload: CbtCutoffPayload
): {
  success: boolean;
  value?: any;
  error?: string;
} => {
  const validationSchema = Joi.object({
    first_cutoff_minutes: Joi.number().required(),
    last_cutoff_minutes: Joi.number().required(),
  });

  const { error, value } = validationSchema.validate(payload);
  if (error) {
    return { success: false, error: error.details[0].message };
  }
  return { success: true, value };
};

export {
  joiValidateAssessmentDocumentArray,
  joiValidateCutoffs,
  joiValidateTimetableArray,
  joiValidateQuestionArray,
  joiValidateExamInputFields,
  joiValidateClassLevelArray,
  joiAccountArrayValidation,
  joiPriorityOrderValidation,
  joiBusFeeValidation,
  negotiatedFeesValidation,
  optionalFeesValidation,
  admissionValidation,
  schoolCreationValidation,
  bankPaymentValidation,
  cashPaymentValidation,
  addressValidation,
  schoolFeesValidation,
  schoolBusValidation,
  teacherValidation,
  sessionValidation,
  joiValidation,
  staffValidation,
  parentValidation,
  studentValidation,
  superAdminValidation,
  bankApprovalValidation,
  joiValidateContactUs,
};
