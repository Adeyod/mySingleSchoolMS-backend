import nodemailer from 'nodemailer';
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { EmailType } from '../constants/types';

const getMailTemplate = (filePath: string, data: {}) => {
  const templatePath = path.join(__dirname, './templates', filePath);
  const template = fs.readFileSync(templatePath, 'utf8');
  return ejs.render(template, data);
};

const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST,
  port: process.env.NODEMAILER_PORT,
  secure: process.env.NODEMAILER_SECURE,
  tls: {
    rejectUnauthorized: false,
  },
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
} as SMTPTransport.Options);

const sendEmailVerification = async ({
  email,
  first_name,
  token,
}: EmailType) => {
  try {
    const emailVerificationContent = getMailTemplate('emailTemplate.ejs', {
      first_name,
      token,
    });

    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_USER,
      to: email,
      subject: 'Email verification',
      html: emailVerificationContent,
    });
    return info;
  } catch (error) {
    console.error(error);
  }
};

const sendPasswordReset = async ({ email, first_name, token }: EmailType) => {
  try {
    const passwordResetContent = getMailTemplate('passwordResetTemplate.ejs', {
      first_name,
      token,
    });

    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_USER,
      to: email,
      subject: 'Password Reset',
      html: passwordResetContent,
    });
    return info;
  } catch (error) {
    console.error(error);
  }
};

const sendChildLinkageMail = async ({
  email,
  first_name,
  title,
  message,
}: EmailType) => {
  try {
    const childLinkageContent = getMailTemplate('childLinkageTemplate.ejs', {
      first_name,
      title,
      message,
    });

    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_USER,
      to: email,
      subject: 'Child Linkage',
      html: childLinkageContent,
    });

    return info;
  } catch (error) {
    console.error(error);
  }
};

const sendStudentSessionNotification = async ({
  first_name,
  email,
  academic_session,
}: EmailType) => {
  try {
    const sessionSubscriptionContent = getMailTemplate(
      'studentSessionSubscriptionTemplate.ejs',
      {
        first_name,
        academic_session,
      }
    );

    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_USER,
      to: email,
      subject: 'Session Subscription Notification',
      html: sessionSubscriptionContent,
    });

    console.log(`mail successfully sent to ${email}`);

    return info;
  } catch (error) {
    console.error(error);
  }
};

const sendParentSessionNotification = async ({
  first_name,
  child_name,
  child_email,
  email,
  academic_session,
}: EmailType) => {
  try {
    const sessionSubscriptionContent = getMailTemplate(
      'studentSessionSubscriptionByParentTemplate.ejs',
      {
        first_name,
        email,
        academic_session,
        child_name,
        child_email,
      }
    );

    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_USER,
      to: email,
      subject: 'Session Subscription Notification',
      html: sessionSubscriptionContent,
    });

    console.log(`mail successfully sent to ${email}`);
    return info;
  } catch (error) {
    console.error(error);
  }
};

export {
  sendParentSessionNotification,
  sendStudentSessionNotification,
  sendEmailVerification,
  sendPasswordReset,
  sendChildLinkageMail,
};
