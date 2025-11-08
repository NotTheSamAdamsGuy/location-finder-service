import { Coordinates } from "@notthesamadamsguy/location-finder-types";

import { loadDao } from "./daoloader.ts";
import { config } from "../../config.ts";

const impl = await loadDao("geolocation", config.service.geolocationDataStore);

/**
 * Get geocode information for a location string
 * @param {string} locationText - a string representing location inputs
 * @returns a Promise, resolving in a Coordinates object or null
 */
export const geocodeLocation = async (
  locationText: string
): Promise<Coordinates> => impl.geocodeLocation(locationText);

/**
 * Get address information information for a set of coordinates
 * @param {Coordinates} coordinates - a set of coordinates for a location
 * @returns a Promise, resolving in a Coordinates object or null
 */
export const reverseGeocodeLocation = async (
  longitude: number,
  latitude: number
) => impl.reverseGeocodeLocation(longitude, latitude);
