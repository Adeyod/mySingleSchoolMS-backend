// import mongoose from 'mongoose';
// import {
//   SessionDocument,
//   TermCreationType,
//   TermDocument,
// } from '../constants/types';
// import Session from '../models/session.model';
// import {
//   calculateOutStandingPerTerm,
//   moveStudentToOldStudent,
// } from '../repository/student.repository';
// import { AppError } from '../utils/app.error';
// import Student from '../models/students.model';
// import ClassEnrolment from '../models/classes_enrolment.model';

// const createSession = async (): Promise<SessionDocument> => {
//   const checkSession = await Session.findOne().sort({
//     createdAt: -1,
//   });

//   let academic_session;

//   const activeSession = await Session.findOne({
//     is_active: true,
//   });

//   if (!checkSession) {
//     const currentDate = new Date();
//     const splittedDate = currentDate.toISOString().split('-');
//     if (Number(splittedDate[1]) >= 9) {
//       academic_session = `${splittedDate[0]}-${Number(splittedDate[0]) + 1}`;
//     } else if (Number(splittedDate[1]) < 9) {
//       academic_session = `${Number(splittedDate[0]) - 1}-${splittedDate[0]}`;
//     }
//   } else {
//     if (activeSession || checkSession.is_active === true) {
//       throw new AppError(
//         'A new session can only be created when there is no active session.',
//         400
//       );
//     }
//     const sessionArray = checkSession?.academic_session.split('-');

//     if (!sessionArray) {
//       throw new AppError(
//         'this session does not have academic session field.',
//         400
//       );
//     }

//     academic_session = `${sessionArray[1]}-${Number(sessionArray[1]) + 1}`;
//   }

//   const response = await new Session({
//     academic_session: academic_session,
//     is_active: true,
//   }).save();

//   return response;
// };

// const creatingNewTerm = async (
//   payload: TermCreationType
// ): Promise<{ session: SessionDocument; term: TermDocument }> => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     const { session_id, name, start_date, end_date } = payload;

//     const response = await Session.findById({
//       _id: session_id,
//     }).session(session);

//     if (!response) {
//       throw new AppError('Session can not be found', 404);
//     }

//     if (response.is_active !== true) {
//       throw new AppError(
//         'You can only create term under an active session',
//         404
//       );
//     }

//     if (response.terms.some((term) => term.name === name)) {
//       throw new AppError(`${name} already exists in the session`, 400);
//     }

//     if (response.terms.some((term) => term.is_active === true)) {
//       throw new AppError(
//         'An active term needed to be ended before you can create new term.',
//         400
//       );
//     }

//     if (name === 'second_term') {
//       const firstTerm = response.terms.find(
//         (term) => term.name === 'first_term'
//       );
//       if (!firstTerm) {
//         throw new AppError(
//           'You must create first term before you can create second term.',
//           400
//         );
//       }
//     }

//     if (name === 'third_term') {
//       const firstTerm = response.terms.find(
//         (term) => term.name === 'first_term'
//       );
//       const secondTerm = response.terms.find(
//         (term) => term.name === 'second_term'
//       );

//       if (!firstTerm || !secondTerm) {
//         throw new AppError(
//           'You must create first term and second term before you can create third term.',
//           400
//         );
//       }
//     }

//     response.terms.push({
//       name,
//       start_date: new Date(start_date),
//       end_date: new Date(end_date),
//       is_active: true,
//     });

//     const newTerm = response?.terms?.find((term) => term?.name === name);

//     if (!newTerm) {
//       throw new AppError('Failed to create the new term.', 400);
//     }

//     console.log('response', response);
//     console.log('start_date', start_date);
//     console.log('end_date', end_date);
//     console.log('DATE start_date', new Date(start_date));
//     console.log('DATE end_date', new Date(end_date));

//     await response.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     const responseObject = {
//       session: response,
//       term: newTerm,
//     };

//     return responseObject;
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened.');
//     }
//   }
// };

// const fetchAllSessions = async (
//   page: number | undefined,
//   limit: number | undefined,
//   searchParams: string
// ): Promise<{
//   session: SessionDocument[];
//   totalCount: number;
//   totalPages: number;
// }> => {
//   let query = Session.find();

//   if (searchParams) {
//     const regex = new RegExp(searchParams, 'i');

//     query = query.where({
//       $or: [{ academic_session: { $regex: regex } }],
//     });
//   }

//   if (!query) {
//     throw new AppError('Session not found.', 404);
//   }

//   const count = await query.clone().countDocuments();

//   let pages = 0;

//   if (page !== undefined && limit !== undefined && count !== 0) {
//     const offset = (page - 1) * limit;

//     query = query.skip(offset).limit(limit).sort({ createdAt: -1 });

//     pages = Math.ceil(count / limit);

//     if (page > pages) {
//       throw new AppError('Page limit exceeded.', 400);
//     }
//   }
//   const response = await query;
//   if (!response || response.length === 0) {
//     throw new AppError('Sessions not found.', 404);
//   }

//   const session = response as SessionDocument[];

//   return {
//     session,
//     totalPages: pages,
//     totalCount: count,
//   };
// };

// const fetchSessionBySessionId = async (
//   session_id: string
// ): Promise<SessionDocument> => {
//   const response = await Session.findById({
//     _id: session_id,
//   });

//   if (!response) {
//     throw new AppError('Session can not be found', 404);
//   }

//   return response as SessionDocument;
// };

// const sessionDeletionUsingSessionId = async (
//   session_id: string
// ): Promise<SessionDocument> => {
//   let response = await Session.findByIdAndDelete({
//     _id: session_id,
//   });

//   if (!response) {
//     throw new AppError('Session can not be deleted or found', 404);
//   }

//   return response as SessionDocument;
// };

// const sessionEndingBySessionId = async (
//   session_id: string
// ): Promise<SessionDocument> => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     let response = await Session.findOne({
//       _id: session_id,
//       is_active: true,
//     }).session(session);

//     if (!response) {
//       throw new AppError('Session can not be found', 404);
//     }

//     const activeTerm = response.terms.find((term) => term.is_active === true);

//     if (activeTerm) {
//       throw new AppError(
//         'Session can only end when first term, second term and third term has ended.',
//         400
//       );
//     } else {
//       response = await Session.findByIdAndUpdate(
//         {
//           _id: session_id,
//         },
//         {
//           $set: { is_active: false },
//         },
//         {
//           new: true,
//           session,
//         }
//       );

//       const allStudents = await Student.find().session(session);
//       if (!allStudents) {
//         throw new AppError('Students not found.', 404);
//       }

//       const bulkOps = allStudents.map((student) => ({
//         updateOne: {
//           filter: { _id: student._id },
//           update: {
//             $set: {
//               active_class_enrolment: false,
//               new_session_subscription: null,
//             },
//           },
//         },
//       }));

//       await Student.bulkWrite(bulkOps, { session });

//       // LETS CHANGE IS_ACTIVE ON CLASS ENROLMENTS FOR THE SESSION TO FALSE
//       const allSessionEnrolments = await ClassEnrolment.find({
//         academic_session_id: response?._id,
//       }).session(session);

//       const bulkSecUps = allSessionEnrolments.map((session) => ({
//         updateOne: {
//           filter: { academic_session_id: session._id },
//           update: {
//             $set: {
//               is_active: false,
//             },
//           },
//         },
//       }));

//       await ClassEnrolment.bulkWrite(bulkSecUps, { session });
//     }

//     /**
//      WE ALSO NEED TO CHANGE IS_ACTIVE ON ALL CLASS ENROLMENTS FOR THE SESSION TO FALSE
//      WE ALSO NEED TO CHANGE NEW SESSION SUBSCRIPTION TO FALSE
//      *  */

//     // GET ALL SSS 3 STUDENTS AND MOVE THEM TO THE OLD STUDENT DOCUMENT
//     const newOldStudents = await moveStudentToOldStudent(session);
//     await session.commitTransaction();
//     session.endSession();

//     return response as SessionDocument;
//   } catch (error) {
//     if (error instanceof AppError) {
//       session.abortTransaction();
//       session.endSession();
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened');
//     }
//   }
// };

// const termDeletionInSessionUsingTermId = async (
//   session_id: string,
//   term_id: string
// ): Promise<{ session: SessionDocument; term_name: string }> => {
//   let response = await Session.findOne({
//     _id: session_id,
//   });

//   if (!response) {
//     throw new AppError('Session can not be found', 404);
//   }

//   const activeTerm = response.terms.find(
//     (term) => term._id?.toString() === term_id
//   );

//   if (!activeTerm) {
//     throw new AppError('Term does not exist', 400);
//   }

//   const remainingTerms = response.terms.filter(
//     (term) => term._id?.toString() !== term_id
//   );

//   response.terms = remainingTerms;
//   await response.save();

//   const responseObject = {
//     session: response as SessionDocument,
//     term_name: activeTerm.name,
//   };
//   console.log('responseObject', responseObject);

//   return responseObject;
// };

// const termEndingInSessionUsingTermId = async (
//   session_id: string,
//   term_id: string
// ): Promise<{ session: SessionDocument; term_name: string }> => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     let response = await Session.findOne({
//       _id: session_id,
//       is_active: true,
//     }).session(session);

//     if (!response) {
//       throw new AppError('Session can not be found', 404);
//     }

//     const activeTerm = response.terms.find(
//       (term) => term._id?.toString() === term_id
//     );

//     if (!activeTerm) {
//       throw new AppError('This term is not active or has already ended.', 400);
//     }

//     const currentTime = Date.now();
//     if (activeTerm.is_active === false) {
//       throw new AppError(
//         'This term is not active or has already been ended.',
//         400
//       );
//     }

//     if (currentTime < new Date(activeTerm?.end_date).getTime()) {
//       throw new AppError(
//         'Term can only be ended after the last day of the term.',
//         400
//       );
//     }

//     response = await Session.findOneAndUpdate(
//       { _id: session_id, 'terms._id': term_id },
//       { $set: { 'terms.$.is_active': false } },
//       { new: true, session }
//     );

//     if (!response) {
//       throw new AppError('Unable to end term', 400);
//     }

//     if (activeTerm.name === 'third_term') {
//       // const endSession = await sessionEndingBySessionId(session_id)
//       response = await Session.findByIdAndUpdate(
//         { _id: session_id },
//         { $set: { is_active: false } },
//         { new: true, session }
//       );

//       const allStudents = await Student.find().session(session);
//       if (!allStudents) {
//         throw new AppError('Students not found.', 404);
//       }

//       const bulkOps = allStudents.map((student) => ({
//         updateOne: {
//           filter: { _id: student._id },
//           update: {
//             $set: {
//               active_class_enrolment: false,
//               new_session_subscription: null,
//             },
//           },
//         },
//       }));

//       const allSessionEnrolments = await ClassEnrolment.find({
//         academic_session_id: response?._id,
//       }).session(session);

//       const bulkSecUps = allSessionEnrolments.map((session) => ({
//         updateOne: {
//           filter: { academic_session_id: session._id },
//           update: {
//             $set: {
//               is_active: false,
//             },
//           },
//         },
//       }));

//       // GET ALL SSS 3 STUDENTS AND MOVE THEM TO THE OLD STUDENT DOCUMENT
//       const newOldStudents = await moveStudentToOldStudent(session);

//       await ClassEnrolment.bulkWrite(bulkSecUps, { session });

//       await Student.bulkWrite(bulkOps, { session });
//     }

//     const responseObject = {
//       session: response as SessionDocument,
//       term_name: activeTerm.name,
//     };

//     // CALCULATE TERM OUTSTANDING PAYMENT HERE
//     await calculateOutStandingPerTerm(
//       session,
//       session_id,
//       responseObject.term_name
//     );

//     // NOTIFICATION MAIL AND IN-APP NOTIFICATION CAN BE SENT TO STUDENT AND PARENTS HERE

//     console.log('responseObject', responseObject);

//     await session.commitTransaction();
//     session.endSession();

//     return responseObject;
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Someting happened');
//     }
//   }
// };

// const fetchActiveSession = async (): Promise<SessionDocument> => {
//   try {
//     const activeSession = await Session.findOne({
//       is_active: true,
//     });

//     console.log('activeSession', activeSession);

//     if (!activeSession) {
//       throw new AppError('There is no active session at the moment.', 404);
//     }

//     return activeSession as SessionDocument;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened.');
//     }
//   }
// };

// export {
//   fetchActiveSession,
//   sessionDeletionUsingSessionId,
//   termDeletionInSessionUsingTermId,
//   fetchAllSessions,
//   termEndingInSessionUsingTermId,
//   createSession,
//   creatingNewTerm,
//   fetchSessionBySessionId,
//   sessionEndingBySessionId,
// };

///////////////////////////////////////////////////////////
import mongoose from 'mongoose';
import {
  SessionDocument,
  TermCreationType,
  TermDocument,
} from '../constants/types';
import Session from '../models/session.model';
import { AppError } from '../utils/app.error';
import Student from '../models/students.model';
import ClassEnrolment from '../models/classes_enrolment.model';
import { calculateOutStandingPerTerm } from '../repository/student.repository';
import Fee from '../models/fees.model';

const createSession = async (): Promise<SessionDocument> => {
  const checkSession = await Session.findOne().sort({
    createdAt: -1,
  });

  console.log("checkSession:", checkSession)

  let academic_session;

  const activeSession = await Session.findOne({
    is_active: true,
  });

  if (!checkSession) {
    const currentDate = new Date();
    const splittedDate = currentDate.toISOString().split('-');
    if (Number(splittedDate[1]) >= 9) {
      academic_session = `${splittedDate[0]}-${Number(splittedDate[0]) + 1}`;
    } else if (Number(splittedDate[1]) < 9) {
      academic_session = `${Number(splittedDate[0]) - 1}-${splittedDate[0]}`;
    }
  } else {
    if (activeSession || checkSession.is_active === true) {
      throw new AppError(
        'A new session can only be created when there is no active session.',
        400
      );
    }
    const sessionArray = checkSession?.academic_session.split('-');

    if (!sessionArray) {
      throw new AppError(
        'this session does not have academic session field.',
        400
      );
    }

    academic_session = `${sessionArray[1]}-${Number(sessionArray[1]) + 1}`;
  }

  const response = await new Session({
    academic_session: academic_session,
    is_active: true,
  }).save();

  console.log('response:', response);

  return response;
};

const creatingNewTerm = async (
  payload: TermCreationType
): Promise<{ session: SessionDocument; term: TermDocument }> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { session_id, name, start_date, end_date } = payload;

    const response = await Session.findById({
      _id: session_id,
    }).session(session);

    if (!response) {
      throw new AppError('Session can not be found', 404);
    }

    if (response.is_active !== true) {
      throw new AppError(
        'You can only create term under an active session',
        404
      );
    }

    if (response.terms.some((term) => term.name === name)) {
      throw new AppError(`${name} already exists in the session`, 400);
    }

    if (response.terms.some((term) => term.is_active === true)) {
      throw new AppError(
        'An active term needed to be ended before you can create new term.',
        400
      );
    }

    // THIS IS NEEDED WHEN PAYMENT IS ENABLED
    // const feeDocExist = await Fee.findOne({
    //   school: school,
    //   academic_session_id: response._id,
    //   term: name,
    // });

    // console.log('feeDocExist:', feeDocExist);

    // if (!feeDocExist) {
    //   throw new AppError(
    //     'Please create fee document for all levels in the school before proceeding.',
    //     400
    //   );
    // }

    if (name === 'second_term') {
      const firstTerm = response.terms.find(
        (term) => term.name === 'first_term'
      );
      if (!firstTerm) {
        throw new AppError(
          'You must create first term before you can create second term.',
          400
        );
      }
    }

    if (name === 'third_term') {
      const firstTerm = response.terms.find(
        (term) => term.name === 'first_term'
      );
      const secondTerm = response.terms.find(
        (term) => term.name === 'second_term'
      );

      if (!firstTerm || !secondTerm) {
        throw new AppError(
          'You must create first term and second term before you can create third term.',
          400
        );
      }
    }

    response.terms.push({
      name,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      is_active: true,
    });

    const newTerm = response?.terms?.find((term) => term?.name === name);

    if (!newTerm) {
      throw new AppError('Failed to create the new term.', 400);
    }

    console.log('response', response);
    console.log('start_date', start_date);
    console.log('end_date', end_date);
    console.log('DATE start_date', new Date(start_date));
    console.log('DATE end_date', new Date(end_date));

    await response.save({ session });

    await session.commitTransaction();
    session.endSession();

    const responseObject = {
      session: response,
      term: newTerm,
    };

    return responseObject;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened.');
    }
  }
};

const termEndingInSessionUsingTermId = async (
  session_id: string,
  term_id: string
): Promise<{ session: SessionDocument; term_name: string }> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let response = await Session.findOne({
      _id: session_id,
      is_active: true,
    }).session(session);

    console.log('response 1:', response);

    if (!response) {
      throw new AppError('Session can not be found', 404);
    }

    const activeTerm = response.terms.find(
      (term) => term._id?.toString() === term_id
    );

    console.log('activeTerm:', activeTerm);

    if (!activeTerm) {
      throw new AppError('This term is not active or has already ended.', 400);
    }

    const currentTime = Date.now();
    if (activeTerm.is_active === false) {
      throw new AppError(
        'This term is not active or has already been ended.',
        400
      );
    }

    if (currentTime < new Date(activeTerm?.end_date).getTime()) {
      throw new AppError(
        'Term can only be ended after the last day of the term.',
        400
      );
    }

    response = await Session.findOneAndUpdate(
      { _id: session_id, 'terms._id': term_id },
      { $set: { 'terms.$.is_active': false } },
      { new: true, session }
    );

    console.log('updating session:', response);

    if (!response) {
      throw new AppError('Unable to end term', 400);
    }

    if (activeTerm.name === 'third_term') {
      response = await Session.findOneAndUpdate(
        { _id: session_id },
        { $set: { is_active: false } },
        { new: true, session }
      );

      const allStudents = await Student.find().session(session);
      if (!allStudents) {
        throw new AppError('Students not found.', 404);
      }

      const bulkOps = allStudents.map((student) => ({
        updateOne: {
          filter: { _id: student._id },
          update: {
            $set: {
              active_class_enrolment: false,
              new_session_subscription: null,
            },
          },
        },
      }));

      const allSessionEnrolments = await ClassEnrolment.find({
        academic_session_id: response?._id,
      }).session(session);

      const bulkSecUps = allSessionEnrolments.map((session) => ({
        updateOne: {
          filter: { academic_session_id: session._id },
          update: {
            $set: {
              is_active: false,
            },
          },
        },
      }));

      await ClassEnrolment.bulkWrite(bulkSecUps, { session });

      await Student.bulkWrite(bulkOps, { session });
    }

    const responseObject = {
      session: response as SessionDocument,
      term_name: activeTerm.name,
    };

    // CALCULATE TERM OUTSTANDING PAYMENT HERE
    // await calculateOutStandingPerTerm(
    //   session,
    //   session_id,
    //   responseObject.term_name,
    //   school
    // );

    // NOTIFICATION MAIL AND IN-APP NOTIFICATION CAN BE SENT TO STUDENT AND PARENTS HERE

    console.log('responseObject', responseObject);

    await session.commitTransaction();
    session.endSession();

    return responseObject;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Someting happened');
    }
  }
};

const fetchSessionBySessionId = async (
  session_id: string
): Promise<SessionDocument> => {
  const response = await Session.findById({
    _id: session_id,
  });

  console.log('response:', response);

  if (!response) {
    throw new AppError('Session can not be found', 404);
  }

  return response as SessionDocument;
};

const fetchActiveSession = async (): Promise<SessionDocument> => {
  try {
    const activeSession = await Session.findOne({
      is_active: true,
    });

    console.log('activeSession', activeSession);

    if (!activeSession) {
      throw new AppError('There is no active session at the moment.', 404);
    }

    return activeSession as SessionDocument;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened.');
    }
  }
};

const fetchAllSessions = async (
  page: number | undefined,
  limit: number | undefined,
  searchParams: string
): Promise<{
  session: SessionDocument[];
  totalCount: number;
  totalPages: number;
}> => {
  let query = Session.find();

  if (searchParams) {
    const regex = new RegExp(searchParams, 'i');

    query = query.where({
      $or: [{ academic_session: { $regex: regex } }],
    });
  }

  if (!query) {
    throw new AppError('Session not found.', 404);
  }

  const count = await query.clone().countDocuments();

  let pages = 0;

  if (page !== undefined && limit !== undefined && count !== 0) {
    const offset = (page - 1) * limit;

    query = query.skip(offset).limit(limit).sort({ createdAt: -1 });

    pages = Math.ceil(count / limit);

    if (page > pages) {
      throw new AppError('Page limit exceeded.', 400);
    }
  }
  const response = await query;
  if (!response || response.length === 0) {
    throw new AppError('Sessions not found.', 404);
  }

  const session = response as SessionDocument[];

  return {
    session,
    totalPages: pages,
    totalCount: count,
  };
};

const sessionEndingBySessionId = async (
  session_id: string
): Promise<SessionDocument> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let response = await Session.findOne({
      _id: session_id,
      is_active: true,
    }).session(session);

    if (!response) {
      throw new AppError('Session can not be found', 404);
    }

    const activeTerm = response.terms.find((term) => term.is_active === true);

    if (activeTerm) {
      throw new AppError(
        'Session can only end when first term, second term and third term has ended.',
        400
      );
    } else {
      response = await Session.findByIdAndUpdate(
        {
          _id: session_id,
        },
        {
          $set: { is_active: false },
        },
        {
          new: true,
          session,
        }
      );

      const allStudents = await Student.find().session(session);
      if (!allStudents) {
        throw new AppError('Students not found.', 404);
      }

      const bulkOps = allStudents.map((student) => ({
        updateOne: {
          filter: { _id: student._id },
          update: {
            $set: {
              active_class_enrolment: false,
              new_session_subscription: null,
            },
          },
        },
      }));

      await Student.bulkWrite(bulkOps, { session });

      // LETS CHANGE IS_ACTIVE ON CLASS ENROLMENTS FOR THE SESSION TO FALSE
      const allSessionEnrolments = await ClassEnrolment.find({
        academic_session_id: response?._id,
      }).session(session);

      const bulkSecUps = allSessionEnrolments.map((session) => ({
        updateOne: {
          filter: { academic_session_id: session._id },
          update: {
            $set: {
              is_active: false,
            },
          },
        },
      }));

      await ClassEnrolment.bulkWrite(bulkSecUps, { session });
    }

    /**
     WE ALSO NEED TO CHANGE IS_ACTIVE ON ALL CLASS ENROLMENTS FOR THE SESSION TO FALSE
     WE ALSO NEED TO CHANGE NEW SESSION SUBSCRIPTION TO FALSE
     *  */

    await session.commitTransaction();
    session.endSession();

    return response as SessionDocument;
  } catch (error) {
    if (error instanceof AppError) {
      session.abortTransaction();
      session.endSession();
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const sessionDeletionUsingSessionId = async (
  session_id: string
): Promise<SessionDocument> => {
  try {
    let response = await Session.findByIdAndDelete({
      _id: session_id,
    });

    if (!response) {
      throw new AppError('Session can not be deleted or found', 404);
    }

    return response as SessionDocument;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const termDeletionInSessionUsingTermId = async (
  session_id: string,
  term_id: string
): Promise<{ session: SessionDocument; term_name: string }> => {
  try {
    let response = await Session.findOne({
      _id: session_id,
    });

    if (!response) {
      throw new AppError('Session can not be found', 404);
    }

    const activeTerm = response.terms.find(
      (term) => term._id?.toString() === term_id
    );

    if (!activeTerm) {
      throw new AppError('Term does not exist', 400);
    }

    const remainingTerms = response.terms.filter(
      (term) => term._id?.toString() !== term_id
    );

    response.terms = remainingTerms;
    await response.save();

    const responseObject = {
      session: response as SessionDocument,
      term_name: activeTerm.name,
    };
    console.log('responseObject', responseObject);

    return responseObject;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

export {
  termDeletionInSessionUsingTermId,
  sessionDeletionUsingSessionId,
  sessionEndingBySessionId,
  fetchAllSessions,
  fetchActiveSession,
  fetchSessionBySessionId,
  createSession,
  creatingNewTerm,
  termEndingInSessionUsingTermId,
};
