import { Server, Socket } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import {
  subjectCbtObjExamRemainingTimeUpdate,
  subjectCbtObjExamStarting,
  subjectCbtObjExamSubmission,
  subjectCbtObjExamUpdate,
} from '../services/cbt.service';
import dotenv from 'dotenv';
import {
  ExamEndedType,
  ExamStartingType,
  ExamTimeUpdateType,
  ExamUpdateType,
  UserInJwt,
} from '../constants/types';
import mongoose from 'mongoose';
dotenv.config();

const jwt_access_secret = process.env.JWT_ACCESS_SECRET;
export const registerCbtHandlers = (io: Server, socket: Socket) => {
  console.log(`CBT socket connected: ${socket.id}`);

  socket.on('start-exam', async (payload, callback) => {
    try {
      const { accessToken, term, subject_id, academic_session_id, class_id } =
        payload;
      if (!accessToken) {
        return callback({ status: 'error', message: 'Access token missing' });
      }

      if (!jwt_access_secret) {
        return callback({
          success: 'errir',
          message: 'JWT_SECRET is not defined in the environment variables',
        });
      }

      const decoded = jwt.verify(accessToken, jwt_access_secret) as UserInJwt;

      const { userId } = decoded;

      const fullPayload: ExamStartingType = {
        term,
        subject_id,
        academic_session_id,
        class_id,
        student_id: userId,
      };

      const result = await subjectCbtObjExamStarting(fullPayload);
      callback({ status: 'success', data: result });
    } catch (error) {
      callback({ status: 'error', message: error });
    }
  });

  socket.on('update-answer', async (payload, callback) => {
    try {
      const { accessToken, cbt_result_id, exam_id, result_doc } = payload;
      if (!accessToken) {
        return callback({ status: 'error', message: 'Access token missing' });
      }

      if (!jwt_access_secret) {
        return callback({
          success: 'errir',
          message: 'JWT_SECRET is not defined in the environment variables',
        });
      }

      const decoded = jwt.verify(accessToken, jwt_access_secret) as UserInJwt;

      const { userId } = decoded;

      const fullPayload: ExamUpdateType = {
        cbt_result_id,
        exam_id,
        result_doc,
        student_id: userId,
      };
      const result = await subjectCbtObjExamUpdate(fullPayload);
      callback({ status: 'success', data: result });
    } catch (error) {
      callback({ status: 'error', message: error });
    }
  });

  socket.on('update-time', async (payload, callback) => {
    try {
      const { accessToken, cbt_result_id, exam_id, remaining_time } = payload;
      if (!accessToken) {
        return callback({ status: 'error', message: 'Access token missing' });
      }

      if (!jwt_access_secret) {
        return callback({
          success: 'errir',
          message: 'JWT_SECRET is not defined in the environment variables',
        });
      }

      const decoded = jwt.verify(accessToken, jwt_access_secret) as UserInJwt;

      const { userId } = decoded;

      const fullPayload: ExamTimeUpdateType = {
        cbt_result_id,
        exam_id,
        remaining_time,
        student_id: userId,
      };
      const result = await subjectCbtObjExamRemainingTimeUpdate(fullPayload);
      callback({ status: 'success', data: result });
    } catch (error) {
      callback({ status: 'error', message: error });
    }
  });

  socket.on('submit-exam', async (payload, callback) => {
    try {
      const { accessToken, cbt_result_id, exam_id, result_doc, trigger_type } =
        payload;
      if (!accessToken) {
        return callback({ status: 'error', message: 'Access token missing' });
      }

      if (!jwt_access_secret) {
        return callback({
          success: 'errir',
          message: 'JWT_SECRET is not defined in the environment variables',
        });
      }

      const decoded = jwt.verify(accessToken, jwt_access_secret) as UserInJwt;

      const { userId } = decoded;

      const fullPayload: ExamEndedType = {
        cbt_result_id,
        exam_id,
        result_doc,
        student_id: userId,
        trigger_type,
      };
      const result = await subjectCbtObjExamSubmission(fullPayload);
      callback({ status: 'success', data: result });
    } catch (error) {
      callback({ status: 'error', message: error });
    }
  });

  socket.on('disconnect', () => {
    console.log(`CBT socket disconnected: ${socket.id}`);
  });
};
