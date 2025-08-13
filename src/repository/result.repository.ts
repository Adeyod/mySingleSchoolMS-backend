import mongoose from 'mongoose';
import {
  MultipleResultCreationType,
  ResultCreationType,
  ResultDocument,
  ScoreParamType,
  ScoreRecordingParamType,
  TermResult,
  CumScoreParamType,
  ResultJobData,
  CbtAssessmentJobData,
  SubjectPositionJobData,
  SubjectCumScoreJobData,
  SubjectResultDocument,
  SubjectTermResult,
  CbtAssessmentEndedType,
} from '../constants/types';
import Class from '../models/class.model';
import ClassEnrolment from '../models/classes_enrolment.model';
import Result from '../models/result.model';
import ResultSetting from '../models/result_setting.model';
import Session from '../models/session.model';
import Student from '../models/students.model';
import { AppError } from '../utils/app.error';
import { calculateSubjectSumAndGrade } from '../utils/functions';
import { SubjectResult } from '../models/subject_result.model';
import { subjectCbtObjCbtAssessmentSubmission } from '../services/cbt.service';

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
): Promise<SubjectResultDocument> => {
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

    const subjectId = Object(subject_id);
    const teacherId = Object(teacher_id);
    const studentId = Object(student_id);
    const sessionId = Object(session_id);
    const classId = Object(class_id);
    const classEnrolmentId = Object(class_enrolment_id);

    const studentExist = await Student.findById({
      _id: studentId,
    }).session(session);

    if (!studentExist) {
      throw new AppError('Student not found.', 404);
    }

    const sessionActive = await Session.findOne({
      _id: sessionId,
      is_active: true,
    }).session(session);

    if (!sessionActive) {
      throw new AppError('Session not found or it is not active.', 404);
    }

    const checkActiveTerm = sessionActive.terms.find((t) => t.name === term);

    if (checkActiveTerm?.is_active === false) {
      throw new AppError('Term is not active.', 400);
    }

    const classExist = await Class.findById({
      _id: classId,
    }).session(session);

    if (!classExist) {
      throw new AppError('Class not found.', 404);
    }

    const resultSettings = await ResultSetting.findOne({
      level: classExist.level,
    }).session(session);

    if (!resultSettings) {
      throw new AppError('Result setting not found for this level.', 404);
    }

    const validComponent = resultSettings.components.find(
      (comp) => comp.name === score_name
    );

    if (!validComponent) {
      throw new AppError(`Invalid score type: ${score_name}.`, 400);
    }

    if (score > validComponent.percentage) {
      throw new AppError(
        `${validComponent.name} score can not be greater than ${validComponent.percentage}.`,
        400
      );
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
      _id: classEnrolmentId,
    }).session(session);

    if (!classEnrolmentExist) {
      throw new AppError('Class enrolment not found.', 404);
    }

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

    let studentSubjectResult = await SubjectResult.findOne({
      enrolment: classEnrolmentExist._id,
      student: studentId,
      class: class_id,
      session: sessionId,
      subject: subjectId,
      // subject_teacher: teacherId,
    });

    if (!studentSubjectResult) {
      studentSubjectResult = new SubjectResult({
        enrolment: classEnrolmentExist._id,
        student: student_id,
        class: class_id,
        session: session_id,
        subject: subjectId,
        subject_teacher: teacherId,
        term_results: [{ term, scores: [scoreObj] }],
      });

      console.log('inside if studentSubjectResult:', studentSubjectResult);
    } else {
      let termResult = studentSubjectResult.term_results.find(
        (t) => t.term === term
      );

      if (!termResult) {
        studentSubjectResult.term_results.push({
          term: term,
          total_score: 0,
          last_term_cumulative: 0,
          cumulative_average: 0,
          // cumulative_score: 0,
          class_position: '',
          exam_object: [],
          scores: [scoreObj],
          subject_position: '',
          grade: '',
          remark: '',
        });
      } else {
        const existingScore = termResult.scores.find(
          (s) => s.score_name === score_name
        );

        if (!existingScore) {
          termResult.scores.push(scoreObj);
        }
        console.log('Appended score to existing term:', term);
      }
      // studentSubjectResult.term_results.scores.push(scoreObj);
      // console.log('inside else studentSubjectResult:', studentSubjectResult);
    }

    studentSubjectResult.markModified('term_results');
    try {
      await studentSubjectResult.save({ session });
    } catch (error) {
      console.error('Error saving SubjectResult:', error);
      throw error;
    }
    console.log(
      'after full recording studentSubjectResult:',
      studentSubjectResult
    );

    return studentSubjectResult as SubjectResultDocument;
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
): Promise<SubjectResultDocument> => {
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
    const studentExist = await Student.findById({
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

    const classExist = await Class.findById({
      _id: class_id,
    }).session(session);

    if (!classExist) {
      throw new AppError('Class not found.', 404);
    }

    const resultSettings = await ResultSetting.findOne({
      level: classExist.level,
    }).session(session);

    if (!resultSettings) {
      throw new AppError(
        'Result setting not found for this level in the school.',
        404
      );
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

    const subject = Object(subject_id);

    const resultExist = await SubjectResult.findOne({
      enrolment: class_enrolment_id,
      student: student_id,
      class: class_id,
      session: session_id,
      subject: subject,
    }).session(session);

    if (!resultExist) {
      throw new AppError('No result found for this student.', 404);
    }

    let subjectResult = resultExist.term_results.find(
      (t) => t.term === term
    ) as SubjectTermResult | undefined;

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

    return updatedResult as SubjectResultDocument;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened.');
    }
  }
};

const processStudentResultUpdate = async (payload: ResultJobData) => {
  const {
    term,
    session_id,
    teacher_id,
    subject_id,
    class_enrolment_id,
    class_id,
    student_id,
    score,
    score_name,
  } = payload;
  try {
    console.log(
      `Updating result for student: ${student_id}, subject: ${subject_id}, term: ${term}`
    );

    const resultExist = await Result.findOne({
      enrolment: class_enrolment_id,
      student: student_id,
      class: class_id,
      academic_session_id: session_id,
    });

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
          console.log(
            `${score_name} score has already been recorded and can not be changed.`
          );
          // throw new AppError(
          //   `${score_name} score has already been recorded and can not be changed.`,
          //   403
          // );
        }

        subjectResult.scores.push(scoreObj);
      }
    }

    resultExist.markModified('term_results');

    resultExist.markModified('term_results.subject_results');
    resultExist.markModified('term_results.subject_results.scores');

    const updatedResult = await resultExist.save();
    console.log(
      `Completed Updating result for student: ${student_id}, subject: ${subject_id}, term: ${term}`
    );
    return { student_id, updated: true };
  } catch (error) {
    console.error('Failed to process student result update:', error);
    throw error;
  }
};

const processStudentExamResultUpdate = async (
  payload: CbtAssessmentJobData
) => {
  const {
    term,
    session_id,
    teacher_id,
    subject_id,
    class_enrolment_id,
    class_id,
    student_id,
    term_results,
    resultObj,
    exam_component_name,
  } = payload;
  try {
    console.log(
      `Updating exam result for student: ${student_id}, subject: ${subject_id}, term: ${term}`
    );

    const resultExist = await Result.findOne({
      enrolment: class_enrolment_id,
      student: student_id,
      class: class_id,
      academic_session_id: session_id,
    });

    if (!resultExist) {
      throw new AppError('No result found for this student.', 404);
    }

    let termExistInResultDoc = resultExist.term_results.find(
      (t) => t.term === term
    ) as TermResult | undefined;

    const scoreObj = {
      score_name: resultObj.score_name,
      score: resultObj.score,
      key: resultObj.key,
    };

    const subjectObj = {
      subject: Object(subject_id),
      subject_teacher: Object(teacher_id),
      total_score: 0,
      cumulative_average: 0,
      last_term_cumulative: 0,
      scores: [scoreObj],
      exam_object: [scoreObj],
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
          exam_object: [scoreObj],
          subject_position: '',
        };

        termExistInResultDoc.subject_results = [
          ...termExistInResultDoc.subject_results,
          subjectResult,
        ];
      } else {
        console.log('There is subject result:');

        let existingScore = subjectResult.scores.find(
          (s) => s.score_name === scoreObj.score_name
        );

        if (existingScore) {
          console.log(
            `${scoreObj.score_name} score has already been recorded and can not be changed.`
          );
          // throw new AppError(
          //   `${score_name} score has already been recorded and can not be changed.`,
          //   403
          // );
        }

        subjectResult.scores.push(scoreObj);
        subjectResult.exam_object.push(scoreObj);
      }

      const actualTerm = term_results.find((t) => t.term === term);
      const examScore = actualTerm?.scores.find(
        (s) => s.score_name === exam_component_name
      );
      const totalScore = actualTerm?.total_score;
      const lastTermCum = actualTerm?.last_term_cumulative;

      if (examScore) {
        subjectResult.scores.push(examScore);
      }

      if (totalScore && totalScore !== 0) {
        subjectResult.total_score = totalScore;
      }

      if (lastTermCum && lastTermCum !== 0) {
        subjectResult.last_term_cumulative = lastTermCum;
      }
      // check inside actualTerm result to see if scores include
      // exam_component_name, and if this is true then add it to
      // the scores of the subject inside the result

      // check if total_score is not 0 and add it as the
      // total_score of the subject in the result and do same for
      // last_term_cumulative

      if (term_results) resultExist.markModified('term_results');
    }

    resultExist.markModified('term_results.subject_results');
    resultExist.markModified('term_results.subject_results.scores');

    const updatedResult = await resultExist.save();
    console.log(
      `Completed Updating result for student: ${student_id}, subject: ${subject_id}, term: ${term}`
    );
    return { student_id, updated: true };
  } catch (error) {
    console.error('Failed to process student result update:', error);
    throw error;
  }
};

const processStudentSubjectPositionUpdate = async (
  payload: SubjectPositionJobData
) => {
  const {
    student_id,
    term,
    subject_id,
    class_id,
    class_enrolment_id,
    session_id,
    subject_position,
  } = payload;

  const student = Object(student_id);
  try {
    const sessionResult = await Result.findOne({
      student: student,
      class: class_id,
      enrolment: class_enrolment_id,
      academic_session_id: session_id,
    });

    // const studentSubjectId = new mongoose.Types.ObjectId(student?.subject);

    const info = sessionResult?.term_results.find((tr) => tr.term === term);

    const actualSubject = info?.subject_results.find(
      (r) =>
        r?.subject instanceof mongoose.Types.ObjectId &&
        r.subject.equals(subject_id)
    );

    if (actualSubject) {
      actualSubject.subject_position = subject_position;
    }

    await sessionResult?.save();
    console.log(
      'actualSubject.subject_position:',
      actualSubject?.subject_position
    );

    // const obj = {
    //   studentId: student.student._id,
    //   first_name: student.student.first_name,
    //   last_name: student.student.last_name,
    //   term: info?.term,
    //   cumulative_score: info?.cumulative_score,
    //   subjectObj: actualSubject,
    // };

    return { student, success: true };
  } catch (error) {
    throw error;
  }
};

const processSubjectCumScoreUpdate = async (
  payload: SubjectCumScoreJobData
) => {
  const {
    term,
    session_id,
    subject_id,
    class_enrolment_id,
    class_id,
    student_id,
    actual_term_result,
  } = payload;
  const student = Object(student_id);

  try {
    const sessionResult = await Result.findOne({
      enrolment: class_enrolment_id,
      student: student,
      class: class_id,
      academic_session_id: session_id,
    });

    const info = sessionResult?.term_results.find((tr) => tr.term === term);

    const actualSubject = info?.subject_results.find(
      (r) =>
        r?.subject instanceof mongoose.Types.ObjectId &&
        r.subject.equals(subject_id)
    );

    if (actualSubject) {
      actualSubject.cumulative_average = actual_term_result.cumulative_average;
      actualSubject.grade = actual_term_result.grade;
      actualSubject.remark = actual_term_result.remark;
      actualSubject.last_term_cumulative =
        actual_term_result.last_term_cumulative;
    }

    await sessionResult?.save();
  } catch (error) {
    throw error;
  }
};

const processCbtAssessmentSubmission = async (
  payload: CbtAssessmentEndedType
) => {
  try {
    const cbtAssessmentSubmission = await subjectCbtObjCbtAssessmentSubmission(
      payload
    );

    return cbtAssessmentSubmission;
  } catch (error) {
    throw error;
  }
};

export {
  processCbtAssessmentSubmission,
  processStudentExamResultUpdate,
  processStudentResultUpdate,
  processStudentSubjectPositionUpdate,
  processSubjectCumScoreUpdate,
  recordCumScore,
  recordScore,
  createResult,
  createResultsForStudents,
};
