import express from 'express';
import {
  getAllOldStudents,
  getAnOldStudent,
} from '../controllers/old_student.controller';

const router = express.Router();

router.get('/all', getAllOldStudents);
router.get('/:id', getAnOldStudent);

export default router;
