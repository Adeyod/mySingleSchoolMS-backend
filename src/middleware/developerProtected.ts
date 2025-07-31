import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/app.error';
import { mandatedSuperAdmins } from '../constants/enum';

export const developerProtected = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError('User not authenticated.', 401));
    }
    const user = req.user;

    const adminRoles =
      user.userRole === 'admin' || user.userRole === 'super_admin';

    if (adminRoles && !mandatedSuperAdmins.includes(user.userEmail)) {
      throw new AppError(
        'Developers are still working with this endpoint. When they are through with it, it will be released for use by the school authority.',
        400
      );
    }

    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};
