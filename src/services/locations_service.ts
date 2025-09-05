import { nanoid } from "nanoid";

import * as locationDao from "../daos/location_dao.ts";
import {
  Location,
  NearbyLocationsParams,
  AddLocationParams,
} from "../types.ts";
import { logger } from "../logging/logger.ts";

/**
 * Get the location's data based on the provided ID value.
 * @param {string} locationId - a location's ID string
 * @returns a Promise, resolving to a Location object.
 */
export const getLocation = async (locationId: string): Promise<Location> => {
  try {
    return locationDao.findById(locationId);
  } catch (err: any) {
    throw new Error("Unable to fetch location data.", err);
  }
};

/**
 * Get data for all locations in the database.
 * @returns a Promise, resolving to an array of Location objects.
 */
export const getAllLocations = async (): Promise<Location[]> => {
  try {
    return locationDao.findAll();
  } catch (err: any) {
    throw new Error("Unable to fetch locations data.", err);
  }
};

/**
 * Get locations nearby the given coordinates.
 *
 * @param {NearbyLocationsParams} - data for the location search
 * @returns a Promise, resolving to an array of Location objects
 */
export const getNearbyLocations = async (
  params: NearbyLocationsParams
): Promise<Location[]> => {
  const { latitude, longitude, radius, unitOfDistance, sort } = params;

  try {
    return locationDao.findNearbyByGeoRadius(
      latitude,
      longitude,
      radius,
      unitOfDistance,
      sort
    );
  } catch (err: any) {
    throw new Error("Unable to fetch nearby locations", err);
  }
};

/**
 * Add a new Location into the database.
 * @param {AddLocationParams} params - data for the location
 * @returns a Promise, resolving to a string containing the database key of the newly-created Location.
 */
export const addLocation = async (
  params: AddLocationParams
): Promise<string> => {
  const {
    name,
    streetAddress,
    city,
    state,
    zip,
    coordinates,
    description,
    images,
  } = params;

  const location: Location = {
    id: nanoid(),
    name: name,
    streetAddress: streetAddress,
    city: city,
    state: state,
    zip: zip,
    coordinates: coordinates,
    description: description,
    images: images,
  };

  try {
    const locationKey = await locationDao.insert(location);
    return locationKey;
  } catch (err: any) {
    logger.error(err);
    throw new Error("Unable to save location data", err);
  }
};
