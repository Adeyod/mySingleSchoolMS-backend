// import {
//   ClassDocument,
//   ClassPositionCalType,
//   ResultObjType,
//   ScoreAndGradingType,
//   UserDocument,
// } from '../constants/types';
// import Session from '../models/session.model';
// import Student from '../models/students.model';
// import { AppError } from './app.error';

// const capitalizeFirstLetter = (payload: string) => {
//   const value = payload.charAt(0).toUpperCase() + payload.slice(1);

//   return value;
// };

// const generateAdmissionNumber = async () => {
//   try {
//     const sessionInfo = await Session.findOne({
//       is_active: true,
//     });

//     if (!sessionInfo) {
//       throw new AppError(
//         'You need to first create an active session before you can do this.',
//         404
//       );
//     }

//     const session = sessionInfo.academic_session;

//     const lastStudent = await Student.findOne({
//       admission_number: { $regex: `CS/${session}/` },
//     }).sort({ admission_number: -1 });

//     let lastStudentNumber = 0;

//     if (lastStudent && lastStudent.admission_number) {
//       const parts = lastStudent.admission_number.split('/');
//       lastStudentNumber = parseInt(parts[2], 10) || 0;
//     }

//     const newStudentNumber = lastStudentNumber + 1;
//     const admissionNumber = `CS/${session}/${newStudentNumber
//       .toString()
//       .padStart(4, '0')}`;

//     return admissionNumber;
//   } catch (error) {
//     throw new Error('Error generating admission number: ' + error);
//   }
// };

// const genderFunction = (user: UserDocument) => {
//   let title = '';
//   let rep = '';
//   if (user.gender === 'male') {
//     title = 'Mr';
//     rep = 'he';
//   } else if (user.gender === 'female') {
//     title = 'Mrs';
//     rep = 'she';
//   }

//   return { title, rep };
// };

// const calculateSubjectSumAndGrade = async (
//   payload: TotalSumType
// ): Promise<ResultObjType> => {
//   try {
//     const result =
//       payload.first_test_score + payload.second_test_score + payload.exam_score;
//     let grade;
//     console.log('result:', result);

//     if (result >= 70) grade = 'A';
//     else if (result >= 60) grade = 'B';
//     else if (result >= 50) grade = 'C';
//     else if (result >= 45) grade = 'D';
//     else if (result >= 40) grade = 'E';
//     else grade = 'F';

//     console.log('grade:', grade);

//     const resultObj = {
//       grade: grade,
//       total: result,
//     };

//     return resultObj as ResultObjType;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened.');
//     }
//   }
// };

// const calculateSubjectSumAndGrade = async (
//   payload: ScoreAndGradingType
// ): Promise<ResultObjType> => {
//   try {
//     const result = payload.score.reduce((sum, a) => sum + a.score, 0);

//     // let last_term_cumulative
//     // let cumulative_score

//     //     if(payload.current_term === 'first_term') {
//     // last_term_cumulative === result
//     //     }else if(payload.current_term === 'second_term') {

//     //     }

//     // let resultObj;
//     for (const gradeItem of payload.gradingObj) {
//       if (result >= gradeItem.value) {
//         return {
//           grade: gradeItem.grade,
//           remark: gradeItem.remark,
//           total: result,
//         };
//       }
//     }

//     return {
//       grade: 'F',
//       remark: 'Fail',
//       total: result,
//     };
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened.');
//     }
//   }
// };

// const getPositionWithSuffix = (position: number): string => {
//   const suffixes = ['th', 'st', 'nd', 'rd'];
//   const v = position % 100;
//   const suffix = suffixes[(v - 20) % 100] || suffixes[v] || suffixes[0];
//   return `${position}${suffix}`;
// };

// const assignPositions = (students: any[]): any[] => {
//   const sortedStudents = [...students]
//     .filter(
//       (student) =>
//         student.subjectObj && student.subjectObj.total_score !== undefined
//     )
//     .sort((a, b) => b.subjectObj.total_score - a.subjectObj.total_score);

//   let previousScore: number | null = null;
//   let previousPosition = 0;
//   let rank = 0;

//   sortedStudents.forEach((student, index) => {
//     if (student.subjectObj.total_score !== previousScore) {
//       rank = index + 1;
//       previousScore = student.subjectObj.total_score;
//     }
//     previousPosition = rank;
//     student.subjectObj.subject_position =
//       getPositionWithSuffix(previousPosition);
//   });

//   return sortedStudents;
// };

// const classPositionCalculation = (
//   students: ClassPositionCalType[]
// ): ClassPositionCalType[] => {
//   students.forEach((student) => {
//     const subjects = student.allCummulatives.subject_results;
//     const totalScores = subjects.reduce(
//       (sum, subject) => sum + subject.total_score,
//       0
//     );
//     student.allCummulatives.cumulative_score = subjects.length
//       ? parseFloat((totalScores / subjects.length).toFixed(2))
//       : 0;
//   });

//   students.sort(
//     (a, b) =>
//       (b.allCummulatives.cumulative_score ?? 0) -
//       (a.allCummulatives.cumulative_score ?? 0)
//   );

//   let position;

//   students.forEach((student, index) => {
//     position = index + 1;
//     student.allCummulatives.class_position = getPositionWithSuffix(position);
//   });

//   return students;
// };

// const schoolClassLevels = async (schoolClasses: ClassDocument[]) => {
//   const uniqueClass = [];
//   const seenLevels = new Set();

//   for (const classObj of schoolClasses) {
//     if (classObj && !seenLevels.has(classObj.level)) {
//       seenLevels.add(classObj.level);
//       uniqueClass.push(classObj);
//     }
//   }

//   return uniqueClass;
// };

// export {schoolClassLevels,
//   assignPositions,
//   getPositionWithSuffix,
//   calculateSubjectSumAndGrade,
//   genderFunction,
//   capitalizeFirstLetter,
//   generateAdmissionNumber,
//   classPositionCalculation,
// };

// "students_result": [
//   {
//       "studentId": "6765188d2cb4b100c441fed6",
//       "first_name": "ayodeji",
//       "last_name": "adebolu",
//       "allCummulatives": {
//           "term": "second_term",
//           "cumulative_score": 0,
//           "subject_results": [
//               {
//                   "subject": "677511cd6c080204ac2b4d8f",
//                   "subject_teacher": "6767b965920cb08b990e5c36",
//                   "total_score": 75,
//                   "first_test_score": 18,
//                   "second_test_score": 12,
//                   "exam_score": 45,
//                   "_id": "678a5aad9ec7a1f24cfd35e4",
//                   "grade": "A",
//                   "subject_position": "2nd"
//               },
//               {
//                 "subject": "677511cd6c080204ac2bsyat",
//                 "subject_teacher": "6767b965920cb08b990evbcn",
//                 "total_score": 68,
//                 "first_test_score": 13,
//                 "second_test_score": 12,
//                 "exam_score": 43,
//                 "_id": "678a5a479sy7a1fdycbjh5d3",
//                 "grade": "A",
//                 "subject_position": "1st"
//             },
//             {
//                 "subject": "677511cd6c080204ac2vnd8f",
//                 "subject_teacher": "6767b965920cb08b990wuc36",
//                 "total_score": 90,
//                 "first_test_score": 15,
//                 "second_test_score": 19,
//                 "exam_score": 56,
//                 "_id": "678a5a479ec7a1f2vyfd35sc",
//                 "grade": "A",
//                 "subject_position": "2nd"
//             }
//           ],
//           "_id": "678a5a469ec7a1f24cfd35cf"
//       }
//   },
//   {
//       "studentId": "676d2abd8b0681ad37a724f0",
//       "first_name": "kolade",
//       "last_name": "dafa",
//       "allCummulatives": {
//           "term": "second_term",
//           "cumulative_score": 0,
//           "subject_results": [
//               {
//                   "subject": "677511cd6c080204ac2b4d8f",
//                   "subject_teacher": "6767b965920cb08b990e5c36",
//                   "total_score": 85,
//                   "first_test_score": 15,
//                   "second_test_score": 18,
//                   "exam_score": 52,
//                   "_id": "678a5a479ec7a1f24cfd35d3",
//                   "grade": "A",
//                   "subject_position": "1st"
//               },
//               {
//                   "subject": "677511cd6c080204ac2bsyat",
//                   "subject_teacher": "6767b965920cb08b990evbcn",
//                   "total_score": 70,
//                   "first_test_score": 13,
//                   "second_test_score": 12,
//                   "exam_score": 45,
//                   "_id": "678a5a479sy7a1f24cbjh5d3",
//                   "grade": "A",
//                   "subject_position": "1st"
//               },
//               {
//                   "subject": "677511cd6c080204ac2vnd8f",
//                   "subject_teacher": "6767b965920cb08b990wuc36",
//                   "total_score": 95,
//                   "first_test_score": 18,
//                   "second_test_score": 20,
//                   "exam_score": 57,
//                   "_id": "678a5a479ec7a1f24cfd35sc",
//                   "grade": "A",
//                   "subject_position": "1st"
//               }
//           ],
//           "_id": "678a5a479ec7a1f24cfd35d2"
//       }
//   }
// ]

////////////////////////////////////////////////////////////
import { subscriptionEnum } from '../constants/enum';
import {
  ClassDocument,
  ClassPositionCalType,
  CompanyEmailQueue,
  EmailQueue,
  GenerateBankReferenceType,
  ObjQuestionType,
  ResultObjType,
  ScoreAndGradingType,
  ScoreType,
  UserDocument,
} from '../constants/types';
import { AppError } from './app.error';
import HashUtil from './crypto/sha256';
import { emailQueue } from './queue';

const capitalizeFirstLetter = (payload: string) => {
  const value = payload.charAt(0).toUpperCase() + payload.slice(1);

  return value;
};

const sendingEmailToQueue = async (
  payload: EmailQueue,
  type:
    | 'email-verification'
    | 'school-creation'
    | 'forgot-password'
    | 'child-linkage'
    | 'session-subscription'
) => {
  try {
    const name = capitalizeFirstLetter(payload.first_name);
    const name_of_school = capitalizeFirstLetter(payload?.school_name);
    const school_city = capitalizeFirstLetter(payload?.school_city);
    const school_state = capitalizeFirstLetter(payload?.school_state);
    const school_country = capitalizeFirstLetter(payload?.school_country);
    const title = payload.title;
    const message = payload.message;

    const jobData = {
      email: payload.email,
      first_name: name,
      token: payload.token,
      school_name: name_of_school,
      city: school_city,
      state: school_state,
      country: school_country,
      type: type,
      title,
      message,
    };

    const mailSent = await emailQueue.add('sendEmail', jobData, {
      attempts: 3,
      backoff: 10000,
      removeOnComplete: true,
    });

    return mailSent;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.error(error);
      throw new Error('Something went wrong');
    }
  }
};

const sendingCompanyEmailToQueue = async (
  payload: CompanyEmailQueue,
  type:
    | 'email-verification'
    | 'school-creation'
    | 'forgot-password'
    | 'child-linkage'
    | 'session-subscription'
) => {
  try {
    const name = capitalizeFirstLetter(payload.first_name);

    const jobData = {
      email: payload.email,
      first_name: name,
      token: payload.token,
      type: type,
    };

    const mailSent = await emailQueue.add('sendEmail', jobData, {
      attempts: 3,
      backoff: 10000,
      removeOnComplete: true,
    });

    return mailSent;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.error(error);
      throw new Error('Something went wrong');
    }
  }
};

const schoolClassLevels = async (schoolClasses: ClassDocument[]) => {
  const uniqueClass = [];
  const seenLevels = new Set();

  for (const classObj of schoolClasses) {
    if (classObj && !seenLevels.has(classObj.level)) {
      seenLevels.add(classObj.level);
      uniqueClass.push(classObj);
    }
  }

  return uniqueClass;
};

// CHANGE THIS FUNCTION TO RETURN ONLY TOTAL. THEN WE CHECK IF IT IS FIRST TERM, THE TOTAL WILL BE USED AS CUMMULATIVE AVERAGE FOR THE FIRST TERM. THEN IF SECOND TERM, GET THE FIRST TERM CUMMULATIVE AND PUT AS LAST TERM CUMM, IF THIRD TERM, GET THAT OF SECOND TERM AND USE
const calculateSubjectSumAndGrade = async (
  payload: ScoreAndGradingType
): Promise<ResultObjType> => {
  try {
    const result = payload.score.reduce((sum, a) => sum + a.score, 0);

    // let last_term_cumulative
    // let cumulative_score

    //     if(payload.current_term === 'first_term') {
    // last_term_cumulative === result
    //     }else if(payload.current_term === 'second_term') {

    //     }

    // let resultObj;
    for (const gradeItem of payload.gradingObj) {
      if (result >= gradeItem.value) {
        return {
          grade: gradeItem.grade,
          remark: gradeItem.remark,
          total: result,
        };
      }
    }

    return {
      grade: 'F',
      remark: 'Fail',
      total: result,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened.');
    }
  }
};

const validateGradingArray = (
  gradingArray: { value: number; grade: string; remark: string }[]
) => {
  if (!gradingArray || gradingArray.length !== 5) {
    throw new Error('Grading levels must be 5 in numbers.');
  }

  // Ensure values are sorted in descending order
  for (let i = 0; i < gradingArray.length - 1; i++) {
    if (gradingArray[i].value <= gradingArray[i + 1].value) {
      throw new Error('Grading values must be in descending order.');
    }
  }

  // Ensure grades are unique
  const gradeSet = new Set(gradingArray.map((item) => item.grade));
  if (gradeSet.size !== gradingArray.length) {
    throw new Error('Grades must be unique.');
  }

  return true;
};

const genderFunction = (user: UserDocument) => {
  let title = '';
  let rep = '';
  if (user.gender === 'male') {
    title = 'Mr';
    rep = 'he';
  } else if (user.gender === 'female') {
    title = 'Mrs';
    rep = 'she';
  }

  return { title, rep };
};

const validatePriorityOrder = (
  priorityOrder: { fee_name: string; priority_number: number }[]
) => {
  if (!priorityOrder || priorityOrder.length === 0) {
    throw new Error('Priority order cannot be empty.');
  }

  // Ensure priority_numbers follow the sequence 1, 2, 3, ..., n
  for (let i = 0; i < priorityOrder.length; i++) {
    if (priorityOrder[i].priority_number !== i + 1) {
      throw new Error(
        `Priority number must follow the sequence. Expected ${
          i + 1
        }, but found ${priorityOrder[i].priority_number}.`
      );
    }
  }

  return true;
};

const getPositionWithSuffix = (position: number): string => {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = position % 100;
  const suffix = suffixes[(v - 20) % 100] || suffixes[v] || suffixes[0];
  return `${position}${suffix}`;
};

const assignPositions = (students: any[]): any[] => {
  const sortedStudents = [...students]
    .filter(
      (student) =>
        student.subjectObj &&
        student.subjectObj.cumulative_average !== undefined
    )
    .sort(
      (a, b) =>
        b.subjectObj.cumulative_average - a.subjectObj.cumulative_average
    );

  let previousScore: number | null = null;
  let previousPosition = 0;
  let rank = 0;

  sortedStudents.forEach((student, index) => {
    if (student.subjectObj.cumulative_average !== previousScore) {
      rank = index + 1;
      previousScore = student.subjectObj.cumulative_average;
    }
    previousPosition = rank;
    student.subjectObj.subject_position =
      getPositionWithSuffix(previousPosition);
  });

  return sortedStudents;
};

const classPositionCalculation = (
  students: ClassPositionCalType[]
): ClassPositionCalType[] => {
  students.forEach((student) => {
    const subjects = student.allCummulatives.subject_results;
    const totalScores = subjects.reduce(
      (sum, subject) => sum + subject.cumulative_average,
      0
    );
    student.allCummulatives.cumulative_score = subjects.length
      ? parseFloat((totalScores / subjects.length).toFixed(2))
      : 0;
  });

  students.sort(
    (a, b) =>
      (b.allCummulatives.cumulative_score ?? 0) -
      (a.allCummulatives.cumulative_score ?? 0)
  );

  let position;

  students.forEach((student, index) => {
    position = index + 1;
    student.allCummulatives.class_position = getPositionWithSuffix(position);
  });

  return students;
};

const extractSubdomain = (host: string): string | null => {
  if (!host) {
    return null;
  }

  const cleanedHost = host.toLowerCase().split(':')[0];
  const prodBase = 'klazikschools.com';
  const localBase = 'localhost';

  if (cleanedHost === prodBase || cleanedHost === localBase) {
    return null;
  }

  let subdomainPart: string | null = null;
  if (cleanedHost.endsWith(prodBase)) {
    subdomainPart = cleanedHost.replace(`.${prodBase}`, '');
  } else if (cleanedHost.endsWith(localBase)) {
    subdomainPart = cleanedHost.replace(`.${localBase}`, '');
  }

  if (!subdomainPart) return null;

  const segments = subdomainPart.split('.').filter(Boolean);

  console.log('cleanedHost:', cleanedHost);
  console.log('subdomainPart:', subdomainPart);
  console.log('segments:', segments);

  if (segments.length === 0) return null;

  return segments.pop()!;
};

const schoolSubscriptionPlan = subscriptionEnum[1];
const schoolNameHandCoded = 'Born to Win';
const schoolCityHandCoded = 'Ado-Ekiti';
const schoolStateHandCoded = 'Ekiti State';
const schoolCountryHandCoded = 'Nigeria';
// const schoolSubscriptionPlan = 'essential';
const formatDate = (date = new Date()) => {
  const f_date = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).formatToParts(date);

  const time = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const weekDay = f_date.find((p) => p.type === 'weekday')?.value;
  const month = f_date.find((p) => p.type === 'month')?.value;
  const day = f_date.find((p) => p.type === 'day')?.value;
  const year = f_date.find((p) => p.type === 'year')?.value;

  const dateFormatted = `${weekDay},${month} ${day}, ${year}, ${time}`;

  return dateFormatted;
};

const normalizeQuestions = (
  questions_array: ObjQuestionType[]
): ObjQuestionType[] => {
  return questions_array.map((q: ObjQuestionType) => ({
    ...q,
    question_text: q.question_text.trim().toLowerCase(),
    options: q.options.map((opt) => opt.trim().toLowerCase()),
    correct_answer: q.correct_answer.trim().toLowerCase(),
  }));
};

const mySchoolName = 'Born to Win';
const mySchoolDomain = 'https://winners-college.vercel.app';

const generateBankReference = (payload: GenerateBankReferenceType): string => {
  const { student_id, first_name, last_name } = payload;

  console.log('payload:', payload);

  if (!student_id || !first_name || !last_name) {
    throw new Error(
      'Please provide student ID, first name and last name to generate reference number.'
    );
  }

  const namePart = `${first_name}${last_name}`.toUpperCase();
  const hashPart = HashUtil.hash(student_id.toString());

  // const hashPart = crypto
  //   .createHash('sha1')
  //   .update(student_id.toString())
  //   .digest('hex')
  const timePart = Date.now().toString().slice(-6);

  const ref = `${namePart}${hashPart}${timePart}`;

  return ref;
};

export {
  generateBankReference,
  mySchoolName,
  mySchoolDomain,
  normalizeQuestions,
  formatDate,
  schoolCountryHandCoded,
  schoolCityHandCoded,
  schoolStateHandCoded,
  schoolNameHandCoded,
  schoolSubscriptionPlan,
  extractSubdomain,
  classPositionCalculation,
  assignPositions,
  validatePriorityOrder,
  genderFunction,
  validateGradingArray,
  calculateSubjectSumAndGrade,
  schoolClassLevels,
  sendingCompanyEmailToQueue,
  capitalizeFirstLetter,
  sendingEmailToQueue,
};
