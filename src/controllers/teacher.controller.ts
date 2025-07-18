// import { TeacherToSubjectType } from '../constants/types';
// import {
//   assigningTeacherToSubject,
//   classTeacherAssignedEndpoint,
//   fetchAllTeachers,
//   fetchTeachersBySubjectId,
//   getTeacherDetailsById,
//   onboardTeacher,
//   classTeacherChange,
//   changingTeacherToSubject,
//   fetchStudentsInClassOfferingTeacherSubject,
//   fetchAllClassesTeacherTeachesByTeacherId,
//   fetchStudentsOfferingTeacherSubjectUsingClassId,
//   fetchAllStudentsInClassByClassId,
//   fetchStudentsInClassThatTeacherManages,
// } from '../services/teacher.service';
// import { AppError } from '../utils/app.error';
// import catchErrors from '../utils/tryCatch';
// import { teacherValidation } from '../utils/validation';

// const assignTeacherToSubject = catchErrors(async (req, res) => {
//   const { subject, class_id, teacher_id } = req.body;

//   if (!subject || !class_id || !teacher_id) {
//     throw new AppError('Subject, class id and teacher id are required', 400);
//   }

//   const payload = {
//     subject,
//     class_id,
//     teacher_id,
//   };
//   const info = await assigningTeacherToSubject(payload);

//   if (!info) {
//     throw new AppError('Unable to assign teacher to the subject', 400);
//   }

//   console.log('info: ', info);

//   return res.status(200).json({
//     message: `${info.teacherFullName} has been successfully assigned to teach ${info.subject} in ${info.classDoc.name}`,
//     status: 200,
//     success: true,
//   });
// });

// const assignTeacherToClass = catchErrors(async (req, res) => {
//   const { teacher_id, class_id } = req.body;

//   if (!teacher_id || !class_id) {
//     throw new AppError('Teacher ID and class name are needed.', 400);
//   }

//   const payload: TeacherToSubjectType = {
//     teacher_id,
//     class_id,
//   };

//   const result = await classTeacherAssignedEndpoint(payload);

//   if (!result) {
//     throw new AppError('Unable to assign teacher to a class.', 400);
//   }

//   return res.status(200).json({
//     message: 'Teacher assigned successfully',
//     status: 200,
//     success: true,
//   });
// });

// const getATeacherById = catchErrors(async (req, res) => {
//   const { teacher_id } = req.params;
//   if (!teacher_id) {
//     throw new AppError('Please provide teacher id.', 400);
//   }

//   const info = await getTeacherDetailsById(teacher_id);

//   if (!info) {
//     throw new AppError('Unable to get teacher details', 400);
//   }

//   return res.status(200).json({
//     message: `Teacher information fetched successfully`,
//     success: true,
//     status: 200,
//     teacher: info,
//   });
// });

// const getAllTeachers = catchErrors(async (req, res) => {
//   const page = req.query.page ? Number(req.query.page) : undefined;
//   const limit = req.query.limit ? Number(req.query.limit) : undefined;
//   const searchQuery =
//     typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

//   const info = await fetchAllTeachers(page, limit, searchQuery);

//   if (!info) {
//     throw new AppError('Unable to get teachers.', 400);
//   }

//   return res.status(200).json({
//     message: `Teachers fetched successfully`,
//     success: true,
//     status: 200,
//     teachers: info,
//   });
// });

// const getTeachersBySubjectId = catchErrors(async (req, res) => {
//   const { subject_id } = req.params;
//   const page = Number(req.query.page) || 1;
//   const limit = Number(req.query.limit) || 10;
//   const searchQuery =
//     typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

//   if (!subject_id) {
//     throw new AppError('Please provide subject id.', 400);
//   }

//   const info = await fetchTeachersBySubjectId(
//     subject_id,
//     page,
//     limit,
//     searchQuery
//   );

//   if (!info) {
//     throw new AppError('Unable to get teachers', 400);
//   }

//   return res.status(200).json({
//     message: `Teachers fetched successfully`,
//     success: true,
//     status: 200,
//     teachers: info,
//   });
// });

// const teacherOnboardingById = catchErrors(async (req, res) => {
//   const { teacher_id } = req.params;
//   const { subject_ids } = req.body;

//   if (!teacher_id) {
//     throw new AppError('Teacher ID is required to proceed.', 400);
//   }

//   if (!subject_ids) {
//     throw new AppError(
//       'Please provide at least one subject that this teacher will be teaching.',
//       400
//     );
//   }

//   const payload = {
//     teacher_id,
//     subject_ids,
//   };

//   const result = await onboardTeacher(payload);

//   if (!result) {
//     throw new AppError('Unable to onboard this teacher.', 400);
//   }

//   return res.status(200).json({
//     message: 'Teacher successfully onboarded.',
//     success: true,
//     status: 200,
//     teacher: result,
//   });
// });

// const changeClassTeacher = catchErrors(async (req, res) => {
//   const { class_id } = req.params;
//   const { new_class_teacher_id } = req.body;

//   if (!class_id) {
//     throw new AppError('Class ID is required to proceed.', 400);
//   }
//   if (!new_class_teacher_id) {
//     throw new AppError('New class teacher ID is required to proceed.', 400);
//   }

//   const payload = {
//     class_id,
//     new_class_teacher_id,
//   };

//   const result = await classTeacherChange(payload);

//   if (!result) {
//     throw new AppError('Unable to change class teacher.', 400);
//   }

//   return res.status(200).json({
//     message: `${result.name} class teacher changed successfully to ${result.class_teacher}`,
//     success: true,
//     status: 200,
//     class: result,
//   });
// });

// const changeSubjectTeacherInAClass = catchErrors(async (req, res) => {
//   const { subject, class_id, new_teacher_id } = req.body;

//   if (!subject || !class_id || !new_teacher_id) {
//     throw new AppError('Subject, class id and teacher id are required', 400);
//   }

//   const payload = {
//     subject,
//     class_id,
//     new_teacher_id,
//   };
//   const info = await changingTeacherToSubject(payload);

//   if (!info) {
//     throw new AppError('Unable to change teacher to the subject', 400);
//   }

//   return res.status(200).json({
//     message: `${info.subject} teacher in ${info.classDoc.name} has been changed to ${info.teacherFullName}`,
//     status: 200,
//     success: true,
//     class: info.classDoc,
//   });
// });

// const getStudentsInClassOfferingTeacherSubject = catchErrors(
//   async (req, res) => {
//     const { class_id, academic_session_id, subject_id } = req.params;

//     const userId = req.user?.userId;
//     const userRole = req.user?.userRole;

//     if (!class_id || !subject_id || !academic_session_id) {
//       throw new AppError(
//         'Please provide valid academic session ID, class ID and subject ID to proceed.',
//         400
//       );
//     }

//     const payload = {
//       class_id,
//       subject_id,
//       academic_session_id,
//       userRole: userRole === 'teacher' ? userRole : undefined,
//       userId: userRole === 'teacher' ? userId : undefined,
//     };

//     const result = await fetchStudentsInClassOfferingTeacherSubject(payload);

//     if (!result) {
//       throw new AppError(
//         'Unable to fetch students offering this subject in this class.',
//         400
//       );
//     }

//     return res.status(200).json({
//       message: `Student offering this subject in this class fetched successfully.`,
//       success: true,
//       status: 200,
//       students: result,
//     });
//   }
// );

// const getAllClassesTeacherTeachesByTeacherId = catchErrors(async (req, res) => {
//   const { teacher_id } = req.params;
//   const userId = req.user?.userId;
//   const userRole = req.user?.userRole;

//   if (!teacher_id) {
//     throw new AppError('Please provide a teacher ID to proceed.', 400);
//   }
//   if (!userId || !userRole) {
//     throw new AppError('Please login to proceed.', 400);
//   }

//   const payload = {
//     teacher_id,
//     userRole,
//     userId,
//   };

//   const result = await fetchAllClassesTeacherTeachesByTeacherId(payload);

//   if (!result) {
//     throw new AppError(
//       'Unable to fetch all the classes that this teacher teaches.',
//       400
//     );
//   }

//   return res.status(200).json({
//     message:
//       'Classes and subject being taught by teacher fetched successfully.',
//     status: 200,
//     success: true,
//     classes: result,
//   });
// });

// const getAllStudentsInClassByClassId = catchErrors(async (req, res) => {
//   const { class_id, academic_session_id } = req.params;

//   const userId = req.user?.userId;
//   const userRole = req.user?.userRole;

//   if (!class_id || !academic_session_id) {
//     throw new AppError(
//       'Please provide a class ID and academic session ID to proceed',
//       400
//     );
//   }

//   if (!userId || !userRole) {
//     throw new AppError('Please login to proceed', 400);
//   }

//   const payload = {
//     class_id,
//     userId,
//     userRole,
//     academic_session_id,
//   };

//   const result = await fetchAllStudentsInClassByClassId(payload);

//   if (!result) {
//     throw new AppError('Unable to get students in this class.', 400);
//   }

//   return res.status(200).json({
//     message: 'Students fetched successfully.',
//     success: true,
//     status: 200,
//     students_in_class: result,
//   });
// });

// const getStudentsOfferingTeacherSubjectUsingClassId = catchErrors(
//   async (req, res) => {
//     const { class_id } = req.params;
//     const userId = req.user?.userId;
//     const userRole = req.user?.userRole;

//     if (!class_id) {
//       throw new AppError('Please provide a class ID to proceed', 400);
//     }

//     if (!userId || !userRole) {
//       throw new AppError('Please login to proceed', 400);
//     }

//     const payload = {
//       class_id,
//       userId,
//       userRole,
//     };

//     const result = await fetchStudentsOfferingTeacherSubjectUsingClassId(
//       payload
//     );

//     if (!result) {
//       throw new AppError(
//         'Unable to get students offering this subject using the class ID.',
//         400
//       );
//     }

//     return res.status(200).json({
//       message: 'Student offering this subject fetched successfully.',
//       success: true,
//       status: 200,
//       students_in_class: result,
//     });
//   }
// );

// const getStudentsInClassThatTeacherManages = catchErrors(async (req, res) => {
//   const { class_id, teacher_id, academic_session_id } = req.params;

//   const userId = req.user?.userId;
//   const userRole = req.user?.userRole;

//   if (!class_id || !teacher_id || !academic_session_id) {
//     throw new AppError(
//       'Please provide a class ID and academic session ID to proceed',
//       400
//     );
//   }

//   if (!userId || !userRole) {
//     throw new AppError('Please login to proceed', 400);
//   }

//   const payload = {
//     class_id,
//     userId,
//     userRole,
//     teacher_id,
//     academic_session_id,
//   };

//   const result = await fetchStudentsInClassThatTeacherManages(payload);

//   if (!result) {
//     throw new AppError('Unable to get students in this class.', 400);
//   }

//   return res.status(200).json({
//     message: 'Students fetched successfully.',
//     success: true,
//     status: 200,
//     students_in_class: result,
//   });
// });

// export {
//   getStudentsInClassThatTeacherManages,
//   getAllStudentsInClassByClassId,
//   getStudentsOfferingTeacherSubjectUsingClassId,
//   getAllClassesTeacherTeachesByTeacherId,
//   getStudentsInClassOfferingTeacherSubject,
//   changeSubjectTeacherInAClass,
//   changeClassTeacher,
//   teacherOnboardingById,
//   getTeachersBySubjectId,
//   getAllTeachers,
//   assignTeacherToClass,
//   getATeacherById,
//   assignTeacherToSubject,
// };

//////////////////////////////////////////////////////////////////////
import mongoose, { Types } from 'mongoose';
import { TeacherToSubjectType } from '../constants/types';
import {
  assigningTeacherToSubject,
  changingTeacherToSubject,
  classTeacherAssignedEndpoint,
  classTeacherChange,
  fetchAllClassesTeacherTeachesByTeacherId,
  fetchAllStudentsInClassByClassId,
  fetchAllTeachers,
  fetchStudentsInClassOfferingTeacherSubject,
  fetchStudentsInClassThatTeacherManages,
  fetchStudentsOfferingTeacherSubjectUsingClassId,
  fetchTeachersBySubjectId,
  getTeacherDetailsById,
  onboardTeacher,
  fetchClassTeacherManagesByTeacherId,
} from '../services/teacher.service';
import { AppError } from '../utils/app.error';
import catchErrors from '../utils/tryCatch';
// import { saveLog } from '../logs/log.service';

const assignTeacherToClass = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { teacher_id, class_id } = req.body;

  if (!teacher_id || !class_id) {
    throw new AppError('Teacher ID and class name are needed.', 400);
  }

  const payload: TeacherToSubjectType = {
    teacher_id,
    class_id,
  };

  const result = await classTeacherAssignedEndpoint(payload);

  if (!result) {
    throw new AppError('Unable to assign teacher to a class.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Teacher assigned successfully.',
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
    message: 'Teacher assigned successfully',
    status: 200,
    success: true,
  });
});

const assignTeacherToSubject = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { subject, class_id, teacher_id } = req.body;

  console.log('req.body:', req.body);

  if (!subject || !class_id || !teacher_id) {
    throw new AppError('Subject, class id and teacher id are required', 400);
  }

  const payload = {
    subject,
    class_id,
    teacher_id,
  };
  const info = await assigningTeacherToSubject(payload);

  if (!info) {
    throw new AppError('Unable to assign teacher to the subject', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: `${info.teacherFullName} has been successfully assigned to teach ${info.subject} in ${info.classDoc.name}`,
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
    message: `${info.teacherFullName} has been successfully assigned to teach ${info.subject} in ${info.classDoc.name}`,
    status: 200,
    success: true,
  });
});

const getATeacherById = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { teacher_id } = req.params;
  console.log('req.params:', req.params);
  if (!teacher_id) {
    throw new AppError('Please provide teacher id.', 400);
  }

  const info = await getTeacherDetailsById(teacher_id);

  if (!info) {
    throw new AppError('Unable to get teacher details', 400);
  }
  console.log('info:', info);

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: `Teacher information fetched successfully`,
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
    message: `Teacher information fetched successfully`,
    success: true,
    status: 200,
    teacher: info,
  });
});

const getTeachersBySubjectId = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { subject_id } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const searchQuery =
    typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

  if (!subject_id) {
    throw new AppError('Please provide subject id.', 400);
  }

  const info = await fetchTeachersBySubjectId(
    subject_id,
    page,
    limit,
    searchQuery
  );

  if (!info) {
    throw new AppError('Unable to get teachers', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Teachers fetched successfully.',
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
    message: `Teachers fetched successfully`,
    success: true,
    status: 200,
    teachers: info,
  });
});

const getAllTeachers = catchErrors(async (req, res) => {
  // const start = Date.now();

  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const searchQuery =
    typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

  const info = await fetchAllTeachers(page, limit, searchQuery);

  if (!info) {
    throw new AppError('Unable to get teachers.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Teachers fetched successfully.',
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
    message: `Teachers fetched successfully`,
    success: true,
    status: 200,
    teachers: info,
  });
});

const teacherOnboardingById = catchErrors(async (req, res) => {
  // const start = Date.now();

  console.log('I am being called');
  console.log(req.params);
  console.log(req.body);

  const { teacher_id } = req.params;
  const { subject_ids } = req.body;

  if (!teacher_id) {
    throw new AppError('Teacher ID is required to proceed.', 400);
  }

  if (!subject_ids) {
    throw new AppError(
      'Please provide at least one subject that this teacher will be teaching.',
      400
    );
  }

  const payload = {
    teacher_id,
    subject_ids,
  };

  const result = await onboardTeacher(payload);

  if (!result) {
    throw new AppError('Unable to onboard this teacher.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Teacher successfully onboarded.',
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
    message: 'Teacher successfully onboarded.',
    success: true,
    status: 200,
    teacher: result,
  });
});

const changeClassTeacher = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { class_id } = req.params;
  const { new_class_teacher_id } = req.body;

  if (!class_id) {
    throw new AppError('Class ID is required to proceed.', 400);
  }
  if (!new_class_teacher_id) {
    throw new AppError('New class teacher ID is required to proceed.', 400);
  }

  const payload = {
    class_id,
    new_class_teacher_id,
  };

  const result = await classTeacherChange(payload);

  if (!result) {
    throw new AppError('Unable to change class teacher.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: `${result.name} class teacher changed successfully to ${result.class_teacher}.`,
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
    message: `${result.name} class teacher changed successfully to ${result.class_teacher}`,
    success: true,
    status: 200,
    class: result,
  });
});

const changeSubjectTeacherInAClass = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { subject, class_id, new_teacher_id } = req.body;

  if (!subject || !class_id || !new_teacher_id) {
    throw new AppError('Subject, class id and teacher id are required', 400);
  }

  const payload = {
    subject,
    class_id,
    new_teacher_id,
  };
  const info = await changingTeacherToSubject(payload);

  if (!info) {
    throw new AppError('Unable to change teacher to the subject', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: `${info.subject} teacher in ${info.classDoc.name} has been changed to ${info.teacherFullName}`,
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
    message: `${info.subject} teacher in ${info.classDoc.name} has been changed to ${info.teacherFullName}`,
    status: 200,
    success: true,
    class: info.classDoc,
  });
});

const getStudentsInClassOfferingTeacherSubject = catchErrors(
  async (req, res) => {
    // const start = Date.now();

    const { class_id, academic_session_id, subject_id } = req.params;

    const userId = req.user?.userId;
    const userRole = req.user?.userRole;

    if (!class_id || !subject_id || !academic_session_id) {
      throw new AppError(
        'Please provide valid academic session ID, class ID and subject ID to proceed.',
        400
      );
    }

    const payload = {
      class_id,
      subject_id,
      academic_session_id,
      userRole: userRole === 'teacher' ? userRole : undefined,
      userId: userRole === 'teacher' ? userId : undefined,
    };

    console.log('payload:', payload);

    const result = await fetchStudentsInClassOfferingTeacherSubject(payload);

    if (!result) {
      throw new AppError(
        'Unable to fetch students offering this subject in this class.',
        400
      );
    }

    // const duration = Date.now() - start;

    // const savelogPayload = {
    //   level: 'info',
    //   message: `Student offering this subject in this class fetched successfully.`,
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
      message: `Student offering this subject in this class fetched successfully.`,
      success: true,
      status: 200,
      students: result,
    });
  }
);

const getAllClassesTeacherTeachesByTeacherId = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { teacher_id } = req.params;
  const userId = req.user?.userId;
  const userRole = req.user?.userRole;

  if (!teacher_id) {
    throw new AppError('Please provide a teacher ID to proceed.', 400);
  }

  if (!userId || !userRole) {
    throw new AppError('Please login to proceed.', 400);
  }

  const payload = {
    teacher_id,
    userRole,
    user_id: userId.toString(),
  };

  const result = await fetchAllClassesTeacherTeachesByTeacherId(payload);

  if (!result) {
    throw new AppError(
      'Unable to fetch all the classes that this teacher teaches.',
      400
    );
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message:
  //     'Classes and subject being taught by teacher fetched successfully.',
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
      'Classes and subject being taught by teacher fetched successfully.',
    status: 200,
    success: true,
    classes: result,
  });
});

const getStudentsOfferingTeacherSubjectUsingClassId = catchErrors(
  async (req, res) => {
    // const start = Date.now();

    const { class_id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.userRole;

    if (!class_id) {
      throw new AppError('Please provide a class ID to proceed', 400);
    }

    if (!userId || !userRole) {
      throw new AppError('Please login to proceed', 400);
    }

    const payload = {
      class_id,
      userId: Object(userId),
      userRole,
    };

    const result = await fetchStudentsOfferingTeacherSubjectUsingClassId(
      payload
    );

    if (!result) {
      throw new AppError(
        'Unable to get students offering this subject using the class ID.',
        400
      );
    }

    // const duration = Date.now() - start;

    // const savelogPayload = {
    //   level: 'info',
    //   message: 'Student offering this subject fetched successfully.',
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
      message: 'Student offering this subject fetched successfully.',
      success: true,
      status: 200,
      students_in_class: result,
    });
  }
);

const getAllStudentsInClassByClassId = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { class_id, academic_session_id } = req.params;

  const userId = req.user?.userId;
  const userRole = req.user?.userRole;

  if (!class_id || !academic_session_id) {
    throw new AppError(
      'Please provide a class ID and academic session ID to proceed',
      400
    );
  }

  if (!userId || !userRole) {
    throw new AppError('Please login to proceed', 400);
  }

  const payload = {
    class_id,
    userId: Object(userId),
    userRole,
    academic_session_id,
  };

  const result = await fetchAllStudentsInClassByClassId(payload);

  if (!result) {
    throw new AppError('Unable to get students in this class.', 400);
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
    success: true,
    status: 200,
    students_in_class: result,
  });
});

const getStudentsInClassThatTeacherManages = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { class_id, teacher_id, academic_session_id } = req.params;
  console.log('class_id:', class_id);
  console.log('teacher_id:', teacher_id);
  console.log('academic_session_id:', academic_session_id);

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const searchQuery =
    typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

  const userId = req.user?.userId;
  const userRole = req.user?.userRole;

  if (!class_id || !teacher_id || !academic_session_id) {
    throw new AppError(
      'Please provide a class ID and academic session ID to proceed',
      400
    );
  }

  if (!userId || !userRole) {
    throw new AppError('Please login to proceed', 400);
  }

  const payload = {
    class_id,
    userId: Object(userId),
    userRole,
    teacher_id,
    academic_session_id,
  };

  const result = await fetchStudentsInClassThatTeacherManages(
    page,
    limit,
    searchQuery,
    payload
  );

  if (!result) {
    throw new AppError('Unable to get students in this class.', 400);
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
    success: true,
    status: 200,
    students_in_class: result,
  });
});

const getClassTeacherManagesByTeacherId = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { teacher_id } = req.params;

  if (!teacher_id) {
    throw new AppError('Teacher ID is required.', 400);
  }

  const userId = req.user?.userId;
  const userRole = req.user?.userRole;

  if (!userId || !userRole) {
    throw new AppError('Please login to proceed', 400);
  }

  const payload = {
    teacher_id,
  };
  const result = await fetchClassTeacherManagesByTeacherId(payload);

  if (!result) {
    throw new AppError('Unable to get class that teacher manages.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Class fetched successfully.',
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
    message: 'Class fetched successfully.',
    success: true,
    status: 200,
    class_am_managing: result,
  });
});

export {
  getClassTeacherManagesByTeacherId,
  assignTeacherToClass,
  assignTeacherToSubject,
  getATeacherById,
  getTeachersBySubjectId,
  getAllTeachers,
  teacherOnboardingById,
  changeClassTeacher,
  changeSubjectTeacherInAClass,
  getStudentsInClassOfferingTeacherSubject,
  getAllClassesTeacherTeachesByTeacherId,
  getStudentsOfferingTeacherSubjectUsingClassId,
  getAllStudentsInClassByClassId,
  getStudentsInClassThatTeacherManages,
};
