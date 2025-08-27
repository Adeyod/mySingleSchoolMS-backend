import express from 'express';
import { klazikWebhook } from '../controllers/klazik.controller';

const router = express.Router();

router.post('/web-hook', klazikWebhook);

export default router;
