// import mongoose from 'mongoose';
// import {
//   OptionalSubjectProcessingType,
//   SubjectCreationType,
// } from '../constants/types';
// import Class from '../models/class.model';
// import ClassEnrolment from '../models/classes_enrolment.model';
// import Session from '../models/session.model';
// import Student from '../models/students.model';
// import Subject from '../models/subject.model';
// import { AppError } from '../utils/app.error';

// // i will need to create an endpoint to update subject for cases where a subject created was for a section and now school decides to teach it at the other section

// const subjectCreation = async (payload: SubjectCreationType) => {
//   try {
//     const existingSubject = await Subject.findOne({
//       name: payload.name,
//     });

//     if (existingSubject) {
//       throw new AppError('Subject with this name already exists', 400);
//     }

//     const newSubject = await new Subject({
//       name: payload.name,
//       description: payload.description,
//       // type: payload.type,
//       stream: payload.stream,
//       sections: payload.sections,
//     }).save();

//     return newSubject;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw error;
//     }
//     throw new Error(`An error occurred: ${error}`);
//   }
// };

// const fetchingAllJssSubjects = async () => {
//   try {
//     const getJssSubjects = await Subject.find({
//       sections: {
//         $elemMatch: {
//           tier: 'jss_section',
//           is_compulsory: true,
//         },
//       },
//     });

//     if (!getJssSubjects) {
//       throw new AppError('No subject found', 404);
//     }

//     return getJssSubjects;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw error;
//     }
//     throw new Error(`An error occurred: ${error}`);
//   }
// };

// const fetchingAllSssCompulsorySubjects = async () => {
//   try {
//     const getSssSubjects = await Subject.find({
//       sections: {
//         $elemMatch: {
//           tier: 'sss_section',
//           is_compulsory: true,
//         },
//       },
//     });

//     if (!getSssSubjects) {
//       throw new AppError('No subject found', 404);
//     }

//     return getSssSubjects;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw error;
//     }
//     throw new Error(`An error occurred: ${error}`);
//   }
// };

// const fetchingAllOptionalSubjects = async () => {
//   try {
//     const getSssOptionalSubjects = await Subject.find({
//       sections: {
//         $elemMatch: {
//           tier: 'sss_section',
//           is_compulsory: false,
//         },
//       },
//     });

//     if (!getSssOptionalSubjects) {
//       throw new AppError('No subject found', 404);
//     }

//     return getSssOptionalSubjects;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw error;
//     }
//     throw new Error(`An error occurred: ${error}`);
//   }
// };

// const fetchingAllSubjects = async () => {
//   try {
//     const getSubjects = await Subject.find();

//     if (!getSubjects) {
//       throw new AppError('No subject found', 404);
//     }

//     return getSubjects;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw error;
//     }
//     throw new Error(`An error occurred: ${error}`);
//   }
// };

// const fetchingASubject = async (subject_id: string) => {
//   try {
//     const getSubject = await Subject.findById({ _id: subject_id });

//     if (!getSubject) {
//       throw new AppError('No subject found', 404);
//     }

//     return getSubject;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw error;
//     }
//     throw new Error(`An error occurred: ${error}`);
//   }
// };

// const storingOptionalSubjectsOfStudent = async (
//   payload: OptionalSubjectProcessingType
// ) => {
//   try {
//     const {
//       student_id,
//       userId,
//       optional_subjects_chosen_ids,
//       userRole,
//       class_id,
//     } = payload;

//     const studentClass = await Class.findById({
//       _id: class_id,
//     });

//     if (!studentClass) {
//       throw new AppError(`Class with ID: ${class_id} does not exist.`, 404);
//     }

//     if (studentClass.level !== 'SSS 1') {
//       throw new AppError(
//         `You can only choose optional subjects in SSS 1 classes.`,
//         400
//       );
//     }

//     const studentExist = await Student.findById({
//       _id: student_id,
//     });

//     if (!studentExist) {
//       throw new AppError(
//         `Student with ID: ${student_id} can not be found.`,
//         404
//       );
//     }

//     if (userRole === 'parent') {
//       const parent = studentExist.parent_id?.includes(userId);
//       if (!parent) {
//         throw new AppError(
//           `You are not a parent to the student with ID: ${student_id}.`,
//           400
//         );
//       }
//     }

//     const optionalSubjectsIdsToString = studentClass.optional_subjects.map(
//       (id) => id.toString()
//     );

//     const subjectExistInOptionalSubject = optional_subjects_chosen_ids.every(
//       (id) => optionalSubjectsIdsToString.includes(id)
//     );

//     if (!subjectExistInOptionalSubject) {
//       throw new AppError(
//         'Some of the subjects chosen are not present inside the optional subjects approved to be offered in this class.',
//         400
//       );
//     }

//     const activeSession = await Session.findOne({
//       is_active: true,
//     });
//     if (!activeSession) {
//       throw new AppError(
//         'You can choose optional subjects only in an active session.',
//         400
//       );
//     }
//     const activeTerm = activeSession.terms.find(
//       (term) => term.is_active === true
//     );

//     if (!activeTerm) {
//       throw new AppError(
//         'You can choose optional subjects only in an active term.',
//         400
//       );
//     }

//     if (activeTerm.name !== 'first_term') {
//       throw new AppError(
//         'You can choose optional subjects only in first term of a new session',
//         400
//       );
//     }

//     const classEnrolment = await ClassEnrolment.findOne({
//       class: class_id,
//       academic_session_id: activeSession._id,
//     });

//     if (!classEnrolment) {
//       throw new AppError(
//         `There is no class Enrolment for ${studentClass.name} in the ${activeSession.academic_session}.`,
//         404
//       );
//     }

//     const studentInsideClassEnrolment = classEnrolment.students.find(
//       (student) => student.student.toString() === student_id.toString()
//     );

//     if (!studentInsideClassEnrolment) {
//       throw new AppError(
//         `Student with ID: ${student_id} is not enrolled in this class for this session.`,
//         400
//       );
//     }

//     const optionalSubjectsIdsToObject = optional_subjects_chosen_ids.map(
//       (id) => new mongoose.Types.ObjectId(id)
//     );

//     const saveOptionalSubjects =
//       studentInsideClassEnrolment.subjects_offered.push(
//         ...optionalSubjectsIdsToObject
//       );

//     await classEnrolment.save();

//     const result = {
//       class_enrolment_details_of_student: studentInsideClassEnrolment,
//       student: studentExist,
//     };

//     return result;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       throw new Error('Something happened');
//     }
//   }
// };

// export {
//   storingOptionalSubjectsOfStudent,
//   fetchingAllOptionalSubjects,
//   fetchingAllSssCompulsorySubjects,
//   subjectCreation,
//   fetchingAllSubjects,
//   fetchingASubject,
//   fetchingAllJssSubjects,
// };

/////////////////////////////////////////////////////////////////////
import mongoose from 'mongoose';
import {
  ClassSubjectFetchPayload,
  OptionalSubjectProcessingType,
  SubjectCreationType,
  SubjectFetchingPayload,
} from '../constants/types';
import Class from '../models/class.model';
import ClassEnrolment from '../models/classes_enrolment.model';
import Session from '../models/session.model';
import Student from '../models/students.model';
import Subject from '../models/subject.model';
import { AppError } from '../utils/app.error';

const subjectCreation = async (payload: SubjectCreationType) => {
  try {
    const existingSubject = await Subject.findOne({
      name: payload.name.toLowerCase().trim(),
    });

    console.log('existingSubject:', existingSubject);

    if (existingSubject) {
      throw new AppError('Subject with this name already exists', 400);
    }

    const newSubject = await new Subject({
      name: payload.name.toLowerCase().trim(),
      description: payload.description,
    }).save();

    return newSubject;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new Error(`An error occurred: ${error}`);
  }
};

const fetchingASubject = async (payload: SubjectFetchingPayload) => {
  try {
    const getSubject = await Subject.findById({
      _id: payload.subject_id,
    }).populate('teacher_ids');

    if (!getSubject) {
      throw new AppError('No subject found', 404);
    }

    return getSubject;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new Error(`An error occurred: ${error}`);
  }
};

const fetchingAllSubjects = async () => {
  try {
    const getSubjects = await Subject.find();

    if (!getSubjects) {
      throw new AppError('No subject found', 404);
    }

    return getSubjects;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new Error(`An error occurred: ${error}`);
  }
};

const fetchingAllJssSubjects = async () => {
  try {
    const getJssSubjects = await Subject.find({
      sections: {
        $elemMatch: {
          tier: 'jss_section',
          is_compulsory: true,
        },
      },
    });

    if (!getJssSubjects) {
      throw new AppError('No subject found', 404);
    }

    return getJssSubjects;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new Error(`An error occurred: ${error}`);
  }
};

const fetchingAllSssCompulsorySubjects = async () => {
  try {
    const getSssSubjects = await Subject.find({
      sections: {
        $elemMatch: {
          tier: 'sss_section',
          is_compulsory: true,
        },
      },
    });

    if (!getSssSubjects) {
      throw new AppError('No subject found', 404);
    }

    return getSssSubjects;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new Error(`An error occurred: ${error}`);
  }
};

const fetchingAllOptionalSubjects = async () => {
  try {
    const getSssOptionalSubjects = await Subject.find({
      sections: {
        $elemMatch: {
          tier: 'sss_section',
          is_compulsory: false,
        },
      },
    });

    if (!getSssOptionalSubjects) {
      throw new AppError('No subject found', 404);
    }

    return getSssOptionalSubjects;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new Error(`An error occurred: ${error}`);
  }
};

const fetchAllClassSubjectsByClassId = async (
  payload: ClassSubjectFetchPayload
) => {
  try {
    const { class_id } = payload;

    const classExist = await Class.findById({
      _id: class_id,
    }).populate('compulsory_subjects');

    if (!classExist) {
      throw new AppError('Class not found.', 404);
    }

    const class_subjects = classExist.compulsory_subjects;

    return class_subjects;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

export {
  fetchAllClassSubjectsByClassId,
  // storingOptionalSubjectsOfStudent,
  fetchingAllOptionalSubjects,
  fetchingAllSssCompulsorySubjects,
  fetchingAllJssSubjects,
  subjectCreation,
  fetchingASubject,
  fetchingAllSubjects,
};
