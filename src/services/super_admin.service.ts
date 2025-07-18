import {
  AccountObjectType,
  AccountType,
  AddingNegotiatedChargesType,
  CutoffMinutesCreationPayload,
} from '../constants/types';
import CbtCutoff from '../models/cbt_cutoffs.model';

import { AppError } from '../utils/app.error';

const cutoffMinutesCreation = async (payload: CutoffMinutesCreationPayload) => {
  try {
    const { first_cutoff_minutes, last_cutoff_minutes, school_id } = payload;
    const school = Object(school_id);

    const schoolExist = await School.findById({
      _id: school,
    });

    if (!schoolExist) {
      throw new AppError('School not found.', 404);
    }

    const cutoffExist = await CbtCutoff.findOne({
      school: schoolExist._id,
    });

    if (cutoffExist) {
      throw new AppError(
        `${schoolExist.school_name} already has cutoff recorded.`,
        400
      );
    }

    const newCutoff = new CbtCutoff({
      school: schoolExist._id,
      first_cutoff_minutes: first_cutoff_minutes,
      last_cutoff_minutes: last_cutoff_minutes,
    });

    await newCutoff.save();

    return newCutoff;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

export { cutoffMinutesCreation };
