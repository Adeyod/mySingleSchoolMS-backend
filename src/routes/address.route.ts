import express from 'express';
import {
  addBusStopToDatabase,
  getBusStopsFromDatabase,
  addManyBusStopsToDatabase,
  getBusStopsByGroupingFromDatabase,
  getBusStopFromDatabaseById,
} from '../controllers/address.controller';
import { verifyAccessToken } from '../middleware/jwtAuth';
import { permission } from '../middleware/authorization';

const router = express.Router();

/**
 * fetch student based on single trip and both trip, single morning or afternoon trip
 add which trip field as enum
 get all addresses
 add option to update addresses and nearest bus stop for students that have changed address.
 
  */

router.use(verifyAccessToken);
router.post(
  '/add-bus-stop-to-database',
  permission(['admin', 'super_admin']),
  addBusStopToDatabase
);
router.post('/add-many-bus-stops-to-database', addManyBusStopsToDatabase);
router.get('/get-all-bus-stops-from-database', getBusStopsFromDatabase);
router.get(
  '/get-group-bus-stops-from-database',
  getBusStopsByGroupingFromDatabase
);
router.get('/get-bus-stop-by-id/:bus_stop_id', getBusStopFromDatabaseById);

export default router;
