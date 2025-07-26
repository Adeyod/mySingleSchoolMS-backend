// import { ClassCreationType, ClassDocument } from '../constants/types';
// import Class from '../models/class.model';
// import Subject from '../models/subject.model';
// import { AppError } from '../utils/app.error';

// const classCreation = async (
//   payload: ClassCreationType
// ): Promise<ClassDocument> => {
//   try {
//     const { name, description, level, arms, compulsory_subjects, section } =
//       payload;

//     const existingClass = await Class.findOne({ name: name });

//     if (existingClass) {
//       throw new AppError('Class with this name already exists', 400);
//     }

//     const compulsorySubjectsLower = compulsory_subjects?.map((subject) =>
//       subject.toLowerCase()
//     );
//     // const optionalSubjectsLower = optional_subjects?.map((subject) =>
//     //   subject.toLowerCase()
//     // );

//     const compulsorySubjectsIds = await Subject.find({
//       name: { $in: compulsorySubjectsLower },
//     });

//     // const optionalSubjectsIds = await Subject.find({
//     //   name: { $in: optionalSubjectsLower },
//     // });

//     // console.log('compulsorySubjectsIds length', compulsorySubjectsIds.length);
//     // console.log('compulsorySubjectsIds', compulsorySubjectsIds);
//     // console.log('compare length', compulsory_subjects.length);
//     // console.log('compare length', compulsory_subjects);

//     const compulsorySubjectsNames = compulsorySubjectsIds.map((s) => s.name);

//     const invalidSubjects = compulsory_subjects.filter(
//       (subject) => !compulsorySubjectsNames.includes(subject.toLowerCase())
//     );

//     if (invalidSubjects?.length > 0) {
//       throw new AppError(
//         `The following compulsory subjects are not found: ${invalidSubjects.join(
//           ', '
//         )}`,
//         404
//       );
//     }

//     // if (
//     //   optional_subjects &&
//     //   optionalSubjectsIds?.length !== optional_subjects?.length
//     // ) {
//     //   throw new AppError('One or more optional subjects not found.', 404);
//     // }

//     const newClass = await new Class({
//       name,
//       description,
//       level,
//       arms,
//       section,
//       compulsory_subjects: compulsorySubjectsIds,
//     }).save();

//     return newClass as unknown as ClassDocument;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw error;
//     }
//     throw new Error(`Error creating new class: ${error}`);
//   }
// };

// const fetchAllClasses = async (): Promise<ClassDocument[]> => {
//   try {
//     const existingClasses = await Class.find().populate('compulsory_subjects');

//     if (!existingClasses) {
//       throw new AppError('No Classes found', 400);
//     }

//     return existingClasses as ClassDocument[];
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw error;
//     }
//     throw new Error(`Error fetching class: ${error}`);
//   }
// };

// const fetchAClassById = async (class_id: string): Promise<ClassDocument> => {
//   try {
//     const existingClass = await Class.findById({
//       _id: class_id,
//     })
//       .populate(
//         'compulsory_subjects teacher_subject_assignments.teacher teacher_subject_assignments.subject'
//       )
//       .populate('teacher_subject_assignments.teacher', '-password')
//       .populate('class_teacher', '-password');

//     if (!existingClass) {
//       throw new AppError('No Class found', 400);
//     }

//     return existingClass as ClassDocument;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw error;
//     }
//     throw new Error(`Error fetching class: ${error}`);
//   }
// };

// export { classCreation, fetchAllClasses, fetchAClassById };

/////////////////////////////////////////////////////////////////////
import mongoose from 'mongoose';
import {
  ClassCreationType,
  ClassDocument,
  GetClassPayloadType,
  SubjectAdditionType,
  SubjectDocument,
  SubjectRemovalType,
} from '../constants/types';
import Class from '../models/class.model';
import ClassLevel from '../models/class_level.model';
import ClassEnrolment from '../models/classes_enrolment.model';
import Subject from '../models/subject.model';
import { AppError } from '../utils/app.error';

const classCreation = async (
  payload: ClassCreationType
): Promise<ClassDocument> => {
  // REMOVE STREAMS AND OPTIONAL SUBJECTS
  try {
    const {
      name,
      description,
      level,
      // arms,
      // streams,
      compulsory_subjects,
      // optional_subjects,
      section,
    } = payload;

    const existingClass = await Class.findOne({
      name: name,
    });

    if (existingClass) {
      throw new AppError('Class with this name already exists', 400);
    }

    const compulsorySubjectsLower = compulsory_subjects?.map((subject) =>
      subject.toLowerCase()
    );
    // const optionalSubjectsLower = optional_subjects?.map((subject) =>
    //   subject.toLowerCase()
    // );

    const compulsorySubjectsIds = await Subject.find({
      name: { $in: compulsorySubjectsLower },
    });
    // const optionalSubjectsIds = await Subject.find({
    //   school: school,
    //   name: { $in: optionalSubjectsLower },
    // });

    console.log('compulsorySubjectsIds length', compulsorySubjectsIds.length);
    // console.log('compulsorySubjectsIds', compulsorySubjectsIds);
    console.log('compare length', compulsory_subjects.length);
    // console.log('compare length', compulsory_subjects);

    const compulsorySubjectsNames = compulsorySubjectsIds.map((s) => s.name);

    console.log('compulsorySubjectsNames:', compulsorySubjectsNames);

    const invalidSubjects = compulsory_subjects.filter(
      (subject) => !compulsorySubjectsNames.includes(subject.toLowerCase())
    );

    console.log('invalidSubjects:', invalidSubjects);

    if (invalidSubjects?.length > 0) {
      throw new AppError(
        `The following subjects are not found: ${invalidSubjects.join(', ')}`,
        404
      );
    }

    // if (
    //   optional_subjects &&
    //   optionalSubjectsIds?.length !== optional_subjects?.length
    // ) {
    //   const optionalSubjectNames = optionalSubjectsIds.map((s) => s.name);

    //   const invalidOptionalSubjects = optional_subjects.filter(
    //     (subject) => !optionalSubjectNames.includes(subject)
    //   );

    //   if (invalidOptionalSubjects?.length > 0) {
    //     throw new AppError(
    //       `The following optional subjects are not found: ${invalidOptionalSubjects.join(
    //         ', '
    //       )}`,
    //       404
    //     );
    //   }
    // }

    const newClass = await new Class({
      name,
      description,
      level,
      // arms,
      // streams,
      section,
      compulsory_subjects: compulsorySubjectsIds,
      // optional_subjects: optionalSubjectsIds,
    }).save();

    console.log('newClass:', newClass);

    return newClass as unknown as ClassDocument;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new Error(`Error creating new class: ${error}`);
  }
};

const fetchAClassById = async (
  payload: GetClassPayloadType
): Promise<ClassDocument> => {
  try {
    const existingClass = await Class.findById({
      _id: payload.class_id,
    })
      .populate(
        'compulsory_subjects teacher_subject_assignments.teacher teacher_subject_assignments.subject'
      )
      .populate('teacher_subject_assignments.teacher', '-password')
      .populate('class_teacher', '-password');

    if (!existingClass) {
      throw new AppError('No Class found', 400);
    }

    return existingClass as ClassDocument;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new Error(`Error fetching class: ${error}`);
  }
};

const fetchAllClasses = async (): Promise<ClassDocument[]> => {
  try {
    const existingClasses = await Class.find({}).populate(
      'compulsory_subjects'
    );

    if (!existingClasses) {
      throw new AppError('No Classes found', 400);
    }

    return existingClasses as ClassDocument[];
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new Error(`Error fetching class: ${error}`);
  }
};

const subjectsAdditionToAClass = async (payload: SubjectAdditionType) => {
  try {
    const { class_id, subject_ids_array } = payload;

    const classId = Object(class_id);

    const activeClassEnrollment = await ClassEnrolment.findOne({
      is_active: true,
      class: classId,
    });

    if (activeClassEnrollment) {
      throw new AppError(
        'You can not add new subject to this class because there is an active class enrollment for the class.',
        400
      );
    }

    const classExist = await Class.findById({
      _id: classId,
    });

    if (!classExist) {
      throw new AppError('Class not found.', 404);
    }

    const duplicateIds = new Set();
    const uniqueIds = new Set();

    subject_ids_array.forEach((s) => {
      if (uniqueIds.has(s)) {
        duplicateIds.add(s);
      } else {
        uniqueIds.add(s);
      }
    });

    if (duplicateIds.size > 0) {
      throw new AppError('You can not save a subject twice in a class.', 400);
    }

    const subjectObjectIds = subject_ids_array.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const invalidSubjects = classExist.compulsory_subjects.filter((subject) =>
      subjectObjectIds.some((id) => id.equals(subject))
    );

    const allSubjects = (await Subject.find({
      _id: { $in: subjectObjectIds },
    })) as SubjectDocument[];

    const filteredSubjects = subjectObjectIds.filter(
      (id) =>
        !allSubjects.some((subject) => subject._id.toString() === id.toString())
    );

    if (filteredSubjects.length > 0) {
      throw new AppError(
        `The following subject IDs: ${filteredSubjects.join(
          ', '
        )} are not found.`,
        400
      );
    }

    if (invalidSubjects.length > 0) {
      throw new AppError(
        'One or more of the subjects is already been offered in this class.',
        400
      );
    }

    subjectObjectIds.forEach((subject) => {
      classExist.compulsory_subjects.push(subject);
    });

    await classExist.save();
    return classExist;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new Error(`Error fetching class: ${error}`);
  }
};

const subjectsRemovalFromClass = async (payload: SubjectRemovalType) => {
  try {
    const { class_id, subject_ids_array } = payload;

    const classId = Object(class_id);

    const activeClassEnrollment = await ClassEnrolment.findOne({
      is_active: true,
    });

    if (activeClassEnrollment) {
      throw new AppError(
        'You can not remove subject from a class when there is an active class enrollment.',
        400
      );
    }

    const classExist = await Class.findById({
      _id: classId,
    });

    if (!classExist) {
      throw new AppError('Class not found.', 404);
    }

    subject_ids_array.forEach((s) => {
      const subject = Object(s);
      if (classExist.compulsory_subjects.includes(subject)) {
        classExist.compulsory_subjects.filter((s) => s !== subject);
      }
      // else if (
      //   classExist.optional_subjects !== null &&
      //   classExist.optional_subjects.length !== 0
      // ) {
      //   if (classExist.optional_subjects.includes(subject)) {
      //     classExist.optional_subjects.filter((s) => s !== subject);
      //   }
      // }
    });

    await classExist.save();
    return classExist;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error(`Error fetching class: ${error}`);
    }
  }
};

const fetchMySchoolClassLevel = async () => {
  try {
    const classLevel = await ClassLevel.findOne({});

    if (!classLevel) {
      throw new AppError('Class level not found.', 404);
    }

    return classLevel;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error(`Error fetching class: ${error}`);
    }
  }
};

export {
  fetchMySchoolClassLevel,
  subjectsRemovalFromClass,
  subjectsAdditionToAClass,
  classCreation,
  fetchAClassById,
  fetchAllClasses,
};
