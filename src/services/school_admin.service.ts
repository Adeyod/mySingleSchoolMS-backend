import Admin from '../models/admin.model';
import Class from '../models/class.model';
import ClassEnrolment from '../models/classes_enrolment.model';
import Parent from '../models/parents.model';
import Session from '../models/session.model';
import Student from '../models/students.model';
import Subject from '../models/subject.model';
import Teacher from '../models/teachers.model';
import { AppError } from '../utils/app.error';

const fetchAllAdmins = async () => {
  try {
    const admins = await Admin.find();
    if (!admins) {
      throw new AppError('No admins found.', 404);
    }

    const adminsWithoutPassword = admins.map((admin) => {
      const { password, ...others } = admin.toJSON();
      return others;
    });

    console.log('adminsWithoutPassword:', adminsWithoutPassword);

    return adminsWithoutPassword;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchMySchoolSummary = async (userRole: string) => {
  try {
    const [
      schoolStudents,
      schoolTeachers,
      schoolParents,
      schoolSession,
      schoolSubjects,
      schoolClasses,
      schoolEnrolments,
    ] = await Promise.all([
      Student.find(),
      Teacher.find(),
      Parent.find(),
      Session.find(),
      Subject.find(),
      Class.find(),
      ClassEnrolment.find(),
    ]);

    const activeClassEnrolments = await ClassEnrolment.find({
      is_active: true,
    }).populate('students.student class', '-password');

    console.log('activeClassEnrolments:', activeClassEnrolments);

    let schoolAdmins: {}[] = [];

    if (userRole === 'school_owner') {
      schoolAdmins = await Admin.find();
    }

    const value = 'Showing total school';

    const users_summary_array = [
      userRole === 'school_owner' && {
        total_count: schoolAdmins.length,
        key: 'admins',
        title: 'School Admins',
        summary: `${value} admins`,
      },
      {
        total_count: schoolTeachers.length,
        key: 'teachers',
        title: 'Teachers',
        summary: `${value} teachers`,
      },
      {
        total_count: schoolParents.length,
        key: 'parents',
        title: 'Parents',
        summary: `${value} parents`,
      },
      {
        total_count: schoolStudents.length,
        key: 'students',
        title: 'Students',
        summary: `${value} students`,
      },
    ].filter(Boolean);

    const academic_summary_array = [
      {
        total_count: schoolSession.length,
        key: 'sessions',
        title: 'Sessions',
        summary: `${value} sessions`,
      },
      {
        total_count: schoolSubjects.length,
        key: 'subjects',
        title: 'Subjects',
        summary: `${value} subjects`,
      },
      {
        total_count: schoolClasses.length,
        key: 'classes',
        title: 'Classes',
        summary: `${value} classes`,
      },
      {
        total_count: schoolEnrolments.length,
        key: 'enrolments',
        title: 'Enrolments',
        summary: `${value} enrolments`,
      },
    ];

    const class_enrolments = {
      enrolment_data: activeClassEnrolments,
      total_count: activeClassEnrolments.length,
      title: 'Enrolments',
      summary: `${value} active class enrolments`,
      key: 'active enrolments',
    };

    const full_summary = {
      users_summary_array,
      academic_summary_array,
      class_enrolments,
    };

    return full_summary;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened');
    }
  }
};

const fetchAdminByAdminId = async (admin_id: string) => {
  try {
    const adminObj = Object(admin_id);

    const admin = await Admin.findOne({
      _id: adminObj,
    });
    if (!admin) {
      throw new AppError('No school admin found.', 404);
    }

    const { password, ...others } = admin.toJSON();
    return others;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

export { fetchMySchoolSummary, fetchAllAdmins, fetchAdminByAdminId };
