import mongoose, { Types } from 'mongoose';
import {
  examKeyEnum,
  examStatusEnum,
  triggerTypeEnum,
} from '../constants/enum';
import {
  CbtAssessmentDocumentCreationType,
  CbtAssessmentDocumentPayload,
  CbtAssessmentStartingType,
  SubjectObjQuestionDocumentCreationType,
  ClassCbtAssessmentTimetablePayloadType,
  CbtAssessmentAuthorizationPayloadType,
  CbtAssessmentUpdateType,
  CbtAssessmentTimeUpdateType,
  CbtAssessmentEndedType,
  GetClassCbtAssessmentTimetablePayloadType,
  UserDocument,
  ExamScoreType,
  ScoreType,
} from '../constants/types';
import CbtCutoff from '../models/cbt_cutoffs.model';
import CbtExam from '../models/cbt_exam.model';
import CbtQuestion from '../models/cbt_question.model';
import CbtResult from '../models/cbt_result.model';
import Class from '../models/class.model';
import ClassExamTimetable from '../models/class_exam_timetable.model';
import ClassEnrolment from '../models/classes_enrolment.model';
import Result from '../models/result.model';
import ResultSetting from '../models/result_setting.model';
import Session from '../models/session.model';
import Student from '../models/students.model';
import Subject from '../models/subject.model';
import Teacher from '../models/teachers.model';
import { AppError } from '../utils/app.error';
import {
  capitalizeFirstLetter,
  formatDate,
  normalizeQuestions,
} from '../utils/functions';
import SuperAdmin from '../models/super_admin.model';
import Admin from '../models/admin.model';
import { SubjectResult } from '../models/subject_result.model';
import { studentResultQueue } from '../utils/queue';

const termCbtAssessmentDocumentCreation = async (
  payload: CbtAssessmentDocumentCreationType
) => {
  try {
    const {
      academic_session_id,
      term,
      assessment_type,
      min_obj_questions,
      max_obj_questions,
      expected_obj_number_of_options,
      number_of_questions_per_student,
    } = payload;

    const academicSessionExist = await Session.findById(academic_session_id);

    if (!academicSessionExist) {
      throw new AppError(
        `Academic session with id: ${academic_session_id} does not exist.`,
        404
      );
    }

    const termExist = academicSessionExist.terms.find((t) => t.name === term);

    if (!termExist) {
      throw new AppError(`${term} does not exist.`, 404);
    }

    if (termExist && termExist.is_active !== true) {
      throw new AppError(
        `${term} has ended and exam document can not be created for a term that has ended.`,
        403
      );
    }

    const existingActiveAssessmentDocument = await CbtExam.find({
      academic_session_id: academic_session_id,
      term: term,
      is_active: true,
    });

    if (existingActiveAssessmentDocument.length > 0) {
      await CbtExam.updateMany(
        {
          academic_session_id: academic_session_id,
          term: term,
          is_active: true,
        },
        { $set: { is_active: false } }
      );
    }

    const examDocExist = await CbtExam.findOne({
      academic_session_id: academic_session_id,
      term: term,
      assessment_type: assessment_type.toLowerCase().trim(),
    });

    if (examDocExist) {
      throw new AppError(
        `${assessment_type} document already created in this term.`,
        400
      );
    }

    const newExamDoc = new CbtExam({
      academic_session_id: academic_session_id,
      term: term,
      assessment_type: assessment_type.toLowerCase(),
      min_obj_questions: min_obj_questions,
      max_obj_questions: max_obj_questions,
      number_of_questions_per_student: number_of_questions_per_student,
      expected_obj_number_of_options: expected_obj_number_of_options,
    });

    await newExamDoc.save();

    return newExamDoc;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(`${error.message}`, 400);
    } else {
      console.error(error);
      throw new Error('Something went wrong');
    }
  }
};

const fetchTermCbtAssessmentDocument = async (
  payload: CbtAssessmentDocumentPayload
) => {
  try {
    const { academic_session_id, term } = payload;

    const academicSessionId = Object(academic_session_id);

    const academicSessionExist = await Session.findById(academicSessionId);

    if (!academicSessionExist) {
      throw new AppError(
        `Academic session with id: ${academic_session_id} does not exist.`,
        404
      );
    }

    const termExist = academicSessionExist.terms.find((t) => t.name === term);

    if (!termExist) {
      throw new AppError(`${term} does not exist.`, 404);
    }

    if (termExist && termExist.is_active !== true) {
      throw new AppError(
        `${term} has ended and exam document can not be created for a term that has ended.`,
        403
      );
    }

    const examDocExist = await CbtExam.findOne({
      academic_session_id: academic_session_id,
      term: term,
      is_active: true,
    });

    if (!examDocExist) {
      throw new AppError(`No assessment document found for ${term}.`, 400);
    }

    return examDocExist;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(`${error.message}`, 400);
    } else {
      console.error(error);
      throw new Error('Something went wrong');
    }
  }
};

const fetchCbtAssessmentDocumentById = async (cbt_document_id: string) => {
  try {
    const cbtAssessmentDocExist = await CbtExam.findById(cbt_document_id);

    if (!cbtAssessmentDocExist) {
      throw new AppError(`Cbt assessment document not found.`, 400);
    }

    return cbtAssessmentDocExist;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(`${error.message}`, 400);
    } else {
      console.error(error);
      throw new Error('Something went wrong');
    }
  }
};

const fetchAllClassCbtAssessmentTimetables = async (
  class_id: string,
  page?: number,
  limit?: number,
  searchParams = ''
) => {
  try {
    const classId = Object(class_id);

    const classExist = await Class.findById(classId);

    if (!classExist) {
      throw new AppError('Class does not exist.', 404);
    }

    let query = ClassExamTimetable.find({}).sort({ createdAt: -1 });

    if (searchParams?.trim()) {
      const regex = new RegExp(searchParams, 'i');

      query = query.where({
        $or: [
          { term: { $regex: regex } },
          { assessment_type: { $regex: regex } },
        ],
      });
    }

    const count = await query.clone().countDocuments();
    let pages = 1;

    if (page && limit && count !== 0) {
      const offset = (page - 1) * limit;
      query = query.skip(offset).limit(limit);
      pages = Math.ceil(count / limit);

      if (page > pages) {
        throw new AppError('Pages can not be found.', 404);
      }
    }

    const timetableExist = await query
      .sort({ createdAt: -1 })
      .populate('scheduled_subjects.subject_id');

    if (!timetableExist || timetableExist.length === 0) {
      throw new AppError(
        `${classExist.name} does not have CBT assessment timetable.`,
        400
      );
    }

    return {
      timetableExist: timetableExist,
      totalCount: count,
      totalPages: pages,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(`${error.message}`, 400);
    } else {
      console.error(error);
      throw new Error('Something went wrong');
    }
  }
};

// We need to fetch timetable by id or by result header name since we will now be having timetable for test and exam as well.
const fetchTermClassCbtAssessmentTimetable = async (
  payload: GetClassCbtAssessmentTimetablePayloadType
) => {
  try {
    const { academic_session_id, class_id, term } = payload;

    const classId = Object(class_id);
    const academicSessionId = Object(academic_session_id);

    const academicSessionExist = await Session.findById(academicSessionId);

    if (!academicSessionExist) {
      throw new AppError(
        `Academic session with id: ${academic_session_id} does not exist.`,
        404
      );
    }

    const termExist = academicSessionExist.terms.find((t) => t.name === term);

    if (!termExist) {
      throw new AppError(`${term} does not exist.`, 404);
    }

    if (termExist && termExist.is_active !== true) {
      throw new AppError(
        `${term} has ended and set exam questions for a term that has ended.`,
        403
      );
    }

    const classExist = await Class.findById(classId);

    if (!classExist) {
      throw new AppError('Class does not exist.', 404);
    }

    const timetableExists = await ClassExamTimetable.findOne({
      class_id: classExist._id,
      academic_session_id: academicSessionExist._id,
      term: term,
    }).populate('scheduled_subjects.subject_id');

    if (!timetableExists) {
      throw new AppError(
        `${classExist.name} does not have exam timetable for ${term}.`,
        400
      );
    }

    return timetableExists;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(`${error.message}`, 400);
    } else {
      console.error(error);
      throw new Error('Something went wrong');
    }
  }
};

const termClassCbtAssessmentTimetableCreation = async (
  payload: ClassCbtAssessmentTimetablePayloadType
) => {
  try {
    const {
      academic_session_id,
      class_id,
      user_id,
      userRole,
      term,
      timetable,
    } = payload;

    const classId = Object(class_id);
    const academicSessionId = Object(academic_session_id);
    const userId = Object(user_id);

    const uniquesSubjectId = new Set();
    const duplicateSubjectId = new Set();
    const timeSlot = new Set();

    timetable.forEach((a) => {
      const key = a.subject_id;

      if (uniquesSubjectId.has(key)) {
        duplicateSubjectId.add(key);
      } else {
        uniquesSubjectId.add(key);
      }
    });

    if (duplicateSubjectId.size > 0) {
      throw new AppError(
        `Duplicate subject found for: ${Array.from(duplicateSubjectId).join(
          ', '
        )} IDs.`,
        400
      );
    }

    for (const entry of timetable) {
      const key = `${new Date(entry.start_time).toISOString()}`;

      if (timeSlot.has(key)) {
        throw new AppError(
          `Duplicate time slot detected ${formatDate(entry.start_time)}.`,
          400
        );
      }
      timeSlot.add(key);
    }

    let userExist: UserDocument | null = null;

    if (userRole === 'super_admin') {
      userExist = await SuperAdmin.findById({
        _id: userId,
      });
    } else if (userRole === 'admin') {
      userExist = await Admin.findById({
        _id: userId,
      });
    } else {
      throw new AppError('Invalid user role.', 400);
    }

    if (!userExist || userExist === null) {
      throw new AppError('User not found.', 400);
    }

    const academicSessionExist = await Session.findById(academicSessionId);

    if (!academicSessionExist) {
      throw new AppError(
        `Academic session with id: ${academic_session_id} does not exist.`,
        404
      );
    }

    const termExist = academicSessionExist.terms.find((t) => t.name === term);

    if (!termExist) {
      throw new AppError(`${term} does not exist.`, 404);
    }

    if (termExist && termExist.is_active !== true) {
      throw new AppError(
        `${term} has ended and you can not set exam questions for a term that has ended.`,
        403
      );
    }

    const classExist = await Class.findById(classId);

    if (!classExist) {
      throw new AppError('Class does not exist.', 404);
    }

    const classEnrolmentExist = await ClassEnrolment.findOne({
      academic_session_id: academicSessionExist._id,
      class: classExist._id,
    });

    if (!classEnrolmentExist) {
      throw new AppError(
        'There is no enrollment into this class in this session.',
        404
      );
    }

    const cbtExamExist = await CbtExam.findOne({
      academic_session_id: academicSessionExist._id,
      term: term,
      is_active: true,
    });

    if (!cbtExamExist) {
      throw new AppError(
        `Reach out to the school management to initialize processes before continuing.`,
        400
      );
    }

    const timetableExist = await ClassExamTimetable.findOne({
      class_id: classExist._id,
      academic_session_id: academicSessionExist._id,
      term: term,
      assessment_type: cbtExamExist.assessment_type,
    });

    if (timetableExist) {
      throw new AppError(
        `${classExist.name} already have ${timetableExist.assessment_type} timetable for ${term}.`,
        400
      );
    }

    const schoolCutoffTimeExist = await CbtCutoff.findOne();

    if (!schoolCutoffTimeExist) {
      throw new AppError(
        `Please tell the school authority to contact the developer so as to set the school cut off times. This is needed to proceed.`,
        400
      );
    }

    // Get all the subject that have the same date and check if there is enough time between two subject time table
    // There is an issue here that is preventing exam from happening the same day so fix it
    const groupedByDate: Record<string, typeof timetable> = {};
    for (const entry of timetable) {
      const date = new Date(entry.start_time).toISOString().split('T')[0];
      const time = new Date(entry.start_time).toISOString().split('T')[1];

      const currentTime = new Date();
      const entryStartTime = new Date(entry.start_time);

      console.log('currentTime:', currentTime);
      console.log('entryStartTime:', entryStartTime);
      if (currentTime > entryStartTime) {
        throw new AppError(
          `Please ensure that the time chosen for all subject are not in the past.`,
          400
        );
      }

      console.log('date:', date);
      console.log('time:', time);
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(entry);
      console.log('groupedByDate:', groupedByDate);
    }

    for (const date in groupedByDate) {
      const subjects = groupedByDate[date];
      console.log('subjects:', subjects);

      subjects.sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );

      for (let i = 0; i < subjects.length - 1; i++) {
        const current = subjects[i];
        const next = subjects[i + 1];

        console.log('current:', current);
        console.log('next:', next);

        const currentStart = new Date(current.start_time);
        const currentDuration = (current.duration || 0) / 60;
        const cutoffTimeSum =
          schoolCutoffTimeExist.first_cutoff_minutes +
          schoolCutoffTimeExist.last_cutoff_minutes;
        const bufferMinutes = currentDuration + cutoffTimeSum;

        console.log('currentStart:', currentStart);
        console.log('currentDuration:', currentDuration);
        console.log('bufferMinutes:', bufferMinutes);

        const currentEndWithBuffer = new Date(
          currentStart.getTime() + bufferMinutes * 60 * 1000
        );
        console.log('currentEndWithBuffer:', currentEndWithBuffer);

        const nextStart = new Date(next.start_time);
        console.log('nextStart:', nextStart);

        const responseError = `Time table with subject with ID: ${next.subject_id} can only be set to start anytime from ${currentEndWithBuffer}`;

        console.log(
          `Next subject can only start after: ${currentEndWithBuffer.toISOString()} but is set to: ${nextStart.toISOString()}`
        );

        if (nextStart < currentEndWithBuffer) {
          throw new AppError(responseError, 400);
        }
      }
    }

    if (timetableExist) {
      throw new AppError(
        `${classExist.name} already have exam timetable for ${term}.`,
        400
      );
    }

    const newTimetable = new ClassExamTimetable({
      exam_id: cbtExamExist._id,
      class_id: classExist._id,
      academic_session_id: academicSessionExist._id,
      term: term,
      assessment_type: cbtExamExist.assessment_type,
      scheduled_subjects: timetable,
    });

    await newTimetable.save();

    return newTimetable;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(`${error.message}`, 400);
    } else {
      console.error(error);
      throw new Error('Something went wrong');
    }
  }
};

const fetchAllCbtAssessmentDocument = async (
  page?: number,
  limit?: number,
  searchParams = ''
) => {
  try {
    let query = CbtExam.find({}).sort({ createdAt: -1 });

    if (searchParams?.trim()) {
      const regex = new RegExp(searchParams, 'i');

      query = query.where({
        $or: [
          { term: { $regex: regex } },
          { assessment_type: { $regex: regex } },
        ],
      });
    }

    const count = await query.clone().countDocuments();
    let pages = 1;

    // If page and limit are defined, apply pagination
    if (page && limit && count !== 0) {
      const offset = (page - 1) * limit;
      query = query.skip(offset).limit(limit);
      pages = Math.ceil(count / limit);

      if (page > pages) {
        throw new AppError('Page can not be found.', 404);
      }
    }

    const findExams = await query.sort({ createdAt: -1 });

    if (!findExams || findExams.length === 0) {
      throw new AppError('Exam documents not found.', 404);
    }
    return {
      examObj: findExams,
      totalCount: count,
      totalPages: pages,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    }
    throw new Error('Something went wrong.');
  }
};

const objQestionSetting = async (
  payload: SubjectObjQuestionDocumentCreationType
) => {
  try {
    const {
      academic_session_id,
      class_id,
      questions_array,
      term,
      subject_id,
      teacher_id,
    } = payload;

    const classId = Object(class_id);
    const subjectId = Object(subject_id);
    const academicSessionId = Object(academic_session_id);

    const academicSessionExist = await Session.findById(academicSessionId);

    if (!academicSessionExist) {
      throw new AppError(
        `Academic session with id: ${academic_session_id} does not exist.`,
        404
      );
    }

    const termExist = academicSessionExist.terms.find((t) => t.name === term);

    if (!termExist) {
      throw new AppError(`${term} does not exist.`, 404);
    }

    if (termExist && termExist.is_active !== true) {
      throw new AppError(
        `${term} has ended and set exam questions for a term that has ended.`,
        403
      );
    }

    const classExist = await Class.findById(classId);

    if (!classExist) {
      throw new AppError('Class does not exist.', 404);
    }

    const subjectExist = await Subject.findById(subjectId);

    if (!subjectExist) {
      throw new AppError('Subject not found', 404);
    }

    const subjectInClass = classExist.compulsory_subjects.find(
      (r) => r.toString() === subjectExist._id.toString()
    );

    if (!subjectInClass) {
      throw new AppError(
        `${subjectExist.name} is not offered in ${classExist.name}.`,
        400
      );
    }

    const actualSubjectTeacher = classExist.teacher_subject_assignments.find(
      (a) => a.subject.toString() === subjectExist._id.toString()
    );

    const teacherExist = await Teacher.findById(teacher_id);

    if (!teacherExist) {
      throw new AppError('Teacher not found.', 404);
    }

    if (
      actualSubjectTeacher &&
      actualSubjectTeacher.teacher.toString() !== teacherExist?._id.toString()
    ) {
      throw new AppError(
        `You are not the subject teacher of ${subjectExist.name} in ${classExist.name}. It is only the subject teacher for the class that can set exams for the subject in the class.`,
        403
      );
    }

    const examDocExist = await CbtExam.findOne({
      academic_session_id: academicSessionExist._id,
      term: term,
      is_active: true,
    });

    if (!examDocExist) {
      throw new AppError(
        `Question submission has not being authorized by the school. Please reach out to the school authority.`,
        400
      );
    }

    const classExamTimetable = await ClassExamTimetable.findOne({
      exam_id: examDocExist._id,
      academic_session_id: academicSessionExist._id,
      class_id: classExist._id,
      term: term,
      assessment_type: examDocExist.assessment_type,
    });

    if (!classExamTimetable) {
      throw new AppError(
        `Assessment Timetable has not been created for ${classExist.name} for ${term}. Please ensure that assessment timetable has been created before setting questions.`,
        400
      );
    }

    if (classExamTimetable.exam_id.toString() !== examDocExist._id.toString()) {
      throw new AppError(
        `The timetable found does not match CBT assessment.`,
        400
      );
    }

    const minLength = examDocExist.min_obj_questions;
    const questionsPerstudent = examDocExist.number_of_questions_per_student;
    const maxLength = examDocExist.max_obj_questions;

    if (questions_array.length < minLength) {
      throw new AppError(
        `The number of questions set is less than ${minLength} which is the minimum number expected.`,
        400
      );
    }

    if (questions_array.length < questionsPerstudent) {
      throw new AppError(
        `The number of questions set is less than ${questionsPerstudent} which is the expected number of questions per student.`,
        400
      );
    }

    if (questions_array.length > maxLength) {
      throw new AppError(
        `The number of questions set is more than ${maxLength} which is the maximum number allowed.`,
        400
      );
    }

    const optionsLength = questions_array.filter(
      (r) => r.options.length !== examDocExist.expected_obj_number_of_options
    );

    if (optionsLength.length > 0) {
      throw new AppError(
        `Please ensure that all questions' options is ${examDocExist.expected_obj_number_of_options}.`,
        400
      );
    }

    const duplicateQuestions = new Set();
    const uniqueQuestions = new Set();

    questions_array.forEach((q) => {
      const key = q.question_text.trim().toLowerCase();
      const options = q.options;

      if (uniqueQuestions.has(key) && uniqueQuestions.has(options)) {
        duplicateQuestions.add(key);
      } else {
        uniqueQuestions.add(key);
      }
    });

    if (duplicateQuestions.size > 0) {
      throw new AppError(
        `Duplicate question found for: ${Array.from(duplicateQuestions).join(
          ', '
        )}.`,
        400
      );
    }

    const subjectQuestionExist = await CbtQuestion.findOne({
      academic_session_id: academicSessionExist._id,
      term: term,
      class_id: classExist._id,
      subject_id: subjectExist._id,
      exam_id: examDocExist._id,
    });

    if (subjectQuestionExist && subjectQuestionExist.obj_questions.length > 0) {
      throw new AppError(
        `${examDocExist.assessment_type} question has been submitted for ${subjectExist.name} in ${classExist.name}.`,
        400
      );
    }

    const actualSubjectExamTime = classExamTimetable.scheduled_subjects.find(
      (s) => s.subject_id.toString() === subject_id.toString()
    );

    if (!actualSubjectExamTime) {
      throw new AppError(`This subject does not have timetable.`, 404);
    }

    const start_time = new Date(actualSubjectExamTime.start_time);

    const subjectExamDuration = actualSubjectExamTime.duration;

    // create cbt cut off time inside the function file and call it since it is for a single school
    const schoolCutoff = await CbtCutoff.findOne();

    if (!schoolCutoff) {
      throw new AppError(
        `Please reach out to developer to setup your school cutoff minutes before proceeding.`,
        400
      );
    }

    const first_cutoff_minutes = schoolCutoff.first_cutoff_minutes;
    const last_cutoff_minutes = schoolCutoff.last_cutoff_minutes;

    const initial_cutoff_time = new Date(
      start_time.getTime() + first_cutoff_minutes * 60000
    );

    const final_cutoff_time = new Date(
      start_time.getTime() +
        first_cutoff_minutes * 60000 +
        subjectExamDuration * 1000 +
        // subjectExamDuration * 60000 +
        last_cutoff_minutes * 60000
    );

    const questionsToLowerCase = normalizeQuestions(questions_array);

    const newSubjectQuestion = new CbtQuestion({
      exam_id: examDocExist._id,
      academic_session_id: academicSessionExist._id,
      class_id: classExist._id,
      subject_id: subjectExist._id,
      term: term,
      teacher_id: teacher_id,
      level: classExist.level,
      obj_questions: questionsToLowerCase,
      // obj_questions: questions_array,
      obj_start_time: actualSubjectExamTime?.start_time,
      obj_initial_cutoff_time: initial_cutoff_time,
      obj_final_cutoff_time: final_cutoff_time,
      obj_total_time_allocated: subjectExamDuration,
    });

    actualSubjectExamTime.is_subject_question_set = true;

    await newSubjectQuestion.save();
    await classExamTimetable.save();

    const subject_name = subjectExist.name;

    const returnObj = {
      newSubjectQuestion,
      subject_name,
    };

    return returnObj;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(`${error.message}`, 400);
    } else {
      console.error(error);
      throw new Error('Something went wrong');
    }
  }
};

const studentCbtSubjectCbtAssessmentAuthorization = async (
  payload: CbtAssessmentAuthorizationPayloadType
) => {
  try {
    const {
      subject_id,
      term,
      academic_session_id,
      class_id,
      teacher_id,
      students_id_array,
    } = payload;

    const subjectId = Object(subject_id);
    const academicSessionId = Object(academic_session_id);
    const classId = Object(class_id);

    const duplicateIds = new Set();
    const uniqueIds = new Set();

    students_id_array.forEach((a) => {
      if (uniqueIds.has(a)) {
        duplicateIds.add(a);
      } else {
        uniqueIds.add(a);
      }
    });

    if (duplicateIds.size > 0) {
      throw new AppError(
        `The following IDs: ${Array.from(duplicateIds).join(
          ', '
        )} appear more than ones.`,
        400
      );
    }

    const academicSessionExist = await Session.findById(academicSessionId);

    if (!academicSessionExist) {
      throw new AppError(
        `Academic session with id: ${academic_session_id} does not exist.`,
        404
      );
    }

    const activeTermExist = academicSessionExist.terms.find(
      (t) => t.is_active === true
    );

    if (!activeTermExist) {
      throw new AppError('There is no active in the session.', 400);
    }

    const classExist = await Class.findById(classId);

    if (!classExist) {
      throw new AppError('This Class does not exist.', 404);
    }

    if (!classExist.class_teacher) {
      throw new AppError(
        `${classExist.name} does not have a class teacher yet.`,
        400
      );
    }

    if (classExist.class_teacher.toString() !== teacher_id.toString()) {
      throw new AppError(
        `You are not the class teacher of ${classExist.name}.`,
        400
      );
    }

    const classEnrolmentExist = await ClassEnrolment.findOne({
      class: classExist._id,
      academic_session_id: academicSessionExist._id,
    });

    if (!classEnrolmentExist) {
      throw new AppError('There is no enrolment for this class.', 404);
    }

    if (classEnrolmentExist.is_active !== true) {
      throw new AppError(
        'There is no active class enrolment for this class.',
        404
      );
    }

    const studentNotEnrolled = students_id_array.filter(
      (s) =>
        !classEnrolmentExist.students.some(
          (a) => a.student.toString() === s.toString()
        )
    );

    if (studentNotEnrolled.length > 0) {
      throw new AppError(
        `Students with the following IDs: ${studentNotEnrolled.join(
          ', '
        )} are not enrolled into ${classExist.name}.`,
        400
      );
    }

    const examDocExist = await CbtExam.findOne({
      academic_session_id: academicSessionExist._id,
      term: term,
      is_active: true,
    });

    if (!examDocExist) {
      throw new AppError(
        `CBT assessment  has not being authorized to start.`,
        403
      );
    }

    const questionExist = await CbtQuestion.findOne({
      academic_session_id: academicSessionExist._id,
      term: term,
      class_id: classExist._id,
      subject_id: subjectId,
      exam_id: examDocExist._id,
    });

    if (!questionExist) {
      throw new AppError(
        `Question does not exist for this subject in ${term}.`,
        404
      );
    }

    const current_time = new Date().getTime();
    const start_time = new Date(questionExist.obj_start_time).getTime();
    const examCutoffTime = new Date(
      questionExist.obj_final_cutoff_time
    ).getTime();

    console.log('current_time:', current_time);
    console.log('start_time:', start_time);
    console.log('examCutoffTime:', examCutoffTime);

    if (current_time < start_time) {
      throw new AppError(
        `You cannot authorize the start of the exam before the scheduled time. Exam Start time: ${questionExist.obj_start_time}`,
        401
      );
    }

    // if (current_time > examCutoffTime) {
    //   throw new AppError(
    //     `Students are already late to start the exam. Refer them to the school authority.`,
    //     400
    //   );
    // }

    // current time < start time - not yet time to start
    // current time > exam cut off time - student can no longer be authorized because student is already late

    const actualExamTimeTable = await ClassExamTimetable.findOne({
      academic_session_id: academicSessionExist._id,
      class_id: classExist._id,
      term: term,
      exam_id: questionExist.exam_id,
      assessment_type: examDocExist.assessment_type,
    });

    if (!actualExamTimeTable) {
      throw new AppError(
        `There is no timetable for ${classExist.name} in this ${term} in ${academicSessionExist.academic_session}.`,
        400
      );
    }

    const findSubjectTimetable = actualExamTimeTable.scheduled_subjects.find(
      (s) => s.subject_id.toString() === subject_id
    );
    if (!findSubjectTimetable) {
      throw new AppError(
        `The time to write this subject exam is not taken care off in the timetable.`,
        400
      );
    }

    const studentIds = questionExist.allowed_students.map((a) => a);

    const matchedIds = students_id_array.filter((b) =>
      studentIds.some((a) => a.toString() === b.toString())
    );

    const notMatchedIds = students_id_array.filter(
      (b) => !studentIds.some((a) => a.toString() === b.toString())
    );

    // const studentsInTimtableArray = findSubjectTimetable.authorized_students.map((c)=>c)

    //   const matchedIdsInsideTimetable = students_id_array.filter((b) =>
    //   studentsInTimtableArray.some((a) => a.toString() === b.toString())
    // );

    // const notMatchedIdsInsideTimetable = students_id_array.filter(
    //   (b) => !studentsInTimtableArray.some((a) => a.toString() === b.toString())
    // );

    if (matchedIds.length > 0 && notMatchedIds.length === 0) {
      throw new AppError(
        `The following IDs: ${matchedIds.join(
          ', '
        )} are already allowed to take the CBT subject exam.`,
        400
      );
    }

    await CbtQuestion.updateOne(
      { _id: questionExist._id },
      { $addToSet: { allowed_students: { $each: notMatchedIds } } }
    );

    const savedTimetable = await ClassExamTimetable.updateOne(
      {
        _id: actualExamTimeTable._id,
        'scheduled_subjects.subject_id': subjectId,
      },
      {
        $addToSet: {
          'scheduled_subjects.$.authorized_students': { $each: notMatchedIds },
        },
      }
    );

    console.log('savedTimetable:', savedTimetable);

    const ids = questionExist.allowed_students.map((id) => id);

    return ids;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(`${error.message}`, 400);
    } else {
      console.error(error);
      throw new Error('Something went wrong');
    }
  }
};

const subjectCbtObjCbtAssessmentStarting = async (
  payload: CbtAssessmentStartingType
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { academic_session_id, class_id, student_id, term, subject_id } =
      payload;

    const classId = Object(class_id);
    const studentId = Object(student_id);
    const academicSessionId = Object(academic_session_id);
    const subjectId = Object(subject_id);

    const academicSessionExist = await Session.findById(
      academicSessionId
    ).session(session);

    if (!academicSessionExist) {
      throw new AppError(
        `Academic session with id: ${academic_session_id} does not exist.`,
        404
      );
    }

    const termExist = academicSessionExist.terms.find((t) => t.name === term);

    if (!termExist) {
      throw new AppError(`${term} does not exist.`, 404);
    }

    if (termExist && termExist.is_active !== true) {
      throw new AppError(
        `${term} has ended and set exam questions for a term that has ended.`,
        403
      );
    }

    const studentExist = await Student.findById(studentId).session(session);

    if (!studentExist) {
      throw new AppError('Student not found.', 404);
    }

    const classExist = await Class.findById(classId).session(session);

    if (!classExist) {
      throw new AppError('Class does not exist in the school.', 404);
    }

    const classEnrolmentExist = await ClassEnrolment.findOne({
      academic_session_id: academicSessionExist._id,
      class: classExist._id,
    }).session(session);

    if (!classEnrolmentExist) {
      throw new AppError(
        'There is no enrollment into this class in this session.',
        404
      );
    }

    const studentInEnrolment = classEnrolmentExist.students.find(
      (s) => s.student.toString() === studentExist._id.toString()
    );

    if (!studentInEnrolment) {
      throw new AppError(
        `${studentExist.first_name} ${studentExist.last_name} does not belong to ${classExist.name}.`,
        400
      );
    }

    const examDocExist = await CbtExam.findOne({
      academic_session_id: academicSessionExist._id,
      term: term,
      is_active: true,
    }).session(session);

    if (!examDocExist) {
      throw new AppError(`Exam has not being authorized to start.`, 403);
    }

    console.log('examDocExist:', examDocExist._id);
    console.log('term:', term);
    console.log('subjectId:', subjectId);
    const exam = await CbtQuestion.findOne({
      academic_session_id: academic_session_id,
      term: term,
      exam_id: examDocExist._id,
      subject_id: subjectId,
      class_id: classId,
    }).session(session);
    console.log('exam:', exam);

    if (!exam) {
      throw new AppError(`${term} Exam question not found.`, 400);
    }

    const studentAuthorized = exam.allowed_students.find(
      (a) => a.toString() === studentExist._id.toString()
    );

    console.log('exam.allowed_students:', exam.allowed_students);
    console.log('studentAuthorized:', studentAuthorized);
    console.log('studentExist._id:', studentExist._id);

    if (!studentAuthorized) {
      throw new AppError(
        `${capitalizeFirstLetter(
          studentExist.first_name
        )} ${capitalizeFirstLetter(
          studentExist.last_name
        )} has not being authorized to start the exam. Please reach out to your class teacher.`,
        400
      );
    }

    const current_time = Date.now();

    // if (current_time > examCutoffTime) {
    //   throw new AppError(
    //     `You can not take this subject CBT exam again as the grace period has passed. Reach out to the school authority.`,
    //     400
    //   );
    // }
    const end_time = exam.obj_final_cutoff_time.getTime();
    const start_time = new Date(exam.obj_start_time).getTime();
    console.log('end_time:', end_time);
    console.log('start_time:', start_time);

    if (current_time < start_time) {
      throw new AppError(
        `You cannot start the exam before the scheduled time. Exam Start time: ${formatDate(
          exam.obj_start_time
        )}`,
        401
      );
    }

    if (current_time > end_time) {
      throw new AppError(
        `This exam has ended because the time for the exam has passed. Exam End time: ${formatDate(
          exam.obj_final_cutoff_time
        )}`,
        401
      );
    }

    let result = await CbtResult.findOne({
      exam_id: examDocExist._id,
      student_id: studentId,
      subject_id: subjectId,
      class_id: classId,
      enrolment: classEnrolmentExist._id,
    }).session(session);

    if (result?.obj_status === 'submitted') {
      throw new AppError('Exam already submitted.', 400);
    }

    if (!result) {
      const intial_cutoff_time = new Date(
        exam.obj_initial_cutoff_time
      ).getTime();

      console.log('current_time:', current_time);

      // if (current_time > intial_cutoff_time) {
      //   throw new AppError(
      //     `You cannot start the CBT subject Objective exam again because you are already late. Reach out to the school admin.`,
      //     401
      //   );
      // }

      const expectedQuestionPerStudent =
        examDocExist.number_of_questions_per_student;

      const shuffledQuestions = exam.obj_questions
        .map((q) => q)
        .sort(() => Math.random() - 0.5)
        .slice(0, expectedQuestionPerStudent)
        .map((q, idx) => ({
          _id: q._id,
          question_shuffled_number: idx + 1,
          question_original_number: q.question_number,
          question_text: q.question_text,
          options: q.options.map((p) => p).sort(() => Math.random() - 0.5),
          score: q.score,
          student_score: null,
          selected_answer: null,
          correct_answer: q.correct_answer,
        }));

      console.log('shuffledQuestions:', shuffledQuestions);

      result = new CbtResult({
        exam_id: examDocExist._id,
        academic_session_id: exam.academic_session_id,
        term: exam.term,
        subject_id: exam.subject_id,
        subject_teacher: exam.teacher_id,
        class_id: classId,
        level: classExist.level,
        enrolment: classEnrolmentExist._id,
        student_id: studentId,
        shuffled_obj_questions: shuffledQuestions,
        obj_total_time_allocated: exam.obj_total_time_allocated,
        obj_time_left: exam.obj_total_time_allocated,
        obj_final_cutoff_time: exam.obj_final_cutoff_time,
        obj_start_time: exam.obj_start_time,
        obj_status: examStatusEnum[1],
      });

      await result.save({ session });
    }

    const populatedValues = await result.populate<{
      subject_id: { name: string };
      subject_teacher: { first_name: string; last_name: string };
    }>([
      { path: 'subject_id', select: 'name' },
      { path: 'subject_teacher', select: 'first_name last_name' },
    ]);
    const { shuffled_obj_questions, ...others } = populatedValues.toJSON();

    const sanitizedQuestions = shuffled_obj_questions.map(
      ({ correct_answer, question_original_number, score, ...rest }) => rest
    );

    const actualExamTimeTable = await ClassExamTimetable.findOne({
      academic_session_id: academicSessionExist._id,
      class_id: classExist._id,
      term: term,
      exam_id: exam.exam_id,
      assessment_type: examDocExist.assessment_type,
    }).session(session);

    if (!actualExamTimeTable) {
      throw new AppError(
        `There is no timetable for ${classExist.name} in this ${term} in ${academicSessionExist.academic_session}.`,
        400
      );
    }

    const findSubjectTimetable = actualExamTimeTable.scheduled_subjects.find(
      (s) => s.subject_id.toString() === subject_id
    );

    if (!findSubjectTimetable) {
      throw new AppError(
        `The time to write this subject exam is not taken care off in the timetable.`,
        400
      );
    }

    // const studentAlreadyInside =
    //   findSubjectTimetable.students_that_have_started.includes(
    //     result.student_id
    //   );

    // if (!studentAlreadyInside) {
    //   findSubjectTimetable.students_that_have_started.push(result.student_id);
    // }

    await ClassExamTimetable.updateOne(
      {
        academic_session_id: academicSessionExist._id,
        class_id: classExist._id,
        term: term,
        exam_id: exam.exam_id,
        assessment_type: examDocExist.assessment_type,
        'scheduled_subjects.subject_id': subject_id,
      },
      {
        $addToSet: {
          'scheduled_subjects.$.students_that_have_started': result.student_id,
        },
      },
      { session }
    );

    const returnObj = {
      others: {
        ...others,
        subject_name: populatedValues.subject_id?.name,
        subject_teacher_name: `${populatedValues.subject_teacher?.first_name} ${populatedValues.subject_teacher?.last_name}`,
      },
      sanitizedQuestions,
    };

    console.log('exam starting returnObj:', returnObj);

    await actualExamTimeTable.save({ session });
    await session.commitTransaction();
    session.endSession();

    return returnObj;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw new AppError(`${error.message}`, 400);
    } else {
      console.error(error);
      throw new Error('Something went wrong');
    }
  }
};

const subjectCbtObjCbtAssessmentUpdate = async (
  payload: CbtAssessmentUpdateType
) => {
  // const session = await mongoose.startSession();
  // session.startTransaction();
  try {
    const { cbt_result_id, exam_id, result_doc, student_id } = payload;

    const studentId = Object(student_id);
    const examId = Object(exam_id);
    const cbtResultId = Object(cbt_result_id);

    const studentExist = await Student.findById(studentId);

    if (!studentExist) {
      throw new AppError('Student not found.', 404);
    }

    const examDocExist = await CbtExam.findById(examId);

    if (!examDocExist) {
      throw new AppError(`Exam has not being authorized to start.`, 403);
    }

    let result = await CbtResult.findOne({
      _id: cbtResultId,
      exam_id: examDocExist._id,
      student_id: studentId,
    });

    if (!result) {
      throw new AppError(`Result does not exist.`, 404);
    }

    if (result.obj_status !== examStatusEnum[1]) {
      throw new AppError(
        'This subject exam is not in-progress. It is either completed or ended.',
        400
      );
    }

    const current_time = Date.now();
    const examCutoffTime = result.obj_final_cutoff_time.getTime();
    const start_time = new Date(result.obj_start_time).getTime();

    if (current_time < start_time) {
      throw new AppError(
        `You cannot update the exam before the scheduled time. Exam Start time: ${result.obj_start_time}`,
        401
      );
    }

    if (current_time > examCutoffTime) {
      throw new AppError(
        `You can not update this subject CBT exam again as the subject CBT exam has ended. Reach out to the school authority.`,
        400
      );
    }

    console.log('Exam CBT selected answer is being updated here');

    const questionMap = new Map(
      result.shuffled_obj_questions.map((q) => [q._id.toString(), q])
    );

    result_doc.forEach((a) => {
      const existingQuestion = questionMap.get(a._id.toString());

      if (existingQuestion) {
        existingQuestion.selected_answer = a.selected_answer;
      }
    });

    await result.save();

    // const { shuffled_obj_questions, ...others } = result.toJSON();
    console.log(
      'what is being sent back after update is successful:'
      // shuffled_obj_questions
    );

    // const sanitizedQuestions = shuffled_obj_questions.map(
    //   ({ correct_answer, question_original_number, score, ...rest }) => rest
    // );

    // const returnObj = {
    //   others,
    //   sanitizedQuestions,
    // };

    // await session.commitTransaction();
    // session.endSession();

    return result_doc;
  } catch (error) {
    // await session.abortTransaction();
    // session.endSession();
    if (error instanceof AppError) {
      throw new AppError(`${error.message}`, 400);
    } else {
      console.error(error);
      throw new Error('Something went wrong');
    }
  }
};

const subjectCbtObjCbtAssessmentRemainingTimeUpdate = async (
  payload: CbtAssessmentTimeUpdateType
) => {
  // const session = await mongoose.startSession();
  // session.startTransaction();
  try {
    const { cbt_result_id, exam_id, remaining_time, student_id } = payload;

    const studentId = Object(student_id);
    const examId = Object(exam_id);
    const cbtResultId = Object(cbt_result_id);

    const studentExist = await Student.findById(studentId);

    if (!studentExist) {
      throw new AppError('Student not found.', 404);
    }

    const examDocExist = await CbtExam.findById(examId);

    if (!examDocExist) {
      throw new AppError(`Exam has not being authorized to start.`, 403);
    }

    let result = await CbtResult.findOne({
      _id: cbtResultId,
      exam_id: examDocExist._id,
      student_id: studentId,
    });

    if (!result) {
      throw new AppError(`Result does not exist.`, 404);
    }

    if (result.obj_status !== examStatusEnum[1]) {
      throw new AppError(
        'This subject exam is not in-progress. It is either completed or ended.',
        400
      );
    }

    const current_time = Date.now();
    const examCutoffTime = result.obj_final_cutoff_time.getTime();
    const start_time = new Date(result.obj_start_time).getTime();

    if (current_time < start_time) {
      throw new AppError(
        `You cannot update the exam before the scheduled time. Exam Start time: ${result.obj_start_time}`,
        401
      );
    }

    if (current_time > examCutoffTime) {
      throw new AppError(
        `You can not update this subject CBT exam again as the subject CBT exam has ended. Reach out to the school authority.`,
        400
      );
    }

    console.log('Exam CBT remaining time is being updated here');

    result.obj_time_left = remaining_time;

    await result.save();

    // await session.commitTransaction();
    // session.endSession();

    return result.obj_time_left;
  } catch (error) {
    // await session.abortTransaction();
    // session.endSession();
    if (error instanceof AppError) {
      throw new AppError(`${error.message}`, 400);
    } else {
      console.error(error);
      throw new Error('Something went wrong');
    }
  }
};

// const subjectCbtObjCbtAssessmentSubmission = async (payload: CbtAssessmentEndedType) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     const { cbt_result_id, exam_id, result_doc, student_id, trigger_type } =
//       payload;

//     const studentId = Object(student_id);
//     const examId = Object(exam_id);
//     const cbtResultId = Object(cbt_result_id);

//     const studentExist = await Student.findById(studentId).session(session);

//     if (!studentExist) {
//       throw new AppError('Student not found.', 404);
//     }

//     const examDocExist = await CbtExam.findById({
//       _id: examId,
//     }).session(session);

//     if (!examDocExist) {
//       throw new AppError(`Exam has not being authorized to start.`, 403);
//     }

//     let result = await CbtResult.findOne({
//       _id: cbtResultId,
//       exam_id: examDocExist._id,
//       student_id: studentId,
//     }).session(session);

//     if (!result) {
//       throw new AppError(`Result does not exist.`, 404);
//     }

//     console.log('result.obj_status:', result.obj_status);

//     const notStarted = result.obj_status === examStatusEnum[0];
//     const isSubmitted = result.obj_status === examStatusEnum[2];
//     if (notStarted || isSubmitted) {
//       console.log('result.obj_status:', result.obj_status);
//       throw new AppError(
//         'This subject exam is not in-progress. It is either completed or ended. Here',
//         400
//       );
//     }

//     const current_time = Date.now();
//     const start_time = new Date(result.obj_start_time).getTime();
//     const end_time = new Date(result.obj_final_cutoff_time).getTime();
//     const grace_period = 5 * 60 * 1000;
//     const finalSubmission = end_time + grace_period;

//     if (current_time < start_time) {
//       throw new AppError(
//         `You cannot update the exam before the scheduled time.`,
//         401
//       );
//     }

//     if (current_time > finalSubmission) {
//       throw new AppError(`Exam is over.`, 401);
//     }

//     // START CHECKING TRIGGER TYPE HERE
//     if (trigger_type === triggerTypeEnum[0]) {
//       result.obj_time_left = result_doc.obj_time_left;
//       result.obj_status = examStatusEnum[2];
//     } else if (trigger_type === triggerTypeEnum[1]) {
//       result.obj_time_left = result_doc.obj_time_left;
//       result.obj_status = examStatusEnum[2];
//     } else if (trigger_type === triggerTypeEnum[2]) {
//       const examCutoffTime = result.obj_final_cutoff_time.getTime();
//       if (current_time < examCutoffTime) {
//         throw new AppError(
//           `It is not yet the final cutoff time so student can still take exam.`,
//           400
//         );
//       }

//       result.obj_time_left = result.obj_time_left;
//       result.obj_status = examStatusEnum[3];
//     }

//     const questionMap = new Map(
//       result.shuffled_obj_questions.map((q) => [q._id.toString(), q])
//     );

//     let totalStudentScore = 0;

//     result_doc.sanitizedQuestions.forEach((a) => {
//       const existingQuestion = questionMap.get(a._id.toString());

//       if (existingQuestion) {
//         existingQuestion.selected_answer = a.selected_answer;

//         if (a.selected_answer === existingQuestion.correct_answer) {
//           existingQuestion.student_score = existingQuestion.score;
//         } else {
//           existingQuestion.student_score = 0;
//         }
//         totalStudentScore += existingQuestion.student_score;
//       }
//     });

//     // Max that a student can get
//     const totalPossibleScore = result.shuffled_obj_questions.reduce(
//       (acc, q) => acc + q.score,
//       0
//     );

//     const resultSettings = await ResultSetting.findOne({
//       level: result.level,
//     }).session(session);

//     const exam_component_name = resultSettings?.exam_components.exam_name;
//     const exam_components = resultSettings?.exam_components.component;

//     const objKeyName = exam_components?.find((k) => k.key === examKeyEnum[0]);

//     if (!objKeyName?.percentage || !objKeyName?.name) {
//       throw new AppError(
//         'Objective scoring setup not found in result settings.',
//         400
//       );
//     }

//     // objWeight is maxObjPercent
//     // studentScore is totalStudentScore
//     // totalScore  is totalPossibleScore
//     const rawPercentage = (totalStudentScore / totalPossibleScore) * 100;

//     const maxObjectivePercent = objKeyName?.percentage; // we get this from the result settings of the school
//     const convertedScore = totalPossibleScore
//       ? (rawPercentage / 100) * maxObjectivePercent
//       : 0;
//     // convertedScore is what we will be adding with theory score

//     result.objective_total_score = totalStudentScore;
//     result.obj_submitted_at = new Date();
//     result.percent_score = convertedScore;
//     result.obj_trigger_type = trigger_type;

//     result.markModified('shuffled_obj_questions');

//     // TO GET THE MATCHING RESULT WE NEED THE FOLLOWING:
//     //  ENROLMENT_ID,  CLASS_ID,

//     /**
//      * SEEN
//      * SCHOOL_ID,
//      * STUDENT_ID,
//      * ACADEMIC_SESSION_ID(GET THIS AFTER FETCHING CBT RESULT USING CBT_RESULT_ID)
//      * SUBJECT_ID(SAME AS ACADEMIC_SESSION_ID)
//      * TERM(SAME AS ABOVE)
//      */

//     // Find subject result here also and update it as well
//     const studentSubjectResult = await SubjectResult.findOne({
//       enrolment: result.enrolment,
//       student: studentExist._id,
//       class: result.class_id,
//       session: result.academic_session_id,
//       subject: result.subject_id,
//     }).session(session);

//     const termResult = studentSubjectResult?.term_results.find(
//       (a) => a.term === result.term
//     );

//     const alreadyHasExam = termResult?.scores.find(
//       (score) =>
//         score.score_name.toLowerCase() === exam_component_name?.toLowerCase()
//     );

//     const examObj = {
//       key: objKeyName.key,
//       score_name: objKeyName?.name,
//       score: convertedScore,
//     };

//     const subjectObj = {
//       subject: result.subject_id,
//       subject_teacher: result.subject_teacher,
//       total_score: 0,
//       cumulative_average: 0,
//       last_term_cumulative: 0,
//       scores: [examObj],
//       exam_object: [examObj],
//       subject_position: '',
//     };

//     if (alreadyHasExam) {
//       console.log('Student already has exam result recorded.');
//     }

//     const hasRecordedExamScore = termResult?.exam_object.find(
//       (s) => s.score_name.toLowerCase() === examObj.score_name.toLowerCase()
//     );
//     if (hasRecordedExamScore) {
//       console.log(
//         `Score for ${examObj.score_name} has been recorded for this student.`
//       );
//     }

//     termResult?.scores.push(examObj);
//     termResult?.exam_object.push(examObj);
//     studentSubjectResult?.markModified('term_results');

//     const mainResult = await Result.findOne({
//       student: studentExist._id,
//       enrolment: result.enrolment,
//       class: result.class_id,
//       academic_session_id: result.academic_session_id,
//     }).session(session);

//     let termExistInResultDoc = mainResult?.term_results.find(
//       (t) => t.term === result.term
//     );

//     if (!termExistInResultDoc) {
//       termExistInResultDoc = {
//         term: result.term,
//         cumulative_score: 0,
//         subject_results: [subjectObj],
//         class_position: '',
//       };

//       mainResult?.term_results.push(termExistInResultDoc);
//       mainResult?.markModified('term_results');
//     } else {
//       const mainSubjectResult = termExistInResultDoc?.subject_results.find(
//         (s) => s.subject.toString() === result.subject_id.toString()
//       );

//       if (!mainSubjectResult) {
//         termExistInResultDoc?.subject_results?.push(subjectObj);
//         mainResult?.markModified('term_results');
//       }

//       mainSubjectResult?.exam_object.push(examObj);
//       mainSubjectResult?.scores.push(examObj);
//       mainResult?.markModified('term_results');
//     }

//     /**
//      * GET THE RESULT SETTINGS AND FETCH EXAM_COMPONENT TO KNOW THE
//      * NAME THAT THE SCHOOL GIVES TO THEIR OBJ
//      *
//      */

//     await result.save({ session });

//     if (studentSubjectResult) {
//       await studentSubjectResult.save({ session });
//     }

//     if (mainResult) {
//       await mainResult.save({ session });
//     }

//     const actualExamTimeTable = await ClassExamTimetable.findOne({
//       academic_session_id: result.academic_session_id,
//       class_id: result.class_id,
//       term: result.term,
//       exam_id: result.exam_id,
//     }).session(session);

//     if (!actualExamTimeTable) {
//       throw new AppError(
//         `There is no timetable for this class in this ${result.term}.`,
//         400
//       );
//     }

//     const findSubjectTimetable = actualExamTimeTable.scheduled_subjects.find(
//       (s) => s.subject_id.toString() === result.subject_id.toString()
//     );

//     if (!findSubjectTimetable) {
//       throw new AppError(
//         `The time to write this subject exam is not taken care off in the timetable.`,
//         400
//       );
//     }

//     await ClassExamTimetable.updateOne(
//       {
//         academic_session_id: result.academic_session_id,
//         class_id: result.class_id,
//         term: result.term,
//         exam_id: result.exam_id,
//         'scheduled_subjects.subject_id': result.subject_id,
//       },
//       {
//         $pull: {
//           'scheduled_subjects.$.students_that_have_started': result.student_id,
//         },
//         $addToSet: {
//           'scheduled_subjects.$.students_that_have_submitted':
//             result.student_id,
//         },
//       },
//       { session }
//     );

//     await session.commitTransaction();
//     session.endSession();
//     return result;
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     if (error instanceof AppError) {
//       throw new AppError(`${error.message}`, 400);
//     } else {
//       console.error(error);
//       throw new Error('Something went wrong');
//     }
//   }
// };

const subjectCbtObjCbtAssessmentSubmission = async (
  payload: CbtAssessmentEndedType
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    console.log('I am being called 1...');

    const { cbt_result_id, exam_id, result_doc, student_id, trigger_type } =
      payload;

    const studentId = Object(student_id);
    const examId = Object(exam_id);
    const cbtResultId = Object(cbt_result_id);

    const studentExist = await Student.findById(studentId).session(session);

    if (!studentExist) {
      throw new AppError('Student not found.', 404);
    }

    const examDocExist = await CbtExam.findById({
      _id: examId,
    }).session(session);

    if (!examDocExist) {
      throw new AppError(`Exam has not being authorized to start.`, 403);
    }

    let result = await CbtResult.findOne({
      _id: cbtResultId,
      exam_id: examDocExist._id,
      student_id: studentId,
    }).session(session);

    if (!result) {
      throw new AppError(`Result does not exist.`, 404);
    }

    const notStarted = result.obj_status === examStatusEnum[0];
    const isSubmitted = result.obj_status === examStatusEnum[2];
    if (notStarted || isSubmitted) {
      console.log('result.obj_status:', result.obj_status);
      throw new AppError(
        'This subject exam is not in-progress. It is either completed or ended.',
        400
      );
    }
    console.log('I am being called 1...');

    const current_time = Date.now();
    const start_time = new Date(result.obj_start_time).getTime();
    const end_time = new Date(result.obj_final_cutoff_time).getTime();
    const grace_period = 5 * 60 * 1000;
    const finalSubmission = end_time + grace_period;

    if (current_time < start_time) {
      throw new AppError(
        `You cannot update the exam before the scheduled time.`,
        401
      );
    }

    if (current_time > finalSubmission) {
      throw new AppError(`Exam is over.`, 401);
    }

    console.log('I am being called 1...');

    // START CHECKING TRIGGER TYPE HERE
    if (trigger_type === triggerTypeEnum[0]) {
      result.obj_time_left = result_doc.obj_time_left;
      result.obj_status = examStatusEnum[2];
    } else if (trigger_type === triggerTypeEnum[1]) {
      result.obj_time_left = result_doc.obj_time_left;
      result.obj_status = examStatusEnum[2];
    } else if (trigger_type === triggerTypeEnum[2]) {
      const examCutoffTime = result.obj_final_cutoff_time.getTime();
      if (current_time < examCutoffTime) {
        throw new AppError(
          `It is not yet the final cutoff time so student can still take exam.`,
          400
        );
      }

      result.obj_time_left = result.obj_time_left;
      result.obj_status = examStatusEnum[3];
    }

    console.log('I am being called 1...');

    const questionMap = new Map(
      result.shuffled_obj_questions.map((q) => [q._id.toString(), q])
    );

    let totalStudentScore = 0;

    result_doc.sanitizedQuestions.forEach((a) => {
      const existingQuestion = questionMap.get(a._id.toString());

      if (existingQuestion) {
        existingQuestion.selected_answer = a.selected_answer;

        if (a.selected_answer === existingQuestion.correct_answer) {
          existingQuestion.student_score = existingQuestion.score;
        } else {
          existingQuestion.student_score = 0;
        }
        totalStudentScore += existingQuestion.student_score;
      }
    });

    // Max that a student can get
    const totalPossibleScore = result.shuffled_obj_questions.reduce(
      (acc, q) => acc + q.score,
      0
    );

    console.log('I am being called 1...');

    const resultSettings = await ResultSetting.findOne({
      level: result.level,
    }).session(session);

    if (!resultSettings) {
      throw new AppError(`There is no result settings for this class.`, 404);
    }

    const exam_component_name = resultSettings?.exam_components.exam_name;
    console.log('I am being called 1...');

    let objKeyName;
    let testName: string;
    if (examDocExist.assessment_type !== exam_component_name) {
      // do for test
      objKeyName = resultSettings.components?.find(
        (k) =>
          k.name.toLowerCase() === examDocExist.assessment_type.toLowerCase()
      );

      if (!objKeyName?.percentage || !objKeyName?.name) {
        throw new AppError(
          'Objective scoring setup not found in result settings.',
          400
        );
      }
      testName = objKeyName?.name;
    } else {
      // do for exam
      const exam_components = resultSettings?.exam_components.component;

      objKeyName = exam_components?.find((k) => k.key === examKeyEnum[0]);

      if (!objKeyName?.percentage || !objKeyName?.name) {
        throw new AppError(
          'Objective scoring setup not found in result settings.',
          400
        );
      }
    }

    const rawPercentage = (totalStudentScore / totalPossibleScore) * 100;
    console.log('I am being called 1...');

    const maxObjectivePercent = objKeyName?.percentage; // we get this from the result settings of the school
    const convertedScore = totalPossibleScore
      ? (rawPercentage / 100) * maxObjectivePercent
      : 0;

    result.objective_total_score = totalStudentScore;
    result.obj_submitted_at = new Date();
    result.percent_score = convertedScore;
    result.obj_trigger_type = trigger_type;

    result.markModified('shuffled_obj_questions');
    await result.save({ session });
    console.log('I am being called 1...');

    await session.commitTransaction();
    session.endSession();

    const queuePayload = {
      cbt_result_id: result._id,
      student_id: result.student_id,
      exam_id: result.exam_id,
      convertedScore: result.percent_score,
      term: result.term,
      level: result.level,
      enrolment: result.enrolment,
      class_id: result.class_id,
      subject_teacher: result.subject_teacher,
      subject_id: result.subject_id,
      session: result.academic_session_id,
    };

    const name = 'cbt-result-submission';
    const data = queuePayload;
    const opts = {
      attempts: 5,
      removeOnComplete: true,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
    };

    studentResultQueue.add(name, data, opts);
    console.log('I am being called 1...');

    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw new AppError(`${error.message}`, 400);
      // throw error;
    } else {
      console.error(error);
      throw new Error('Something went wrong');
    }
  }
};

const theoryQestionSetting = async (
  payload: SubjectObjQuestionDocumentCreationType
) => {
  try {
    const {
      academic_session_id,
      class_id,
      questions_array,
      term,
      subject_id,
      teacher_id,
    } = payload;

    const classId = Object(class_id);
    const subjectId = Object(subject_id);
    const academicSessionId = Object(academic_session_id);

    const academicSessionExist = await Session.findById({
      _id: academicSessionId,
    });

    if (!academicSessionExist) {
      throw new AppError(
        `Academic session with id: ${academic_session_id} does not exist.`,
        404
      );
    }

    const termExist = academicSessionExist.terms.find((t) => t.name === term);

    if (!termExist) {
      throw new AppError(`${term} does not exist.`, 404);
    }

    if (termExist && termExist.is_active !== true) {
      throw new AppError(
        `${term} has ended and set exam questions for a term that has ended.`,
        403
      );
    }

    const classExist = await Class.findById({
      _id: classId,
    });

    if (!classExist) {
      throw new AppError('Class does not exist.', 404);
    }

    const subjectExist = await Subject.findById({
      _id: subjectId,
    });

    if (!subjectExist) {
      throw new AppError('Subject not found', 404);
    }

    const examDocExist = await CbtExam.findOne({
      academic_session_id: academicSessionExist._id,
      term: term,
    });

    if (!examDocExist) {
      throw new AppError(
        `Question submission has not being authorized by the school. Please reach out to the school authority.`,
        400
      );
    }

    const minLength = examDocExist.min_obj_questions;
    const maxLength = examDocExist.max_obj_questions;

    if (questions_array.length < minLength) {
      throw new AppError(
        `The number of questions set is less than ${minLength} which is the minimum number expected.`,
        400
      );
    }

    if (questions_array.length > maxLength) {
      throw new AppError(
        `The number of questions set is more than ${maxLength} which is the maximum number allowed.`,
        400
      );
    }

    const optionsLength = questions_array.filter(
      (r) => r.options.length !== examDocExist.expected_obj_number_of_options
    );

    if (optionsLength.length > 0) {
      throw new AppError(
        `Please ensure that all questions' options is ${examDocExist.expected_obj_number_of_options}.`,
        400
      );
    }

    const subjectQuestionExist = await CbtQuestion.findOne({
      academic_session_id: academic_session_id,
      term: term,
      exam_id: examDocExist._id,
    });

    if (subjectQuestionExist && subjectQuestionExist.obj_questions.length > 0) {
      throw new AppError(
        `${term} Exam question has been submitted for ${subjectExist.name} in ${classExist.name}.`,
        400
      );
    }

    const newSubjectQuestion = new CbtQuestion({
      exam_id: examDocExist._id,
      academic_session_id: academicSessionExist._id,
      class_id: classExist._id,
      subject_id: subjectExist._id,
      term: term,
      teacher_id: teacher_id,
      obj_questions: questions_array,
    });

    await newSubjectQuestion.save();

    const subject_name = subjectExist.name;

    const returnObj = {
      newSubjectQuestion,
      subject_name,
    };

    return returnObj;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(`${error.message}`, 400);
    } else {
      console.error(error);
      throw new Error('Something went wrong');
    }
  }
};

export {
  subjectCbtObjCbtAssessmentRemainingTimeUpdate,
  fetchTermClassCbtAssessmentTimetable,
  subjectCbtObjCbtAssessmentSubmission,
  subjectCbtObjCbtAssessmentUpdate,
  studentCbtSubjectCbtAssessmentAuthorization,
  termClassCbtAssessmentTimetableCreation,
  subjectCbtObjCbtAssessmentStarting,
  termCbtAssessmentDocumentCreation,
  objQestionSetting,
  theoryQestionSetting,
  fetchTermCbtAssessmentDocument,
  fetchCbtAssessmentDocumentById,
  fetchAllClassCbtAssessmentTimetables,
  fetchAllCbtAssessmentDocument,
};
