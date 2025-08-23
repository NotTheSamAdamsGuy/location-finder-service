import * as geolocationDao from "../daos/geolocation_dao.ts";
import { GeoLocation } from "../types.ts";

type GeolocationInputs = {
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
}

type Coordinates = {
  lat: number;
  lng: number;
}

/**
 * Get geolocation data for a given string.
 * @param {string} locationText - a string representing a location's address or other search criteria
 * @returns a Promise, resolving to a GeoLocation object.
 */
export const getGeolocation = async (
  locationText: string
): Promise<GeoLocation> => {
  return await geolocationDao.geocodeLocation(locationText);
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
  let coordinates = {
    lat: 0,
    lng: 0,
  };

  try {
    const geolocation = await getGeolocation(
      `${streetAddress} ${city} ${state}, ${zip}`
    );
    coordinates["lat"] = geolocation.latitude;
    coordinates["lng"] = geolocation.longitude;
  } catch (err) {
    console.log(err);
    throw new Error("Unable to get coordinates for location.");
  }

  return coordinates;
};
