// import { StudentLinkingType } from '../constants/types';
// import { createNotificationMessage } from '../repository/notification.repository';
// import {
//   studentCumScorePerTerm,
//   studentLinking,
//   fetchStudentById,
//   fetchAllStudents,
//   studentUpdateDetails,
//   newSessionStudentsSubscription,
//   studentSessionSubscriptionUpdate,
//   fetchStudentsThatSubscribedToNewSession,
//   fetchNewStudentsThatHasNoClassEnrolmentBefore,
//   fetchAllStudentsOnAClassLevel,
// } from '../services/student.service';
// import { AppError, JoiError } from '../utils/app.error';
// import { queue } from '../utils/queue';
// import catchErrors from '../utils/tryCatch';
// import { addressValidation, joiValidation } from '../utils/validation';

// const linkStudentWithParent = catchErrors(async (req, res) => {
//   const { admission_number, first_name, last_name, parent_id } = req.body;

//   const payload = {
//     first_name,
//     last_name,
//   };

//   const response = joiValidation(payload, 'link-student');

//   if (!response) {
//     throw new JoiError('Could not validate input fields');
//   }

//   const { success, value } = response;

//   const param: StudentLinkingType = {
//     first_name: value.first_name,
//     last_name: value.last_name,
//     admission_number,
//     parent_id,
//   };

//   const linkStudent = await studentLinking(param);

//   if (!linkStudent) {
//     throw new AppError('Unable to link student to parent.', 400);
//   }

//   const notificationPayload = {
//     title: 'Student Linkage',
//     message: `Your child whose name is ${linkStudent.student.first_name} ${linkStudent.student.last_name} has been linked to you. You can now view the progress of ${linkStudent.student.first_name} and also pay for his/her school fees and other fees.`,
//     user_id: linkStudent.parent._id,
//   };

//   const notifyParent = await createNotificationMessage(notificationPayload);

//   const jobData = {
//     email: linkStudent.parent.email,
//     first_name: linkStudent.parent.first_name,
//     title: 'Child Linkage',
//     type: 'child-linkage',
//     message: `Your child whose name is ${linkStudent.student.first_name} ${linkStudent.student.last_name} has been linked to you. You can now view the progress of ${linkStudent.student.first_name} and also pay for his/her school fees and other fees.`,
//   };

//   const mailSent = await queue.add('sendEmail', jobData, {
//     attempts: 3,
//     backoff: 10000,
//     removeOnComplete: true,
//   });

//   return res.status(200).json({
//     message: `${linkStudent.student.first_name}, has been linked to ${linkStudent.parent.first_name}`,
//     status: 200,
//     success: true,
//   });
// });

// const calculateStudentCumulativeScoreForAllSubjectsPerTerm = catchErrors(
//   async (req, res) => {
//     const { studentId, sessionId, term, studentClass } = req.body;
//     if (!studentId || !sessionId || !term || !studentClass) {
//       throw new AppError(
//         'Student ID, session ID and term must be provided to continue.',
//         404
//       );
//     }

//     const param = {
//       studentId,
//       sessionId,
//       term,
//       studentClass,
//     };
//     const result = await studentCumScorePerTerm(param);

//     if (!result) {
//       throw new AppError('Unable to calculate student cumulative score', 400);
//     }

//     return res.status(200).json({
//       message: 'Student cumulative score calculation completed successfully.',
//       success: true,
//       status: 200,
//       result,
//     });
//   }
// );

// const getAStudentById = catchErrors(async (req, res) => {
//   const { student_id } = req.params;
//   if (!student_id) {
//     throw new AppError('Student ID is required.', 404);
//   }

//   const userId = req.user?.userId;
//   const userRole = req.user?.userRole;

//   if (!userId) {
//     throw new AppError('Please login to proceed.', 404);
//   }

//   if (userRole === 'student') {
//     if (userId.toString() !== student_id) {
//       throw new AppError('You are only allowed to view your own account.', 400);
//     }
//   }

//   const response = await fetchStudentById(student_id);

//   if (!response) {
//     throw new AppError('Unable to get student.', 404);
//   }

//   return res.status(200).json({
//     message: 'Student fetched successfully',
//     success: true,
//     status: 200,
//     student: response,
//   });
// });

// const getAllStudents = catchErrors(async (req, res) => {
//   const page = req.query.page ? Number(req.query.page) : undefined;
//   const limit = req.query.limit ? Number(req.query.limit) : undefined;

//   const searchQuery =
//     typeof req.query.searchParams === 'string' ? req.query.searchParams : '';
//   const result = await fetchAllStudents(page, limit, searchQuery);

//   if (!result) {
//     throw new AppError('Unable to get students.', 404);
//   }

//   return res.status(200).json({
//     message: 'Students fetched successfully',
//     success: true,
//     status: 200,
//     students: result,
//   });
// });

// const getAllStudentsOnAClassLevel = catchErrors(async (req, res) => {
//   const { level } = req.params;

//   if (!level) {
//     throw new AppError('Please provide a valid level.', 400);
//   }

//   const result = await fetchAllStudentsOnAClassLevel(level);

//   if (!result) {
//     throw new AppError('Unable to fetch all students on the class level.', 400);
//   }

//   return res.status(200).json({
//     message: `Students in ${level} fetched successfully.`,
//     success: true,
//     status: 200,
//     students: result,
//   });
// });

// const updateStudentDetails = catchErrors(async (req, res) => {
//   const { home_address, close_bus_stop } = req.body;
//   const { student_id } = req.params;

//   const userRole = req.user?.userRole;

//   console.log('home_address:', home_address);
//   console.log('close_bus_stop:', close_bus_stop);
//   console.log('student_id:', student_id);
//   console.log('req.file:', req.file);

//   const payload = { home_address, close_bus_stop };
//   const validateInput = addressValidation(payload);

//   if (!validateInput) {
//     throw new AppError('Unable to validate input fields.', 400);
//   }

//   const { success, value } = validateInput;

//   const parent_id =
//     userRole === 'parent' ? req.user?.userId.toString() : undefined;

//   if (userRole === 'parent' && !parent_id) {
//     console.error('Parent ID not found');
//     throw new AppError('Parent ID not found.', 400);
//   }

//   const userObj = {
//     home_address: value.home_address,
//     close_bus_stop: value.close_bus_stop,
//     student_id,
//     userRole,
//     parent_id,
//   };

//   const result = await studentUpdateDetails(req, userObj, res);
//   if (!result) {
//     throw new AppError('Unable to update student.', 400);
//   }

//   return res.status(200).json({
//     message: 'Student updated successfully',
//     status: 200,
//     success: true,
//     student: result,
//   });
// });

// const studentsSubscribeToNewSession = catchErrors(async (req, res) => {
//   const result = await newSessionStudentsSubscription();

//   if (!result) {
//     throw new AppError(
//       'Unable to send subscription notification to students and parents.',
//       400
//     );
//   }

//   return res.status(200).json({
//     message: 'Subscription notification sent to students and parents.',
//     success: true,
//     status: 200,
//   });
// });

// const updateStudentSessionSubscription = catchErrors(async (req, res) => {
//   const { student_id, academic_session_id } = req.params;
//   const { new_session_subscription_status } = req.body;

//   const userId = req.user?.userId;
//   const userRole = req.user?.userRole;

//   if (!student_id || !academic_session_id || !new_session_subscription_status) {
//     throw new AppError(
//       'Please provide a valid student ID, new session subscription status and academic session ID to proceed.',
//       400
//     );
//   }

//   if (!userId || !userRole) {
//     throw new AppError('Please login to continue.', 400);
//   }

//   const payload = {
//     student_id,
//     academic_session_id,
//     parent_id: userId,
//     userRole: userRole,
//     new_session_subscription_status,
//   };

//   const result = await studentSessionSubscriptionUpdate(payload);

//   if (!result) {
//     throw new AppError(
//       'Unable to update student for session subscription.',
//       400
//     );
//   }

//   return res.status(200).json({
//     message: 'Student session subscription successfully updated.',
//     status: 200,
//     success: true,
//     student: result,
//   });
// });

// const getStudentsThatSubscribedToNewSession = catchErrors(async (req, res) => {
//   const { level } = req.params;
//   // const { class_id } = req.params;

//   console.log('level:', level);

//   if (!level) {
//     throw new AppError('Please provide a valid class level to proceed.', 400);
//   }

//   const result = await fetchStudentsThatSubscribedToNewSession(level);

//   if (!result) {
//     throw new AppError(
//       'Unable to fetch students that has subscribed to a new session for this class.',
//       404
//     );
//   }

//   return res.status(200).json({
//     message:
//       'Students who have subscribed to a new session for this class fetched successfully.',
//     status: 200,
//     success: true,
//     students: result,
//   });
// });

// const getNewStudentsThatHasNoClassEnrolmentBefore = catchErrors(
//   async (req, res) => {
//     const page = req.query.page ? Number(req.query.page) : undefined;
//     const limit = req.query.limit ? Number(req.query.limit) : undefined;

//     const searchQuery =
//       typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

//     const result = await fetchNewStudentsThatHasNoClassEnrolmentBefore(
//       page,
//       limit,
//       searchQuery
//     );

//     if (!result) {
//       throw new AppError('Unable to get students.', 400);
//     }

//     return res.status(200).json({
//       message: 'Students fetched successfully.',
//       status: 200,
//       success: true,
//       students: result,
//     });
//   }
// );
// export {
//   getAllStudentsOnAClassLevel,
//   getNewStudentsThatHasNoClassEnrolmentBefore,
//   getStudentsThatSubscribedToNewSession,
//   updateStudentSessionSubscription,
//   studentsSubscribeToNewSession,
//   updateStudentDetails,
//   linkStudentWithParent,
//   calculateStudentCumulativeScoreForAllSubjectsPerTerm,
//   getAllStudents,
//   getAStudentById,
// };

////////////////////////////////////////////////////////////////
import mongoose from 'mongoose';
import { StudentLinkingType } from '../constants/types';
import {
  fetchAllStudents,
  fetchAllStudentsOnAClassLevel,
  fetchNewStudentsThatHasNoClassEnrolmentBefore,
  fetchStudentById,
  fetchStudentsThatAreYetToSubscribedToNewSession,
  fetchStudentsThatSubscribedToNewSession,
  newSessionStudentsSubscription,
  studentLinking,
  studentSessionSubscriptionUpdateByAdmin,
  studentSessionSubscriptionUpdateByStudentOrParent,
  studentUpdateDetails,
} from '../services/student.service';
import { AppError, JoiError } from '../utils/app.error';
import catchErrors from '../utils/tryCatch';
import { addressValidation, joiValidation } from '../utils/validation';
// import { saveLog } from '../logs/log.service';

const getAStudentById = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { student_id } = req.params;

  console.log('student_id:', student_id);

  if (!student_id) {
    throw new AppError('Student ID is required.', 404);
  }

  const userId = req.user?.userId;
  const userRole = req.user?.userRole;

  if (!userId) {
    throw new AppError('Please login to proceed.', 404);
  }

  if (userRole === 'student') {
    if (userId.toString() !== student_id) {
      throw new AppError('You are only allowed to view your own account.', 400);
    }
  }

  const response = await fetchStudentById(student_id);

  if (!response) {
    throw new AppError('Unable to get student.', 404);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Student fetched successfully.',
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
    message: 'Student fetched successfully',
    success: true,
    status: 200,
    student: response,
  });
});

const updateStudentDetails = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { home_address } = req.body;
  const { student_id } = req.params;

  const userRole = req.user?.userRole;

  const payload = home_address;
  const validateInput = addressValidation(home_address);

  console.log('validateInput:', validateInput);
  if (!validateInput) {
    throw new AppError('Unable to validate input fields.', 400);
  }

  const { success, value } = validateInput;

  console.log('value:', value);

  const parent_id =
    userRole === 'parent' ? req.user?.userId.toString() : undefined;

  if (userRole === 'parent' && !parent_id) {
    console.error('Parent ID not found');
    throw new AppError('Parent ID not found.', 400);
  }

  const userObj = {
    home_address: value.home_address,
    student_id,
    userRole,
    parent_id,
  };

  console.log('controller file:', req.file);

  const result = await studentUpdateDetails(req, userObj, res);
  if (!result) {
    throw new AppError('Unable to update student.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Student updated successfully.',
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
    message: 'Student updated successfully',
    status: 200,
    success: true,
    student: result,
  });
});

const getAllStudents = catchErrors(async (req, res) => {
  // const start = Date.now();

  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const searchQuery =
    typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

  console.log('page:', page);
  console.log('limit:', limit);
  console.log('searchQuery:', searchQuery);
  const result = await fetchAllStudents(page, limit, searchQuery);

  if (!result) {
    throw new AppError('Unable to get students.', 404);
  }

  console.log('result', result.studentObj);

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Students fetched successfully.',
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
    message: 'Students fetched successfully',
    success: true,
    status: 200,
    students: result,
  });
});

const getAllStudentsOnAClassLevel = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { level } = req.params;

  if (!level) {
    throw new AppError('Please provide a valid level.', 400);
  }

  const result = await fetchAllStudentsOnAClassLevel(level);

  if (!result) {
    throw new AppError('Unable to fetch all students on the class level.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: `Students in ${level} fetched successfully.`,
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
    message: `Students in ${level} fetched successfully.`,
    success: true,
    status: 200,
    students: result,
  });
});

const linkStudentWithParent = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { admission_number, first_name, last_name, parent_id } = req.body;

  const payload = {
    first_name: first_name.trim().toLowerCase(),
    last_name: last_name.trim().toLowerCase(),
  };

  const response = joiValidation(payload, 'link-student');

  if (!response) {
    throw new JoiError('Could not validate input fields');
  }

  const { success, value } = response;

  const param: StudentLinkingType = {
    first_name: value.first_name,
    last_name: value.last_name,
    admission_number,
    parent_id,
  };

  const linkStudent = await studentLinking(param);

  if (!linkStudent) {
    throw new AppError('Unable to link student to parent.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: `${linkStudent.student.first_name}, has been linked to ${linkStudent.parent.first_name}`,
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
    message: `${linkStudent.student.first_name}, has been linked to ${linkStudent.parent.first_name}`,
    status: 200,
    success: true,
  });
});

const studentsSubscribeToNewSession = catchErrors(async (req, res) => {
  // const start = Date.now();

  const result = await newSessionStudentsSubscription();

  if (!result) {
    throw new AppError(
      'Unable to send subscription notification to students and parents.',
      400
    );
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Subscription notification sent to students and parents.',
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
    message: 'Subscription notification sent to students and parents.',
    success: true,
    status: 200,
  });
});

const adminUpdateStudentSessionSubscription = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { academic_session_id } = req.params;
  const { student_ids_array } = req.body;

  const userId = req.user?.userId;
  const userRole = req.user?.userRole;

  if (!academic_session_id) {
    throw new AppError('Please provide a academic session ID to proceed.', 400);
  }

  if (student_ids_array.length === 0) {
    throw new AppError(
      'Please provide the IDs of the students that which to subscribe to a new session in the school.',
      400
    );
  }

  if (!userId || !userRole) {
    throw new AppError('Please login to continue.', 400);
  }

  const payload = {
    student_ids_array,
    academic_session_id,
    parent_id: userId,
    userRole: userRole,
  };

  const result = await studentSessionSubscriptionUpdateByAdmin(payload);

  if (!result) {
    throw new AppError(
      'Unable to update student for session subscription.',
      400
    );
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Student session subscription successfully updated.',
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
    message: 'Student session subscription successfully updated.',
    status: 200,
    success: true,
    student: result,
  });
});

const studentOrParentUpdateStudentSessionSubscription = catchErrors(
  async (req, res) => {
    // const start = Date.now();

    const { student_id, academic_session_id } = req.params;
    const { new_session_subscription_status } = req.body;

    const userId = req.user?.userId;
    const userRole = req.user?.userRole;

    if (
      !student_id ||
      !academic_session_id ||
      !new_session_subscription_status
    ) {
      throw new AppError(
        'Please provide a valid student ID, new session subscription status and academic session ID to proceed.',
        400
      );
    }

    if (!userId || !userRole) {
      throw new AppError('Please login to continue.', 400);
    }

    const payload = {
      student_id,
      academic_session_id,
      parent_id: userId,
      userRole: userRole,
      new_session_subscription_status,
    };

    const result = await studentSessionSubscriptionUpdateByStudentOrParent(
      payload
    );

    if (!result) {
      throw new AppError(
        'Unable to update student for session subscription.',
        400
      );
    }

    // const duration = Date.now() - start;

    // const savelogPayload = {
    //   level: 'info',
    //   message: 'Student session subscription successfully updated.',
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
      message: 'Student session subscription successfully updated.',
      status: 200,
      success: true,
      student: result,
    });
  }
);

const getStudentsThatSubscribedToNewSession = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { level } = req.params;

  if (!level) {
    throw new AppError('Please provide a valid class level to proceed.', 400);
  }

  const result = await fetchStudentsThatSubscribedToNewSession(level);

  if (!result) {
    throw new AppError(
      'Unable to fetch students that has subscribed to a new session for this class.',
      404
    );
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message:
  //     'Students who have subscribed to a new session for this class fetched successfully.',
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
    message:
      'Students who have subscribed to a new session for this class fetched successfully.',
    status: 200,
    success: true,
    students: result,
  });
});

const getNewStudentsThatHasNoClassEnrolmentBefore = catchErrors(
  async (req, res) => {
    // const start = Date.now();

    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const searchQuery =
      typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

    const result = await fetchNewStudentsThatHasNoClassEnrolmentBefore(
      page,
      limit,
      searchQuery
    );

    if (!result) {
      throw new AppError('Unable to get students.', 400);
    }

    // const duration = Date.now() - start;

    // const savelogPayload = {
    //   level: 'info',
    //   message: 'Students fetched successfully.',
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
      message: 'Students fetched successfully.',
      status: 200,
      success: true,
      students: result,
    });
  }
);

const getStudentsThatAreYetToSubscribedToNewSession = catchErrors(
  async (req, res) => {
    // const start = Date.now();

    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const searchQuery =
      typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

    const result = await fetchStudentsThatAreYetToSubscribedToNewSession(
      page,
      limit,
      searchQuery
    );

    if (!result) {
      throw new AppError(
        'Unable to fetch students that are yet to subscribe to a new session.',
        400
      );
    }

    // const duration = Date.now() - start;

    // const savelogPayload = {
    //   level: 'info',
    //   message: 'Students fetched successfully.',
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
      message: 'Students fetched successfully.',
      status: 200,
      success: true,
      students_yet_to_subscribe_to_new_session: result,
    });
  }
);

export {
  getAStudentById,
  updateStudentDetails,
  getAllStudents,
  getAllStudentsOnAClassLevel,
  linkStudentWithParent,
  studentsSubscribeToNewSession,
  adminUpdateStudentSessionSubscription,
  studentOrParentUpdateStudentSessionSubscription,
  getStudentsThatSubscribedToNewSession,
  getNewStudentsThatHasNoClassEnrolmentBefore,
  getStudentsThatAreYetToSubscribedToNewSession,
};
