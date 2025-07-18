// import { NextFunction, Request, Response } from 'express';

// const restrictLocalAccess = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): void => {
//   const clientIp =
//     req.connection?.remoteAddress || req.socket?.remoteAddress || '';

//   if (
//     clientIp.startsWith('192.168.') ||
//     clientIp === '::1' ||
//     clientIp === '127.0.0.1'
//   ) {
//     return next();
//   }

//   res.status(403).json({
//     message:
//       'Access Denied: Exams endpoints are only accessible within the school network.',
//   });
// };

// export default restrictLocalAccess;
