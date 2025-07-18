import {
  allBusStopsFromAddressDocument,
  createBusStop,
  createManyBusStops,
  fetchBusStopById,
} from '../services/address.service';
import { AppError } from '../utils/app.error';
import catchErrors from '../utils/tryCatch';

const addBusStopToDatabase = catchErrors(async (req, res) => {
  const { bus_stop, group } = req.body;
  if (!bus_stop || !group) {
    throw new AppError('Bus stop and group must be provided to continue.', 400);
  }

  const result = await createBusStop(bus_stop, group);

  if (!result) {
    throw new AppError('Unable to add bus stop.', 400);
  }

  return res.status(201).json({
    message: 'Bus Stop added successfully.',
    status: 201,
    success: true,
    bus_stop: result,
  });
});

const addManyBusStopsToDatabase = catchErrors(async (req, res) => {
  const { bus_stops, group } = req.body;
  if (!bus_stops || !group) {
    throw new AppError('Bus stop and group must be provided to continue.', 400);
  }

  const result = await createManyBusStops(bus_stops, group);

  if (!result) {
    throw new AppError('Unable to add bus stop.', 400);
  }

  return res.status(201).json({
    message: 'Bus stops added successfully.',
    status: 201,
    success: true,
    bus_stop: result,
  });
});

const getBusStopsFromDatabase = catchErrors(async (req, res) => {
  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const searchQuery =
    typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

  const result = await allBusStopsFromAddressDocument(page, limit, searchQuery);
  if (!result) {
    throw new AppError('Unable to get bus stops.', 400);
  }

  return res.status(200).json({
    message: 'Bus Stops fetched successfully.',
    success: true,
    status: 200,
    bus_stop: result,
  });
});

const getBusStopsByGroupingFromDatabase = catchErrors(async (req, res) => {});

const getBusStopFromDatabaseById = catchErrors(async (req, res) => {
  const { bus_stop_id } = req.params;
  const { group } = req.body;

  if (!bus_stop_id) {
    throw new AppError('Bus stop ID is required.', 400);
  }

  const result = await fetchBusStopById(bus_stop_id, group);

  if (!result) {
    throw new AppError('Unable to get bus stop.', 400);
  }

  return res.status(200).json({
    message: 'Bus Stop fetched successfully.',
    success: true,
    status: 200,
    bus_stop: result,
  });
});

export {
  addBusStopToDatabase,
  getBusStopsFromDatabase,
  addManyBusStopsToDatabase,
  getBusStopsByGroupingFromDatabase,
  getBusStopFromDatabaseById,
};
