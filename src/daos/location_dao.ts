import { LocationFeature, LocationFeatureCollection } from "@notthesamadamsguy/location-finder-types";

import { loadDao } from "./daoloader.ts";

const impl = await loadDao("location");

/**
 * Insert a new location.
 *
 * @param {LocationFeature} location - a LocationFeature object.
 * @returns {Promise} - a Promise, resolving to the string value
 *   for the ID of the LocationFeature in the database.
 */
export const insert = async (location: LocationFeature): Promise<string> =>
  impl.insert(location);

/**
 * Update an existing location.
 *
 * @param {LocationFeature} location - a LocationFeature object.
 * @returns {Promise} - a Promise, resolving to the string value
 *   for the ID of the LocationFeature in the database.
 */
export const update = async (location: LocationFeature): Promise<string> =>
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
 * @returns {Promise<LocationFeature>} - a Promise, resolving to a LocationFeature object.
 */
export const findById = async (id: string): Promise<LocationFeature> =>
  impl.findById(id);

/**
 * Get all the location objects.
 *
 * @returns {Promise<LocationFeatureCollection>} - a Promise, resolving to a LocationFeatureCollection.
 */
export const findAll = async (): Promise<LocationFeatureCollection> => impl.findAll();

/**
 * Get all of the nearby locations.
 *
 * @param {number} latitude - the latitude of the search point
 * @param {number} longitude - the longitude of the search point
 * @param {number} radius - the radius around the search point
 * @param {number} height - the height of the bounding box
 * @param {number} width - the width of the bounding box
 * @param {string} unitOfDistance - the unit of distance ("mi" or "km")
 * @param {string} sort - the sort order ("ASC" or "DESC")
 * @returns a Promise resolving to an array of Location objects
 */
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
): Promise<LocationFeatureCollection> => impl.findNearby(params);
