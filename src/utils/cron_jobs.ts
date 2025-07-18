import cron from 'node-cron';
import CbtQuestion from '../models/cbt_question.model';
import ClassExamTimetable from '../models/class_exam_timetable.model';
import CbtExam from '../models/cbt_exam.model';

const examStatusUpdatejob = () => {
  cron.schedule('*/1 * * * *', async () => {
    const now = new Date();

    const cbtExams = await CbtExam.find({
      is_active: true,
    });

    const cbtExamsIds = cbtExams.map((a) => a._id);

    const exams = await CbtQuestion.find({
      exam_id: { $in: cbtExamsIds },
      exam_subject_status: { $ne: 'ended' },
    });

    for (const exam of exams) {
      const exactTimetable = await ClassExamTimetable.findOne({
        exam_id: exam.exam_id,
        academic_session_id: exam.academic_session_id,
        class_id: exam.class_id,
        term: exam.term,
      });

      if (!exactTimetable) {
        console.warn(
          `[CRON]: No matching timetable found for exam ID: ${exam._id}`
        );
        continue;
      }

      const subject = exactTimetable?.scheduled_subjects.find(
        (s) => s.subject_id.toString() === exam.subject_id.toString()
      );

      if (now < exam.obj_start_time) {
        exam.exam_subject_status = 'not_started';
        exam.markModified('exam_subject_status');
        if (subject && exactTimetable) {
          subject.exam_subject_status = 'not_started';
          exactTimetable.markModified('scheduled_subjects');
        }
      } else if (
        now > exam.obj_start_time &&
        now <= exam.obj_final_cutoff_time
      ) {
        exam.exam_subject_status = 'ongoing';
        exam.markModified('exam_subject_status');
        if (subject && exactTimetable) {
          subject.exam_subject_status = 'ongoing';
          exactTimetable.markModified('scheduled_subjects');
        }
        if (
          now > exam.obj_initial_cutoff_time &&
          now <= exam.obj_final_cutoff_time
        ) {
          if (subject) {
            subject.has_subject_grace_period_ended = true;
          }
        }
      } else {
        exam.exam_subject_status = 'ended';
        exam.markModified('exam_subject_status');
        if (subject && exactTimetable) {
          subject.exam_subject_status = 'ended';
          exactTimetable.markModified('scheduled_subjects');
          console.log('CRON subject:', subject);
        }
      }

      exam.markModified('exam_subject_status');
      await exam.save();
      if (exactTimetable) {
        await exactTimetable.save();
      }
    }

    console.log(`[CRON]: Status updated at ${now.toISOString()}`);
  });
};

export { examStatusUpdatejob };
