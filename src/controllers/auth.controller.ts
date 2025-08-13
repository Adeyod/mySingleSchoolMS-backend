import {
  changeUserPassword,
  forgotPass,
  generateAnotherAccessToken,
  loggingUserOut,
  registerNewUser,
  sendingEmailVerificationToken,
  userEmailVerification,
  userLogin,
} from '../services/auth.service';
import { AppError, JoiError } from '../utils/app.error';
import { capitalizeFirstLetter } from '../utils/functions';
import catchErrors from '../utils/tryCatch';
import {
  joiValidation,
  parentValidation,
  staffValidation,
  studentValidation,
  superAdminValidation,
} from '../utils/validation';

const registerUser = catchErrors(async (req, res) => {
  console.log('I am being called', req.body);
  const {
    // COMMON TO ALL
    first_name,
    last_name,
    gender,
    role,
    email,
    password,
    confirm_password,

    // COMMON TO STUDENTS, ADMINS, TEACHERS AND NON-TEACHING
    middle_name,
    dob,

    // exclude student
    phone,
    current_class_level,
    employment_date,
    admission_session,
    admission_number,
  } = req.body;

  const requiredFields = {
    first_name,
    last_name,
    gender,
    role,
    email,
    password,
    confirm_password,
  };

  const missingField = Object.entries(requiredFields).find(
    ([key, value]) => !value
  );

  if (missingField) {
    throw new AppError(
      `Please provide ${missingField[0].replace('_', ' ')} to proceed.`,
      400
    );
  }

  if (role !== 'student' && role !== 'parent') {
    const workerFields = {
      phone,
      employment_date,
    };
    const workerMissingField = Object.entries(workerFields).find(
      ([key, value]) => !value
    );

    if (workerMissingField) {
      throw new AppError(
        `Please provide ${workerMissingField[0].replace('_', ' ')} to proceed.`,
        400
      );
    }
  }

  if (role === 'student') {
    if (!admission_number || !dob) {
      throw new AppError(
        'Admission number and date of birth are required for student registration.',
        400
      );
    }
  }

  const userRole = req.user?.userRole;

  let payload;

  payload = {
    first_name: first_name.trim().toLowerCase(),
    last_name: last_name.trim().toLowerCase(),
    gender,
    email: email.trim(),
    password,
    confirm_password,
    phone,
  };

  const mainValidation = joiValidation(payload, 'register');
  let otherValidation:
    | { success: boolean; value?: any; error?: string }
    | undefined;

  // if (role === 'parent') {
  //   payload = {
  //     middle_name: middle_name ? middle_name.trim().toLowerCase() : undefined,
  //   };
  //   otherValidation = parentValidation(payload);
  // }

  // if (role === 'non_teaching' || role === 'admin') {
  //   payload = {
  //     middle_name: middle_name ? middle_name.trim().toLowerCase() : undefined,
  //     dob,
  //     employment_date,
  //   };
  //   otherValidation = staffValidation(payload);
  // }

  // if (role === 'teacher') {
  //   payload = {
  //     middle_name: middle_name ? middle_name.trim().toLowerCase() : undefined,
  //     dob,
  //     employment_date,
  //   };
  //   otherValidation = staffValidation(payload);
  // }

  // if (role === 'super_admin') {
  //   payload = {
  //     middle_name: middle_name ? middle_name.trim().toLowerCase() : undefined,
  //   };
  //   otherValidation = superAdminValidation(payload);
  // }

  // if (role === 'student') {
  //   payload = {
  //     middle_name: middle_name ? middle_name.trim().toLowerCase() : undefined,
  //     dob,
  //     admission_session,
  //   };

  //   otherValidation = studentValidation(payload);
  // }

  if (role === 'parent') {
    payload = {
      middle_name: middle_name ? middle_name.trim().toLowerCase() : undefined,
    };
    otherValidation = parentValidation(payload);
  }

  if (role === 'non_teaching' || role === 'admin') {
    payload = {
      middle_name: middle_name ? middle_name.trim().toLowerCase() : undefined,
      dob,
      employment_date,
    };
    otherValidation = staffValidation(payload);
  }

  if (role === 'teacher') {
    payload = {
      middle_name: middle_name ? middle_name.trim().toLowerCase() : undefined,
      dob,
      employment_date,
    };
    otherValidation = staffValidation(payload);
  }

  if (role === 'super_admin') {
    payload = {
      middle_name: middle_name ? middle_name.trim().toLowerCase() : undefined,
    };
    otherValidation = superAdminValidation(payload);
  }

  if (role === 'student') {
    payload = {
      middle_name: middle_name ? middle_name.trim().toLowerCase() : undefined,
      dob,
      admission_session,
    };

    otherValidation = studentValidation(payload);
  }

  const { success, value } = mainValidation;

  if (!otherValidation) {
    throw new JoiError('Please make sure all required fields are supplied');
  }

  if (otherValidation.error) {
    throw new JoiError(otherValidation.error);
  }

  const { success: otherSuccess, value: otherValue } = otherValidation;

  const valueInput = {
    ...value,
    ...otherValue,
    admission_number: admission_number && admission_number,
    role,
    gender,
    userRole: userRole && userRole,
  };

  const user = await registerNewUser(valueInput);

  if (!user) {
    throw new AppError('Unable to register user', 400);
  }

  return res.json({
    message:
      'Registration successful. Please verify your account using the token sent to your email address.',
    success: true,
  });
});

const verifyUserEmail = catchErrors(async (req, res) => {
  const token = req.params.token;

  const verifyUserEmailResponse = await userEmailVerification(token);

  if (!verifyUserEmailResponse) {
    throw new AppError('Error verifying user email.', 401);
  }

  const first_name = capitalizeFirstLetter(verifyUserEmailResponse?.first_name);
  return res.status(200).json({
    message: `${first_name}, Your email Verification is successful. You can login now.`,
    success: true,
    status: 200,
  });
});

const loginUser = catchErrors(async (req, res) => {
  const { email, password } = req.body;

  const payload = {
    email: email.trim(),
    password: password.trim(),
  };
  const validateResponse = await joiValidation(payload, 'login');

  const loginResponse = await userLogin(validateResponse.value);

  if (!loginResponse) {
    throw new AppError('Unable to login user.', 400);
  }

  return res.status(200).json({
    message: `${loginResponse.user.first_name}, your login was successful`,
    user: loginResponse.user,
    accessToken: loginResponse.accessToken,
    refreshToken: loginResponse.refreshToken,
    success: true,
    status: 200,
  });
});

const requestAccessToken = catchErrors(async (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    throw new AppError('Please provide a refresh token.', 404);
  }

  const confirmTokenResponse = await generateAnotherAccessToken(refreshToken);

  if (!confirmTokenResponse) {
    throw new AppError('Unable to generate a new access token', 400);
  }

  const { password: hashValue, ...others } =
    confirmTokenResponse.user.toObject();

  return res.status(200).json({
    message: 'Access token generated successfully',
    accessToken: confirmTokenResponse.newAccessToken,
    user: others,
    success: true,
    status: 200,
  });
});

const resendEmailVerificationLink = catchErrors(async (req, res) => {
  const { email } = req.body;

  const validateInput = joiValidation(email, 'forgot-password');

  if (!validateInput) {
    throw new AppError('Unable to validate email.', 400);
  }

  const { success, value } = validateInput;

  const response = await sendingEmailVerificationToken(email);

  if (!response) {
    throw new AppError('Unable to send verification token.', 400);
  }

  return res.status(200).json({
    message:
      'A new Email verification token has been sent successfully. Please check your email address',
    success: true,
    status: 200,
  });
});

const forgotPassword = catchErrors(async (req, res) => {
  const { email } = req.body;

  const validateInput = joiValidation(email, 'forgot-password');

  if (!validateInput) {
    throw new AppError('Unable to validate email.', 400);
  }

  const { success, value } = validateInput;

  const forgotPasswordResponse = await forgotPass(email);

  if (!forgotPasswordResponse) {
    throw new AppError('Unable to verify account', 400);
  }

  return res.status(200).json({
    message:
      'Please use the token sent to your email address to reset your password.',
    status: 200,
  });
});

const resetPassword = catchErrors(async (req, res) => {
  const { password, confirm_password, token } = req.body;

  const payload = {
    password,
    confirm_password,
  };

  const validatePasswords = joiValidation(payload, 'reset-password');

  if (!validatePasswords) {
    throw new AppError('Unable to validate input fields', 400);
  }

  const { success, value } = validatePasswords;

  const input = {
    token,
    password: value.password,
  };

  const response = await changeUserPassword(input);
  if (!response) {
    throw new AppError('Unable to change password', 400);
  }

  return res.status(200).json({
    message: 'Password changed successfully',
    success: true,
    status: 200,
  });
});

const logoutUser = catchErrors(async (req, res) => {
  const { refresh_token } = req.body;
  const access_token = req.headers.authorization?.split(' ')[1];
  const user_id = req.user?.userId;

  console.log('refresh_token:', refresh_token);
  console.log('access_token:', access_token);
  console.log('user_id:', user_id);

  if (!refresh_token) {
    throw new AppError('Refresh Token is required to proceed.', 400);
  }

  if (!access_token) {
    throw new AppError('No token found in the header.', 400);
  }

  const payload = {
    access_token,
    refresh_token,
    user_id,
  };

  const result = await loggingUserOut(payload);

  res.status(200).json({
    message: 'User logged out successfully',
  });
});

export {
  requestAccessToken,
  registerUser,
  loginUser,
  verifyUserEmail,
  resendEmailVerificationLink,
  forgotPassword,
  resetPassword,
  logoutUser,
};
