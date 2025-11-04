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
 * Update an existing location.
 *
 * @param {Location} location - a Location object.
 * @returns {Promise} - a Promise, resolving to the string value
 *   for the ID of the location in the database.
 */
export const update = async (location: Location): Promise<string> =>
  impl.update(location);

/**
 * Delete a location.
 *
 * @param {string} locationKey A location hash key
 * @returns {Promise} a Promise, resolving to a boolean - true if the deletion
 *   was successful, false if it was not.
 */
export const remove = async (id: string): Promise<boolean> => impl.remove(id);

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
 * @param {number} latitude - the latitude of the search point
 * @param {number} longitude - the longitude of the search point
 * @param {number} radius - the radius around the search point
 * @param {string} unitOfDistance - the unit of distance ("mi" or "km")
 * @param {string} sort - the sort order ("ASC" or "DESC")
 * @returns a Promise resolving to an array of Location objects
 */
export const findNearbyByGeoRadius = async (
  latitude: number,
  longitude: number,
  radius: number,
  unitOfDistance: "m" | "km" | "ft" | "mi",
  sort?: "ASC" | "DESC"
): Promise<Location[]> =>
  impl.findNearbyByGeoRadius(latitude, longitude, radius, unitOfDistance, sort);

export type FindNearbyParams = {
  latitude: number;
  longitude: number;
  radius?: number;
  height?: number;
  width?: number;
  unitOfDistance: "km" | "mi" | "ft" | "m";
  sort?: "ASC" | "DESC";
};

export const findNearby = async (
  params: FindNearbyParams
): Promise<Location[]> => impl.findNearby(params);
