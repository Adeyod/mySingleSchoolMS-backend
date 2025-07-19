import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

import {
  CloudinaryType,
  ImageType,
  SchoolCreationPayloadType,
  SchoolType,
  SchoolUserType,
  TokenType,
  ClassLevelCreationPayloadType,
  ResultSettingComponentType,
  GradingAndRemarkType,
  ExamComponentType,
  CutoffMinutesCreationPayload,
} from '../constants/types';
import { AppError } from '../utils/app.error';
import { cloudinaryDestroy, handleFileUpload } from '../utils/cloudinary';
import { rolesEnum } from '../constants/enum';
import { generateAndStoreVerificationToken } from '../repository/token.repository';
import { capitalizeFirstLetter, sendingEmailToQueue } from '../utils/functions';
import { emailQueue } from '../utils/queue';
import { findUserByEmail } from '../repository/user.repository';
import ClassLevel from '../models/class_level.model';
import ResultSetting from '../models/result_setting.model';
import CbtCutoff from '../models/cbt_cutoffs.model';

// const addingSchoolLogo = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     if (findSchool?.logo?.url) {
//       const deletion = await cloudinaryDestroy(
//         findSchool?.logo?.public_url as string
//       );
//     }

//     const imageUpload = await handleFileUpload(req, res);

//     if (!imageUpload) {
//       throw new AppError('Unable to upload profile image.', 400);
//     }

//     let imageData: { url: string; public_url: string } | undefined;

//     if (Array.isArray(imageUpload)) {
//       imageData = imageUpload[0];
//     } else {
//       imageData = imageUpload;
//     }

//     if (!imageData) {
//       throw new AppError('This is not a valid cloudinary image upload.', 400);
//     }

//     const updateSchool = await School.findByIdAndUpdate(
//       {
//         _id: schoolId,
//       },
//       {
//         logo: {
//           url: imageData.url,
//           public_url: imageData.public_url,
//         },
//       },
//       { new: true }
//     );

//     return updateSchool;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.error(error);
//       throw new Error('Something went wrong');
//     }
//   }
// };

// const addingSchoolImage = async (
//   req: Request,
//   schoolId: string,
//   subdomain: string,
//   res: Response
// ) => {
//   try {
//     const school_id = Object(schoolId);

//     const findSchool = await School.findById({
//       _id: school_id,
//     });

//     if (!findSchool) {
//       throw new AppError('School not found.', 404);
//     }

//     if (findSchool.subdomain !== subdomain.toLowerCase()) {
//       throw new AppError('Subdomain mis-match.', 400);
//     }

//     if (findSchool?.school_image?.url) {
//       const deletion = await cloudinaryDestroy(
//         findSchool?.school_image?.public_url as string
//       );
//     }

//     const imageUpload = await handleFileUpload(req, res);

//     if (!imageUpload) {
//       throw new AppError('Unable to upload profile image.', 400);
//     }

//     let imageData: { url: string; public_url: string } | undefined;

//     if (Array.isArray(imageUpload)) {
//       imageData = imageUpload[0];
//     } else {
//       imageData = imageUpload;
//     }

//     if (!imageData) {
//       throw new AppError('This is not a valid cloudinary image upload.', 400);
//     }

//     const updateSchool = await School.findByIdAndUpdate(
//       {
//         _id: schoolId,
//       },
//       {
//         school_image: {
//           url: imageData.url,
//           public_url: imageData.public_url,
//         },
//       },
//       { new: true }
//     );

//     console.log('updatedSchool:', updateSchool);
//     return updateSchool;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.error(error);
//       throw new Error('Something went wrong');
//     }
//   }
// };

// const principalSignAndDateAddition = async (
//   req: Request,
//   academic_session_id: string,
//   term: string,
//   res: Response
// ) => {
//   try {
//     const academicSession = Object(academic_session_id);
//     const termPrincipalSignExist = findSchool.principal_signature_per_term.find(
//       (a) => a.academic_session_id === academicSession && a.term === term
//     );

//     if (termPrincipalSignExist?.url) {
//       const deletion = await cloudinaryDestroy(
//         termPrincipalSignExist?.public_url as string
//       );
//     }

//     const imageUpload = await handleFileUpload(req, res);

//     if (!imageUpload) {
//       throw new AppError('Unable to upload principal term signature.', 400);
//     }

//     let imageData: { url: string; public_url: string } | undefined;

//     if (Array.isArray(imageUpload)) {
//       imageData = imageUpload[0];
//     } else {
//       imageData = imageUpload;
//     }

//     if (!imageData) {
//       throw new AppError('This is not a valid cloudinary image upload.', 400);
//     }

//     if (termPrincipalSignExist) {
//       termPrincipalSignExist.url === imageData.url,
//         termPrincipalSignExist.public_url === imageData.public_url;
//     } else {
//       findSchool.principal_signature_per_term.push({
//         academic_session_id: academicSession,
//         term: term,
//         url: imageData.url,
//         public_url: imageData.public_url,
//       });
//     }

//     console.log(
//       'findSchool.principal_signature_per_term:',
//       findSchool.principal_signature_per_term
//     );
//     await findSchool.save();
//     return findSchool;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw new AppError(error.message, error.statusCode);
//     } else {
//       console.error(error);
//       throw new Error('Something went wrong');
//     }
//   }
// };

const classLevelsCreation = async (payload: ClassLevelCreationPayloadType) => {
  try {
    const { class_level_array } = payload;

    const classLevelExist = await ClassLevel.findOne();

    if (classLevelExist) {
      throw new AppError('This school already have class level.', 400);
    }

    const newClassLevel = await new ClassLevel({
      class_level_array,
    }).save();

    if (!newClassLevel) {
      throw new AppError('Unable to create class level for this school.', 400);
    }

    console.log('newClassLevel:', newClassLevel);

    return newClassLevel;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.error(error);
      throw new Error('Something went wrong');
    }
  }
};

const resultSettingCreation = async (
  name_percent_array: ResultSettingComponentType[],
  level: string,
  grading_array: GradingAndRemarkType[],
  exam_components: ExamComponentType
) => {
  try {
    const schoolLevels = await ClassLevel.findOne();

    if (!schoolLevels) {
      throw new AppError('This school does not have class levels at all.', 400);
    }

    const classLevelExist = schoolLevels.class_level_array.find(
      (a) => a.toString() === level
    );

    if (!classLevelExist) {
      throw new AppError(
        'This class level does not exist for this school',
        404
      );
    }

    const resultSettingExist = await ResultSetting.findOne({
      level: level,
    });

    if (resultSettingExist) {
      throw new AppError(
        'This level already have result component in this school.',
        400
      );
    }

    let resultComponentArray = [];

    const nameSet: Set<string> = new Set();
    const columnSet: Set<number> = new Set();

    for (const item of name_percent_array) {
      const {
        name: itemName,
        percentage: itemPercentage,
        column: itemColumn,
      } = item;

      if (!itemName || !itemPercentage || !itemColumn) {
        throw new AppError(
          'Each name must have a corresponding percentage and column number to process.',
          400
        );
      }

      if (nameSet.has(itemName)) {
        throw new AppError(
          `Duplicate name detected: ${itemName}. Each name must be unique.`,
          400
        );
      }
      nameSet.add(itemName);

      if (columnSet.has(itemColumn)) {
        throw new AppError(
          `Duplicate column number detected: ${itemColumn}.`,
          400
        );
      }

      columnSet.add(itemColumn);

      const itemObj = {
        name: itemName,
        percentage: itemPercentage,
        column: itemColumn,
      };

      resultComponentArray.push(itemObj);
    }

    const sortedColumns = Array.from(columnSet).sort((a, b) => a - b);

    for (let i = 0; i < sortedColumns.length; i++) {
      if (sortedColumns[i] !== i + 1) {
        throw new AppError(
          `Column numbers must be sequential without skipping. Found: ${sortedColumns.join(
            ', '
          )}`,
          400
        );
      }
    }

    const emptyExamPercentage = exam_components.component.find(
      (a) => a.percentage === 0 || a.percentage === null
    );

    console.log('emptyExamPercentage:', emptyExamPercentage);

    if (emptyExamPercentage) {
      throw new AppError(
        `Please provide percentage value for ${emptyExamPercentage.name}.`,
        400
      );
    }

    const totalExamPercentage = exam_components.component.reduce(
      (sum, percent) => sum + percent.percentage,
      0
    );

    const totalOthersPercentage = resultComponentArray.reduce(
      (sum, percent) => sum + percent.percentage,
      0
    );

    const totalPercentage = totalExamPercentage + totalOthersPercentage;

    if (totalPercentage !== 100) {
      throw new AppError(
        'Total percentage can not be greater than or less than 100%.',
        400
      );
    }

    const newResultSetting = new ResultSetting({
      components: resultComponentArray,
      grading_and_remark: grading_array,
      level: level,
      exam_components: exam_components,
    });

    await newResultSetting.save();

    const schoolAndResultObj = {
      result_settings: newResultSetting,
    };

    return schoolAndResultObj;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened.');
    }
  }
};

const cutoffMinutesCreation = async (payload: CutoffMinutesCreationPayload) => {
  try {
    const { first_cutoff_minutes, last_cutoff_minutes } = payload;

    const cutoffExist = await CbtCutoff.findOne();

    if (cutoffExist) {
      throw new AppError(`School already has cutoff recorded.`, 400);
    }

    const newCutoff = new CbtCutoff({
      first_cutoff_minutes: first_cutoff_minutes,
      last_cutoff_minutes: last_cutoff_minutes,
    });

    await newCutoff.save();

    return newCutoff;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

export {
  cutoffMinutesCreation,
  resultSettingCreation,
  // principalSignAndDateAddition,
  classLevelsCreation,
  // addingSchoolLogo,
  // addingSchoolImage,
};
