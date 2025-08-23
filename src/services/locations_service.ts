import * as locationDao from "../daos/location_dao.ts";
import { Location } from "../types.ts";

/**
 * Get the location's data based on the provided ID value.
 * @param {string} locationId - a location's ID string
 * @returns a Promise, resolving to a Location object.
 */
export const getLocation = async (locationId: string) => locationDao.findById(locationId);

/**
 * Get data for all locations in the database.
 * @returns a Promise, resolving to an array of Location objects.
 */
export const getAllLocations = async () => locationDao.findAll();

/**
 * Add a new Location into the database.
 * @param {Location} location - a Location object
 * @returns a Promise, resolving to a string containing the database key of the newly-created Location.
 */
export const addLocation = async (location: Location) => locationDao.insert(location);