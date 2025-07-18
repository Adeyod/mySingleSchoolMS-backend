import {
  MultipleResultCreationType,
  ResultCreationType,
  ResultDocument,
  ScoreParamType,
  ScoreRecordingParamType,
  TermResult,
  CumScoreParamType,
} from '../constants/types';
import Class from '../models/class.model';
import ClassEnrolment from '../models/classes_enrolment.model';
import Result from '../models/result.model';
import ResultSetting from '../models/result_setting.model';
import Session from '../models/session.model';
import Student from '../models/students.model';
import { AppError } from '../utils/app.error';
import { calculateSubjectSumAndGrade } from '../utils/functions';

const createResult = async (payload: ResultCreationType) => {
  try {
    const { class_enrolment_id, student_id, class_id, academic_session_id } =
      payload;

    const enrollmentExist = await ClassEnrolment.findById({
      _id: class_enrolment_id,
    });

    const studentExistInsideClass = enrollmentExist?.students.find(
      (p) => p.student.toString() === student_id.toString()
    );

    if (!studentExistInsideClass) {
      throw new AppError(
        'Student not enrolled into this class for the session.',
        404
      );
    }

    const studentAlreadyHaveResultForTheSession = await Result.findOne({
      student: student_id,
      academic_session_id: academic_session_id,
    });

    if (studentAlreadyHaveResultForTheSession) {
      throw new AppError(
        'Since a student can only have one result per session, this student already have the result for the session.',
        400
      );
    }

    const result = await new Result({
      enrolment: class_enrolment_id,
      student: student_id,
      class: class_id,
      academic_session_id: academic_session_id,
      term_results: [],
      final_cumulative_score: 0,
      final_status: null,
      position: null,
    }).save();

    if (!result) {
      throw new AppError(
        `Unable to create result for student with ID: ${student_id}`,
        400
      );
    }

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened.');
    }
  }
};

const createResultsForStudents = async (
  payload: MultipleResultCreationType
) => {
  try {
    const { class_enrolment_id, student_ids, class_id, academic_session_id } =
      payload;

    const enrollmentExist = await ClassEnrolment.findOne({
      _id: class_enrolment_id,
    });

    if (!enrollmentExist) {
      throw new AppError(
        `Class enrollment with ID: ${class_enrolment_id} does not exist.`,
        404
      );
    }

    const results = [];
    const errors = [];

    for (const student_id of student_ids) {
      try {
        const studentExistInsideClass = enrollmentExist.students.find(
          (p) => p.student.toString() === student_id.toString()
        );

        if (!studentExistInsideClass) {
          throw new AppError(
            `Student with ID: ${student_id} is not enrolled in this class for the session.`,
            404
          );
        }

        const studentAlreadyHaveResultForTheSession = await Result.findOne({
          student: student_id,
          academic_session_id: academic_session_id,
        });

        if (studentAlreadyHaveResultForTheSession) {
          throw new AppError(
            `Student with ID: ${student_id} already has a result for this session.`,
            400
          );
        }

        const result = new Result({
          enrolment: class_enrolment_id,
          student: student_id,
          class: class_id,
          academic_session_id: academic_session_id,
          term_results: [],
          final_cumulative_score: 0,
          final_status: null,
          position: null,
        });

        results.push(result);
      } catch (error) {
        errors.push({ student_id, error: error });
      }
    }

    const savedResults = results.length ? await Result.insertMany(results) : [];

    return { savedResults, errors };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened.');
    }
  }
};

const recordScore = async (
  payload: ScoreRecordingParamType
): Promise<ResultDocument> => {
  try {
    const {
      term,
      student_id,
      session_id,
      teacher_id,
      score,
      subject_id,
      score_name,
      class_enrolment_id,
      class_id,
      session,
    } = payload;

    console.log(`I want to record for ${score_name} now`);

    const resultSettings = await ResultSetting.findOne({}).session(session);

    if (!resultSettings) {
      throw new AppError('Result setting not found for this school.', 404);
    }

    const studentExist = await Student.findOne({
      _id: student_id,
    }).session(session);

    if (!studentExist) {
      throw new AppError('Student not found.', 404);
    }

    const sessionActive = await Session.findOne({
      _id: session_id,
      is_active: true,
    }).session(session);

    if (!sessionActive) {
      throw new AppError('Session not found or it is not active.', 404);
    }

    console.log('sessionActive:', sessionActive.terms);
    const checkActiveTerm = sessionActive.terms.find((t) => t.name === term);

    console.log('checkActiveTerm:', checkActiveTerm);

    if (checkActiveTerm?.is_active === false) {
      throw new AppError('Term is not active.', 400);
    }

    const classExist = await Class.findOne({
      _id: class_id,
    }).session(session);

    if (!classExist) {
      throw new AppError('Class not found.', 404);
    }

    const subjectTeacher = classExist.teacher_subject_assignments.find(
      (p) =>
        p?.subject?.toString() === subject_id &&
        p?.teacher?.toString() === teacher_id
    );

    if (!subjectTeacher) {
      throw new AppError(
        'You are not the teacher assigned to teach this subject.',
        400
      );
    }
    const classEnrolmentExist = await ClassEnrolment.findById({
      _id: class_enrolment_id,
    }).session(session);

    if (!classEnrolmentExist) {
      throw new AppError('Class enrolment not found.', 404);
    }

    const resultExist = await Result.findOne({
      enrolment: class_enrolment_id,
      student: student_id,
      class: class_id,
      academic_session_id: session_id,
    }).session(session);

    if (!resultExist) {
      throw new AppError('No result found for this student.', 404);
    }

    let termExistInResultDoc = resultExist.term_results.find(
      (t) => t.term === term
    ) as TermResult | undefined;

    const scoreObj = {
      score_name: score_name,
      score: score,
    };

    const subjectObj = {
      subject: Object(subject_id),
      subject_teacher: Object(teacher_id),
      total_score: 0,
      cumulative_average: 0,
      last_term_cumulative: 0,
      scores: [scoreObj],
      exam_object: [],
      subject_position: '',
    };

    if (!termExistInResultDoc) {
      console.log('There is no term result yet:');

      termExistInResultDoc = {
        term,
        cumulative_score: 0,
        subject_results: [subjectObj],
        class_position: '',
      };
      console.log(
        'There is no term result yet:',
        termExistInResultDoc.subject_results
      );
      resultExist.term_results.push(termExistInResultDoc);
    } else {
      let subjectResult = termExistInResultDoc.subject_results.find(
        (s) => s.subject?.toString() === subject_id
      );

      if (!subjectResult) {
        console.log('There is no subject result yet:');

        subjectResult = {
          subject: Object(subject_id),
          subject_teacher: Object(teacher_id),
          total_score: 0,
          cumulative_average: 0,
          last_term_cumulative: 0,
          scores: [scoreObj],
          exam_object: [],
          subject_position: '',
        };

        termExistInResultDoc.subject_results = [
          ...termExistInResultDoc.subject_results,
          subjectResult,
        ];
      } else {
        console.log('There is subject result:');

        let existingScore = subjectResult.scores.find(
          (s) => s.score_name === score_name
        );

        if (existingScore) {
          throw new AppError(
            `${score_name} score has already been recorded and can not be changed.`,
            403
          );
        }

        subjectResult.scores.push(scoreObj);

        // // I WILL CHECK HERE IF THE SCHOOL SUBSCRIBE TO OBJ CBT AND SUCH IS TRUE, THEN
        // if (subjectResult.scores.length === resultSettings.components.length) {
        //   const result = subjectResult.scores.reduce(
        //     (sum, a) => sum + a.score,
        //     0
        //   );

        //   const gradingArray = resultSettings.grading_and_remark;
        //   const payload = {
        //     gradingObj: gradingArray,
        //     score: subjectResult.scores,
        //     current_term: checkActiveTerm?.name,
        //   };
        //   let last_term_cumulative: number = 0;

        //   if (checkActiveTerm?.name === 'first_term') {
        //     last_term_cumulative = result;
        //   } else if (checkActiveTerm?.name === 'second_term') {
        //     const firstTermResult = resultExist.term_results.find(
        //       (t) => t.term === 'first_term'
        //     );
        //     const firstTermSubjectResult =
        //       firstTermResult?.subject_results.find(
        //         (s) => s.subject?.toString() === subject_id
        //       );

        //     last_term_cumulative =
        //       firstTermSubjectResult?.cumulative_average ?? 0;

        //     console.log(
        //       'second term firstTermSubjectResult?.cumulative_average:',
        //       firstTermSubjectResult?.cumulative_average
        //     );
        //   } else if (checkActiveTerm?.name === 'third_term') {
        //     const secondTermResult = resultExist.term_results.find(
        //       (t) => t.term === 'second_term'
        //     );
        //     const secondTermSubjectResult =
        //       secondTermResult?.subject_results.find(
        //         (s) => s.subject?.toString() === subject_id
        //       );

        //     last_term_cumulative =
        //       secondTermSubjectResult?.cumulative_average ?? 0;
        //   }

        //   console.log('last_term_cumulative:', last_term_cumulative);
        //   console.log('checkActiveTerm?.name:', checkActiveTerm?.name);
        //   const total = result;
        //   subjectResult.total_score = total;
        //   subjectResult.last_term_cumulative = last_term_cumulative;
        // }
      }
    }

    resultExist.markModified('term_results');

    resultExist.markModified('term_results.subject_results');
    resultExist.markModified('term_results.subject_results.scores');

    const updatedResult = await resultExist.save({ session });

    return updatedResult as ResultDocument;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened.');
    }
  }
};

const recordCumScore = async (
  payload: CumScoreParamType
): Promise<ResultDocument> => {
  try {
    const {
      term,
      student_id,
      session_id,
      teacher_id,
      score,
      subject_id,
      class_enrolment_id,
      class_id,
      session,
    } = payload;

    console.log(`I want to record for last_term_cumulative now`);

    const resultSettings = await ResultSetting.findOne({}).session(session);

    if (!resultSettings) {
      throw new AppError('Result setting not found for this school.', 404);
    }

    const studentExist = await Student.findOne({
      _id: student_id,
    }).session(session);

    if (!studentExist) {
      throw new AppError('Student not found.', 404);
    }

    const sessionActive = await Session.findOne({
      _id: session_id,
      is_active: true,
    }).session(session);

    if (!sessionActive) {
      throw new AppError('Session not found or it is not active.', 404);
    }

    console.log('sessionActive:', sessionActive.terms);
    const checkActiveTerm = sessionActive.terms.find((t) => t.name === term);

    console.log('checkActiveTerm:', checkActiveTerm);

    if (checkActiveTerm?.is_active === false) {
      throw new AppError('Term is not active.', 400);
    }

    const classExist = await Class.findOne({
      _id: class_id,
    }).session(session);

    if (!classExist) {
      throw new AppError('Class not found.', 404);
    }

    const subjectTeacher = classExist.teacher_subject_assignments.find(
      (p) =>
        p?.subject?.toString() === subject_id &&
        p?.teacher?.toString() === teacher_id
    );

    if (!subjectTeacher) {
      throw new AppError(
        'You are not the teacher assigned to teach this subject.',
        400
      );
    }
    const classEnrolmentExist = await ClassEnrolment.findOne({
      _id: class_enrolment_id,
    }).session(session);

    if (!classEnrolmentExist) {
      throw new AppError('Class enrolment not found.', 404);
    }

    const resultExist = await Result.findOne({
      enrolment: class_enrolment_id,
      student: student_id,
      class: class_id,
      academic_session_id: session_id,
    }).session(session);

    if (!resultExist) {
      throw new AppError('No result found for this student.', 404);
    }

    let termExistInResultDoc = resultExist.term_results.find(
      (t) => t.term === term
    ) as TermResult | undefined;

    if (!termExistInResultDoc) {
      throw new AppError('The term chosen does not have result yet.', 404);
    }

    const subjectResult = termExistInResultDoc.subject_results.find(
      (s) => s.subject.toString() === subject_id
    );

    if (!subjectResult) {
      throw new AppError('No result for this subject for the term.', 404);
    }

    if (!subjectResult.total_score || subjectResult.total_score === 0) {
      throw new AppError(
        'You can only record last term cumulative when all scores has been recorded.',
        400
      );
    }

    const shouldUpdateCumulative =
      subjectResult.last_term_cumulative === null ||
      subjectResult.last_term_cumulative === 0;

    if (shouldUpdateCumulative) {
      subjectResult.last_term_cumulative = score;
    }
    subjectResult.cumulative_average =
      (subjectResult.total_score + subjectResult.last_term_cumulative) / 2;

    const gradingArray = resultSettings.grading_and_remark;

    const sortedGrades = gradingArray.sort((a, b) => b.value - a.value);
    console.log('sortedGrades:', sortedGrades);

    let grade = 'F';
    let remark = 'Fail';

    for (const gradeItem of gradingArray) {
      if (subjectResult.cumulative_average >= gradeItem.value) {
        (grade = gradeItem.grade), (remark = gradeItem.remark);
        break;
      } else {
        (grade = 'F'), (remark = 'Fail');
      }
    }

    subjectResult.grade = grade;
    subjectResult.remark = remark;

    resultExist.markModified('term_results');

    resultExist.markModified('term_results.subject_results');
    resultExist.markModified('term_results.subject_results.scores');

    const updatedResult = await resultExist.save({ session });

    console.log('updatedResult:', updatedResult);

    return updatedResult as ResultDocument;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened.');
    }
  }
};

export { recordCumScore, recordScore, createResult, createResultsForStudents };
