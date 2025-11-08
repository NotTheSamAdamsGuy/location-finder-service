import { Coordinates } from "@notthesamadamsguy/location-finder-types";

import { logger } from "../../../logging/logger.ts";
import { config } from "../../../../config.ts";

const mapboxGeocodeUrl = process.env.MAPBOX_GEOCODE_URL;

/**
 * Get geocode information for a location string
 * @param {string} locationText - a string representing location inputs
 * @returns a Promise, resolving in a Coordinates object or null
 */
export const geocodeLocation = async (
  locationText: string
): Promise<Coordinates | null> => {
  const url = `${mapboxGeocodeUrl}/forward?q=${encodeURIComponent(
    locationText
  )}&types=address&access_token=${config.secrets.mapboxAccessToken}`;

  logger.debug(`Calling Mapbox at ${url}`);

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

export const reverseGeocodeLocation = async (
  latitude: number,
  longitude: number
) => {
  const url = `${mapboxGeocodeUrl}/reverse?latitude=${latitude}&longitude=${longitude}&types=address&access_token=${config.secrets.mapboxAccessToken}`;
  logger.debug(`Calling Mapbox at ${url}`);
  
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
};
