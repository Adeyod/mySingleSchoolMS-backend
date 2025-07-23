import express from 'express';
import { verifyAccessToken } from '../middleware/jwtAuth';
import { permission } from '../middleware/authorization';
import {
  assignTeacherToClass,
  assignTeacherToSubject,
  getATeacherById,
  getTeachersBySubjectId,
  getAllTeachers,
  teacherOnboardingById,
  changeClassTeacher,
  changeSubjectTeacherInAClass,
  getStudentsInClassOfferingTeacherSubject,
  getAllClassesTeacherTeachesByTeacherId,
  getStudentsOfferingTeacherSubjectUsingClassId,
  getAllStudentsInClassByClassId,
  getStudentsInClassThatTeacherManages,
  getClassTeacherManagesByTeacherId,
} from '../controllers/teacher.controller';

const router = express.Router();

router.use(verifyAccessToken);
router.put(
  '/assign-class-teacher',
  permission(['admin', 'super_admin']),
  assignTeacherToClass
);

router.put(
  '/change-class-teacher/:class_id',
  permission(['admin', 'super_admin']),
  changeClassTeacher
);

router.put(
  '/assign-teacher-to-subject',
  permission(['admin', 'super_admin']),
  assignTeacherToSubject
);

router.put(
  '/change-subject-teacher-in-a-class',
  permission(['admin', 'super_admin']),
  changeSubjectTeacherInAClass
);

router.put(
  '/teacher-onboarding/:teacher_id',
  permission(['admin', 'super_admin']),
  teacherOnboardingById
);

router.get(
  '/get-a-teacher-by-id/:teacher_id',
  permission(['admin', 'super_admin']),
  getATeacherById
);

router.get(
  '/get-all-teachers-by-subject/:subject_id',
  permission(['admin', 'super_admin']),
  getTeachersBySubjectId
);

router.get(
  '/get-all-teachers',
  permission(['admin', 'super_admin']),
  getAllTeachers
);

router.get(
  '/get-students-in-class-offering-subject/:academic_session_id/:class_id/:subject_id',
  permission(['admin', 'super_admin', 'teacher']),
  getStudentsInClassOfferingTeacherSubject
);

router.get(
  '/students-in-class-offering-subject-using-class-id/:class_id',
  permission(['teacher']),
  getStudentsOfferingTeacherSubjectUsingClassId
);

router.get(
  '/get-all-classes-teacher-teaches/:teacher_id',
  permission(['admin', 'super_admin', 'teacher']),
  getAllClassesTeacherTeachesByTeacherId
);

router.get(
  '/get-all-students-in-class/:class_id/:academic_session_id',
  permission(['admin', 'super_admin', 'teacher']),
  getAllStudentsInClassByClassId
);

router.get(
  '/get-all-students-in-class-that-teacher-manages/:teacher_id/:class_id/:academic_session_id',
  permission(['teacher', 'super_admin']),
  getStudentsInClassThatTeacherManages
);

router.get(
  '/get-class-teacher-manages-by-teacher-id/:teacher_id',
  permission(['teacher']),
  getClassTeacherManagesByTeacherId
);

// fetch all classes that a teacher is teaching using teacher_id and add subject and students.

export default router;
