// import { ClassEnrolmentDocument } from '../constants/types';
// import {
//   createResult,
//   createResultsForStudents,
// } from '../repository/result.repository';
// import {
//   enrolStudentToClass,
//   enrolManyStudentsToClass,
//   fetchAllEnrollments,
//   fetchEnrollmentsBySession,
//   fetchSingleEnrollment,
//   fetchAllActiveClassEnrollments,
//   fetchAllStudentsInAClass,
//   fetchAllStudentsInAClassInActiveSession,
// } from '../services/class_enrolment.service';
// import { AppError } from '../utils/app.error';
// import catchErrors from '../utils/tryCatch';

// const studentEnrolmentToClass = catchErrors(async (req, res) => {
//   const { student_id, level, class_id, academic_session_id, term } = req.body;
//   if (!student_id || !class_id || !academic_session_id || !term || !level) {
//     throw new AppError(
//       'Student ID, classId, academic session, level and term are all required.',
//       400
//     );
//   }

//   const payload = { level, student_id, class_id, academic_session_id, term };

//   const info = await enrolStudentToClass(payload);

//   if (!info) {
//     throw new AppError('Unable to enrol student', 400);
//   }

//   const payload2 = {
//     class_enrolment_id: info._id,
//     student_id: Object(student_id),
//     class_id: info.class,
//     academic_session_id: info.academic_session_id,
//   };
//   const createResultForStudent = await createResult(payload2);

//   return res.status(201).json({
//     message: 'Student enrollment was successfully',
//     status: 201,
//     success: true,
//     classEnrollment: info,
//     resultCreation: createResultForStudent,
//   });
// });

// const manyStudentsEnrolmentToClass = catchErrors(async (req, res) => {
//   const { student_ids, class_id, academic_session_id, term, level } = req.body;
//   if (!student_ids || !class_id || !academic_session_id || !term || !level) {
//     throw new AppError(
//       'Student ID, classId, academic session, LEVEL and term are all required.',
//       400
//     );
//   }

//   const payload = { student_ids, class_id, academic_session_id, level, term };

//   const info: ClassEnrolmentDocument | null = await enrolManyStudentsToClass(
//     payload
//   );

//   console.log(info);

//   if (!info) {
//     throw new AppError('Unable to enrol students', 400);
//   }

//   /**
//    * POPULATE PAYMENT OF STUDENTS WHEN STUDENT LOGIN, GET STUDENT BY ID, AND PARENT FETCHING CHILD
//    */

//   const payload2 = {
//     class_enrolment_id: info._id,
//     student_ids,
//     class_id,
//     academic_session_id,
//   };
//   const infoDoc = await createResultsForStudents(payload2);

//   return res.status(201).json({
//     message: 'Students enrollment was successfully',
//     status: 201,
//     success: true,
//     classEnrollments: info,
//     results: infoDoc,
//   });
// });

// const getASingleEnrollmentById = catchErrors(async (req, res) => {
//   const { id } = req.params;
//   if (!id) {
//     throw new AppError('Enrollment ID is required.', 400);
//   }

//   const result = await fetchSingleEnrollment(id);

//   if (!result) {
//     throw new AppError('Unable to find enrollment.', 404);
//   }

//   return res.status(200).json({
//     message: 'Enrollment fetched successfully',
//     success: true,
//     status: 200,
//     enrollment: result,
//   });
// });

// const getAllEnrollments = catchErrors(async (req, res) => {
//   const page = req.query.page ? Number(req.query.page) : undefined;
//   const limit = req.query.limit ? Number(req.query.limit) : undefined;

//   const searchQuery =
//     typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

//   if (!req.user?.userId) {
//     throw new AppError('Please login to continue.', 400);
//   }

//   const info = await fetchAllEnrollments(page, limit, searchQuery);

//   if (!info) {
//     throw new AppError('Error fetching Enrollments.', 400);
//   }

//   return res.status(200).json({
//     message: 'Enrollments fetched successfully',
//     status: 200,
//     success: true,
//     enrollments: info,
//   });
// });

// const getAllSessionEnrollmentsBySessionId = catchErrors(async (req, res) => {
//   const { session_id } = req.params;
//   const page = req.query.page ? Number(req.query.page) : undefined;
//   const limit = req.query.limit ? Number(req.query.limit) : undefined;

//   const searchQuery =
//     typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

//   if (!req.user?.userId) {
//     throw new AppError('Please login to continue.', 400);
//   }
//   if (!session_id) {
//     throw new AppError('Session ID is required.', 400);
//   }

//   const result = await fetchEnrollmentsBySession(
//     session_id,
//     page,
//     limit,
//     searchQuery
//   );

//   if (!result) {
//     throw new AppError('Unable to find enrollments.', 404);
//   }

//   return res.status(200).json({
//     message: 'Enrollment fetched successfully',
//     success: true,
//     status: 200,
//     enrollment: result,
//   });
// });

// const getAllActiveClassEnrollments = catchErrors(async (req, res) => {
//   const result = await fetchAllActiveClassEnrollments();

//   if (!result) {
//     throw new AppError('Unable to get active class enrollments.', 400);
//   }

//   return res.status(200).json({
//     message: 'Active class Enrollments fetched successfully.',
//     success: true,
//     status: 200,
//     class_enrollments: result,
//   });
// });

// // NEEDED TO TEST THE FOLLOWING ENDPOINTS
// const getAllStudentsInAClass = catchErrors(async (req, res) => {
//   const { session_id, class_id } = req.params;
//   const userId = req.user?.userId;
//   const userRole = req.user?.userRole;

//   if (!session_id || !class_id) {
//     throw new AppError(
//       'Please provide a valid session ID and class ID to proceed.',
//       400
//     );
//   }

//   const payload = {
//     session_id,
//     class_id,
//     userId: userRole === 'teacher' ? userId : undefined,
//     userRole: userRole === 'teacher' ? userRole : undefined,
//   };

//   const result = await fetchAllStudentsInAClass(payload);

//   if (!result) {
//     throw new AppError('Unable to find students in the class.', 400);
//   }

//   return res.status(200).json({
//     message: `All students in ${result.class_name} class fetched successfully.`,
//     status: 200,
//     success: true,
//     class_document: result.classDoc,
//   });
// });

// const getAllStudentsInAClassInActiveSession = catchErrors(async (req, res) => {
//   const { session_id, class_id } = req.params;
//   const userId = req.user?.userId;
//   const userRole = req.user?.userRole;

//   if (!session_id || !class_id) {
//     throw new AppError(
//       'Please provide a valid session ID and class ID to proceed.',
//       400
//     );
//   }

//   const payload = {
//     session_id,
//     class_id,
//     userId: userRole === 'teacher' ? userId : undefined,
//     userRole: userRole === 'teacher' ? userRole : undefined,
//   };

//   const result = await fetchAllStudentsInAClassInActiveSession(payload);

//   if (!result) {
//     throw new AppError('Unable to find students in the class.', 400);
//   }

//   return res.status(200).json({
//     message: `All students in ${result.class_name} class fetched successfully.`,
//     status: 200,
//     success: true,
//     class_document: result.classDoc,
//   });
// });

// /*
// FETCH CLASS ENROLLMENTS BASED ON CLASS ID AND SESSION ID
// */

// export {
//   getAllStudentsInAClassInActiveSession,
//   getAllStudentsInAClass,
//   getAllActiveClassEnrollments,
//   manyStudentsEnrolmentToClass,
//   studentEnrolmentToClass,
//   getASingleEnrollmentById,
//   getAllEnrollments,
//   getAllSessionEnrollmentsBySessionId,
// };

/////////////////////////////////////////////////////////////////////////////
import mongoose from 'mongoose';
import { ClassEnrolmentDocument } from '../constants/types';
import {
  createResult,
  createResultsForStudents,
} from '../repository/result.repository';
import {
  enrolManyStudentsToClass,
  enrolStudentToClass,
  fetchAllActiveClassEnrollments,
  fetchAllEnrollments,
  fetchAllStudentsInAClass,
  fetchAllStudentsInAClassInActiveSession,
  fetchEnrollmentsBySession,
  fetchSingleEnrollment,
} from '../services/class_enrolment.service';
import { AppError } from '../utils/app.error';
import catchErrors from '../utils/tryCatch';
// import { saveLog } from '../logs/log.service';

const studentEnrolmentToClass = catchErrors(async (req, res) => {
  // const start = Date.now();

  // ADD SUBJECTS THAT THE STUDENT IS SUPPOSED TO OFFER IN THE
  // CLASS AS THIS WILL BE ADDED FROM THE SUBJECTS SAVED TO THE
  // CLASS
  const {
    student_id,
    level,
    class_id,
    academic_session_id,
    term,
    subjects_to_offer_array,
  } = req.body;
  if (!student_id || !class_id || !academic_session_id || !term || !level) {
    throw new AppError(
      'Student ID, classId, academic session, level and term are all required.',
      400
    );
  }

  if (!subjects_to_offer_array || subjects_to_offer_array.length === 0) {
    throw new AppError(
      'Please select all the subjects that this student is supposed to offer in this class.',
      400
    );
  }

  // email: 'ayodejiadebolu@gmail.com', password: '$Adebolu@6910'

  const payload = {
    level,
    student_id,
    class_id,
    academic_session_id,
    term,
    subjects_to_offer_array,
  };

  const info = await enrolStudentToClass(payload);

  if (!info) {
    throw new AppError('Unable to enrol student', 400);
  }

  const payload2 = {
    class_enrolment_id: info._id,
    student_id: Object(student_id),
    class_id: info.class,
    academic_session_id: info.academic_session_id,
  };
  const createResultForStudent = await createResult(payload2);

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Student enrollment was successfully',
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
    message: 'Student enrollment was successfully',
    status: 201,
    success: true,
    classEnrollment: info,
    resultCreation: createResultForStudent,
  });
});

const getASingleEnrollmentById = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { id } = req.params;

  if (!id) {
    throw new AppError('Enrollment ID is required.', 400);
  }

  const result = await fetchSingleEnrollment(id);

  if (!result) {
    throw new AppError('Unable to find enrollment.', 404);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Enrollment fetched successfully',
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

  console.log('ENROLLMENT:', result);

  return res.status(200).json({
    message: 'Enrollment fetched successfully',
    success: true,
    status: 200,
    enrollment: result,
  });
});

const getAllEnrollments = catchErrors(async (req, res) => {
  // const start = Date.now();

  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const searchQuery =
    typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

  if (!req.user?.userId) {
    throw new AppError('Please login to continue.', 400);
  }

  const info = await fetchAllEnrollments(page, limit, searchQuery);

  if (!info) {
    throw new AppError('Error fetching Enrollments.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Enrollments fetched successfully',
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
    message: 'Enrollments fetched successfully',
    status: 200,
    success: true,
    enrollments: info,
  });
});

const getAllActiveClassEnrollments = catchErrors(async (req, res) => {
  // const start = Date.now();

  const result = await fetchAllActiveClassEnrollments();

  if (!result) {
    throw new AppError('Unable to get active class enrollments.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Active class Enrollments fetched successfully.',
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
    message: 'Active class Enrollments fetched successfully.',
    success: true,
    status: 200,
    class_enrollments: result,
  });
});

const getAllSessionEnrollmentsBySessionId = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { session_id } = req.params;
  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const searchQuery =
    typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

  if (!req.user?.userId) {
    throw new AppError('Please login to continue.', 400);
  }
  if (!session_id) {
    throw new AppError('Session ID is required.', 400);
  }

  const result = await fetchEnrollmentsBySession(
    session_id,
    page,
    limit,
    searchQuery
  );

  if (!result) {
    throw new AppError('Unable to find enrollments.', 404);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Enrollment fetched successfully',
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
    message: 'Enrollment fetched successfully',
    success: true,
    status: 200,
    enrollment: result,
  });
});

const getAllStudentsInAClass = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { session_id, class_id } = req.params;

  const userId = req.user?.userId;
  const userRole = req.user?.userRole;

  if (!session_id || !class_id) {
    throw new AppError(
      'Please provide a valid session ID and class ID to proceed.',
      400
    );
  }

  const payload = {
    session_id,
    class_id,
    userId: userRole === 'teacher' ? userId : undefined,
    userRole: userRole === 'teacher' ? userRole : undefined,
  };

  const result = await fetchAllStudentsInAClass(payload);

  if (!result) {
    throw new AppError('Unable to find students in the class.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: `All students in ${result.class_name} class fetched successfully.`,
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
    message: `All students in ${result.class_name} class fetched successfully.`,
    status: 200,
    success: true,
    class_document: result.classDoc,
  });
});

const getAllStudentsInAClassInActiveSession = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { session_id, class_id } = req.params;

  const userId = req.user?.userId;
  const userRole = req.user?.userRole;

  if (!session_id || !class_id) {
    throw new AppError(
      'Please provide a valid session ID and class ID to proceed.',
      400
    );
  }

  const payload = {
    session_id,
    class_id,
    userId: userRole === 'teacher' ? userId : undefined,
    userRole: userRole === 'teacher' ? userRole : undefined,
  };

  const result = await fetchAllStudentsInAClassInActiveSession(payload);

  if (!result) {
    throw new AppError('Unable to find students in the class.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: `All students in ${result.class_name} class fetched successfully.`,
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
    message: `All students in ${result.class_name} class fetched successfully.`,
    status: 200,
    success: true,
    class_document: result.classDoc,
  });
});

const manyStudentsEnrolmentToClass = catchErrors(async (req, res) => {
  // const start = Date.now();

  const {
    student_ids,
    class_id,
    academic_session_id,
    term,
    level,
    subjects_to_offer_array,
  } = req.body;

  if (!student_ids || !class_id || !academic_session_id || !term || !level) {
    throw new AppError(
      'Student ID, classId, academic session, LEVEL and term are all required.',
      400
    );
  }

  const payload = {
    student_ids,
    class_id,
    academic_session_id,
    level,
    term,
    subjects_to_offer_array,
  };

  const info: ClassEnrolmentDocument | null = await enrolManyStudentsToClass(
    payload
  );

  if (!info) {
    throw new AppError('Unable to enrol students', 400);
  }

  /**
   * POPULATE PAYMENT OF STUDENTS WHEN STUDENT LOGIN, GET STUDENT BY ID, AND PARENT FETCHING CHILD
   */

  const payload2 = {
    class_enrolment_id: info._id,
    student_ids,
    class_id,
    academic_session_id,
  };
  const infoDoc = await createResultsForStudents(payload2);

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Students enrollment was successfully',
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
    message: 'Students enrollment was successfully',
    status: 201,
    success: true,
    classEnrollments: info,
    results: infoDoc,
  });
});

// addLogoToASchool, addSchoolImageToASchool,

export {
  studentEnrolmentToClass,
  getASingleEnrollmentById,
  getAllEnrollments,
  getAllSessionEnrollmentsBySessionId,
  getAllActiveClassEnrollments,
  getAllStudentsInAClass,
  getAllStudentsInAClassInActiveSession,
  manyStudentsEnrolmentToClass,
};
