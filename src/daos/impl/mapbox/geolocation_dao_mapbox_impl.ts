import { Coordinates } from "../../../types.ts";
import { config } from "../../../../config.ts";
import { logger } from "../../../logging/logger.ts";

/**
 * Get geocode information for a location string
 * @param {string} locationText - a string representing location inputs
 * @returns a Promise, resolving in a Coordinates object or null
 */
export const geocodeLocation = async (locationText: string): Promise<Coordinates | null> => {
  const mapboxConfig = config.dataStores.mapbox;
  const url = `${mapboxConfig.geocodeUrl}/forward?q=${encodeURIComponent(locationText)}&types=address&access_token=${mapboxConfig.accessToken}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.features?.length > 0) {
      return data.features[0].properties.coordinates;
    } 
  } catch (err) {
    logger.error(err);
  }

  return null;
};

export const reverseGeocodeLocation = async (latitude: number, longitude: number) => {
  const mapboxConfig = config.dataStores.mapbox;
  const url = `${mapboxConfig.geocodeUrl}/reverse?latitude=${latitude}&longitude=${longitude}&types=address&access_token=${mapboxConfig.accessToken}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.features?.length > 0) {
      return data;
    } 
  } catch (err) {
    logger.error(err);
  }

  return null;
}