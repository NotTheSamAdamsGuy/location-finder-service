import { loadDao } from "./daoloader.ts";
import { Location } from "../types.ts";

const impl = await loadDao("location");

/**
 * Insert a new location.
 *
 * @param {Location} location - a Location object.
 * @returns {Promise} - a Promise, resolving to the string value
 *   for the ID of the location in the database.
 */
export const insert = async (location: Location): Promise<string> =>
  impl.insert(location);

/**
 * Get the location object for a location site ID.
 *
 * @param {string} id - a location ID.
 * @returns {Promise<Location>} - a Promise, resolving to a location object.
 */
export const findById = async (id: string): Promise<Location> =>
  impl.findById(id);

/**
 * Get all the location objects.
 *
 * @returns {Promise<Location[]>} - a Promise, resolving to an array of Location objects.
 */
export const findAll = async (): Promise<Location[]> => impl.findAll();

/**
 * Get all of the nearby locations.
 *
 * @param {number} lat - the latitude of the search point
 * @param {number} lng - the longitude of the search point
 * @param {number} radius - the radius around the search point
 * @param {string} unitOfDistance - the unit of distance ("mi" or "km")
 * @param {string} sort - the sort order ("ASC" or "DESC")
 * @returns a Promise resolving to an array of Location objects
 */
export const findNearbyByGeoRadius = async (
  lat: number,
  lng: number,
  radius: number,
  unitOfDistance: 'm' | 'km' | 'ft' | 'mi',
  sort?: 'ASC' | 'DESC'
): Promise<Location[]> => impl.findNearbyByGeoRadius(lat, lng, radius, unitOfDistance, sort);
