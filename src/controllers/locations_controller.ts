import { Request } from "express";
import { nanoid } from "nanoid";

import * as locationsService from "../services/locations_service.ts";
import * as geolocationService from "../services/geolocation_service.ts";
import { Coordinates, Image, ControllerReply, Location } from "../types.ts";

export type LocationControllerReply = ControllerReply & {
  result?: Location | Location[] | string | null;
};

/**
 * Get data for all locations.
 * @returns {Promise<LocationControllerReply>}
 */
export const getAllLocations = async (): Promise<LocationControllerReply> => {
  const data = await locationsService.getAllLocations();
  return { result: data.result } as LocationControllerReply;
};

/**
 * Get details for a given location.
 * @param {Express.Request} req
 * @returns {Promise<LocationControllerReply>}
 */
export const getLocation = async (
  req: Request
): Promise<LocationControllerReply> => {
  const locationId = req.params.locationId;
  const data = await locationsService.getLocation(locationId);
  return { result: data.result } as LocationControllerReply;
};

/**
 * Get nearby locations.
 * @param {Express.Request} req
 * @returns {Promise<LocationControllerReply>}
 */
export const getNearbyLocations = async (
  req: Request
): Promise<LocationControllerReply> => {
  const latitude = parseFloat(req.query.latitude as string);
  const longitude = parseFloat(req.query.longitude as string);
  const radius = parseFloat(req.query.radius as string);
  const unitOfDistance: any = req.query.unitOfDistance;
  const sort: any = req.query.sort;

  const data = await locationsService.getNearbyLocations({
    latitude,
    longitude,
    radius,
    unitOfDistance,
    sort,
  });

  return { result: data.result } as LocationControllerReply;
};

/**
 * Add a location to the database.
 * @param {Express.Request} req
 * @returns {Promise<LocationControllerReply>}
 */
export const addLocation = async (
  req: Request
): Promise<LocationControllerReply> => {
  const location = await createLocationFromRequest(req);
  const locationServiceReply = await locationsService.addLocation(location);

  return { result: locationServiceReply.result } as LocationControllerReply;
};

/**
 * Update a location in the database.
 * @param {Express.Request} req
 * @returns {Promise<LocationControllerReply>}
 */
export const updateLocation = async (
  req: Request
): Promise<LocationControllerReply> => {
  const location = await createLocationFromRequest(req);
  const locationServiceReply = await locationsService.updateLocation(location);

  return { result: locationServiceReply.result } as LocationControllerReply;
};

/**
 * Remove a location from the database.
 * @param {Express.Request} req
 * @returns {Promise<LocationControllerReply>}
 */
export const removeLocation = async (
  req: Request
): Promise<LocationControllerReply> => {
  const locationId = req.params.locationId;
  const locationServiceReply = await locationsService.removeLocation(
    locationId
  );
  const message = locationServiceReply.success ? "success" : "failure";

  return { message: message, result: locationServiceReply.result };
};

/**
 * Create a Location object using data contained in a Request.
 *
 * @param {Express.Request} req
 * @returns {Promise<Location>} a Promise resolving to a Location object
 */
const createLocationFromRequest = async (req: Request): Promise<Location> => {
  let tags: string[] = [];

  if (req.body.tag) {
    if (Array.isArray(req.body.tag)) {
      tags = req.body.tag;
    } else {
      tags = [req.body.tag];
    }
  }

  const images: Image[] = createImagesFromRequest(req);

  const coordinates: Coordinates = await getCoordinatesFromAddress(
    req.body.streetAddress,
    req.body.city,
    req.body.state,
    req.body.zip
  );

  return {
    id: req.body.id || nanoid(),
    name: req.body.name,
    streetAddress: req.body.streetAddress,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
    description: req.body.description || "",
    images: images,
    coordinates: coordinates,
    tags: tags,
    displayOnSite: req.body.displayOnSite,
  };
};

/**
 * Create Image objects from the data in a Request.
 * @param {Express.Request} req
 * @returns {Image[]} an array of Image objects
 */
const createImagesFromRequest = (req: Request): Image[] => {
  const files = req.files as Express.Multer.File[] | Express.MulterS3.File[];
  const multerStorageType = process.env.MULTER_STORAGE_TYPE;

  const filenames: string[] = Array.isArray(req.body.filename)
    ? req.body.filename
    : req.body.filename
    ? [req.body.filename]
    : [];

  const originalFilenames: string[] = Array.isArray(req.body.originalFilename)
    ? req.body.originalFilename
    : [req.body.originalFilename];

  const descriptions: string[] = Array.isArray(req.body.imageDescription)
    ? req.body.imageDescription
    : [req.body.imageDescription];

  // if images are currently being uploaded, we need to get the system-generated filename
  // from the files array, otherwise the wrong value will be saved for filename.
  filenames.forEach((filename, index) => {
    if (filename === originalFilenames[index]) {
      if (multerStorageType === "s3") {
        const matchingFile = files.find(
          (file) => file.originalname === filename
        ) as Express.MulterS3.File;
        filenames[index] = matchingFile.key;
      } else {
        const matchingFile = files.find(
          (file) => file.originalname === filename
        ) as Express.Multer.File;
        filenames[index] = matchingFile?.filename || "";
      }
    }
  });

  let images: Image[] = [];

  if (filenames) {
    images = filenames.map((filename, index) => {
      return {
        filename: filename,
        originalFilename: originalFilenames[index],
        description: descriptions[index],
      };
    });
  }

  return images;
};

/**
 * Get the coordinates for a given address.
 *
 * @param {string} streetAddress
 * @param {string} city
 * @param {string} state
 * @param {string} zip
 * @returns {Promise<Coordinates>} a Promise resolving to a Coordinates object
 */
const getCoordinatesFromAddress = async (
  streetAddress: string,
  city: string,
  state: string,
  zip: string
): Promise<Coordinates> => {
  try {
    const geoServiceReply = await geolocationService.getCoordinates({
      streetAddress: streetAddress,
      city: city,
      state: state,
      zip: zip,
    });
    return geoServiceReply.result;
  } catch (err: any) {
    throw new Error("Unable to fetch coordinates data", err);
  }
};
