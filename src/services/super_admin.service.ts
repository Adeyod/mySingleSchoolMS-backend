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
    const { first_cutoff_minutes, last_cutoff_minutes } = payload;

    const cutoffExist = await CbtCutoff.find();

    if (cutoffExist) {
      throw new AppError(`Cutoff time not found.`, 400);
    }

    const newCutoff = new CbtCutoff({
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
