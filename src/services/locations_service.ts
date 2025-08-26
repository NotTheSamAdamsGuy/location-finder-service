import { nanoid } from "nanoid";

import * as locationDao from "../daos/location_dao.ts";
import * as geolocationService from "./geolocation_service.ts";
import { Coordinates, Location } from "../types.ts";

/**
 * Get the location's data based on the provided ID value.
 * @param {string} locationId - a location's ID string
 * @returns a Promise, resolving to a Location object.
 */
export const getLocation = async (locationId: string) => {
  try {
    return locationDao.findById(locationId);
  } catch (err: any) {
    throw new Error("Unable to fetch location data.", err);
  }
};

/**
 * Get data for all locations in the database.
 * @returns a Promise, resolving to an array of Location objects.
 */
export const getAllLocations = async () => {
  try {
    return locationDao.findAll();
  } catch (err: any) {
    throw new Error("Unable to fetch locations data.", err);
  }
};

/**
 * Get locations nearby the given coordinates.
 *
 * @param {Record<string, number | "m" | "km" | "ft" | "mi" | "ASC" | "DESC">} data
 * @returns a Promise, resolving to an array of Location objects
 */
export const getNearbyLocations = async (
  data: Record<string, string | "m" | "km" | "ft" | "mi" | "ASC" | "DESC">
) => {
  const latitude = parseFloat(data.latitude as string);
  const longitude = parseFloat(data.longitude as string);
  const radius = parseFloat(data.radius as string);
  const unitOfDistance: any = data.unitOfDistance;
  const sort: any = data.sort;

  try {
    return locationDao.findNearbyByGeoRadius(
      latitude,
      longitude,
      radius,
      unitOfDistance,
      sort
    );
  } catch (err: any) {
    throw new Error("Unable to fetch nearby locations", err);
  }
};

/**
 * Add a new Location into the database.
 * @param {Record<string, string | File[]>} data - data for the location
 * @returns a Promise, resolving to a string containing the database key of the newly-created Location.
 */
export const addLocation = async (
  data: Record<string, string | Express.Multer.File[] | Express.MulterS3.File>
) => {
  const name = data.name as string;
  const streetAddress = data.streetAddress as string;
  const city = data.city as string;
  const state = data.state as string;
  const zip = data.zip as string;
  const description = data.description as string;
  const multerStorageType = process.env.MULTER_STORAGE_TYPE;
  const files = data.files as Express.Multer.File[] | Express.MulterS3.File[];

  const imageNames = files.map((file) => {
    if (multerStorageType === "s3") {
      const tempFile = file as Express.MulterS3.File;
      return tempFile.key;
    } else {
      return file.filename;
    }
  });

  let coordinates: Coordinates = {
    latitude: 0,
    longitude: 0,
  };

  try {
    coordinates = await geolocationService.getCoordinates({
      streetAddress: streetAddress,
      city: city,
      state: state,
      zip: zip,
    });
  } catch (err: any) {
    throw new Error("Unable to fetch coordinates data", err);
  }

  const location: Location = {
    id: nanoid(),
    name: name,
    streetAddress: streetAddress,
    city: city,
    state: state,
    zip: zip,
    coordinates: coordinates,
    description: description ?? "",
    imageNames: imageNames,
  };

  try {
    const locationKey = await locationDao.insert(location);
    return locationKey;
  } catch (err: any) {
    throw new Error("Unable to save location data", err);
  }
};
