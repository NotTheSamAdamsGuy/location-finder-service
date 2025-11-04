import * as locationDao from "../daos/location_dao.ts";
import { Feature, FeatureCollection, Geometry, Point } from "geojson";
import { Location, NearbyLocationsParams, ServiceReply } from "../types.ts";
import { logger } from "../logging/logger.ts";

type FeatureServiceReplyType = ServiceReply & {
  result: GeoJSON.Feature | null;
};

type NearbyFeaturesServiceReplyType = ServiceReply & {
  result: GeoJSON.FeatureCollection;
}

const mapLocationToGeoJSONFeature = (location: Location) => {
  const geometry: Geometry = {
    type: "Point",
    coordinates: [
      location.coordinates.longitude,
      location.coordinates.latitude,
    ],
  };

  const feature: Feature<Point> = {
    type: "Feature",
    geometry: geometry,
    properties: {
      id: location.id,
      name: location.name,
      description: location.description,
      streetAddress: location.streetAddress,
      city: location.city,
      state: location.state,
      zip: location.zip,
      images: location.images,
      tags: location.tags,
    },
  };

  return feature;
};

/**
 * Get the feature's data based on the provided ID value.
 * @param {string} locationId - a location's ID string
 * @returns {Promise<FeatureServiceReplyType>} - a Promise, resolving to a FeatureServiceReplyType object.
 */
export const getFeature = async (
  featureId: string
): Promise<FeatureServiceReplyType> => {
  try {
    const location = await locationDao.findById(featureId);

    if (!location || !location.displayOnSite) {
      return { success: true, result: null };
    }

    const feature = mapLocationToGeoJSONFeature(location);
    return { success: true, result: feature };

  } catch (err: any) {
    throw new Error("Unable to fetch feature data.", err);
  }
};

/**
 * Get a FeatureCollection with features based on the given parameters
 * @param params 
 * @returns {Promise<NearbyFeaturesServiceReplyType>} a promise resolving to a NearbyFeaturesServiceReplyType object
 */
export const getNearbyFeatures = async (
  params: NearbyLocationsParams
): Promise<NearbyFeaturesServiceReplyType> => {
  const { latitude, longitude, radius, height, width, unitOfDistance, sort } =
    params;

  try {
    const locations = await locationDao.findNearby({
      latitude,
      longitude,
      radius,
      height,
      width,
      unitOfDistance,
      sort,
    });

    const features: Feature[] = [];

    locations.forEach((location) => {
      if (location.displayOnSite) {
        features.push(mapLocationToGeoJSONFeature(location))
      }
    });

    const featureCollection: FeatureCollection = {
      type: "FeatureCollection",
      features: features
    };

    return { success: true, result: featureCollection };
  } catch (err: any) {
    console.log(err);
    throw new Error(`Unable to fetch nearby features: ${err}`);
  }
};
