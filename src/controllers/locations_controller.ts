import { Request } from "express";
import { nanoid } from "nanoid";
import {
  Coordinates,
  LocationFeature,
  LocationFeatureCollection,
  LocationImage
} from "@notthesamadamsguy/location-finder-types";

import * as locationsService from "../services/locations_service.ts";
import * as geolocationService from "../services/geolocation_service.ts";
import { ControllerReply } from "../types.ts";
import { MAPBOX_CONSTANTS } from "../utils/map_utils.ts";
import { US_STATES, COUNTRY_CODES } from "../lib/constants.ts";

export type LocationControllerReply = ControllerReply & {
  result?: LocationFeature | LocationFeatureCollection | string | null;
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
export const getNearbyLocations = async (req: Request) => {
  const latitude = parseFloat(req.query.latitude as string);
  const longitude = parseFloat(req.query.longitude as string);
  const unitOfDistance = req.query.unitOfDistance as string;
  const zoomlevel = parseInt(req.query.zoomlevel as string, 10);
  const mapDimensionsInPx: DimensionsType = {
    width: parseInt(req.query.mapWidthInPx as string, 10),
    height: parseInt(req.query.mapHeightInPx as string, 10),
    unitOfMeasure: "px",
  };

  const actualUnitsOfDistance = convertMapDimensionsToActualUnitsOfDistance({
    zoomlevel: zoomlevel,
    mapDimensions: mapDimensionsInPx,
    latitude: latitude,
    unitOfDistance: unitOfDistance as "km" | "mi",
  });

  // get information for nearby locations
  const data = await locationsService.getNearbyLocations({
    latitude: latitude,
    longitude: longitude,
    height: actualUnitsOfDistance.height,
    width: actualUnitsOfDistance.width,
    unitOfDistance: unitOfDistance as "km" | "mi",
    sort: "ASC",
  });

  const featuresCollection = data.result;

  return { result: featuresCollection };
};

/**
 * Add a location to the database.
 * @param {Express.Request} req
 * @returns {Promise<LocationControllerReply>}
 */
export const addLocation = async (
  req: Request
): Promise<LocationControllerReply> => {
  const location = await createLocationFeatureFromRequest(req);
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
  const location = await createLocationFeatureFromRequest(req);
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
const createLocationFeatureFromRequest = async (
  req: Request
): Promise<LocationFeature> => {
  let tags: string[] = [];

  if (req.body.tag) {
    if (Array.isArray(req.body.tag)) {
      tags = req.body.tag;
    } else {
      tags = [req.body.tag];
    }
  }

  const images: LocationImage[] = createImagesFromRequest(req);

  const coordinates: Coordinates = await getCoordinatesFromAddress(
    req.body.address,
    req.body.city,
    req.body.stateAbbreviation,
    req.body.postalCode,
    req.body.countryCode
  );

  return {
    id: req.body.id || nanoid(),
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [coordinates.longitude, coordinates.latitude],
    },
    properties: {
      name: req.body.name,
      address: req.body.address,
      city: req.body.city,
      state: {
        name:
          US_STATES.find(
            (state) => state.abbreviation === req.body.stateAbbreviation
          )?.name || "",
        abbreviation: req.body.stateAbbreviation,
      },
      postalCode: req.body.postalCode,
      country: {
        name:
          COUNTRY_CODES.find(
            (country) => country.countryCode === req.body.countryCode
          )?.name || "",
        countryCode: req.body.countryCode,
      },
      description: req.body.description || "",
      images: images,
      coordinates: coordinates,
      tags: tags,
      displayOnSite: req.body.displayOnSite === "true" ? true : false,
    },
  };
};

/**
 * Create LocationImage objects from the data in a Request.
 * @param {Express.Request} req
 * @returns {LocationImage[]} an array of Image objects
 */
const createImagesFromRequest = (req: Request): LocationImage[] => {
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

  let images: LocationImage[] = [];

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
 * @param {string} stateAbbreviation
 * @param {string} postalCode
 * @param {string} countryCode
 * @returns {Promise<Coordinates>} a Promise resolving to a Coordinates object
 */
const getCoordinatesFromAddress = async (
  streetAddress: string,
  city: string,
  stateAbbreviation: string,
  postalCode: string,
  countryCode: string
): Promise<Coordinates> => {
  try {
    const geoServiceReply = await geolocationService.getCoordinates({
      streetAddress: streetAddress,
      city: city,
      state: stateAbbreviation,
      zip: postalCode,
    });
    return geoServiceReply.result;
  } catch (err: any) {
    throw new Error("Unable to fetch coordinates data", err);
  }
};

type DimensionsType = {
  height: number;
  width: number;
  unitOfMeasure: "px" | "mi" | "km";
};

type MapDimensionsConversionProps = {
  zoomlevel: number;
  mapDimensions: DimensionsType;
  latitude: number;
  unitOfDistance: "mi" | "km";
};

/**
 * Convert a map's dimensions in pixels to the actual distances of the
 * area represented by the map.
 * @param props
 * @returns {DimensionsType} an object containing the actual distances represented by the map
 *
 * Note: we need to do this conversion because Redis calculates nearby locations based on
 * height and width distances of a bounding box, not the bounding coordinates as used by Mapbox.
 */
const convertMapDimensionsToActualUnitsOfDistance = (
  props: MapDimensionsConversionProps
) => {
  const { zoomlevel, mapDimensions, latitude, unitOfDistance } = props;
  const horizontalTileDistance =
    MAPBOX_CONSTANTS.calculateHorizontalTileDistance(
      zoomlevel,
      latitude,
      unitOfDistance
    );
  const unitOfDistancePerPixel =
    horizontalTileDistance / MAPBOX_CONSTANTS.TILE_WIDTH_IN_PX;
  const actualWidth = mapDimensions.width * unitOfDistancePerPixel;
  const actualHeight = mapDimensions.height * unitOfDistancePerPixel;

  const actualDimensions: DimensionsType = {
    height: actualHeight,
    width: actualWidth,
    unitOfMeasure: unitOfDistance,
  };

  return actualDimensions;
};
