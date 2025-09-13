// const teacherStatusEnum = ['active', 'inactive', 'sacked', 'resigned'];
// const genderEnum = ['male', 'female', 'others'];
// const rolesEnum = [
//   'admin',
//   'student',
//   'teacher',
//   'parent',
//   'super_admin',
//   'old_student',
//   'non_teaching',
// ];
// const testTypeEnum = ['first_test', 'second_test', 'exam'];
// const enrolmentEnum = ['enrolled', 'completed', 'to_repeat'];
// const attendanceEnum = ['present', 'absent'];
// const verificationEnum = ['email_verification', 'password_reset'];
// const termEnum = ['first_term', 'second_term', 'third_term'];
// const gradeEnum = [null, 'A', 'B', 'C', 'D', 'E', 'F'];
// const streamEnum = [
//   'art',
//   'science',
//   'commercial',
//   'commercial/art',
//   'science/commercial',
//   'all_sss_only',
//   'all_jss_only',
//   'others',
// ];
// const studentStatusEnum = ['active', 'graduated', 'expelled'];
// const currentClassLevelEnum = [
//   'JSS 1',
//   'JSS 2',
//   'JSS 3',
//   'SSS 1',
//   'SSS 2',
//   'SSS 3',
// ];
// const classEnum = [
//   'JSS1A',
//   'JSS1B',
//   'JSS1C',
//   'JSS1D',
//   'JSS1E',
//   'JSS1F',
//   'JSS2A',
//   'JSS2B',
//   'JSS2C',
//   'JSS2D',
//   'JSS3A',
//   'JSS3B',
//   'SS1A',
//   'SS1B',
//   'SS1C',
//   'SS2A',
//   'SS2B',
//   'SS3A',
//   'SS3B',
// ];
// const busTripEnum = ['both_trips', 'single_trip'];
// const busRouteEnum = ['morning', 'afternoon'];
// const paymentEnum = ['cash', 'bank', 'card'];
// const paymentStatusEnum = ['pending', 'confirmed'];
// const subjectTypeEnum = ['compulsory', 'optional'];
// const subjectTierEnum = ['jss_section', 'sss_section'];
// const finalResultStatusEnum = ['promoted', 'repeat', 'withdrawn', 'graduated'];

// export {
//   testTypeEnum,
//   busRouteEnum,
//   paymentStatusEnum,
//   paymentEnum,
//   busTripEnum,
//   subjectTierEnum,
//   subjectTypeEnum,
//   classEnum,
//   studentStatusEnum,
//   streamEnum,
//   gradeEnum,
//   termEnum,
//   verificationEnum,
//   teacherStatusEnum,
//   genderEnum,
//   rolesEnum,
//   enrolmentEnum,
//   attendanceEnum,
//   finalResultStatusEnum,
//   currentClassLevelEnum,
// };

/////////////////////////////////////////////////////////////////////////////////////
const teacherStatusEnum = ['active', 'inactive', 'sacked', 'resigned'];
const genderEnum = ['male', 'female', 'others'];
const rolesEnum = [
  'admin',
  'student',
  'teacher',
  'parent',
  'super_admin',
  'non_teaching',
];
const mandatedSuperAdmins = [
  'ayodejiadebolu@gmail.com',
  'agbetuyiolawande@gmail.com',
  'topzyray009@gmail.com',
];
const testTypeEnum = ['first_test', 'second_test', 'exam'];
const enrolmentEnum = ['enrolled', 'completed', 'to_repeat'];
const attendanceEnum = ['present', 'absent'];
const verificationEnum = ['email_verification', 'password_reset'];
const termEnum = ['first_term', 'second_term', 'third_term'];
const gradeEnum = [null, 'A', 'B', 'C', 'D', 'E', 'F'];
const studentStatusEnum = ['active', 'graduated', 'expelled'];
const busTripEnum = ['both_trips', 'single_trip'];
const busRouteEnum = ['morning', 'afternoon'];
const paymentEnum = ['cash', 'bank', 'card'];
const paymentStatusEnum = ['pending', 'confirmed'];
const subjectTypeEnum = ['compulsory', 'optional'];
const subjectTierEnum = ['jss_section', 'sss_section'];
const finalResultStatusEnum = ['promoted', 'repeat', 'withdrawn', 'graduated'];
const nonTeachingEnum = ['bursar', 'counselor', 'gateman', 'admin_officer'];
const streamEnum = [
  'art',
  'science',
  'commercial',
  'commercial/art',
  'science/commercial',
  'all_sss_only',
  'all_jss_only',
  'others',
];

const subscriptionEnum = ['basic', 'essential', 'pro', 'advanced'] as const;

const examStatusEnum = ['not-started', 'in-progress', 'submitted', 'ended'];

const triggerTypeEnum = ['manual', 'time_up', 'cutoff'];

const examKeyEnum = ['obj', 'theory'];

const partyRoleEnum = ['sender', 'beneficiary'];

const transactionStatusEnum = ['pending', 'success', 'failed'] as const;

const transactionTypeEnum = ['credit', 'debit'];

const transactionChannelEnum = ['webhook', 'manual', 'fee_payment', 'transfer'];

export {
  partyRoleEnum,
  transactionChannelEnum,
  transactionStatusEnum,
  transactionTypeEnum,
  examKeyEnum,
  triggerTypeEnum,
  examStatusEnum,
  subscriptionEnum,
  // companyRoles,
  streamEnum,
  nonTeachingEnum,
  testTypeEnum,
  busRouteEnum,
  paymentStatusEnum,
  paymentEnum,
  busTripEnum,
  subjectTierEnum,
  subjectTypeEnum,
  studentStatusEnum,
  gradeEnum,
  termEnum,
  verificationEnum,
  teacherStatusEnum,
  genderEnum,
  rolesEnum,
  enrolmentEnum,
  attendanceEnum,
  finalResultStatusEnum,
  mandatedSuperAdmins,
};
