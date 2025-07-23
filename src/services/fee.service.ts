// import {
//   SchoolBusDocument,
//   SchoolBusPayloadType,
//   SchoolFeesDocument,
// } from '../constants/types';
// import Class from '../models/class.model';
// import Fee from '../models/fees.model';
// import GeneralFee from '../models/general_fee.model';
// import { AppError } from '../utils/app.error';

// const schoolFeesCreation = async (
//   class_level: string,
//   amount: number
// ): Promise<SchoolFeesDocument> => {
//   try {
//     const existSchoolFees = await Fee.findOne({
//       level: class_level,
//     });

//     if (existSchoolFees) {
//       throw new AppError('This level already have existing school fees.', 400);
//     }

//     const getAllSections = await Class.find({
//       level: class_level,
//     });

//     // const filterArms = getAllSections.filter((section) =>
//     //   arms.includes(section.section)
//     // );

//     // console.log('filterArms:', filterArms);

//     const feeData = {
//       level: class_level,
//       school_fees: amount,
//       // applicable_classes: filterArms.map((section) => section._id),
//       class_specific_fees: [],
//     };

//     const response = new Fee(feeData);
//     const savedResponse = await response.save();
//     const plainObject = savedResponse.toJSON();

//     return plainObject as unknown as SchoolFeesDocument;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(`${error.message}`, error.statusCode);
//     } else {
//       console.error(error);
//       throw new Error('Something went wrong');
//     }
//   }
// };

// const schoolBusFeeCreation = async (
//   payload: SchoolBusPayloadType
// ): Promise<SchoolBusDocument> => {
//   try {
//     const existSchoolBusFees = await GeneralFee.find();

//     if (existSchoolBusFees.length > 0) {
//       throw new AppError('There is an existing school bus fee.', 400);
//     }

//     const response = await new GeneralFee({
//       school_bus: {
//         close_group: payload.close_group,
//         far_group: payload.far_group,
//       },
//     }).save();

//     return response as SchoolBusDocument;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(`${error.message}`, error.statusCode);
//     } else {
//       console.error(error);
//       throw new Error('Something went wrong');
//     }
//   }
// };

// const schoolBusFeeUpdating = async (
//   payload: SchoolBusPayloadType
// ): Promise<SchoolBusDocument> => {
//   try {
//     const updatingSchoolBusFees = await GeneralFee.findByIdAndUpdate(
//       { _id: payload.id },
//       {
//         school_bus: {
//           close_group: payload.close_group,
//           far_group: payload.far_group,
//         },
//       },
//       { new: true }
//     );

//     if (!updatingSchoolBusFees) {
//       throw new AppError('Unable to update school bus fee.', 400);
//     }

//     return updatingSchoolBusFees as SchoolBusDocument;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(`${error.message}`, error.statusCode);
//     } else {
//       console.error(error);
//       throw new Error('Something went wrong');
//     }
//   }
// };

// const schoolFeesUpdating = async (
//   fee_id: string,
//   amount: number
// ): Promise<SchoolFeesDocument> => {
//   try {
//     const feeExists = await Fee.findByIdAndUpdate(
//       { _id: fee_id },
//       { school_fees: amount },
//       { new: true }
//     );

//     if (!feeExists) {
//       throw new AppError('Unable to update fee', 404);
//     }

//     return feeExists as unknown as SchoolFeesDocument;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something went wrong');
//     }
//   }
// };

// const fetchAllSchoolFees = async (): Promise<SchoolFeesDocument[]> => {
//   try {
//     const response = await Fee.find();
//     if (!response || response.length === 0) {
//       throw new AppError('No Fee found', 404);
//     }

//     const responseResult = response.map(
//       (doc) => doc.toJSON() as unknown as SchoolFeesDocument
//     );

//     return responseResult;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something went wrong');
//     }
//   }
// };

// const fetchASchoolFee = async (
//   school_fee_id: string
// ): Promise<SchoolFeesDocument> => {
//   try {
//     const response = await Fee.findById({
//       _id: school_fee_id,
//     });

//     if (!response) {
//       throw new AppError('No Fee found', 404);
//     }

//     const responseObj = response.toJSON();

//     return responseObj as unknown as SchoolFeesDocument;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something went wrong');
//     }
//   }
// };

// const fetchSchoolBusByGroup = async (
//   group: string
// ): Promise<SchoolBusDocument> => {
//   try {
//     const response = await GeneralFee.findOne().select(`school_bus.${group}`);

//     if (!response) {
//       throw new AppError('Bus Fee not found', 404);
//     }

//     const responseObj = response.toJSON();

//     return responseObj as unknown as SchoolBusDocument;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something went wrong');
//     }
//   }
// };
// const fetchSchoolBus = async (): Promise<SchoolBusDocument> => {
//   try {
//     const response = await GeneralFee.findOne();

//     if (!response) {
//       throw new AppError('Bus Fee not found', 404);
//     }

//     const responseObj = response.toJSON();

//     return responseObj as unknown as SchoolBusDocument;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something went wrong');
//     }
//   }
// };

// export {
//   fetchSchoolBus,
//   fetchSchoolBusByGroup,
//   fetchASchoolFee,
//   fetchAllSchoolFees,
//   schoolFeesCreation,
//   schoolBusFeeCreation,
//   schoolFeesUpdating,
//   schoolBusFeeUpdating,
// };

///////////////////////////////////////////////
import mongoose, { ObjectId, Types } from 'mongoose';
import {
  AccountType,
  FeePayloadType,
  MandatoryFeePayloadType,
  MandatoryFeeType,
  OptionalFeeAdditionType,
  OptionalFeePayloadType,
  OptionalFeeProcessingType,
  OptionalFeeType,
  SchoolFeesDocument,
} from '../constants/types';
import Fee from '../models/fees.model';
import Payment from '../models/payment.model';
import Session from '../models/session.model';
import { AppError } from '../utils/app.error';
import { capitalizeFirstLetter, schoolClassLevels } from '../utils/functions';
import {
  createFeeDoc,
  fetchClassLevels,
  getLevelFeeDoc,
  mandatoryFeeProcessing,
  mySchoolClasses,
  optionalFeeProcessing,
} from '../repository/fee.repository';
import {
  mandatoryFeeAdditionToPaymentDocuments,
  optionalFeeAdditionToPaymentDocuments,
} from '../repository/payment.repository';
import SchoolAccount from '../models/school_account.model';
import { maxSchoolAccountNumbers } from '../utils/code';

// this is for creating school fees
const schoolFeesCreation = async (
  fee_array: FeePayloadType[],
  receiving_acc_id: string
): Promise<SchoolFeesDocument[]> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const receivingAccount = new mongoose.Types.ObjectId(receiving_acc_id);

    // console.log('fee_array:', fee_array);
    // console.log('receivingAccount:', receivingAccount);

    const schoolAccountExist = await SchoolAccount.findOne(
      {
        'accounts._id': receivingAccount,
      },
      { 'accounts.$': 1 }
    ).session(session);

    console.log('schoolAccountExist:', schoolAccountExist);

    if (!schoolAccountExist) {
      throw new AppError(
        `Account number not found. Please choose account that exist or add this account to proceed.`,
        400
      );
    }

    const uniqueLevel = new Set();
    const duplicateLevel = new Set();

    fee_array.forEach((fee) => {
      const key = fee.class_level.toString();
      if (uniqueLevel.has(key)) {
        duplicateLevel.add(key);
      } else {
        uniqueLevel.add(key);
      }
    });

    if (duplicateLevel.size > 0) {
      throw new AppError(
        `Duplicate level fee found for: ${Array.from(duplicateLevel).join(
          ', '
        )}.`,
        400
      );
    }

    // const matchingAccountObj = schoolAccountExist.accounts.find(
    //   (a) => a._id.toString() === receivingAccount.toString()
    // );

    // // console.log('matchingAccountObj:', matchingAccountObj);

    // if (!matchingAccountObj) {
    //   throw new AppError(
    //     'This account is not part of the accounts that the school has with us.',
    //     400
    //   );
    // }

    /**
     * FIND ACTIVE ACADEMIC SESSION, IF NON THROW ERROR
     * IF THERE IS AN ACTIVE TERM, THROW ERROR:
     */

    const activeSession = await Session.findOne({
      is_active: true,
    }).session(session);

    if (!activeSession) {
      throw new AppError(
        'You can only create school fees in an active session before starting a new term.',
        400
      );
    }

    // console.log('activeSession:', activeSession);

    const activeTerm = activeSession.terms.find(
      (term) => term.is_active === true
    );

    let term: string = '';

    const terms = activeSession.terms.map((t) => t.name);

    console.log('terms:', terms);

    if (terms.length === 0) {
      term = 'first_term';
    } else if (terms.length === 1 && terms.includes('first_term')) {
      term = 'second_term';
    } else {
      term = 'third_term';
    }
    console.log('term:', term);

    console.log('activeTerm:', activeTerm);

    const paymentDocExist = await Payment.findOne({
      session: activeSession._id,
      term: term,
    }).session(session);

    // console.log('paymentDocExist:', paymentDocExist);
    if (activeTerm) {
      throw new AppError(
        'Fee documents can only be created when a term has ended.',
        400
      );
    }

    if (paymentDocExist) {
      throw new AppError(
        'You can only create school fees before creating payment document for the term.',
        400
      );
    }

    const existSchoolFees = async () => {
      const feeDocs = await Promise.all(
        fee_array.map(async (fee) => {
          return await Fee.findOne({
            level: fee.class_level,
            academic_session_id: activeSession._id,
            term: term,
          }).session(session);
        })
      );

      return feeDocs.filter((fee) => fee !== null);
    };

    const getFeeDocuments = await existSchoolFees();

    // console.log('getFeeDocuments:', getFeeDocuments);

    if (getFeeDocuments.length > 0) {
      throw new AppError(
        'School fees has already been created for this term.',
        400
      );
    }

    const feeCreated = await createFeeDoc(
      fee_array,
      term,
      activeSession._id,
      receivingAccount,
      session
    );

    // console.log('feeCreated:', feeCreated);
    await session.commitTransaction();
    session.endSession();

    return feeCreated as unknown as SchoolFeesDocument[];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw new AppError(`${error.message}`, error.statusCode);
    } else {
      console.error(error);
      throw new Error('Something went wrong');
    }
  }
};

const fetchAllSchoolFeesPerTerm = async (
  term: string,
  academic_session_id: string
): Promise<SchoolFeesDocument[]> => {
  try {
    const response = await Fee.find({
      academic_session_id: Object(academic_session_id),
      term: term,
    });

    if (!response || response.length === 0) {
      throw new AppError('No Fee found', 404);
    }

    const responseResult = response.map(
      (doc) => doc.toJSON() as unknown as SchoolFeesDocument
    );

    return responseResult;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

const fetchASchoolFee = async (
  school_fee_id: string
): Promise<SchoolFeesDocument> => {
  try {
    const response = await Fee.findOne({
      _id: school_fee_id,
    });

    if (!response) {
      throw new AppError('No Fee found', 404);
    }

    const responseObj = response.toJSON();

    return responseObj as unknown as SchoolFeesDocument;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

const fetchASchoolFeeByLevelAndTerm = async (
  academic_session_id: string,
  term: string
): Promise<SchoolFeesDocument> => {
  try {
    const response = await Fee.findOne({
      academic_session_id: academic_session_id,
      term: term,
    });

    if (!response) {
      throw new AppError('No Fee found', 404);
    }

    const responseObj = response.toJSON();

    return responseObj as unknown as SchoolFeesDocument;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

// this is for adding optional fees when term is yet to start
const optionalFeesCreation = async (
  payload: OptionalFeePayloadType
): Promise<SchoolFeesDocument[]> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { fee_name, applicable_classes, amount, receiving_acc_id } = payload;

    const schoolClasses = await mySchoolClasses(session);

    if (!schoolClasses) {
      throw new AppError('schools not found', 404);
    }

    const academicSession = schoolClasses.academicSession;

    const activeTerm = academicSession.terms.find((a) => a.is_active === true);

    console.log('activeTerm:', activeTerm);

    const duplicateClasses = new Set();
    const uniqueObj = new Set();

    applicable_classes.forEach((c) => {
      if (uniqueObj.has(c)) {
        duplicateClasses.add(c);
      } else {
        uniqueObj.add(c);
      }
    });

    console.log('duplicateClasses:', duplicateClasses);
    console.log('uniqueObj:', uniqueObj);

    if (duplicateClasses.size > 0) {
      throw new AppError(
        `Duplicate Classes found for: ${Array.from(duplicateClasses).join(
          ', '
        )}.`,
        400
      );
    }

    if (activeTerm) {
      throw new AppError(
        'Optional fees can only be created before the creation of a new term.',
        400
      );
    }

    let term: string = '';

    const terms = academicSession.terms.map((t) => t.name);

    if (terms.length === 0) {
      term = 'first_term';
    } else if (terms.length === 1 && terms.includes('first_term')) {
      term = 'second_term';
    } else {
      term = 'third_term';
    }

    const cLevels = await schoolClassLevels(schoolClasses.schoolClasses);
    console.log('cLevels:', cLevels);

    const gLevels = await getLevelFeeDoc(
      cLevels,
      term,
      academicSession._id,
      session
    );
    console.log('gLevels:', gLevels);

    if (gLevels.length !== cLevels.length) {
      throw new AppError(
        'Please create school fees for all levels before adding other fees.',
        400
      );
    }

    const uniqueClasses = await fetchClassLevels(applicable_classes, session);

    console.log('uniqueClasses:', uniqueClasses);

    const payload2: OptionalFeeProcessingType = {
      uniqueClasses,
      fee_name,
      amount,
      term,
      academic_session_id: academicSession._id,
      receiving_acc_id,
    };

    const updatedFee = await optionalFeeProcessing(payload2, session);

    // i think it will be better to check if there is any payment document for the class level and update such with the amount added.
    // I WILL ALSO NEED TO FETCH ALL THE PAYMENT DOCUMENT OF
    // STUDENTS AFFECTED BY THE FEE AND ADD IT TO THEIR
    // fees_breakdown AND ALSO ADD IT TO THEIR total_amount FOR THE
    // TERM. IF IT IS ALREADY ADDED, THEN I WONT ADD IT AGAIN TO
    // AVOID DUPLICATE.
    console.log('updatedFee:', updatedFee);

    if (updatedFee.length === 0) {
      throw new AppError(
        `${capitalizeFirstLetter(
          fee_name
        )} has already been saved in all applicable fee documents.`,
        400
      );
    }

    await session.commitTransaction();
    session.endSession();

    return updatedFee as unknown as SchoolFeesDocument[];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

// this is for adding optional fees when term is already active
const optionalFeesAddition = async (
  payload: OptionalFeePayloadType
): Promise<SchoolFeesDocument[]> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { fee_name, applicable_classes, amount, receiving_acc_id, term } =
      payload;

    const schoolClasses = await mySchoolClasses(session);

    if (!schoolClasses) {
      throw new AppError('schools not found', 404);
    }

    const academicSession = schoolClasses.academicSession;

    const activeTerm = academicSession.terms.find(
      (term) => term.is_active === true
    );

    if (!activeTerm) {
      throw new AppError(
        'There is no active term. Please create one to proceed.',
        400
      );
    }

    if (activeTerm.name !== term) {
      throw new AppError('Please choose an active term.', 400);
    }

    const cLevels = await schoolClassLevels(schoolClasses.schoolClasses);
    console.log('cLevels:', cLevels);

    const gLevels = await getLevelFeeDoc(
      cLevels,
      activeTerm.name,
      academicSession._id,
      session
    );
    console.log('gLevels:', gLevels);

    if (gLevels.length !== cLevels.length) {
      throw new AppError(
        'Please create school fees for all levels before adding other fees.',
        400
      );
    }

    const termPaymentDocExist = await Payment.find({
      session: academicSession._id,
      term: activeTerm.name,
    });

    console.log('termPaymentDocExist:', termPaymentDocExist);

    if (termPaymentDocExist.length === 0) {
      throw new AppError(
        'Please create payment document for students before proceeding.',
        400
      );
    }

    const uniqueClasses = await fetchClassLevels(applicable_classes, session);

    console.log('uniqueClasses:', uniqueClasses);

    const payload2: OptionalFeeProcessingType = {
      uniqueClasses,
      fee_name,
      amount,
      term: activeTerm.name,
      academic_session_id: academicSession._id,
      receiving_acc_id: receiving_acc_id,
    };

    const updatedFee = await optionalFeeProcessing(payload2, session);

    // i think it will be better to check if there is any payment document for the class level and update such with the amount added.
    // I WILL ALSO NEED TO FETCH ALL THE PAYMENT DOCUMENT OF
    // STUDENTS AFFECTED BY THE FEE AND ADD IT TO THEIR
    // fees_breakdown AND ALSO ADD IT TO THEIR total_amount FOR THE
    // TERM. IF IT IS ALREADY ADDED, THEN I WONT ADD IT AGAIN TO
    // AVOID DUPLICATE.
    console.log('updatedFee:', updatedFee);

    if (updatedFee.length === 0) {
      throw new AppError(
        `${capitalizeFirstLetter(
          fee_name
        )} has already been saved in all applicable fee documents.`,
        400
      );
    }

    // fetch the class enrolment for the id of the selected
    // classes for the session. then use the class IDs, enrolment
    // IDs, academic session IDs, school ID, term to fetch the
    // payment documents of all students affected and if the fee
    // had earlier been added, throw an error and if not, add.

    const paymentPayload = {
      applicable_classes,
      academic_session_id: academicSession._id,
      termName: activeTerm.name,
      session: session,
      fee_name: fee_name,
      amount: amount,
      receiving_acc_id: receiving_acc_id,
    };

    const addFeeToPaymentDocs = await optionalFeeAdditionToPaymentDocuments(
      paymentPayload
    );

    console.log('fee service optional fees addition:', addFeeToPaymentDocs);

    await session.commitTransaction();
    session.endSession();
    return updatedFee as unknown as SchoolFeesDocument[];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

// this is for adding mandatory fees when term is yet to start
const mandatoryFeesCreation = async (
  payload: MandatoryFeePayloadType
): Promise<SchoolFeesDocument[]> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { fee_name, amount, receiving_acc_id } = payload;

    // Get all the classes in the school
    const schoolClasses = await mySchoolClasses(session);

    const academicSession = schoolClasses.academicSession;

    let term: string = '';

    const terms = academicSession.terms.map((t) => t.name);

    if (terms.length === 0) {
      term = 'first_term';
    } else if (terms.length === 1 && terms.includes('first_term')) {
      term = 'second_term';
    } else {
      term = 'third_term';
    }

    const activeTerm = academicSession.terms.find(
      (term) => term.is_active === true
    );

    if (activeTerm) {
      throw new AppError(
        'Mandatory fees can only be created before the start of a new term.',
        400
      );
    }

    // Get all the levels in the school
    const cLevels = await schoolClassLevels(schoolClasses.schoolClasses);
    console.log('cLevels:', cLevels);

    // Get fee document for all the class levels in the school
    const gLevels = await getLevelFeeDoc(
      cLevels,
      term,
      academicSession._id,
      session
    );
    console.log('gLevels:', gLevels);

    if (gLevels.length !== cLevels.length) {
      throw new AppError(
        'Please create school fees for all levels before adding other fees.',
        400
      );
    }

    const termPaymentDocExist = await Payment.find({
      session: academicSession._id,
      term: term,
    });

    console.log('termPaymentDocExist:', termPaymentDocExist);

    if (termPaymentDocExist.length > 0) {
      throw new AppError(
        'Mandatory fees can only be created before payment document is created.',
        400
      );
    }

    // const findFeeDoc = async () => {
    //   return Promise.all(
    //     gLevels.map(async (g) => {
    //       const mandatoryFeeObj = {
    //         fee_name,
    //         amount,
    //       };

    //       console.log('g', g);

    //       console.log(
    //         'Mandatory Fee Object before storing:',
    //         JSON.stringify(mandatoryFeeObj, null, 2)
    //       );

    //       const existingFee = await Fee.findOne({
    //         school,
    //         level: g.level,
    //         term,
    //         academic_session_id: academicSession?._id,
    //       });

    //       if (!existingFee) {
    //         console.log(`No fee document found for level: ${g}`);
    //         return null;
    //       }

    //       const feeExists = existingFee.mandatory_fees.some(
    //         (fee: any) => fee.fee_name === fee_name
    //       );

    //       if (feeExists) {
    //         console.log(`Fee '${fee_name}' already exists for level: ${g}`);
    //         return null;
    //       }

    //       return Fee.findOneAndUpdate(
    //         {
    //           school,
    //           level: g.level,
    //           term,
    //           academic_session_id: academicSession?._id,
    //         },
    //         { $push: { mandatory_fees: mandatoryFeeObj } },
    //         { new: true }
    //       );
    //     })
    //   ).then((feeDocs) => feeDocs.filter((doc) => doc !== null));
    // };

    const feeProcessionPayload = {
      gLevels: gLevels,
      fee_name: fee_name,
      amount: amount,
      termName: term,
      academic_session_id: academicSession?._id,
      session: session,
      receiving_acc_id,
    };

    const updatedFee = await mandatoryFeeProcessing(feeProcessionPayload);
    // I WILL ALSO NEED TO FETCH ALL THE PAYMENT DOCUMENT OF
    // STUDENTS AFFECTED BY THE FEE AND ADD IT TO THEIR
    // fees_breakdown AND ALSO ADD IT TO THEIR total_amount FOR THE
    // TERM. IF IT IS ALREADY ADDED, THEN I WONT ADD IT AGAIN TO
    // AVOID DUPLICATE.
    console.log('updatedFee:', updatedFee);

    if (updatedFee.length === 0) {
      throw new AppError(
        `${capitalizeFirstLetter(
          fee_name
        )} has already been saved in all applicable fee documents.`,
        400
      );
    }

    await session.commitTransaction();
    session.endSession();

    return updatedFee as unknown as SchoolFeesDocument[];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

// this is for adding mandatory fees when term is yet to start
const mandatoryFeesAddition = async (
  payload: MandatoryFeePayloadType
): Promise<SchoolFeesDocument[]> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { fee_name, amount, term, receiving_acc_id } = payload;

    // Get all the classes in the school
    const schoolClasses = await mySchoolClasses(session);

    if (!schoolClasses) {
      throw new AppError('schools not found', 404);
    }

    const academicSession = schoolClasses.academicSession;

    const activeTerm = academicSession.terms.find(
      (term) => term.is_active === true
    );

    if (!activeTerm) {
      throw new AppError(
        'There is no active term. Please create one to proceed.',
        400
      );
    }

    if (activeTerm.name !== term) {
      throw new AppError('The term you specify is not the active term.', 400);
    }

    // Get all the levels in the school
    const cLevels = await schoolClassLevels(schoolClasses.schoolClasses);
    console.log('cLevels:', cLevels);

    // Get fee document for all the class levels in the school
    const gLevels = await getLevelFeeDoc(
      cLevels,
      term,
      academicSession._id,
      session
    );
    console.log('gLevels:', gLevels);

    if (gLevels.length !== cLevels.length) {
      throw new AppError(
        'Please create school fees for all levels before adding other fees.',
        400
      );
    }

    const feeProcessionPayload = {
      gLevels: gLevels,
      fee_name: fee_name,
      amount: amount,
      termName: term,
      academic_session_id: academicSession?._id,
      session: session,
      receiving_acc_id,
    };

    const updatedFee = await mandatoryFeeProcessing(feeProcessionPayload);

    // I WILL ALSO NEED TO FETCH ALL THE PAYMENT DOCUMENT OF
    // STUDENTS AFFECTED BY THE FEE AND ADD IT TO THEIR
    // fees_breakdown AND ALSO ADD IT TO THEIR total_amount FOR THE
    // TERM. IF IT IS ALREADY ADDED, THEN I WONT ADD IT AGAIN TO
    // AVOID DUPLICATE.
    console.log('updatedFee:', updatedFee);

    if (updatedFee.length === 0) {
      throw new AppError(
        `${capitalizeFirstLetter(
          fee_name
        )} has already been saved in all applicable fee documents.`,
        400
      );
    }

    const paymentPayload = {
      academic_session_id: academicSession._id,
      termName: term,
      session: session,
      fee_name: fee_name,
      amount: amount,
      receiving_acc_id,
    };

    const addFeeToPaymentDocs = await mandatoryFeeAdditionToPaymentDocuments(
      paymentPayload
    );

    console.log('fee service mandatory fees addition:', addFeeToPaymentDocs);

    await session.commitTransaction();
    session.endSession();

    return updatedFee as unknown as SchoolFeesDocument[];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

const fetchSchoolFees = async (
  page: number | undefined,
  limit: number | undefined,
  searchParams: string,
  session?: string,
  term?: string
): Promise<{
  feesArray: SchoolFeesDocument[];
  totalCount: number;
  totalPages: number;
}> => {
  try {
    let query = Fee.find();

    // return only school fees alone and when session or term or
    // both are passed as query, i should filter based on that

    if (searchParams) {
      const regex = new RegExp(searchParams, 'i');

      console.log('searchParams:', searchParams);

      query = query.where({
        $or: [
          { term: { $regex: regex } },
          { level: { $regex: regex } },
          {
            mandatory_fees: {
              $elemMatch: {
                $or: [{ fee_name: 'school_fees' }],
              },
            },
          },
        ],
      });
    }

    if (!query) {
      throw new AppError('Fees not found.', 404);
    }

    if (session && term) {
      query = query.where({ academic_session_id: Object(session), term: term });
    } else if (session) {
      console.log('session:', session);
      query = query.where({ academic_session_id: Object(session) });
    } else if (term) {
      query = query.where({ term: term });
    }

    const count = await query.clone().countDocuments();

    let pages = 0;

    if (page !== undefined && limit !== undefined && count !== 0) {
      const offset = (page - 1) * limit;

      query = query.skip(offset).limit(limit);

      pages = Math.ceil(count / limit);

      if (page > pages) {
        throw new AppError('Page can not be found', 404);
      }
    }

    if (limit === undefined && count !== 0) {
      limit = 10;
      pages = Math.ceil(count / limit);
    }

    const response = await query.sort({ createdAt: -1 });

    if (!response || response.length === 0) {
      throw new AppError('Fees not found.', 404);
    }

    const formattedSchoolFees = response.map((a) => {
      const docObject = a.toObject() as any;
      delete docObject.optional_fees;
      const school_fee = docObject.mandatory_fees.find(
        (b: MandatoryFeeType) => b.fee_name === 'school_fee'
      );
      delete docObject.mandatory_fees;
      const obj = {
        ...docObject,
        school_fee,
      };

      return obj;
    });

    console.log('formattedSchoolFees:', formattedSchoolFees);

    const feeDocs = response as SchoolFeesDocument[];

    return {
      feesArray: formattedSchoolFees,
      totalPages: pages,
      totalCount: count,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log('error:', error);
      throw new Error('Something went wrong');
    }
  }
};

const fetchAllMandatoryFees = async (
  page: number | undefined,
  limit: number | undefined,
  searchParams: string,
  session?: string,
  term?: string
): Promise<{
  feesArray: SchoolFeesDocument[];
  totalCount: number;
  totalPages: number;
}> => {
  try {
    let query = Fee.find();

    if (searchParams) {
      const regex = new RegExp(searchParams, 'i');

      console.log('searchParams:', searchParams);

      query = query.where({
        $or: [
          { term: { $regex: regex } },
          { level: { $regex: regex } },
          {
            mandatory_fees: {
              $elemMatch: {
                $or: [{ fee_name: { $ne: 'school_fee' } }],
              },
            },
          },
        ],
      });
    }

    if (!query) {
      throw new AppError('Fees not found.', 404);
    }

    if (session && term) {
      query = query.where({ academic_session_id: Object(session), term: term });
    } else if (session) {
      console.log('session:', session);
      query = query.where({ academic_session_id: Object(session) });
    } else if (term) {
      query = query.where({ term: term });
    }

    const count = await query.clone().countDocuments();

    let pages = 0;

    const response = await query.sort({ createdAt: -1 });

    if (!response || response.length === 0) {
      throw new AppError('Fees not found.', 404);
    }

    const formattedMandatoryFees = response
      .map((a) => {
        const docObject = a.toObject() as any;
        delete docObject.optional_fees;
        const otherMandatoryFees = docObject.mandatory_fees.filter(
          (b: MandatoryFeeType) => b.fee_name !== 'school_fee'
        );

        delete docObject.mandatory_fees;
        const mandatoryObjStructureManipulated = otherMandatoryFees.map(
          (a: MandatoryFeeType) => ({
            ...a,
            ...docObject,
          })
        );

        return mandatoryObjStructureManipulated;
      })
      .flat();

    const totalCount = formattedMandatoryFees.length;

    const totalPages =
      page !== undefined && limit !== undefined
        ? Math.ceil(totalCount / limit)
        : Math.ceil(totalCount / 10);

    console.log('totalPages:', totalPages);

    if (page && limit) {
      if (page > totalPages) {
        throw new AppError('Page can not be found.', 404);
      }

      const offset = (page - 1) * limit;
      const paginatedFees = formattedMandatoryFees.slice(
        offset,
        offset + limit
      );

      console.log('paginatedFees:', paginatedFees);

      return {
        feesArray: paginatedFees,
        totalPages,
        totalCount,
      };
    } else if (page) {
      if (page > totalPages) {
        throw new AppError('Page can not be found.', 404);
      }

      const offset = (page - 1) * 10;
      const paginatedFees = formattedMandatoryFees.slice(offset, offset + 10);

      console.log('paginatedFees:', paginatedFees);

      return {
        feesArray: paginatedFees,
        totalPages,
        totalCount,
      };
    }

    return {
      feesArray: formattedMandatoryFees,
      totalPages,
      totalCount,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log('error:', error);
      throw new Error('Something went wrong');
    }
  }
};

const fetchAllOptionalFees = async (
  page: number | undefined,
  limit: number | undefined,
  searchParams: string,
  session?: string,
  term?: string
): Promise<{
  feesArray: SchoolFeesDocument[];
  totalCount: number;
  totalPages: number;
}> => {
  try {
    let query = Fee.find();

    if (searchParams) {
      const regex = new RegExp(searchParams, 'i');

      query = query.where({
        $or: [
          { term: { $regex: regex } },
          { level: { $regex: regex } },
          {
            optional_fees: {
              $elemMatch: {
                $or: [{ fee_name: { $regex: regex } }],
              },
            },
          },
        ],
      });
    }

    if (!query) {
      throw new AppError('Fees not found.', 404);
    }

    if (session && term) {
      query = query.where({ academic_session_id: Object(session), term: term });
    } else if (session) {
      console.log('session:', session);
      query = query.where({ academic_session_id: Object(session) });
    } else if (term) {
      query = query.where({ term: term });
    }

    const count = await query.clone().countDocuments();

    const response = await query.sort({ createdAt: -1 });

    if (!response || response.length === 0) {
      throw new AppError('Fees not found.', 404);
    }

    const filteredResponse = response.filter(
      (a) => Array.isArray(a.optional_fees) && a.optional_fees.length > 0
    );

    const formattedOptionalFees = filteredResponse
      .map((a) => {
        const docObject = a.toObject() as any;
        delete docObject.mandatory_fees;

        const extractedOptionalFeesArray = docObject.optional_fees;
        delete docObject.optional_fees;

        const optionalObjStructureManipulated = extractedOptionalFeesArray.map(
          (a: OptionalFeeType) => ({
            ...a,
            ...docObject,
          })
        );

        return optionalObjStructureManipulated;
      })
      .flat();

    console.log('formattedOptionalFees:', formattedOptionalFees);

    const totalCount = formattedOptionalFees.length;

    const totalPages =
      page !== undefined && limit !== undefined
        ? Math.ceil(totalCount / limit)
        : Math.ceil(totalCount / 10);

    console.log('totalPages:', totalPages);

    if (page && limit) {
      if (page > totalPages) {
        throw new AppError('Page can not be found.', 404);
      }

      const offset = (page - 1) * limit;
      const paginatedFees = formattedOptionalFees.slice(offset, offset + limit);

      console.log('paginatedFees:', paginatedFees);

      return {
        feesArray: paginatedFees,
        totalPages,
        totalCount,
      };
    } else if (page) {
      if (page > totalPages) {
        throw new AppError('Page can not be found.', 404);
      }

      const offset = (page - 1) * 10;
      const paginatedFees = formattedOptionalFees.slice(offset, offset + 10);

      console.log('paginatedFees:', paginatedFees);

      return {
        feesArray: paginatedFees,
        totalPages,
        totalCount,
      };
    }

    return {
      feesArray: formattedOptionalFees,
      totalPages,
      totalCount,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log('error:', error);
      throw new Error('Something went wrong');
    }
  }
};

const fetchTermFees = async (academic_session_id: string, term: string) => {
  try {
    const result = await Fee.find({
      academic_session_id: academic_session_id,
      term: term,
    });

    if (!result || result.length === 0) {
      throw new AppError('School fees not found for this term.', 404);
    }

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

const fetchTermMandatoryFees = async (
  academic_session_id: string,
  term: string
) => {
  try {
    const result = await Fee.find({
      academic_session_id: academic_session_id,
      term: term,
    });

    if (!result || result.length === 0) {
      throw new AppError('School fees not found for this term.', 404);
    }

    const formattedMandatoryFees = result.map((a) => {
      const docObject = a.toObject() as any;
      delete docObject.optional_fees;
      return docObject;
    });

    return formattedMandatoryFees;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

const fetchTermOptionalFees = async (
  academic_session_id: string,
  term: string
) => {
  try {
    const result = await Fee.find({
      academic_session_id: academic_session_id,
      term: term,
    });

    if (!result || result.length === 0) {
      throw new AppError('School fees not found for this term.', 404);
    }

    const formattedOptionalFees = result.map((a) => {
      const docObject = a.toObject() as any;
      delete docObject.mandatory_fees;
      return docObject;
    });

    return formattedOptionalFees;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export {
  fetchTermMandatoryFees,
  fetchTermOptionalFees,
  fetchTermFees,
  fetchSchoolFees,
  mandatoryFeesAddition,
  optionalFeesAddition,
  optionalFeesCreation,
  fetchASchoolFeeByLevelAndTerm,
  fetchASchoolFee,
  fetchAllSchoolFeesPerTerm,
  schoolFeesCreation,
  mandatoryFeesCreation,
  fetchAllMandatoryFees,
  fetchAllOptionalFees,
};
