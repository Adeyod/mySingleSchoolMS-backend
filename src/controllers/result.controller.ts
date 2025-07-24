// import {
//   recordManyStudentScores,
//   recordStudentScore,
//   fetchAllScoresPerSubject,
//   fetchStudentSubjectResultInAClass,
//   fetchStudentTermResult,
//   fetchStudentSessionResults,
//   studentsSubjectPositionInClass,
//   fetchAllStudentResultsInClassForActiveTermByClassId,
//   calculatePositionOfStudentsInClass,
// } from '../services/result.service';
// import { AppError } from '../utils/app.error';
// import catchErrors from '../utils/tryCatch';

// const recordStudentScorePerTerm = catchErrors(async (req, res) => {
//   const {
//     term,
//     student_id,
//     session_id,
//     teacher_id,
//     score,
//     subject_id,
//     score_type,
//     class_enrolment_id,
//     class_id,
//   } = req.body;

//   console.log('req.body', req.body);

//   const teacherId = req.user?.userId;
//   const role = req.user?.userRole;

//   if (!teacherId) {
//     throw new AppError(
//       'It is only a teacher that can record test or exam. You need to login as a teacher.',
//       400
//     );
//   }

//   if (teacherId.toString() !== teacher_id.toString()) {
//     throw new AppError('You are not the teacher taking this course.', 400);
//   }

//   if (!role || role !== 'teacher') {
//     throw new AppError('Only teacher can record test or exam.', 400);
//   }

//   const requiredFields = {
//     term,
//     student_id,
//     teacher_id,
//     session_id,
//     score,
//     subject_id,
//     score_type,
//     class_enrolment_id,
//     class_id,
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

//   if (
//     !term ||
//     !student_id ||
//     !teacher_id ||
//     !session_id ||
//     !score ||
//     !subject_id ||
//     !score_type ||
//     !class_enrolment_id ||
//     !class_id
//   ) {
//     throw new AppError(
//       'Please provide the following parameters to proceed. term, student_id session_id, score, subject score_type, teacher_id class_enrolment_id and class ID.',
//       400
//     );
//   }

//   const payload = {
//     term,
//     student_id,
//     session_id,
//     teacher_id,
//     score,
//     subject_id,
//     score_type,
//     class_enrolment_id,
//     class_id,
//   };

//   const result = await recordStudentScore(payload);

//   if (!result) {
//     throw new AppError(`Unable to record score for ${score_type}.`, 400);
//   }

//   return res.status(200).json({
//     message: `Score was successfully recorded for ${score_type}`,
//     success: true,
//     status: 201,
//     result,
//   });
// });

// /**
//  * AJULO SAMSON
//  * BADEJO KEHINDE
//  * ATOLAGBE MICHAELS
//  */

// const recordAllStudentsScoresPerTerm = catchErrors(async (req, res) => {
//   const {
//     term,

//     session_id,
//     teacher_id,
//     result_objs,
//     subject_id,
//     score_type,
//     class_enrolment_id,
//     class_id,
//   } = req.body;

//   console.log(`I want to record for ${score_type} now`);

//   // console.log('body:', req.body);

//   const teacherId = req.user?.userId;
//   const role = req.user?.userRole;

//   if (!teacherId) {
//     throw new AppError(
//       'It is only a teacher that can record test or exam. You need to login as a teacher.',
//       400
//     );
//   }

//   if (!role || role !== 'teacher') {
//     throw new AppError('Only teacher can record test or exam.', 400);
//   }

//   if (teacherId.toString() !== teacher_id.toString()) {
//     throw new AppError('You are not the teacher taking this course.', 400);
//   }

//   if (result_objs.length === 0) {
//     throw new AppError(
//       'Please provide student IDs and their respective score to proceed.',
//       400
//     );
//   }

//   const requiredFields = {
//     term,
//     teacher_id,
//     session_id,
//     subject_id,
//     score_type,
//     class_enrolment_id,
//     class_id,
//   };
//   const missingField = Object.entries(requiredFields).find(
//     ([key, value]) => !value
//   );

//   if (missingField) {
//     throw new AppError(
//       `Please provide ${missingField[0].replace('_', ' ')} to continue.`,
//       400
//     );
//   }

//   const payload = {
//     term,
//     session_id,
//     teacher_id,
//     result_objs,
//     subject_id,
//     score_type,
//     class_enrolment_id,
//     class_id,
//   };

//   const result = await recordManyStudentScores(payload);

//   if (!result) {
//     throw new AppError(`Unable to record score for ${score_type}.`, 400);
//   }

//   const successfulResponse = result.successfulRecords.filter(
//     (r) => r.status === 'fulfilled'
//   );
//   const response = successfulResponse.map((r) => r.student_id);

//   const failureResponse = result.successfulRecords.filter(
//     (r) => r.status !== 'fulfilled'
//   );

//   const failedIds = failureResponse.map((r) => r.student_id);

//   let returnMsg = '';
//   let returnSMsg = '';
//   let returnFMsg = '';

//   if (response.length > 0) {
//     returnSMsg = `Scores for Students with the following IDs: ${response.join(
//       ','
//     )} were recorded successfully.`;
//   }

//   if (failedIds.length > 0) {
//     returnFMsg = `Scores for Students with the following IDs: ${failedIds.join(
//       ','
//     )} failed.`;
//   }

//   returnMsg = `${returnSMsg} ${returnFMsg}`;

//   return res.status(200).json({
//     message: returnMsg,
//     success: true,
//     status: 201,
//     Records: result.successfulRecords,
//   });
// });

// const getAllStudentResultsInClassForActiveTermByClassId = catchErrors(
//   async (req, res) => {
//     const { class_id, academic_session_id, term } = req.params;

//     const userId = req.user?.userId;
//     const userRole = req.user?.userRole;

//     if (!class_id || !term || !academic_session_id) {
//       throw new AppError(
//         'Please provide class id, academic session id and term to proceed.',
//         400
//       );
//     }

//     if (!userId || !userRole) {
//       throw new AppError('Please login to proceed.', 400);
//     }

//     const payload = {
//       class_id,
//       userId,
//       userRole,
//       academic_session_id,
//       term,
//     };

//     const result = await fetchAllStudentResultsInClassForActiveTermByClassId(
//       payload
//     );

//     if (!result) {
//       throw new AppError(
//         'Unable to getch all student results in the class for the term.',
//         404
//       );
//     }

//     return res.status(200).json({
//       message: 'Students results fetched successfully',
//       success: true,
//       status: 200,
//       students_results: result,
//     });
//   }
// );

// const getAllSubjectResultOfStudentsInClass = catchErrors(async (req, res) => {
//   const { class_id, academic_session_id, subject_id, term } = req.body;

//   const userId = req.user?.userId;
//   const userRole = req.user?.userRole;

//   if (!class_id || !academic_session_id || !subject_id || !term) {
//     throw new AppError(
//       'Please provide all these parameters to proceed: class id, academic session id, subject id, and term.',
//       400
//     );
//   }

//   const payload = {
//     class_id,
//     academic_session_id,
//     subject_id,
//     term,
//     userId: userRole === 'teacher' ? userId : undefined,
//     userRole: userRole === 'teacher' ? userRole : undefined,
//   };
//   const results = await fetchAllScoresPerSubject(payload);

//   if (!results) {
//     throw new AppError(
//       'Unable to fetch students document for the subject.',
//       400
//     );
//   }

//   return res.status(200).json({
//     message: 'Subject result successfully fetched.',
//     status: 200,
//     success: true,
//     results,
//   });
// });

// const getStudentSubjectResultInAClass = catchErrors(async (req, res) => {
//   const { student_id, subject_id, academic_session_id, class_id, term } =
//     req.body;

//   const userId = req.user?.userId;
//   const userRole = req.user?.userRole;

//   if (
//     !class_id ||
//     !academic_session_id ||
//     !subject_id ||
//     !term ||
//     !student_id
//   ) {
//     throw new AppError(
//       'Please provide all these parameters to proceed: student id class id, academic session id, subject id, and term.',
//       400
//     );
//   }

//   if (!userId || !userRole) {
//     throw new AppError('Please login to continue.', 400);
//   }

//   const payload = {
//     class_id,
//     academic_session_id,
//     student_id,
//     subject_id,
//     term,
//     userId,
//     userRole,
//   };

//   const result = await fetchStudentSubjectResultInAClass(payload);

//   if (!result) {
//     throw new AppError(
//       'Unable to fetch student subject result for the term.',
//       400
//     );
//   }

//   return res.status(200).json({
//     message: 'Student subject result was successfully fetched.',
//     success: true,
//     status: 200,
//     student_result: result,
//   });
// });

// const getStudentTermResult = catchErrors(async (req, res) => {
//   const { student_id, academic_session_id, term } = req.params;

//   const userId = req.user?.userId;
//   const userRole = req.user?.userRole;

//   const requiredFields = { student_id, academic_session_id, term };

//   const missingField = Object.entries(requiredFields).find(
//     ([key, value]) => !value
//   );

//   if (missingField) {
//     throw new AppError(
//       `Please provide ${missingField[0].replace('_', ' ')} to proceed.`,
//       400
//     );
//   }

//   if (!userId || !userRole) {
//     throw new AppError('Please login to continue.', 400);
//   }

//   const payload = {
//     student_id,
//     academic_session_id,
//     term,
//     userId,
//     userRole,
//   };

//   const result = await fetchStudentTermResult(payload);

//   if (!result) {
//     throw new AppError('Unable to fetch student result for the term.', 400);
//   }

//   return res.status(200).json({
//     message: 'Student result for the term fetched successfully.',
//     success: true,
//     status: 200,
//     student_result: result,
//   });
// });

// const getStudentSessionResults = catchErrors(async (req, res) => {
//   const { student_id, academic_session_id } = req.params;

//   const userId = req.user?.userId;
//   const userRole = req.user?.userRole;

//   const requiredFields = { student_id, academic_session_id };

//   const missingField = Object.entries(requiredFields).find(
//     ([key, value]) => !value
//   );

//   if (missingField) {
//     throw new AppError(
//       `Please provide ${missingField[0].replace('_', ' ')} to proceed.`,
//       400
//     );
//   }

//   if (!userId || !userRole) {
//     throw new AppError('Please login to continue.', 400);
//   }

//   const payload = {
//     student_id,
//     academic_session_id,
//     userId,
//     userRole,
//   };

//   const result = await fetchStudentSessionResults(payload);

//   if (!result) {
//     throw new AppError('Unable to fetch student result for the term.', 400);
//   }

//   return res.status(200).json({
//     message: 'Student result for the term fetched successfully.',
//     success: true,
//     status: 200,
//     student_result: result,
//   });
// });

// const subjectPositionGradingInClass = catchErrors(async (req, res) => {
//   const { class_enrolment_id, subject_id } = req.params;

//   const userId = req.user?.userId;
//   const userRole = req.user?.userRole;

//   if (!class_enrolment_id) {
//     throw new AppError('Please provide a class enrolment ID to proceed.', 400);
//   }

//   if (!subject_id) {
//     throw new AppError('Please provide a subject ID to proceed.', 400);
//   }

//   if (!userId || !userRole) {
//     throw new AppError('Please login to proceed.', 400);
//   }

//   const payload = { class_enrolment_id, subject_id, userId, userRole };

//   const result = await studentsSubjectPositionInClass(payload);

//   if (!result) {
//     throw new AppError('Unable to grade student for this subject.', 400);
//   }

//   return res.status(200).json({
//     message: 'Subject position successfully done for this class.',
//     success: true,
//     status: 200,
//     result,
//   });
// });

// const calculateStudentsClassPosition = catchErrors(async (req, res) => {
//   const { class_id } = req.params;

//   const userId = req.user?.userId;
//   const userRole = req.user?.userRole;

//   if (!class_id) {
//     throw new AppError('Please provide a class ID to proceed.', 400);
//   }

//   if (!userRole || !userId) {
//     throw new AppError('Please login to continue', 400);
//   }

//   const payload = {
//     class_id,
//     userId,
//     userRole,
//   };

//   const result = await calculatePositionOfStudentsInClass(payload);
//   if (!result) {
//     throw new AppError('Unable to calculate class position of students.', 400);
//   }

//   return res.status(200).json({
//     message: 'Class position calculated successfully.',
//     success: true,
//     status: 200,
//     students_result: result,
//   });
// });

// // NOTE PART
// export {
//   getAllStudentResultsInClassForActiveTermByClassId,
//   calculateStudentsClassPosition,
//   subjectPositionGradingInClass,
//   getStudentTermResult,
//   getStudentSessionResults,
//   getStudentSubjectResultInAClass,
//   getAllSubjectResultOfStudentsInClass,
//   recordStudentScorePerTerm,
//   recordAllStudentsScoresPerTerm,
// };

/////////////////////////////////////////////////////////
import mongoose from 'mongoose';
import {
  fetchAllScoresPerSubject,
  fetchAllStudentResultsInClassForActiveTermByClassId,
  fetchResultSetting,
  fetchStudentSessionResults,
  fetchStudentSubjectResultInAClass,
  fetchStudentTermResult,
  recordManyStudentScores,
  recordStudentScore,
  // resultSettingCreation,
  fetchAllResultsOfAStudent,
  fetchStudentResultByResultId,
  recordManyStudentCumScores,
  studentsSubjectPositionInClass,
  calculatePositionOfStudentsInClass,
  recordManyStudentExamScores,
  fetchLevelResultSetting,
} from '../services/result.service';
import { AppError } from '../utils/app.error';
import { validateGradingArray } from '../utils/functions';
import catchErrors from '../utils/tryCatch';
// import { saveLog } from '../logs/log.service';

// const createResultSettingInASchool = catchErrors(async (req, res) => {
//   const { name_percent_array, grading_array } = req.body;
//   const school_id = req.school_id;

//   if (!school_id) {
//     throw new AppError('School ID is required.', 400);
//   }

//   const userSchool = req.user?.school_id;

//   if (school_id !== userSchool) {
//     throw new AppError('You can only do this in your school.', 400);
//   }

//   if (name_percent_array.length === 0) {
//     throw new AppError(
//       'Please provide column names and corresponding percentages to proceed.',
//       400
//     );
//   }

//   const validateGrading = validateGradingArray(grading_array);

//   if (!validateGrading) {
//     throw new AppError('Error validating grading array.', 400);
//   }

//   const result = await resultSettingCreation(
//     name_percent_array,
//     school_id,
//     grading_array
//   );

//   if (!result) {
//     throw new AppError('Unable to create result setting.', 400);
//   }

//   return res.status(201).json({
//     message: 'Result settings created successfully.',
//     success: true,
//     status: 201,
//     result,
//   });
// });

const getResultSetting = catchErrors(async (req, res) => {
  // const start = Date.now();

  const result = await fetchResultSetting();

  if (!result) {
    throw new AppError('Unable to fetch result setting.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Result settings fetched successfully.',
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
    message: 'Result settings fetched successfully.',
    success: true,
    status: 200,
    result_setting: result,
  });
});

const recordStudentScorePerTerm = catchErrors(async (req, res) => {
  // const start = Date.now();

  const {
    term,
    student_id,
    session_id,
    teacher_id,
    score,
    subject_id,
    score_name,
    class_enrolment_id,
    class_id,
  } = req.body;

  const teacherId = req.user?.userId;
  const role = req.user?.userRole;

  if (!teacherId) {
    throw new AppError(
      'It is only a teacher that can record test or exam. You need to login as a teacher.',
      400
    );
  }

  if (teacherId.toString() !== teacher_id.toString()) {
    throw new AppError('You are not the teacher taking this course.', 400);
  }

  if (!role || role !== 'teacher') {
    throw new AppError('Only teacher can record test or exam.', 400);
  }

  const requiredFields = {
    term,
    student_id,
    teacher_id,
    session_id,
    score,
    subject_id,
    score_name,
    class_enrolment_id,
    class_id,
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

  const payload = {
    term,
    student_id,
    session_id,
    teacher_id,
    score,
    subject_id,
    score_name,
    class_enrolment_id,
    class_id,
  };

  const result = await recordStudentScore(payload);

  if (!result) {
    throw new AppError(`Unable to record score for ${score_name}.`, 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: `Score was successfully recorded for ${score_name}`,
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
    message: `Score was successfully recorded for ${score_name}`,
    success: true,
    status: 201,
    result,
  });
});

const recordAllStudentsScoresPerTerm = catchErrors(async (req, res) => {
  // const start = Date.now();

  const {
    term,
    session_id,
    teacher_id,
    subject_id,
    result_objs,
    score_name,
    class_enrolment_id,
    class_id,
  } = req.body;

  const teacherId = req.user?.userId;
  const role = req.user?.userRole;

  if (!teacherId) {
    throw new AppError(
      'It is only a teacher that can record test or exam. You need to login as a teacher.',
      400
    );
  }

  if (!role || role !== 'teacher') {
    throw new AppError('Only teacher can record test or exam.', 400);
  }

  if (teacherId.toString() !== teacher_id.toString()) {
    throw new AppError('You are not the teacher taking this course.', 400);
  }

  if (result_objs.length === 0) {
    throw new AppError(
      'Please provide student IDs and their respective score to proceed.',
      400
    );
  }

  const requiredFields = {
    term,
    teacher_id,
    session_id,
    subject_id,
    score_name,
    class_enrolment_id,
    class_id,
  };
  const missingField = Object.entries(requiredFields).find(
    ([key, value]) => !value
  );

  if (missingField) {
    throw new AppError(
      `Please provide ${missingField[0].replace('_', ' ')} to continue.`,
      400
    );
  }

  const payload = {
    term,
    session_id,
    teacher_id,
    result_objs,
    subject_id,
    score_name,
    class_enrolment_id,
    class_id,
  };

  console.log('result_objs:', result_objs);

  const result = await recordManyStudentScores(payload);

  if (!result) {
    throw new AppError(`Unable to record score for ${score_name}.`, 400);
  }

  const successfulResponse = result.successfulRecords.filter(
    (r) => r.status === 'fulfilled'
  );
  const response = successfulResponse.map((r) => r.student_id);

  const failureResponse = result.successfulRecords.filter(
    (r) => r.status !== 'fulfilled'
  );

  const failedIds = failureResponse.map((r) => r.student_id);

  let returnMsg = '';
  let returnSMsg = '';
  let returnFMsg = '';

  if (response.length > 0) {
    returnSMsg = `Scores for Students with the following IDs: ${response.join(
      ','
    )} were recorded successfully.`;
  }

  if (failedIds.length > 0) {
    returnFMsg = `Scores for Students with the following IDs: ${failedIds.join(
      ','
    )} failed.`;
  }

  returnMsg = `${returnSMsg} ${returnFMsg}`;

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: returnMsg,
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
    message: returnMsg,
    success: true,
    status: 201,
    Records: result.successfulRecords,
  });
});

const recordAllStudentsExamScoresPerTerm = catchErrors(async (req, res) => {
  // const start = Date.now();

  const {
    term,
    session_id,
    teacher_id,
    subject_id,
    result_objs,
    score_name,
    class_enrolment_id,
    class_id,
  } = req.body;

  const teacherId = req.user?.userId;
  const role = req.user?.userRole;

  if (!teacherId) {
    throw new AppError(
      'It is only a teacher that can record test or exam. You need to login as a teacher.',
      400
    );
  }

  if (!role || role !== 'teacher') {
    throw new AppError('Only teacher can record test or exam.', 400);
  }

  if (teacherId.toString() !== teacher_id.toString()) {
    throw new AppError('You are not the teacher taking this course.', 400);
  }

  if (result_objs.length === 0) {
    throw new AppError(
      'Please provide student IDs and their respective score to proceed.',
      400
    );
  }

  const requiredFields = {
    term,
    teacher_id,
    session_id,
    subject_id,
    score_name,
    class_enrolment_id,
    class_id,
  };
  const missingField = Object.entries(requiredFields).find(
    ([key, value]) => !value
  );

  if (missingField) {
    throw new AppError(
      `Please provide ${missingField[0].replace('_', ' ')} to continue.`,
      400
    );
  }

  const payload = {
    term,
    session_id,
    teacher_id,
    result_objs,
    subject_id,
    score_name,
    class_enrolment_id,
    class_id,
  };

  const result = await recordManyStudentExamScores(payload);

  if (!result) {
    throw new AppError(`Unable to record score for ${score_name}.`, 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Exam scores recorded successfully',
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
    message: 'Exam scores recorded successfully',
    success: true,
    status: 201,
    Records: result,
  });
});

const getAllSubjectResultOfStudentsInClass = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { class_id, academic_session_id, subject_id, term } = req.body;

  const userId = req.user?.userId;
  const userRole = req.user?.userRole;

  if (!class_id || !academic_session_id || !subject_id || !term) {
    throw new AppError(
      'Please provide all these parameters to proceed: class id, academic session id, subject id, and term.',
      400
    );
  }

  const payload = {
    class_id,
    academic_session_id,
    subject_id,
    term,
    userId: userRole === 'teacher' ? userId : undefined,
    userRole: userRole === 'teacher' ? userRole : undefined,
  };
  const results = await fetchAllScoresPerSubject(payload);

  if (!results) {
    throw new AppError(
      'Unable to fetch students document for the subject.',
      400
    );
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Subject result successfully fetched.',
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
    message: 'Subject result successfully fetched.',
    status: 200,
    success: true,
    results,
  });
});

const getStudentSubjectResultInAClass = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { student_id, subject_id, academic_session_id, class_id, term } =
    req.body;

  const userId = req.user?.userId;
  const userRole = req.user?.userRole;

  if (
    !class_id ||
    !academic_session_id ||
    !subject_id ||
    !term ||
    !student_id
  ) {
    throw new AppError(
      'Please provide all these parameters to proceed: student id class id, academic session id, subject id, and term.',
      400
    );
  }

  if (!userId || !userRole) {
    throw new AppError('Please login to continue.', 400);
  }

  const payload = {
    class_id,
    academic_session_id,
    student_id,
    subject_id,
    term,
    userId,
    userRole,
  };

  const result = await fetchStudentSubjectResultInAClass(payload);

  if (!result) {
    throw new AppError(
      'Unable to fetch student subject result for the term.',
      400
    );
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Student subject result was successfully fetched.',
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
    message: 'Student subject result was successfully fetched.',
    success: true,
    status: 200,
    student_result: result,
  });
});

const getStudentTermResult = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { student_id, academic_session_id, term } = req.params;

  const userId = req.user?.userId;
  const userRole = req.user?.userRole;

  const requiredFields = { student_id, academic_session_id, term };

  const missingField = Object.entries(requiredFields).find(
    ([key, value]) => !value
  );

  if (missingField) {
    throw new AppError(
      `Please provide ${missingField[0].replace('_', ' ')} to proceed.`,
      400
    );
  }

  if (!userId || !userRole) {
    throw new AppError('Please login to continue.', 400);
  }

  const payload = {
    student_id,
    academic_session_id,
    term,
    userId,
    userRole,
  };

  const result = await fetchStudentTermResult(payload);

  if (!result) {
    throw new AppError('Unable to fetch student result for the term.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Student result for the term fetched successfully.',
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
    message: 'Student result for the term fetched successfully.',
    success: true,
    status: 200,
    student_result: result,
  });
});

const getStudentSessionResults = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { student_id, academic_session_id } = req.params;

  const userId = req.user?.userId;
  const userRole = req.user?.userRole;

  const requiredFields = { student_id, academic_session_id };

  const missingField = Object.entries(requiredFields).find(
    ([key, value]) => !value
  );

  if (missingField) {
    throw new AppError(
      `Please provide ${missingField[0].replace('_', ' ')} to proceed.`,
      400
    );
  }

  if (!userId || !userRole) {
    throw new AppError('Please login to continue.', 400);
  }

  const payload = {
    student_id,
    academic_session_id,
    userId,
    userRole,
  };

  const result = await fetchStudentSessionResults(payload);

  if (!result) {
    throw new AppError('Unable to fetch student result for the term.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Student result for the session fetched successfully.',
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
    message: 'Student result for the session fetched successfully.',
    success: true,
    status: 200,
    student_result: result,
  });
});

const getAllStudentResultsInClassForActiveTermByClassId = catchErrors(
  async (req, res) => {
    // const start = Date.now();

    const { class_id, academic_session_id, term } = req.params;

    const userId = req.user?.userId;
    const userRole = req.user?.userRole;

    if (!class_id || !term || !academic_session_id) {
      throw new AppError(
        'Please provide class id, academic session id and term to proceed.',
        400
      );
    }

    if (!userId || !userRole) {
      throw new AppError('Please login to proceed.', 400);
    }

    const payload = {
      class_id,
      userId,
      userRole,
      academic_session_id,
      term,
    };

    const result = await fetchAllStudentResultsInClassForActiveTermByClassId(
      payload
    );

    if (!result) {
      throw new AppError(
        'Unable to fetch all student results in the class for the term.',
        404
      );
    }

    // const duration = Date.now() - start;

    // const savelogPayload = {
    //   level: 'info',
    //   message: 'Students results fetched successfully',
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
      message: 'Students results fetched successfully',
      success: true,
      status: 200,
      students_results: result,
    });
  }
);

const getAllResultsOfAStudent = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { student_id } = req.params;

  if (!student_id) {
    throw new AppError('Student ID is required.', 400);
  }

  const payload = {
    student_id,
  };

  const result = await fetchAllResultsOfAStudent(payload);

  if (!result) {
    throw new AppError('Unable to fetch student results.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Student results fetched successfully.',
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
    message: 'Student results fetched successfully.',
    status: 200,
    success: true,
    results: result,
  });
});

const getStudentResultByResultId = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { student_id, result_id } = req.params;

  if (!result_id) {
    throw new AppError('Result ID is required.', 400);
  }

  if (!student_id) {
    throw new AppError('Student ID is required.', 400);
  }

  const payload = {
    student_id,
    result_id,
  };

  const result = await fetchStudentResultByResultId(payload);

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Student result fetched successfully.',
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
    message: 'Student result fetched successfully.',
    success: true,
    status: 200,
    result,
  });
});

const recordAllStudentsLastTermCumPerTerm = catchErrors(async (req, res) => {
  // const start = Date.now();

  const {
    term,
    session_id,
    teacher_id,
    subject_id,
    last_term_cumulative_objs,
    class_enrolment_id,
    class_id,
  } = req.body;

  const teacherId = req.user?.userId;
  const role = req.user?.userRole;

  if (!teacherId) {
    throw new AppError(
      'It is only a teacher that can record test or exam. You need to login as a teacher.',
      400
    );
  }

  if (!role || role !== 'teacher') {
    throw new AppError('Only teacher can record test or exam.', 400);
  }

  if (teacherId.toString() !== teacher_id.toString()) {
    throw new AppError('You are not the teacher taking this course.', 400);
  }

  if (last_term_cumulative_objs.length === 0) {
    throw new AppError(
      'Please provide student IDs and their respective last term cumulative to proceed.',
      400
    );
  }

  const requiredFields = {
    term,
    teacher_id,
    session_id,
    subject_id,
    class_enrolment_id,
    class_id,
  };
  const missingField = Object.entries(requiredFields).find(
    ([key, value]) => !value
  );

  if (missingField) {
    throw new AppError(
      `Please provide ${missingField[0].replace('_', ' ')} to continue.`,
      400
    );
  }

  const payload = {
    term,
    session_id,
    teacher_id,
    last_term_cumulative_objs,
    subject_id,
    class_enrolment_id,
    class_id,
  };

  const result = await recordManyStudentCumScores(payload);

  if (!result) {
    throw new AppError(`Unable to record cumulative score.`, 400);
  }

  const successfulResponse = result.successfulRecords.filter(
    (r) => r.status === 'fulfilled'
  );
  const response = successfulResponse.map((r) => r.student_id);

  const failureResponse = result.successfulRecords.filter(
    (r) => r.status !== 'fulfilled'
  );

  const failedIds = failureResponse.map((r) => r.student_id);

  let returnMsg = '';
  let returnSMsg = '';
  let returnFMsg = '';

  if (response.length > 0) {
    returnSMsg = `Scores for Students with the following IDs: ${response.join(
      ','
    )} were recorded successfully.`;
  }

  if (failedIds.length > 0) {
    returnFMsg = `Scores for Students with the following IDs: ${failedIds.join(
      ','
    )} failed.`;
  }

  returnMsg = `${returnSMsg} ${returnFMsg}`;

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: returnMsg,
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
    message: returnMsg,
    success: true,
    status: 201,
    Records: result.successfulRecords,
  });
});

const subjectPositionGradingInClass = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { class_enrolment_id, subject_id } = req.params;

  const userRole = req.user?.userRole;

  if (!class_enrolment_id) {
    throw new AppError('Please provide a class enrolment ID to proceed.', 400);
  }

  if (!subject_id) {
    throw new AppError('Please provide a subject ID to proceed.', 400);
  }

  const teacherId = req.user?.userId;

  if (!teacherId) {
    throw new AppError(
      'It is only a teacher that can record test or exam. You need to login as a teacher.',
      400
    );
  }

  if (!userRole || userRole !== 'teacher') {
    throw new AppError('Only teacher can record test or exam.', 400);
  }

  const payload = {
    class_enrolment_id,
    subject_id,
    userId: teacherId,
    userRole,
  };

  const result = await studentsSubjectPositionInClass(payload);

  if (!result) {
    throw new AppError('Unable to grade student for this subject.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Subject position successfully done for this class.',
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
    message: 'Subject position successfully done for this class.',
    success: true,
    status: 200,
    result,
  });
});

const calculateStudentsClassPosition = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { class_id } = req.params;

  const userId = req.user?.userId;
  const userRole = req.user?.userRole;

  if (!class_id) {
    throw new AppError('Please provide a class ID to proceed.', 400);
  }

  if (!userRole || !userId) {
    throw new AppError('Please login to continue', 400);
  }

  const payload = {
    class_id,
    userId,
    userRole,
  };

  const result = await calculatePositionOfStudentsInClass(payload);
  if (!result) {
    throw new AppError('Unable to calculate class position of students.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Class position calculated successfully.',
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
    message: 'Class position calculated successfully.',
    success: true,
    status: 200,
    students_result: result,
  });
});

const getResultSettings = catchErrors(async (req, res) => {
  const result = await fetchResultSetting();

  if (!result) {
    throw new AppError('Unable to fetch result setting.', 400);
  }

  return res.status(200).json({
    message: 'Result settings fetched successfully.',
    success: true,
    status: 200,
    result_settings: result,
  });
});

const getLevelResultSetting = catchErrors(async (req, res) => {
  const level = req.params.level;

  if (!level) {
    throw new AppError('Level is required.', 400);
  }

  const result = await fetchLevelResultSetting(level);

  if (!result) {
    throw new AppError('Unable to fetch result setting.', 400);
  }

  return res.status(200).json({
    message: 'Result settings fetched successfully.',
    success: true,
    status: 200,
    result_setting: result,
  });
});

export {
  getLevelResultSetting,
  getResultSettings,
  recordStudentScorePerTerm,
  recordAllStudentsScoresPerTerm,
  getAllSubjectResultOfStudentsInClass,
  getStudentSubjectResultInAClass,
  getStudentTermResult,
  getStudentSessionResults,
  getAllStudentResultsInClassForActiveTermByClassId,
  recordAllStudentsExamScoresPerTerm,
  recordAllStudentsLastTermCumPerTerm,
  getStudentResultByResultId,
  getAllResultsOfAStudent,
  getResultSetting,
  // createResultSetting,
  //////////////////////////////////////////
  subjectPositionGradingInClass,
  calculateStudentsClassPosition,
};
