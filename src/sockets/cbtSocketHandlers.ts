import { Server, Socket } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import {
  subjectCbtObjCbtAssessmentRemainingTimeUpdate,
  subjectCbtObjCbtAssessmentStarting,
  subjectCbtObjCbtAssessmentSubmission,
  subjectCbtObjCbtAssessmentUpdate,
} from '../services/cbt.service';
import dotenv from 'dotenv';
import {
  CbtAssessmentEndedType,
  CbtAssessmentStartingType,
  CbtAssessmentTimeUpdateType,
  CbtAssessmentUpdateType,
  UserInJwt,
} from '../constants/types';
import mongoose from 'mongoose';
import { studentResultQueue } from '../utils/queue';
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

      const fullPayload: CbtAssessmentStartingType = {
        term,
        subject_id,
        academic_session_id,
        class_id,
        student_id: userId,
      };

      const result = await subjectCbtObjCbtAssessmentStarting(fullPayload);
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

      const fullPayload: CbtAssessmentUpdateType = {
        cbt_result_id,
        exam_id,
        result_doc,
        student_id: userId,
      };
      const result = await subjectCbtObjCbtAssessmentUpdate(fullPayload);
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

      const fullPayload: CbtAssessmentTimeUpdateType = {
        cbt_result_id,
        exam_id,
        remaining_time,
        student_id: userId,
      };
      const result = await subjectCbtObjCbtAssessmentRemainingTimeUpdate(
        fullPayload
      );
      callback({ status: 'success', data: result });
    } catch (error) {
      callback({ status: 'error', message: error });
    }
  });

  socket.on('submit-exam', async (payload, callback) => {
    try {
      console.log('I am being called...');
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

      const fullPayload: CbtAssessmentEndedType = {
        cbt_result_id,
        exam_id,
        result_doc,
        student_id: userId,
        trigger_type,
      };

      // const name = 'cbt-assessment-submission';
      const data = fullPayload;
      // const opts = {
      //   attempts: 5,
      //   removeOnComplete: true,
      //   backoff: {
      //     type: 'exponential',
      //     delay: 3000,
      //   },
      // };

      console.log('payload:', data);

      const result = await subjectCbtObjCbtAssessmentSubmission(data);
      // const result = await studentResultQueue.add(name, data, opts);
      callback({ status: 'success', data: result });
    } catch (error) {
      callback({ status: 'error', message: error });
    }
  });

  socket.on('disconnect', () => {
    console.log(`CBT socket disconnected: ${socket.id}`);
  });
};
