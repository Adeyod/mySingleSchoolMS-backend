import express from 'express';

import { verifyAccessToken } from '../middleware/jwtAuth';
import { permission } from '../middleware/authorization';
import {
  createNewSession,
  createNewTerm,
  endATermInASessionByTermId,
  getASessionBySessionId,
  getActiveSession,
  getAllSessions,
  deleteSessionById,
  deleteTermById,
  endASessionBySessionId,
} from '../controllers/session.controller';
import { developerProtected } from '../middleware/developerProtected';

const router = express.Router();

router.use(verifyAccessToken);
router.get('/get-active-session', getActiveSession);

router.get(
  '/get-sessions',
  permission(['admin', 'super_admin']),
  getAllSessions
);

router.get(
  '/get-session/:session_id',
  permission(['admin', 'super_admin']),
  getASessionBySessionId
);

router.put(
  '/end-session/:session_id',
  permission(['admin', 'super_admin']),
  developerProtected,
  endASessionBySessionId
);

router.put(
  '/end-term/:session_id/:term_id',
  permission(['admin', 'super_admin']),
  developerProtected,
  endATermInASessionByTermId
);

router.post(
  '/create-session',
  permission(['admin', 'super_admin']),
  createNewSession
);

router.post(
  '/:session_id/create-term',
  permission(['admin', 'super_admin']),
  createNewTerm
);

router.delete(
  '/delete-session/:session_id',
  permission(['admin', 'super_admin']),
  deleteSessionById
);

router.delete(
  '/:session_id/delete-term/:term_id',
  permission(['admin', 'super_admin']),
  deleteTermById
);

export default router;
