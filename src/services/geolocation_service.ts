import * as geolocationDao from "../daos/geolocation_dao.ts";
import { Address, Coordinates } from "../types.ts";
import { logger } from "../logging/logger.ts";

type GeolocationInputs = {
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
};

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
    logger.error("Unable to get geocode data for location", err);
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
    latitude: -1,
    longitude: -1,
  };

  try {
    const geolocation = await getGeolocation(
      `${streetAddress} ${city}, ${state} ${zip}`
    );

    if (geolocation) {
      coordinates.latitude = geolocation.latitude;
      coordinates.longitude = geolocation.longitude;
    }

    if (coordinates.latitude === -1 || coordinates.longitude === -1) {
      // no data was retrieved from service so we cannot proceed
      throw new Error("No coordinates were found for the given location");
    }
  } catch (err) {
    logger.error("Unable to get coordinates for location", err);
    throw new Error("Unable to get coordinates for location.");
  }

  return coordinates;
};

/**
 * Get an address for a given latitude/longitude coordinates.
 * @param {Coordinates} props - an object containing latitude and longitude values
 * @returns a Promise, resolving to an Address object.
 */
export const getAddress = async (
  coordinates: Coordinates
): Promise<Address> => {
  const { latitude, longitude } = coordinates;
  let address: Address = {
    streetAddress: "",
    city: "",
    state: "",
    zip: "",
  };

  try {
    const data = await geolocationDao.reverseGeocodeLocation(
      latitude,
      longitude
    );
    const context = data.features[0].properties.context;

    address.streetAddress = context.address.name;
    address.city = context.place.name;
    address.state = context.region.region_code;
    address.zip = context.postcode.name;

    return address;
  } catch (err) {
    logger.error("Unable to get address data for coordinates", err);
    throw new Error("Unable to get address data for coordinates.");
  }
};
