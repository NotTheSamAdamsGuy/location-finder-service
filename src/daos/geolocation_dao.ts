import { loadDao } from "./daoloader.ts"
import { Coordinates } from "../types.ts";
import { config } from "../../config.ts";

const impl = await loadDao('geolocation', config.service.geolocationDataStore);

/**
 * Get geocode information for a location string
 * @param {string} locationText - a string representing location inputs
 * @returns a Promise, resolving in a Coordinates object or null
 */
export const geocodeLocation = async (locationText: string): Promise<Coordinates> => impl.geocodeLocation(locationText);