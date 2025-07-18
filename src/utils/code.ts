import Student from '../models/students.model';

const generateRandomCode = (num: number) => {
  if (num < 1) {
    throw new Error('Number must be greater than zero');
  }

  const min = Math.pow(10, num - 1);
  const max = Math.pow(10, num) - 1;

  const randomNum = Math.floor(min + Math.random() * (max - min + 1));
  return randomNum;
};

const generateCode = (num: number) => {
  let code;

  const uniqueId = generateRandomCode(num);

  code = uniqueId;
  return code;
};

const maxSubjectNum = 3;
const maxClassTeachingAssignment = 10;

const maxSubjectOfferedBySSSStudents = 9;

const maxParentLength = 2;

const highestTestScore = 20;
const highestExamScore = 60;
const maxSchoolAccountNumbers = 3;

export {
  maxSchoolAccountNumbers,
  highestTestScore,
  highestExamScore,
  maxParentLength,
  maxSubjectOfferedBySSSStudents,
  generateCode,
  generateRandomCode,
  maxSubjectNum,
  maxClassTeachingAssignment,
};
