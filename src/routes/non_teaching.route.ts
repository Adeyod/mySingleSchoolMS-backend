import express from 'express';
import { verifyAccessToken } from '../middleware/jwtAuth';
import { permission } from '../middleware/authorization';

const router = express.Router();

// router.post('/create-a-job', createAJob);
// router.get('/get-a-job', getAJob);

export default router;
