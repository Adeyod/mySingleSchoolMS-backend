import {
  ChangePasswordType,
  LoginResponseType,
  PayloadForLoginInput,
  UserDocument,
  VerificationType,
  VerifyUserType,
  LogoutPayload,
} from '../constants/types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import Admin from '../models/admin.model';
import NonTeaching from '../models/non_teaching.model';
import OldStudent from '../models/old_student.model';
import Parent from '../models/parents.model';
import Student from '../models/students.model';
import Teacher from '../models/teachers.model';
import {
  generateAndStoreVerificationToken,
  getUserRefreshTokenDetails,
  getUserTokenDetails,
  getUserTokenDetailsUsingUserId,
} from '../repository/token.repository';
import {
  createNewUserDoc,
  findAndVerifyUser,
  findSameAdmissionNumber,
  findUserByEmail,
  findUserById,
} from '../repository/user.repository';
import { AppError } from '../utils/app.error';
import { sendEmailVerification } from '../utils/nodemailer';
import { object } from 'joi';
import { capitalizeFirstLetter } from '../utils/functions';
import { emailQueue } from '../utils/queue';
import {
  generateAccessToken,
  generateRefreshToken,
  jwtDecodeRefreshToken,
} from '../middleware/jwtAuth';
import { RefreshToken } from '../models/refresh_token.model';
import Payment from '../models/payment.model';
import Session from '../models/session.model';
import BlackListedToken from '../models/black_listed.model';

const registerNewUser = async (payload: UserDocument) => {
  try {
    const userAlreadyExist = await findUserByEmail(payload?.email);

    if (userAlreadyExist) {
      throw new AppError('User already exist...', 400);
    }

    if (payload.role === 'student') {
      const admissionNumberExist = await findSameAdmissionNumber(
        payload.admission_number
      );

      if (admissionNumberExist) {
        throw new AppError('Admission number already exist.', 400);
      }
    }

    const userResult = await createNewUserDoc(payload);

    if (!userResult) {
      throw new AppError('Unable to create user', 400);
    }

    const userEmailVerification = await generateAndStoreVerificationToken(
      userResult,
      'email_verification'
    );

    if (!userEmailVerification) {
      throw new AppError('Unable to create token', 400);
    }

    // const name = capitalizeFirstLetter(userResult.first_name);

    // const jobData = {
    //   email: userResult.email,
    //   first_name: name,
    //   token: userEmailVerification.token,
    //   type: 'email-verification',
    // };

    // const mailSent = await emailQueue.add('sendEmail', jobData, {
    //   attempts: 3,
    //   backoff: 10000,
    //   removeOnComplete: true,
    // });

    return userResult;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      // console.log('error:', error);
      throw new Error('Something went wrong');
    }
  }
};

const userEmailVerification = async (token: string) => {
  try {
    const tokenResponse = await getUserTokenDetails(
      token,
      'email_verification'
    );

    if (!tokenResponse) {
      throw new AppError(
        'Token does not exist or verification token has expired. You can request for another one',
        404
      );
    }

    const user_id =
      tokenResponse.super_admin_id ||
      tokenResponse.student_id ||
      tokenResponse.parent_id ||
      tokenResponse.teacher_id ||
      tokenResponse.admin_id;

    if (!user_id || typeof user_id !== 'object') {
      throw new AppError(
        'Invalid token: No valid user associated with this token',
        400
      );
    }

    const input = {
      user_id: user_id,
      role: tokenResponse.role,
      token: Number(tokenResponse.token),
    };

    const verifyResponse = await findAndVerifyUser(input);

    if (!verifyResponse) {
      throw new AppError('Unable to verify user', 401);
    }

    await tokenResponse.deleteOne();
    return verifyResponse;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      // console.log('error:', error);
      throw new Error('Something went wrong');
    }
  }
};

const userLogin = async (
  payload: PayloadForLoginInput
): Promise<LoginResponseType> => {
  try {
    const userExist = await findUserByEmail(payload?.email);

    if (!userExist) {
      throw new AppError('Invalid credential...', 404);
    }

    // let userPaymentDoc = null;

    if (userExist.role === 'parent') {
      await userExist.populate('children', '-password');
    } else if (userExist.role === 'student') {
      await userExist.populate('parent_id current_class.class_id', '-password');
      const session = await Session.findOne({
        is_active: true,
      });

      // const activeTerm = session?.terms.find((term) => term.is_active === true);

      // userPaymentDoc = await Payment.findOne({
      //   student: userExist._id,
      //   session: session?._id,
      //   term: activeTerm?.name,
      // });

      // userExist.set('latest_payment_document', userPaymentDoc, { strict: false });
    } else if (userExist.role === 'teacher') {
      await userExist.populate(
        'teaching_assignment.class_id teaching_assignment.subject subjects_capable_of_teaching class_managing'
      );
    }

    const passwordMatch = await bcrypt.compare(
      payload?.password,
      userExist?.password
    );

    if (!passwordMatch) {
      throw new AppError('Invalid credential...', 404);
    }

    if (userExist.is_verified !== true) {
      const checkTokenExist = await getUserTokenDetailsUsingUserId(
        userExist._id,
        'email_verification'
      );

      if (!checkTokenExist) {
        const userVerifyResponse = await generateAndStoreVerificationToken(
          userExist,
          'email_verification'
        );

        if (!userVerifyResponse) {
          throw new AppError('Unable to create token', 400);
        }

        const jobData = {
          email: userExist.email,
          first_name: userExist.first_name,
          token: userVerifyResponse.token,
          type: 'email-verification',
        };

        const mailSent = await emailQueue.add('sendEmail', jobData, {
          attempts: 3,
          backoff: 10000,
          removeOnComplete: true,
        });

        throw new AppError(
          'Please verify your email with the token sent to your email address...',
          400
        );
      } else {
        const jobData = {
          email: userExist.email,
          first_name: userExist.first_name,
          token: checkTokenExist.token,
          type: 'email-verification',
        };

        const mailSent = await emailQueue.add('sendEmail', jobData, {
          attempts: 3,
          backoff: 10000,
          removeOnComplete: true,
        });

        throw new AppError(
          'Please verify your email with the token sent to your email address...',
          400
        );
      }
    }

    // generate jwt token here to be sent to the frontend for authorization
    const accessToken = await generateAccessToken(
      userExist._id,
      userExist.email,
      userExist.role
    );
    const refreshToken = await generateRefreshToken(
      userExist._id,
      userExist.email,
      userExist.role
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);

    await RefreshToken.findOneAndDelete({ user_id: userExist._id });

    await new RefreshToken({
      token: hashedRefreshToken,
      user_id: userExist._id,
      role: userExist.role,
    }).save();

    const { password: hashValue, ...others } = userExist.toObject();

    const tokenObj = {
      accessToken,
      refreshToken,
      user: { ...others },
      // user: { ...others, latest_payment_document: userPaymentDoc },
    };

    return tokenObj as LoginResponseType;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      // console.log('error:', error);
      throw new Error('Something went wrong');
    }
  }
};

const generateAnotherAccessToken = async (token: string) => {
  try {
    const decodeTokenResponse = await jwtDecodeRefreshToken(token);
    const tokenResponse = await getUserRefreshTokenDetails(
      decodeTokenResponse.userId
    );

    if (!tokenResponse) {
      throw new AppError('Token does not exist or token has expired.', 404);
    }

    const compareToken = await bcrypt.compare(token, tokenResponse.token);

    if (!compareToken) {
      throw new AppError('Invalid token', 404);
    }

    const user = await findUserById(tokenResponse.user_id);

    if (!user) {
      throw new AppError('Invalid user', 404);
    }

    const newAccessToken = await generateAccessToken(
      user?._id,
      user?.email,
      user.role
    );

    const userObj = {
      user,
      newAccessToken,
      refreshToken: token,
    };

    return userObj;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      // console.log('error:', error);
      throw new Error('Something went wrong');
    }
  }
};

const forgotPass = async (email: string): Promise<UserDocument> => {
  try {
    const findUser = await findUserByEmail(email);

    if (!findUser) {
      throw new AppError('User does not exist', 404);
    }

    const name = capitalizeFirstLetter(findUser.first_name);

    const getTokenResponse = await getUserTokenDetailsUsingUserId(
      findUser._id,
      'password_reset'
    );

    if (!getTokenResponse) {
      const userEmailVerification = await generateAndStoreVerificationToken(
        findUser,
        'password_reset'
      );

      if (!userEmailVerification) {
        throw new AppError('Unable to create token', 400);
      } else {
        const jobData = {
          email: findUser.email,
          first_name: name,
          token: userEmailVerification.token,
          type: 'forgot-password',
        };

        const mailSent = await emailQueue.add('sendEmail', jobData, {
          attempts: 3,
          backoff: 10000,
          removeOnComplete: true,
        });
      }
    } else {
      const jobData = {
        email: findUser.email,
        first_name: name,
        token: getTokenResponse.token,
        type: 'forgot-password',
      };

      const mailSent = await emailQueue.add('sendEmail', jobData, {
        attempts: 3,
        backoff: 10000,
        removeOnComplete: true,
      });
    }
    return findUser;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      // console.log('error:', error);
      throw new Error('Something went wrong');
    }
  }
};

const sendingEmailVerificationToken = async (
  email: string
): Promise<UserDocument> => {
  try {
    const findUser = await findUserByEmail(email);

    if (!findUser) {
      throw new AppError('User does not exist', 404);
    }

    console.log('USER DOCUMENT:', findUser);

    if (findUser.is_verified === true) {
      throw new AppError('User already verified', 400);
    }

    let tokenObj: VerificationType;

    const userToken = await getUserTokenDetailsUsingUserId(
      findUser._id,
      'email_verification'
    );

    if (userToken) {
      tokenObj = userToken;
    } else {
      const generateToken = await generateAndStoreVerificationToken(
        findUser,
        'email_verification'
      );

      tokenObj = generateToken;
    }

    const name = capitalizeFirstLetter(findUser.first_name);

    const jobData = {
      email: findUser.email,
      first_name: name,
      token: tokenObj.token,
      type: 'email-verification',
    };

    const mailSent = await emailQueue.add('sendEmail', jobData, {
      attempts: 3,
      backoff: 10000,
      removeOnComplete: true,
    });

    return findUser;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      // console.log('error:', error);
      throw new Error('Something went wrong');
    }
  }
};

const changeUserPassword = async (
  payload: ChangePasswordType
): Promise<UserDocument> => {
  try {
    const findToken = await getUserTokenDetails(
      payload.token,
      'password_reset'
    );

    if (!findToken) {
      throw new AppError('User does not exist', 404);
    }

    let userId;
    if (findToken.role === 'admin') {
      userId = findToken?.admin_id;
    }

    if (findToken.role === 'super_admin') {
      userId = findToken?.super_admin_id;
    }

    if (findToken.role === 'non_teaching') {
      userId = findToken?.non_teaching_id;
    }

    if (findToken.role === 'parent') {
      userId = findToken?.parent_id;
    }

    if (findToken.role === 'student') {
      userId = findToken?.student_id;
    }

    if (findToken.role === 'teacher') {
      userId = findToken?.teacher_id;
    }

    if (userId === undefined || userId === null) {
      throw new AppError('user id is required', 404);
    }

    const user = await findUserById(userId);

    if (!user) {
      throw new AppError('user not found', 404);
    }
    const hashedPassword = await bcrypt.hash(payload.password, 10);

    user.password = hashedPassword;

    await user.save();
    await findToken.deleteOne();

    return user as UserDocument;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      // console.log('error:', error);
      throw new Error('Something went wrong');
    }
  }
};

// const loggingUserOut = async (payload: LogoutPayload) => {
//   try {
//     const decoded = jwt.decode(payload.access_token) as jwt.JwtPayload

//     console.log('decoded:', decoded);

//     const decodeRefreshToken = await jwtDecodeRefreshToken(
//       payload.refresh_token
//     );
//     console.log('decodeRefreshToken:', decodeRefreshToken);

//     const findToken = await getUserRefreshTokenDetails(
//       decodeRefreshToken.userId
//     );

//     console.log('findToken:', findToken);

//     if (findToken) {
//       const compareToken = await bcrypt.compare(
//         payload.refresh_token,
//         findToken?.token
//       );

//       console.log('compareToken:', compareToken);

//       if (compareToken) {
//         console.log('Refresh token do not match');
//         await RefreshToken.findByIdAndDelete({ _id: findToken._id });
//       }

//       // if (!decoded) {
//       //   throw new AppError('Unable to decode JWT token', 400);
//       // }
//     } else {
//       console.log('No refresh token stored for this user.');
//     }
//     const expiresAt = decoded.exp ? new Date(decoded.exp * 1000) : null;

//     await new BlackListedToken({
//       token: payload.access_token,
//       expires_at: expiresAt,
//     }).save();

//     return { message: 'User logged out successfully' };
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.log('error:', error);
//       throw new Error('Something went wrong');
//     }
//   }
// };

const loggingUserOut = async (payload: LogoutPayload) => {
  try {
    const decoded = jwt.decode(payload.access_token) as jwt.JwtPayload | null;

    console.log('decoded:', decoded);

    // If decode failed (invalid or expired token), fallback
    if (!decoded || !decoded.exp) {
      const fallbackExpiresAt = new Date(Date.now() + 60 * 1000); // 1 min fallback
      await new BlackListedToken({
        token: payload.access_token,
        expires_at: fallbackExpiresAt,
      }).save();

      return {
        message: 'Access token invalid or expired. Forced logout successful.',
      };
    }

    const decodeRefreshToken = await jwtDecodeRefreshToken(
      payload.refresh_token
    );
    const findToken = await getUserRefreshTokenDetails(
      decodeRefreshToken.userId
    );

    console.log('findToken:', findToken);

    if (findToken) {
      const compareToken = await bcrypt.compare(
        payload.refresh_token,
        findToken.token
      );

      console.log('compareToken:', compareToken);

      if (compareToken) {
        console.log('Refresh token matched. Removing it.');
        await RefreshToken.findByIdAndDelete({ _id: findToken._id });
      }
    } else {
      console.log('No refresh token stored for this user.');
    }

    const expiresAt = new Date(decoded.exp * 1000);

    await new BlackListedToken({
      token: payload.access_token,
      expires_at: expiresAt,
    }).save();

    return { message: 'User logged out successfully' };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log('error:', error);
      throw new Error('Something went wrong');
    }
  }
};

export {
  loggingUserOut,
  sendingEmailVerificationToken,
  changeUserPassword,
  forgotPass,
  registerNewUser,
  userEmailVerification,
  userLogin,
  generateAnotherAccessToken,
};

// meetgeek ottaai
