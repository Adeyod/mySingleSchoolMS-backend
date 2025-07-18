import mongoose from 'mongoose';
import AddressGroup from '../models/address_grouping.model';
import { AppError } from '../utils/app.error';

const createBusStop = async (
  address: string,
  group: 'close_group' | 'far_group'
) => {
  try {
    if (!['close_group', 'far_group'].includes(group)) {
      throw new AppError(
        `Invalid group type. Must be "close group" or "far group".`,
        400
      );
    }

    let addressGroup = await AddressGroup.findOne();
    if (!addressGroup) {
      addressGroup = new AddressGroup({ close_group: [], far_group: [] });
    }

    const addressExists = addressGroup[group].some(
      (entry) => entry.street === address.toLowerCase()
    );
    if (addressExists) {
      throw new AppError('Address already in group.', 400);
    }

    addressGroup[group].push({ street: address.toLowerCase() });

    await addressGroup.save();

    return addressGroup;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.error(error);
      throw new Error('Something unexpected happened.');
    }
  }
};

const createManyBusStops = async (
  addresses: string[],
  group: 'close_group' | 'far_group'
) => {
  try {
    if (!['close_group', 'far_group'].includes(group)) {
      throw new AppError(
        `Invalid group type. Must be "close group" or "far group".`,
        400
      );
    }

    let addressGroup = await AddressGroup.findOne();
    if (!addressGroup) {
      addressGroup = new AddressGroup({ close_group: [], far_group: [] });
    }

    const existingAddresses = addresses.filter((address) =>
      addressGroup[group].some(
        (entry) => entry.street === address.toLowerCase()
      )
    );

    if (existingAddresses.length > 0) {
      throw new AppError(
        `The following addresses already exist in the group: ${existingAddresses.join(
          ','
        )}`,
        400
      );
    }

    const newAddresses = addresses
      .filter((address) => !existingAddresses.includes(address.toLowerCase()))
      .map((address) => ({ street: address.toLowerCase() }));

    addressGroup[group].push(...newAddresses);

    await addressGroup.save();

    return addressGroup;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.error(error);
      throw new Error('Something unexpected happened.');
    }
  }
};

const fetchBusStopById = async (
  address_id: string,
  group: 'far_group' | 'close_group'
) => {
  try {
    const address = await AddressGroup.findOne({
      [`${group}._id`]: address_id,
    });
    if (!address) {
      throw new AppError('Could not find address in the group.', 404);
    }

    const info = address[group].find(
      (entry) => entry._id.toString() === address_id
    );

    if (!info) {
      throw new AppError('Address not found.', 404);
    }
    return info;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.error(error);
      throw new Error('Something happened');
    }
  }
};

const allBusStopsFromAddressDocument = async (
  page: number | undefined,
  limit: number | undefined,
  searchParams: string
): Promise<{
  addressArray: object[];
  totalPages: number;
  totalCount: number;
}> => {
  try {
    const addresses = await AddressGroup.findOne();
    if (!addresses) {
      throw new AppError('Could not find addresses in the group.', 404);
    }

    console.log('addresses:', addresses);

    // Combine the far_group and close_group arrays
    const combinedAddressArray = [
      ...addresses.far_group.map(
        (address) =>
          address || {
            _id: Object,
            street: '',
          }
      ), // Extract 'street'
      ...addresses.close_group.map(
        (address) =>
          address || {
            _id: Object,
            street: '',
          }
      ), // Extract 'street'
    ];

    // Apply search filter if searchParams is provided
    let filteredAddresses = combinedAddressArray;
    if (searchParams) {
      const regex = new RegExp(searchParams, 'i');
      filteredAddresses = combinedAddressArray.filter((address) =>
        address?.street ? regex.test(address.street) : false
      );
    }

    // Get the total count of filtered addresses
    const totalCount = filteredAddresses.length;

    // Apply pagination if page and limit are defined
    let paginatedAddresses = filteredAddresses;
    let totalPages = 0;

    if (page !== undefined && limit !== undefined && totalCount !== 0) {
      const offset = (page - 1) * limit;
      totalPages = Math.ceil(totalCount / limit);

      if (page > totalPages) {
        throw new AppError('Page cannot be found.', 404);
      }

      paginatedAddresses = filteredAddresses.slice(offset, offset + limit);
    }

    return {
      addressArray: paginatedAddresses,
      totalPages,
      totalCount,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.error(error);
      throw new Error('Something happened');
    }
  }
};

export {
  allBusStopsFromAddressDocument,
  createBusStop,
  createManyBusStops,
  fetchBusStopById,
};
