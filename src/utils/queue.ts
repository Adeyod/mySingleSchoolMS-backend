import { Job, Queue, Worker } from 'bullmq';
import { Redis, RedisOptions } from 'ioredis';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import {
  sendChildLinkageMail,
  sendEmailVerification,
  sendParentSessionNotification,
  sendPasswordReset,
  sendStudentSessionNotification,
} from './nodemailer';
import { EmailJobData } from '../constants/types';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';

const redisUrl = process.env.REDIS_URL;

console.log('REDIS URL:', redisUrl);

if (!redisUrl) {
  throw new Error('REDIS_URL is not defined...');
}

const redisConnectionString = redisUrl.replace('redis://', '');

const [host, port] = redisConnectionString.split(':');

const redisOptions: RedisOptions = {
  host: host,
  port: parseInt(port || '6379', 10),
  maxRetriesPerRequest: null,
};

const connection = new Redis(redisOptions);

const queue = new Queue('emailQueue', { connection });

const worker = new Worker<EmailJobData>(
  'emailQueue',
  async (job: Job<EmailJobData>) => {
    const {
      child_email,
      child_name,
      academic_session,
      option,
      email,
      first_name,
      token,
      type,
      title,
      message,
    } = job.data;

    if (type === 'email-verification') {
      if (!token) {
        throw new Error('Token is required for email verification');
      }

      const sendEmail = await sendEmailVerification({
        email,
        first_name,
        token,
      });

      return sendEmail;
    } else if (type === 'forgot-password') {
      if (!token) {
        throw new Error('Token is required for forgot password');
      }

      const sendEmail = await sendPasswordReset({
        email,
        first_name,
        token,
      });

      return sendEmail;
    } else if (type === 'child-linkage') {
      const sendEmail = await sendChildLinkageMail({
        email,
        first_name,
        title,
        message,
      });

      return sendEmail;
    } else if (type === 'session-subscription') {
      let sendEmail;
      if (option === 'student') {
        sendEmail = await sendStudentSessionNotification({
          email,
          first_name,
          academic_session,
        });
      } else if (option === 'parent') {
        sendEmail = await sendParentSessionNotification({
          first_name,
          child_name,
          child_email,
          email,
          academic_session,
        });
      }

      return sendEmail;
    }
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} has been completed`);
});

worker.on('failed', (job: Job<EmailJobData> | undefined, err: Error) => {
  if (job) {
    console.error(`Job ${job.id} failed with error: ${err.message}`);
  } else {
    console.error(`failed to process job due to error: ${err.message}`);
  }
});

const serverAdapter = new ExpressAdapter();
createBullBoard({
  queues: [new BullMQAdapter(queue)],
  serverAdapter,
});

serverAdapter.setBasePath('/bull-board');

export { queue, worker, serverAdapter };
