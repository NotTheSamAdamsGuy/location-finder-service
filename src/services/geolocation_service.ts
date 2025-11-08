import { Coordinates } from "@notthesamadamsguy/location-finder-types";

import * as geolocationDao from "../daos/geolocation_dao.ts";
import { Address, ServiceReply } from "../types.ts";
import { logger } from "../logging/logger.ts";

type GeolocationInputs = {
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
};

type GeolocationServiceReply = ServiceReply & {
  result: Coordinates;
};

/**
 * Get geolocation data for a given string.
 * @param {string} locationText - a string representing a location's address or other search criteria
 * @returns {Promise<GeolocationServiceReply>} a Promise, resolving to a GeolocationServiceReply object.
 */
export const getGeolocation = async (
  locationText: string
): Promise<GeolocationServiceReply> => {
  try {
    const coords = await geolocationDao.geocodeLocation(locationText);
    return { success: true, result: coords };
  } catch (err) {
    logger.error("Unable to get geocode data for location", err);
    throw new Error("Unable to get geocode data for location.");
  }
};

/**
 * Get latitude/longitude coordinates for a given address.
 * @param {GeolocationInputs} props - an object containing inputs used to search for a geolocation
 * @returns {Promise<GeolocationServiceReply>} a Promise, resolving to a GeolocationServiceReply object.
 */
export const getCoordinates = async ({
  streetAddress,
  city,
  state,
  zip,
}: GeolocationInputs): Promise<GeolocationServiceReply> => {
  let coordinates: Coordinates = {
    latitude: -1,
    longitude: -1,
  };

  try {
    const geoReply = await getGeolocation(
      `${streetAddress} ${city}, ${state} ${zip}`
    );
    const geolocation = geoReply.result;

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

  return {success: true, result: coordinates};
};

/**
 * Get an address for a given latitude/longitude coordinates.
 * @param {Coordinates} props - an object containing latitude and longitude values
 * @returns a Promise, resolving to an Address object.
 */
export type GeolocationServiceAddressReply = ServiceReply & {
  result: Address;
}

export const getAddress = async (
  coordinates: Coordinates
): Promise<GeolocationServiceAddressReply> => {
  const { latitude, longitude } = coordinates;
  let address: Address = {
    streetAddress: "",
    city: "",
    state: "",
    zip: "",
  };

  try {
    const daoReply = await geolocationDao.reverseGeocodeLocation(
      latitude,
      longitude
    );
    const context = daoReply.features[0].properties.context;

    address.streetAddress = context.address.name;
    address.city = context.place.name;
    address.state = context.region.region_code;
    address.zip = context.postcode.name;

    return { success: true, result: address };
  } catch (err) {
    logger.error("Unable to get address data for coordinates", err);
    throw new Error("Unable to get address data for coordinates.");
  }
};
