// import { userLogin } from '../services/auth.service';
// import { AppError } from '../utils/app.error';
// import catchErrors from '../utils/tryCatch';
// import { joiValidation } from '../utils/validation';

// const examLogin = catchErrors(async (req, res) => {
//   const { email, password } = req.body;
//   const payload = {
//     email: email.trim(),
//     password: password.trim(),
//   };
//   const validateResponse = await joiValidation(payload, 'login');

//   const loginResponse = await userLogin(validateResponse.value);
//   console.log(loginResponse);

//   if (!loginResponse) {
//     throw new AppError('Unable to login user.', 400);
//   }

//   return res.status(200).json({
//     message: `${loginResponse.user.first_name}, your login was successful`,
//     user: loginResponse.user,
//     accessToken: loginResponse.accessToken,
//     refreshToken: loginResponse.refreshToken,
//     success: true,
//     status: 200,
//   });
// });
// const startExam = catchErrors(async (req, res) => {});
// const submitExam = catchErrors(async (req, res) => {});
// const getExamSubjects = catchErrors(async (req, res) => {});
// export { startExam, submitExam, getExamSubjects, examLogin };
