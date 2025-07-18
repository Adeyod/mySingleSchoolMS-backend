import mongoose, { ClientSession, ObjectId } from 'mongoose';
import {
  AccountType,
  ClassDocument,
  FeePayloadType,
  MandatoryFeeProcessingType,
  OptionalFeeProcessingType,
  SchoolFeesDocument,
} from '../constants/types';
import Fee from '../models/fees.model';
import Class from '../models/class.model';
import { AppError } from '../utils/app.error';
import Session from '../models/session.model';

const getLevelFeeDoc = async (
  uniqueClassLevel: ClassDocument[],
  term: string,
  academic_session_id: mongoose.Types.ObjectId,
  session: mongoose.ClientSession
) => {
  const feeDocs = await Promise.all(
    uniqueClassLevel.map(async (l) => {
      return await Fee.findOne({
        level: l.level,
        term: term,
        academic_session_id: academic_session_id,
      }).session(session);
    })
  );

  return feeDocs.filter((fee) => fee !== null);
};

const createFeeDoc = async (
  fee_array: FeePayloadType[],
  term: string,
  activeSession: mongoose.Types.ObjectId,
  receivingAccount: mongoose.Types.ObjectId,
  session: mongoose.ClientSession
) => {
  return await Promise.all(
    fee_array.map(async (fee) => {
      const feeData = {
        level: fee.class_level,
        mandatory_fees: {
          fee_name: 'school_fee',
          amount: fee.amount,
          receiving_account: receivingAccount,
        },
        term: term,
        academic_session_id: activeSession,
        class_specific_fees: [],
      };
      const response = new Fee(feeData);

      const savedResponse = await response.save({ session });
      const plainObject = savedResponse.toJSON();
      return plainObject;
    })
  );
};

const fetchClassLevels = async (
  applicable_classes: ObjectId[],
  session: mongoose.ClientSession
) => {
  const classLevels = await Promise.all(
    applicable_classes.map((classId) =>
      Class.findOne({ _id: classId }).session(session)
    )
  );

  return classLevels.filter((classDoc) => classDoc !== null);
};

const mySchoolClasses = async (session: mongoose.ClientSession) => {
  try {
    const academicSession = await Session.findOne({
      is_active: true,
    }).session(session);

    if (!academicSession) {
      throw new AppError(
        'There is no active session. Please create one to proceed.',
        400
      );
    }

    const schoolClasses = await Class.find({}).session(session);

    const schoolObj = {
      schoolClasses,
      academicSession,
    };

    return schoolObj;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

const optionalFeeProcessing = async (
  payload: OptionalFeeProcessingType,
  session: mongoose.ClientSession
) => {
  const {
    uniqueClasses,
    fee_name,
    amount,
    term,
    academic_session_id,
    receiving_acc_id,
  } = payload;
  try {
    // Group classes by level
    const levelClassMap = uniqueClasses.reduce((acc, c) => {
      if (!acc[c.level]) {
        acc[c.level] = [];
      }
      acc[c.level].push(new mongoose.Types.ObjectId(String(c._id))); // Collect class IDs for the level
      return acc;
    }, {} as Record<string, mongoose.Types.ObjectId[]>); // Object mapping level -> class IDs

    return Promise.all(
      Object.entries(levelClassMap).map(async ([level, classIds]) => {
        console.log(`Processing Level: ${level}, Classes:`, classIds);

        const receiving_account = receiving_acc_id;

        const optionalFeeObj = {
          fee_name,
          amount,
          applicable_classes: classIds,
          receiving_account,
        };

        console.log(
          'Optional Fee Object before storing:',
          JSON.stringify(optionalFeeObj, null, 2)
        );

        const existingFee = await Fee.findOne({
          level,
          term,
          academic_session_id: academic_session_id,
        }).session(session);

        if (!existingFee) {
          console.log(`No fee document found for level: ${level}`);
          return null;
        }

        const feeExists = existingFee.optional_fees.some(
          (fee: any) => fee.fee_name === fee_name
        );

        if (feeExists) {
          console.log(`Fee '${fee_name}' already exists for level: ${level}`);
          return null;
        }

        return Fee.findOneAndUpdate(
          {
            level,
            term,
            academic_session_id: academic_session_id,
          },
          { $push: { optional_fees: optionalFeeObj } },
          { new: true, session }
        );
      })
    ).then((feeDocs) => feeDocs.filter((doc) => doc !== null));
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

const mandatoryFeeProcessing = async (payload: MandatoryFeeProcessingType) => {
  const {
    gLevels,
    fee_name,
    amount,
    termName,
    academic_session_id,
    session,
    receiving_acc_id,
  } = payload;
  try {
    const receiving_account = Object(receiving_acc_id);
    return Promise.all(
      gLevels.map(async (g) => {
        const mandatoryFeeObj = {
          fee_name,
          amount,
          receiving_account,
        };

        console.log('g', g);

        console.log(
          'Mandatory Fee Object before storing:',
          JSON.stringify(mandatoryFeeObj, null, 2)
        );

        const existingFee = await Fee.findOne({
          level: g.level,
          term: termName,
          academic_session_id: academic_session_id,
        }).session(session);

        if (!existingFee) {
          console.log(`No fee document found for level: ${g}`);
          return null;
        }

        const feeExists = existingFee.mandatory_fees.some(
          (fee: any) => fee.fee_name === fee_name
        );

        if (feeExists) {
          console.log(`Fee '${fee_name}' already exists for level: ${g}`);
          return null;
        }

        return Fee.findOneAndUpdate(
          {
            level: g.level,
            term: termName,
            academic_session_id: academic_session_id,
          },
          { $push: { mandatory_fees: mandatoryFeeObj } },
          { new: true, session }
        );
      })
    ).then((feeDocs) => feeDocs.filter((doc) => doc !== null));
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export {
  mandatoryFeeProcessing,
  optionalFeeProcessing,
  mySchoolClasses,
  getLevelFeeDoc,
  createFeeDoc,
  fetchClassLevels,
};
