import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import connectDB from './DBConfig/connectDB';

import { setupGlobalErrorHandler } from './middleware/globalError';
import { errorHandler } from './middleware/errorHandler';
import { serverAdapter } from './utils/queue';

import adminRoute from './routes/admin.route';
// import examRoute from './routes/exam.route';
import cbtRoute from './routes/cbt.route';
import attendanceRoute from './routes/attendance.route';
import resultRoute from './routes/result.route';
import paymentRoute from './routes/payment.route';
import feeRoute from './routes/fee.route';
import authRoute from './routes/auth.route';
import classEnrolmentRoute from './routes/class_enrolment.route';
import classRoute from './routes/class.route';
import schoolAccountRoute from './routes/school_account.route';
import schoolAdminRoute from './routes/school_admin.route';
import nonTeachingRoute from './routes/non_teaching.route';
import notificationRoute from './routes/notification.route';
import superAdminRoute from './routes/super_admin.route';
import sessionRoute from './routes/session.route';
import studentRoute from './routes/student.route';
import parentRoute from './routes/parent.route';
import oldStudentRoute from './routes/old_student.route';
import jobRoute from './routes/job.route';
import schoolRoute from './routes/school.route';
import addressRoute from './routes/address.route';
import subjectRoute from './routes/subject.route';
import teacherRoute from './routes/teacher.route';
import { examStatusUpdatejob } from './utils/cron_jobs';
import { registerCbtHandlers } from './sockets/cbtSocketHandlers';
import { createServer } from 'http';
import { Server } from 'socket.io';
// import ngrok from '@ngrok/ngrok';

connectDB;

const app = express();

setupGlobalErrorHandler();

const port = process.env.PORT || 3100;

const httpServer = createServer(app);

const allowedOrigins: string[] = [
  process.env.FRONTEND_URL || '',
  'http://localhost:3000',
  'http://localhost:5173',
  // 'https://school-management-system-prod.netlify.app',
  // 'https://school-management-system-jade.vercel.app',
  'https://winners-college.vercel.app',
];

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Access Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(helmet());

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/sessions', sessionRoute);
app.use('/api/v1/students', studentRoute);
app.use('/api/v1/parents', parentRoute);
app.use('/api/v1/subjects', subjectRoute);
app.use('/api/v1/teachers', teacherRoute);
app.use('/api/v1/old-students', oldStudentRoute);
app.use('/api/v1/jobs', jobRoute);
app.use('/api/v1/addresses', addressRoute);
app.use('/api/v1/school-accounts', schoolAccountRoute);
app.use('/api/v1/school-admin', schoolAdminRoute);
app.use('/api/v1/admins', adminRoute);
app.use('/api/v1/attendance', attendanceRoute);
app.use('/api/v1/results', resultRoute);
app.use('/api/v1/payments', paymentRoute);
app.use('/api/v1/fees', feeRoute);
app.use('/api/v1/class-enrollment', classEnrolmentRoute);
app.use('/api/v1/classes', classRoute);
app.use('/api/v1/cbt', cbtRoute);
app.use('/api/v1/non-teaching', nonTeachingRoute);
app.use('/api/v1/notifications', notificationRoute);
app.use('/api/v1/super-admin', superAdminRoute);
app.use('/api/v1/school', schoolRoute);

app.use('/admin/queues', serverAdapter.getRouter());
app.use(errorHandler);
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the server side of School management application.',
    status: 200,
    success: true,
  });
});

examStatusUpdatejob();
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  registerCbtHandlers(io, socket);
});

httpServer.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// app.listen(port, () => {
//   console.log(`Bull Board is running at http://localhost:${port}/admin/queues`);
//   console.log(`Listening on port ${port}`);
// });

// ngrok
//   .connect({ addr: port, authtoken: process.env.NGROK_AUTHTOKEN || '' })
//   .then((listener) => console.log(`Ingress established at: ${listener.url()}`))
//   .catch((error) => {
//     console.error(error);
//   });
