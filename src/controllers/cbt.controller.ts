import mongoose from 'mongoose';
import { triggerTypeEnum } from '../constants/enum';
import {
  termExamDocumentCreation,
  fetchTermExamDocument,
  fetchExamDocumentById,
  objQestionSetting,
  subjectCbtObjExamStarting,
  termClassExamTimetableCreation,
  fetchAllExamDocument,
  studentCbtSubjectExamAuthorization,
  subjectCbtObjExamUpdate,
  subjectCbtObjExamSubmission,
  fetchTermClassExamTimetable,
  subjectCbtObjExamRemainingTimeUpdate,
  fetchAllClassExamTimetables,
} from '../services/cbt.service';
import { AppError } from '../utils/app.error';
import catchErrors from '../utils/tryCatch';
import {
  joiValidateQuestionArray,
  joiValidateExamInputFields,
  joiValidateTimetableArray,
} from '../utils/validation';
// import { saveLog } from '../logs/log.service';

const getExamDocumentById = catchErrors(async (req, res) => {
  const { exam_document_id } = req.params;
  const result = await fetchExamDocumentById(exam_document_id);

  if (!result) {
    throw new AppError('Unable to fetch exam document.', 400);
  }

  return res.status(201).json({
    message: 'Exam document fetched successfully.',
    status: 201,
    success: true,
    exam_document: result,
  });
});

const getAllExamDocument = catchErrors(async (req, res) => {
  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const searchQuery =
    typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

  console.log('page:', page);
  console.log('limit:', limit);
  console.log('searchQuery:', searchQuery);

  const result = await fetchAllExamDocument(page, limit, searchQuery);

  if (!result) {
    throw new AppError('Unable to fetch exam documents.', 400);
  }

  return res.status(201).json({
    message: 'Exam document fetched successfully.',
    status: 201,
    success: true,
    exam_documents: result,
  });
});

const createTermExamDocument = catchErrors(async (req, res) => {
  console.log('req.body:', req.body);
  const { academic_session_id, term } = req.params;
  const {
    title,
    number_of_questions_per_student,
    min_obj_questions,
    max_obj_questions,
    expected_obj_number_of_options,
  } = req.body;

  if (!academic_session_id) {
    throw new AppError('Academic session is required to proceed.', 400);
  }

  if (!term) {
    throw new AppError('Academic session is required to proceed.', 400);
  }

  const input = {
    min_obj_questions,
    max_obj_questions,
    expected_obj_number_of_options,
    title,
    number_of_questions_per_student,
  };

  const validateTitle = joiValidateExamInputFields(input);

  if (validateTitle.error) {
    throw new AppError(validateTitle.error, 400);
  }

  const { success, value } = validateTitle;

  const payload = {
    academic_session_id,
    term,
    title: value.title,
    min_obj_questions: value.min_obj_questions,
    max_obj_questions: value.max_obj_questions,
    expected_obj_number_of_options: value.expected_obj_number_of_options,
    number_of_questions_per_student: value.number_of_questions_per_student,
  };

  const result = await termExamDocumentCreation(payload);

  if (!result) {
    throw new AppError('Unable to create exam document for the term.', 400);
  }

  return res.status(201).json({
    message: 'Exam document created successfully.',
    status: 201,
    success: true,
    exam_document: result,
  });
});

const getTermExamDocument = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { academic_session_id, term } = req.params;

  if (!academic_session_id) {
    throw new AppError('Academic session is required to proceed.', 400);
  }

  if (!term) {
    throw new AppError('Academic session is required to proceed.', 400);
  }

  const payload = {
    academic_session_id,
    term,
  };

  const result = await fetchTermExamDocument(payload);

  if (!result) {
    throw new AppError('Unable to get exam document for the term.', 400);
  }

  return res.status(201).json({
    message: 'Term exam document fetched successfully..',
    status: 201,
    success: true,
    exam_document: result,
  });
});

const getTermClassExamTimetable = catchErrors(async (req, res) => {
  const { academic_session_id, class_id, term } = req.params;

  const requiredFields = {
    academic_session_id,
    class_id,
    term,
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

  const payload = {
    academic_session_id,
    class_id,
    term,
  };

  const result = await fetchTermClassExamTimetable(payload);

  if (!result) {
    throw new AppError('Unable to get exam timetable for this class.', 400);
  }

  return res.status(201).json({
    message: `Exam timetable fetched successfully.`,
    status: 201,
    success: true,
    timetable: result,
  });
});

const getAllClassExamTimetables = catchErrors(async (req, res) => {
  const { class_id } = req.params;
  console.log('class_id:', class_id);

  const requiredFields = {
    class_id,
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

  const payload = {
    class_id,
  };

  const result = await fetchAllClassExamTimetables(payload);

  if (!result) {
    throw new AppError('Unable to get exam timetable for this class.', 400);
  }

  return res.status(201).json({
    message: `Exam timetable fetched successfully.`,
    status: 201,
    success: true,
    timetable: result,
  });
});

const createTermClassExamTimetable = catchErrors(async (req, res) => {
  const start = Date.now();

  const { academic_session_id, class_id } = req.params;
  const { term, timetable_array } = req.body;

  const teacher_id = req.user?.userId;

  if (!teacher_id) {
    throw new AppError('Please login to continue.', 400);
  }

  const requiredFields = {
    academic_session_id,
    class_id,
    term,
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

  const validateTimetableArray = joiValidateTimetableArray(timetable_array);

  if (validateTimetableArray.error) {
    throw new AppError(validateTimetableArray.error, 400);
  }

  const payload = {
    academic_session_id,
    class_id,
    teacher_id,
    term,
    timetable: validateTimetableArray.value,
  };

  const result = await termClassExamTimetableCreation(payload);

  if (!result) {
    throw new AppError('Unable to create exam timetable.', 400);
  }

  return res.status(201).json({
    message: `Exam timetable created successfully.`,
    status: 201,
    success: true,
    timetable: result,
  });
});

const setSubjectCbtObjQuestionsForAClass = catchErrors(async (req, res) => {
  console.log('req.body:', req.body);
  const { academic_session_id, class_id } = req.params;
  const { questions_array, term, subject_id } = req.body;

  if (!Array.isArray(questions_array) || questions_array.length === 0) {
    throw new AppError('Questions are required.', 400);
  }

  const teacher_id = req.user?.userId;

  if (!teacher_id) {
    throw new AppError('Please login to continue.', 400);
  }

  const requiredFields = {
    academic_session_id,
    class_id,
    questions_array,
    term,
    subject_id,
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

  const validateQuestionsArray = joiValidateQuestionArray(questions_array);

  if (validateQuestionsArray.error) {
    throw new AppError(validateQuestionsArray.error, 400);
  }

  const validQuestions = validateQuestionsArray.value;

  const payload = {
    academic_session_id,
    class_id,
    questions_array: validQuestions,
    term,
    subject_id,
    teacher_id,
  };

  const result = await objQestionSetting(payload);

  if (!result) {
    throw new AppError('Unable to store exam questions for this subject.', 400);
  }

  return res.status(201).json({
    message: `Exam questions submitted for ${result.subject_name}`,
    status: 201,
    success: true,
  });
});

const classTeacherAuthorizeStudentsToWriteSubjectCbt = catchErrors(
  async (req, res) => {
    const { subject_id, academic_session_id, class_id } = req.params;
    const { students_id_array, term } = req.body;

    if (!Array.isArray(students_id_array) || students_id_array.length === 0) {
      throw new AppError(
        'Please provide the students that are to be allowed to take the CBT for this subject.',
        400
      );
    }

    const teacher_id = req.user?.userId;

    if (!teacher_id) {
      throw new AppError('Please login to continue.', 400);
    }

    const requiredFields = {
      subject_id,
      term,
      academic_session_id,
      class_id,
      students_id_array,
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

    const payload = {
      subject_id,
      term,
      academic_session_id,
      class_id,
      teacher_id,
      students_id_array,
    };

    const result = await studentCbtSubjectExamAuthorization(payload);

    if (!result) {
      throw new AppError(
        'Unable to authorize students to take this CBT subject.',
        400
      );
    }

    return res.status(201).json({
      message: `Students CBT subject attendance marked successfully`,
      status: 201,
      success: true,
      authorized_students_ids: result,
    });
  }
);

const startSubjectCbtObjExamForAClass = catchErrors(async (req, res) => {
  const { term, subject_id, academic_session_id, class_id } = req.params;

  const student_id = req.user?.userId;

  if (!student_id) {
    throw new AppError('Please login to continue.', 400);
  }

  const requiredFields = {
    academic_session_id,
    class_id,
    term,
    subject_id,
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

  const payload = {
    academic_session_id,
    class_id,
    student_id,
    term,
    subject_id,
  };

  const result = await subjectCbtObjExamStarting(payload);

  if (!result) {
    throw new AppError('Unable to exam questions.', 400);
  }

  return res.status(200).json({
    message: `Exam started successfully.`,
    status: 200,
    success: true,
    questions: result,
  });
});

const updateSubjectCbtObjExamRemainingTimeForAClass = catchErrors(
  async (req, res) => {
    const { cbt_result_id, exam_id } = req.params;
    const { remaining_time } = req.body;

    const student_id = req.user?.userId;

    if (!student_id) {
      throw new AppError('Please login to continue.', 400);
    }

    const requiredFields = {
      cbt_result_id,
      exam_id,
      remaining_time,
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

    const payload = {
      cbt_result_id,
      exam_id,
      remaining_time,
      student_id,
    };

    const result = await subjectCbtObjExamRemainingTimeUpdate(payload);

    // if (!result) {
    //   throw new AppError('Unable to update exam remaining time.', 400);
    // }

    return res.status(200).json({
      message: `Exam time updated successfully.`,
      status: 200,
      success: true,
      // questions: result && result,
    });
  }
);

const updateSubjectCbtObjExamAnswersForAClass = catchErrors(
  async (req, res) => {
    const { cbt_result_id, exam_id } = req.params;
    const { result_doc } = req.body;

    const student_id = req.user?.userId;

    if (!student_id) {
      throw new AppError('Please login to continue.', 400);
    }

    if (result_doc.length === 0) {
      throw new AppError('No answer selected.', 400);
    }

    const requiredFields = {
      cbt_result_id,
      exam_id,
      result_doc,
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

    const payload = {
      cbt_result_id,
      exam_id,
      result_doc,
      student_id,
    };

    const result = await subjectCbtObjExamUpdate(payload);

    // if (!result) {
    //   throw new AppError('Unable to update exam.', 400);
    // }

    return res.status(200).json({
      message: `Exam answers updated successfully.`,
      status: 200,
      success: true,
      questions: result && result,
    });
  }
);

const submitSubjectCbtObjExamForAClass = catchErrors(async (req, res) => {
  const { cbt_result_id, exam_id } = req.params;
  const { result_doc, trigger_type } = req.body;

  console.log('trigger type:', trigger_type);
  console.log('req.body:', req.body);

  const student_id = req.user?.userId;

  if (!student_id) {
    throw new AppError('Please login to continue.', 400);
  }

  if (!triggerTypeEnum.includes(trigger_type)) {
    throw new AppError('Invalid trigger type.', 400);
  }

  const requiredFields = {
    cbt_result_id,
    exam_id,
    result_doc,
    trigger_type,
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

  const payload = {
    cbt_result_id,
    exam_id,
    result_doc,
    student_id,
    trigger_type,
  };

  const result = await subjectCbtObjExamSubmission(payload);

  if (!result) {
    throw new AppError('Unable to end and update exam.', 400);
  }

  return res.status(200).json({
    message: `Exam submitted successfully.`,
    status: 200,
    success: true,
    questions: result,
  });
});

const setSubjectCbtTheroyQuestionsForAClass = catchErrors(async (req, res) => {
  const { academic_session_id, class_id } = req.params;
  const { questions_array, term, subject_id } = req.body;

  const teacher_id = req.user?.userId;

  if (!teacher_id) {
    throw new AppError('Please login to continue.', 400);
  }

  const requiredFields = {
    academic_session_id,
    class_id,
    questions_array,
    term,
    subject_id,
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
});

export {
  getExamDocumentById,
  getAllClassExamTimetables,
  getTermClassExamTimetable,
  getTermExamDocument,
  submitSubjectCbtObjExamForAClass,
  updateSubjectCbtObjExamAnswersForAClass,
  updateSubjectCbtObjExamRemainingTimeForAClass,
  classTeacherAuthorizeStudentsToWriteSubjectCbt,
  createTermClassExamTimetable,
  startSubjectCbtObjExamForAClass,
  setSubjectCbtObjQuestionsForAClass,
  createTermExamDocument,
  setSubjectCbtTheroyQuestionsForAClass,
  getAllExamDocument,
};
