// import {
//   subjectCreation,
//   fetchingAllSubjects,
//   fetchingASubject,
//   fetchingAllJssSubjects,
//   fetchingAllSssCompulsorySubjects,
//   fetchingAllOptionalSubjects,
//   storingOptionalSubjectsOfStudent,
// } from '../services/subject.service';
// import { AppError, JoiError } from '../utils/app.error';
// import catchErrors from '../utils/tryCatch';
// import { joiValidation } from '../utils/validation';

// const getAllSubjects = catchErrors(async (req, res) => {
//   const info = await fetchingAllSubjects();

//   if (!info) {
//     throw new AppError('Error fetching subjects', 400);
//   }

//   return res.status(200).json({
//     length: info.length,
//     message: 'Subjects fetched successfully',
//     success: true,
//     status: 200,
//     subjects: info,
//   });
// });

// const getAllJssSubjects = catchErrors(async (req, res) => {
//   const info = await fetchingAllJssSubjects();

//   if (!info) {
//     throw new AppError('Error fetching subjects', 400);
//   }

//   return res.status(200).json({
//     length: info.length,
//     message: 'Subjects fetched successfully',
//     success: true,
//     status: 200,
//     subjects: info,
//   });
// });

// const getAllSssCompulsorySubjects = catchErrors(async (req, res) => {
//   const info = await fetchingAllSssCompulsorySubjects();

//   if (!info) {
//     throw new AppError('Error fetching subjects', 400);
//   }

//   return res.status(200).json({
//     length: info.length,
//     message: 'Subjects fetched successfully',
//     success: true,
//     status: 200,
//     subjects: info,
//   });
// });

// const getAllOptionalSubjects = catchErrors(async (req, res) => {
//   const info = await fetchingAllOptionalSubjects();

//   if (!info) {
//     throw new AppError('Error fetching subjects', 400);
//   }

//   return res.status(200).json({
//     length: info.length,
//     message: 'Subjects fetched successfully',
//     success: true,
//     status: 200,
//     subjects: info,
//   });
// });

// const getASubjectById = catchErrors(async (req, res) => {
//   const { subject_id } = req.params;
//   const info = await fetchingASubject(subject_id);

//   if (!info) {
//     throw new AppError('Error fetching subject', 400);
//   }

//   return res.status(200).json({
//     message: 'Subject fetched successfully',
//     success: true,
//     status: 200,
//     subject: info,
//   });
// });

// const createASubject = catchErrors(async (req, res) => {
//   const { name, description, sections, stream } = req.body;

//   const payload = { name, description };

//   const result = joiValidation(payload, 'create-subject');

//   if (!result) {
//     throw new JoiError('Error validating subject creation');
//   }

//   const { success, value } = result;

//   const param = {
//     name: value.name.toLowerCase(),
//     description: value.description.toLowerCase(),
//     sections: sections,
//     stream,
//   };

//   const info = await subjectCreation(param);

//   if (!info) {
//     throw new AppError('Error creating subject', 400);
//   }

//   return res.status(200).json({
//     message: 'Subject created successfully',
//     success: true,
//     status: 200,
//     subject: info,
//   });
// });

// const chooseOptionalSubjects = catchErrors(async (req, res) => {
//   const { student_id, class_id } = req.params;
//   const { optional_subjects_chosen_ids } = req.body;
//   const userId = req.user?.userId;
//   const userRole = req.user?.userRole;

//   if (!student_id) {
//     throw new AppError('Please provide a valid student ID to continue.', 400);
//   }

//   if (!userId || !userRole) {
//     throw new AppError('Please login to continue.', 400);
//   }

//   if (student_id.toString() !== userId?.toString() && userRole !== 'parent') {
//     throw new AppError(
//       'You are not authorized to continue with this process.',
//       400
//     );
//   }

//   const payload = {
//     student_id,
//     userId,
//     optional_subjects_chosen_ids,
//     userRole,
//     class_id,
//   };

//   const result = await storingOptionalSubjectsOfStudent(payload);
// });

// export {
//   chooseOptionalSubjects,
//   createASubject,
//   getAllSubjects,
//   getASubjectById,
//   getAllJssSubjects,
//   getAllSssCompulsorySubjects,
//   getAllOptionalSubjects,
// };

//////////////////////////////////////////////////
import mongoose from 'mongoose';
import {
  fetchingAllJssSubjects,
  fetchingAllOptionalSubjects,
  fetchingAllSssCompulsorySubjects,
  fetchingAllSubjects,
  fetchingASubject,
  // storingOptionalSubjectsOfStudent,
  subjectCreation,
  fetchAllClassSubjectsByClassId,
} from '../services/subject.service';
import { AppError, JoiError } from '../utils/app.error';
import catchErrors from '../utils/tryCatch';
import { joiValidation } from '../utils/validation';
// import { saveLog } from '../logs/log.service';

const createASubject = catchErrors(async (req, res) => {
  // const start = Date.now();
  const {
    name,
    description,
    // sections, stream
  } = req.body;

  const payload = { name, description };

  const result = joiValidation(payload, 'create-subject');

  if (!result) {
    throw new JoiError('Error validating subject creation');
  }

  const { success, value } = result;

  const param = {
    name: value.name.toLowerCase(),
    description: value.description.toLowerCase(),
  };

  const info = await subjectCreation(param);

  if (!info) {
    throw new AppError('Error creating subject', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Subject created successfully.',
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
    message: 'Subject created successfully',
    success: true,
    status: 200,
    subject: info,
  });
});

const getASubjectById = catchErrors(async (req, res) => {
  // const start = Date.now();
  const { subject_id } = req.params;

  const userRole = req.user?.userRole;

  console.log('subject_id:', subject_id);

  const payload = {
    subject_id,
  };

  const info = await fetchingASubject(payload);

  if (!info) {
    throw new AppError('Error fetching subject', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Subject fetched successfully.',
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
    message: 'Subject fetched successfully',
    success: true,
    status: 200,
    subject: info,
  });
});

const getAllClassSubjectsByClassId = catchErrors(async (req, res) => {
  // const start = Date.now();
  const { class_id } = req.params;

  const payload = {
    class_id,
  };

  const result = await fetchAllClassSubjectsByClassId(payload);

  if (!result) {
    throw new AppError('Unable to fetch class subjects.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Class subjects fetched successfully.',
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
    message: 'Class subjects fetched successfully.',
    status: 200,
    success: true,
    class_subjects: result,
  });
});

const getAllSubjects = catchErrors(async (req, res) => {
  // const start = Date.now();
  const userRole = req.user?.userRole;

  console.log('fetching subjects');

  const info = await fetchingAllSubjects();

  if (!info) {
    throw new AppError('Error fetching subjects', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Subjects fetched successfully.',
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
    length: info.length,
    message: 'Subjects fetched successfully',
    success: true,
    status: 200,
    subjects: info,
  });
});

// REMOVE THESE FOUR ENDPOINTS AS WE WILL NOT BE NEEDING THEM AGAIN
const getAllJssSubjects = catchErrors(async (req, res) => {
  const info = await fetchingAllJssSubjects();

  if (!info) {
    throw new AppError('Error fetching subjects', 400);
  }

  return res.status(200).json({
    length: info.length,
    message: 'Subjects fetched successfully',
    success: true,
    status: 200,
    subjects: info,
  });
});

const getAllSssCompulsorySubjects = catchErrors(async (req, res) => {
  const info = await fetchingAllSssCompulsorySubjects();

  if (!info) {
    throw new AppError('Error fetching subjects', 400);
  }

  return res.status(200).json({
    length: info.length,
    message: 'Subjects fetched successfully',
    success: true,
    status: 200,
    subjects: info,
  });
});

const getAllOptionalSubjects = catchErrors(async (req, res) => {
  const info = await fetchingAllOptionalSubjects();

  if (!info) {
    throw new AppError('Error fetching subjects', 400);
  }

  return res.status(200).json({
    length: info.length,
    message: 'Subjects fetched successfully',
    success: true,
    status: 200,
    subjects: info,
  });
});

export {
  getAllSubjects,
  createASubject,
  getASubjectById,
  getAllJssSubjects,
  getAllSssCompulsorySubjects,
  getAllOptionalSubjects,
  // chooseOptionalSubjects,
  getAllClassSubjectsByClassId,
};
