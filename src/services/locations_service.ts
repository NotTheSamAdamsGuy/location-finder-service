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
 * Get locations nearby the given coordinates.
 * 
 * @param {number} lat - latitude
 * @param {number} lng - longitude
 * @param {number} radius - the search readius
 * @param {string} unitOfDistance - unit of distance for the search ('m', 'km', 'ft', or 'mi')
 * @param {string} sort - sort order ('ASC' or 'DESC')
 * @returns 
 */
export const getNearbyLocations = async (
  lat: number,
  lng: number,
  radius: number,
  unitOfDistance: "m" | "km" | "ft" | "mi",
  sort: "ASC" | "DESC" = "ASC"
) => locationDao.findNearbyByGeoRadius(lat, lng, radius, unitOfDistance, sort);

/**
 * Add a new Location into the database.
 * @param {Location} location - a Location object
 * @returns a Promise, resolving to a string containing the database key of the newly-created Location.
 */
export const addLocation = async (location: Location) => locationDao.insert(location);