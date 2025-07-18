// import Session from '../models/session.model';
// import {
//   createSession,
//   sessionEndingBySessionId,
//   termEndingInSessionUsingTermId,
//   creatingNewTerm,
//   fetchSessionBySessionId,
//   fetchAllSessions,
//   termDeletionInSessionUsingTermId,
//   sessionDeletionUsingSessionId,
//   fetchActiveSession,
// } from '../services/session.service';
// import { AppError, JoiError } from '../utils/app.error';
// import catchErrors from '../utils/tryCatch';
// import { sessionValidation } from '../utils/validation';

// const createNewSession = catchErrors(async (req, res) => {
//   // const { academic_session } = req.body;

//   // if (!academic_session) {
//   //   throw new AppError('Academic session is required.', 404);
//   // }

//   // const response = sessionValidation(academic_session, 'session');
//   // const { success, value } = response;

//   // if (!response || !success) {
//   //   throw new JoiError('Error validation session');
//   // }

//   const session = await createSession();

//   if (!session) {
//     throw new AppError('Unable to create session.', 400);
//   }

//   return res.status(201).json({
//     message: `${session.academic_session} Session created successfully.`,
//     success: true,
//     status: 201,
//     session,
//   });
// });

// const getActiveSession = catchErrors(async (req, res) => {
//   const result = await fetchActiveSession();

//   if (!result) {
//     throw new AppError('Unable to fetch active session.', 400);
//   }

//   return res.status(200).json({
//     message: 'Active session fetched successfully.',
//     status: 200,
//     success: true,
//     session: result,
//   });
// });

// const createNewTerm = catchErrors(async (req, res) => {
//   const { start_date, end_date, name } = req.body;
//   const { session_id } = req.params;

//   if (!start_date || !end_date || !name) {
//     throw new AppError(
//       'Start date, session name and end date must be provided.',
//       400
//     );
//   }

//   const formattedName = name.toLowerCase().split(' ');

//   const fName = formattedName[0] + '_' + formattedName[1];
//   console.log('fName: ', fName);

//   const payload = {
//     start_date,
//     end_date,
//     name: fName,
//   };

//   const response = sessionValidation(payload, 'term');
//   const { success, value } = response;

//   if (!response || !success) {
//     throw new JoiError('Error validation term');
//   }

//   const input = { ...value, session_id };

//   const sessionInfo = await creatingNewTerm(input);

//   return res.status(201).json({
//     message: `${name} created successfully.`,
//     success: true,
//     status: 201,
//     term: sessionInfo.term,
//   });
// });

// const getAllSessions = catchErrors(async (req, res) => {
//   const page = req.query.page ? Number(req.query.page) : undefined;
//   const limit = req.query.limit ? Number(req.query.limit) : undefined;

//   const searchParams =
//     typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

//   const response = await fetchAllSessions(page, limit, searchParams);

//   if (!response) {
//     throw new AppError('Unable to fetch session', 400);
//   }

//   return res.status(200).json({
//     message: `Sessions fetched successfully.`,
//     success: true,
//     status: 200,
//     sessions: response,
//   });
// });

// const getASessionBySessionId = catchErrors(async (req, res) => {
//   const { session_id } = req.params;

//   if (!session_id) {
//     throw new AppError('Session ID is required.', 400);
//   }

//   const response = await fetchSessionBySessionId(session_id);

//   if (!response) {
//     throw new AppError('Unable to fetch session', 400);
//   }

//   return res.status(200).json({
//     message: `Session fetched successfully.`,
//     success: true,
//     status: 200,
//     session: response,
//   });
// });

// const endASessionBySessionId = catchErrors(async (req, res) => {
//   const { session_id } = req.params;

//   if (!session_id) {
//     throw new AppError('Session ID is required.', 400);
//   }

//   const response = await sessionEndingBySessionId(session_id);

//   if (!response) {
//     throw new AppError('Unable to end session.', 400);
//   }

//   return res.status(201).json({
//     message: `Session ended successfully.`,
//     success: true,
//     status: 201,
//     session: response,
//   });
// });

// const deleteTermById = catchErrors(async (req, res) => {
//   const { session_id, term_id } = req.params;

//   if (!session_id || !term_id) {
//     throw new AppError('Session ID and Term ID are required.', 400);
//   }

//   const response = await termDeletionInSessionUsingTermId(session_id, term_id);

//   if (!response) {
//     throw new AppError('Unable to delete term.', 400);
//   }

//   let msg = `${response.term_name} deleted successfully.`;

//   return res.status(201).json({
//     message: msg,
//     success: true,
//     status: 201,
//     session: response,
//   });
// });

// const deleteSessionById = catchErrors(async (req, res) => {
//   const { session_id } = req.params;

//   if (!session_id) {
//     throw new AppError('Session ID is required.', 400);
//   }

//   const response = await sessionDeletionUsingSessionId(session_id);

//   if (!response) {
//     throw new AppError('Unable to delete session.', 400);
//   }

//   let msg = `Session deleted successfully.`;

//   return res.status(200).json({
//     message: msg,
//     success: true,
//     status: 200,
//     session: response,
//   });
// });

// const endATermInASessionByTermId = catchErrors(async (req, res) => {
//   const { session_id, term_id } = req.params;

//   if (!session_id || !term_id) {
//     throw new AppError('Session ID and Term ID are required.', 400);
//   }

//   const response = await termEndingInSessionUsingTermId(session_id, term_id);

//   if (!response) {
//     throw new AppError('Unable to end term.', 400);
//   }

//   let msg = `${response.term_name} ended successfully.`;

//   if (response.term_name === 'third_term') {
//     msg = `${response.term_name} ended successfully. Since this is the last term in this session, the session has also automatically ended.`;
//   }
//   return res.status(201).json({
//     message: msg,
//     success: true,
//     status: 201,
//     session: response,
//   });
// });

// // SCORE RECORDING ENDPOINT: session,

// export {
//   deleteSessionById,
//   deleteTermById,
//   getAllSessions,
//   createNewSession,
//   createNewTerm,
//   getASessionBySessionId,
//   endASessionBySessionId,
//   endATermInASessionByTermId,
//   getActiveSession,
// };

/////////////////////////////////////////////////////////////////////////////////////////////
import mongoose from 'mongoose';
import {
  createSession,
  creatingNewTerm,
  fetchActiveSession,
  fetchAllSessions,
  fetchSessionBySessionId,
  sessionDeletionUsingSessionId,
  sessionEndingBySessionId,
  termDeletionInSessionUsingTermId,
  termEndingInSessionUsingTermId,
} from '../services/session.service';
import { AppError, JoiError } from '../utils/app.error';
import catchErrors from '../utils/tryCatch';
import { sessionValidation } from '../utils/validation';
// import { saveLog } from '../logs/log.service';

const createNewSession = catchErrors(async (req, res) => {
  // const start = Date.now();

  const session = await createSession();

  if (!session) {
    throw new AppError('Unable to create session.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: `${session.academic_session} Session created successfully.`,
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
    message: `${session.academic_session} Session created successfully.`,
    success: true,
    status: 201,
    session,
  });
});

const createNewTerm = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { start_date, end_date, name } = req.body;
  const { session_id } = req.params;

  if (!start_date || !end_date || !name) {
    throw new AppError(
      'Start date, session name and end date must be provided.',
      400
    );
  }

  const formattedName = name.toLowerCase().split(' ');

  const fName = formattedName[0] + '_' + formattedName[1];
  console.log('fName: ', fName);

  const payload = {
    start_date,
    end_date,
    name: fName,
  };

  const response = sessionValidation(payload, 'term');
  const { success, value } = response;

  if (!response || !success) {
    throw new JoiError('Error validation term');
  }

  const input = { ...value, session_id };

  const sessionInfo = await creatingNewTerm(input);

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: `${name} created successfully.`,
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
    message: `${name} created successfully.`,
    success: true,
    status: 201,
    term: sessionInfo.term,
  });
});

const endATermInASessionByTermId = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { session_id, term_id } = req.params;

  if (!session_id || !term_id) {
    throw new AppError('Session ID and Term ID are required.', 400);
  }

  const response = await termEndingInSessionUsingTermId(session_id, term_id);

  if (!response) {
    throw new AppError('Unable to end term.', 400);
  }

  let msg = `${response.term_name} ended successfully.`;

  if (response.term_name === 'third_term') {
    msg = `${response.term_name} ended successfully. Since this is the last term in this session, the session has also automatically ended.`;
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: msg,
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
    message: msg,
    success: true,
    status: 201,
    session: response,
  });
});

const getASessionBySessionId = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { session_id } = req.params;

  if (!session_id) {
    throw new AppError('Session ID is required.', 400);
  }

  const response = await fetchSessionBySessionId(session_id);

  if (!response) {
    throw new AppError('Unable to fetch session', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: `Session fetched successfully.`,
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
    message: `Session fetched successfully.`,
    success: true,
    status: 200,
    session: response,
  });
});

const getActiveSession = catchErrors(async (req, res) => {
  // const start = Date.now();

  const result = await fetchActiveSession();

  if (!result) {
    throw new AppError('Unable to fetch active session.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Active session fetched successfully.',
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
    message: 'Active session fetched successfully.',
    status: 200,
    success: true,
    session: result,
  });
});

const getAllSessions = catchErrors(async (req, res) => {
  // const start = Date.now();

  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const searchParams =
    typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

  const response = await fetchAllSessions(page, limit, searchParams);

  if (!response) {
    throw new AppError('Unable to fetch session', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: `Sessions fetched successfully.`,
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
    message: `Sessions fetched successfully.`,
    success: true,
    status: 200,
    sessions: response,
  });
});

const endASessionBySessionId = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { session_id } = req.params;

  if (!session_id) {
    throw new AppError('Session ID is required.', 400);
  }

  const response = await sessionEndingBySessionId(session_id);

  if (!response) {
    throw new AppError('Unable to end session.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: `Session ended successfully.`,
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
    message: `Session ended successfully.`,
    success: true,
    status: 201,
    session: response,
  });
});

const deleteSessionById = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { session_id } = req.params;

  if (!session_id) {
    throw new AppError('Session ID is required.', 400);
  }

  const response = await sessionDeletionUsingSessionId(session_id);

  if (!response) {
    throw new AppError('Unable to delete session.', 400);
  }

  let msg = `Session deleted successfully.`;

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: msg,
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
    message: msg,
    success: true,
    status: 200,
    session: response,
  });
});

const deleteTermById = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { session_id, term_id } = req.params;

  if (!session_id || !term_id) {
    throw new AppError('Session ID and Term ID are required.', 400);
  }

  const response = await termDeletionInSessionUsingTermId(session_id, term_id);

  if (!response) {
    throw new AppError('Unable to delete term.', 400);
  }

  let msg = `${response.term_name} deleted successfully.`;

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: msg,
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
    message: msg,
    success: true,
    status: 200,
    session: response,
  });
});

export {
  createNewSession,
  createNewTerm,
  endATermInASessionByTermId,
  getASessionBySessionId,
  getActiveSession,
  getAllSessions,
  deleteSessionById,
  deleteTermById,
  endASessionBySessionId,
};
