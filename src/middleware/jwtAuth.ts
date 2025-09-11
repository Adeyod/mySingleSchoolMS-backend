import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AppError, JwtError } from '../utils/app.error';
import { NextFunction, Request, Response } from 'express';
import { UserInJwt } from '../constants/types';
dotenv.config();

const jwt_access_secret = process.env.JWT_ACCESS_SECRET;
const jwt_refresh_secret = process.env.JWT_REFRESH_SECRET;

const generateAccessToken = async (
  userId: object,
  userEmail: string,
  userRole: string
) => {
  try {
    const payload = {
      userId,
      userEmail,
      userRole,
    };

    if (!jwt_access_secret) {
      throw new AppError(
        'JWT_SECRET is not defined in the environment variables',
        404
      );
    }

    const accessToken = await jwt.sign(payload, jwt_access_secret, {
      expiresIn: '2days',
    });

    return accessToken;
  } catch (error: any) {
    throw new JwtError(error.message, error.status);
  }
};

const generateRefreshToken = async (
  userId: object,
  userEmail: string,
  userRole: string
) => {
  try {
    const payload = {
      userId,
      userEmail,
      userRole,
    };

    if (!jwt_refresh_secret) {
      throw new AppError(
        'JWT_SECRET is not defined in the environment variables',
        404
      );
    }

    const refreshToken = await jwt.sign(payload, jwt_refresh_secret, {
      expiresIn: '7days',
    });

    return refreshToken;
  } catch (error: any) {
    throw new JwtError(error.message, error.status);
  }
};

const verifyAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const accessToken = req.headers['authorization']?.split(' ')[1];

    if (!accessToken) {
      throw new AppError('Please login to continue.', 401);
    }

    if (!jwt_access_secret) {
      throw new AppError(
        'JWT_SECRET is not defined in the environment variables',
        404
      );
    }

    const user = (await jwt.verify(
      accessToken,
      jwt_access_secret
    )) as UserInJwt;

    if (!user) {
      throw new AppError('Invalid token', 400);
    }

    req.user = user;
    next();
  } catch (error: any) {
    next(new JwtError(error.message, error.status));
  }
};

const jwtDecodeRefreshToken = async (token: string): Promise<UserInJwt> => {
  try {
    if (!token) {
      throw new AppError('Please provide a token to continue', 404);
    }

    if (!jwt_refresh_secret) {
      throw new AppError(
        'JWT_SECRET is not defined in the environment variables',
        404
      );
    }

    const response = await jwt.verify(token, jwt_refresh_secret);

    if (
      !response ||
      typeof response !== 'object' ||
      !('userId' in response) ||
      !('userEmail' in response) ||
      !('userRole' in response)
    ) {
      throw new Error('could not verify token');
    }

    return response as UserInJwt;
  } catch (error) {
    console.error(error);
    throw new Error('Invalid or expired token');
  }
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  jwtDecodeRefreshToken,
};
