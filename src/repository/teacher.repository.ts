import mongoose from 'mongoose';
import Teacher from '../models/teachers.model';
import { AppError } from '../utils/app.error';
import { GetTeacherByIdType } from '../constants/types';

const getTeacherById = async (payload: GetTeacherByIdType) => {
  try {
    const { teacher_id, session } = payload;
    const teacher = await Teacher.findById(teacher_id).session(session || null);
    return teacher;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

export { getTeacherById };
