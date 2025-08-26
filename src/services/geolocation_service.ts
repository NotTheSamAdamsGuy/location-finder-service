import * as geolocationDao from "../daos/geolocation_dao.ts";
import { Coordinates } from "../types.ts";

type GeolocationInputs = {
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
}

/**
 * Get geolocation data for a given string.
 * @param {string} locationText - a string representing a location's address or other search criteria
 * @returns a Promise, resolving to a Coordinates object.
 */
export const getGeolocation = async (
  locationText: string
): Promise<Coordinates> => {
  try {
    return await geolocationDao.geocodeLocation(locationText);
  } catch (err) {
    // console.log(err); // TODO: replace with logger
    throw new Error("Unable to get geocode data for location.");
  }
};

/**
 * Get latitude/longitude coordinates for a given address.
 * @param {GeolocationInputs} props - an object containing inputs used to search for a geolocation
 * @returns a Promise, resolving to a Coordinates object.
 */
export const getCoordinates = async ({
  streetAddress,
  city,
  state,
  zip,
}: GeolocationInputs): Promise<Coordinates> => {
  let coordinates: Coordinates = {
    latitude: 0,
    longitude: 0,
  };

  try {
    const geolocation = await getGeolocation(
      `${streetAddress} ${city}, ${state} ${zip}`
    );
    coordinates.latitude = geolocation.latitude;
    coordinates.longitude = geolocation.longitude;
  } catch (err) {
    // console.log(err); // TODO: replace with logger
    throw new Error("Unable to get coordinates for location.");
  }

  return coordinates;
};
