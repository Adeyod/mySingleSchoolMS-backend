import multer, { FileFilterCallback } from 'multer';
import fs from 'fs';
import { Request } from 'express';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.originalname + '-' + uniqueSuffix);
  },
});

const maxLimit = 200000;

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg'
  ) {
    cb(null, true);
  } else if (file.size > maxLimit) {
    console.error('Max limit exceeded');
    cb(new Error('File size exceeded.'));
  } else {
    cb(new Error('File format not supported.'));
  }
};

const uploadFile = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: maxLimit, files: 20 },
});

export default uploadFile;
