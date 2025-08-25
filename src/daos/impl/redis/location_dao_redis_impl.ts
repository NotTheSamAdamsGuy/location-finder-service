import * as keyGenerator from "./redis_key_generator.ts";
import * as redis from "./redis_client.ts";
import { Location } from "../../../types.ts";

/**
 * Remap a Redis hash to a Location object.
 * @param {Record<string, any>} data - a Redis hash
 * @returns {Location} - a Location object
 * @private
 */
const remap = (data: Record<string, any>): Location => {
  const imageNames: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith("image-")) {
      imageNames.push(value);
    }
  }

  return {
    id: data.id,
    name: data.name,
    streetAddress: data.streetAddress,
    city: data.city,
    state: data.state,
    zip: data.zip,
    coordinates: {
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
    },
    description: data.description,
    imageNames: imageNames
  };
};

/**
 * Takes a location domain object and flattens its structure out into
 * a set of key/value pairs suitable for storage in a Redis hash.
 *
 * @param {Location} location - a Location domain object.
 * @returns {Record<string, any>} - a flattened version of 'location', with no nested
 *  inner objects, suitable for storage in a Redis hash.
 * @private
 */
const flatten = (location: Location): Record<string, any> => {
  const flattenedLocation: Record<string, any> = {
    id: `${location.id}`,
    name: location.name,
    streetAddress: location.streetAddress,
    city: location.city,
    state: location.state,
    zip: location.zip,
    latitude: `${location.coordinates.latitude}`,
    longitude: `${location.coordinates.longitude}`,
    description: location.description,
  };

  location.imageNames.forEach((name, index) => {
    flattenedLocation[`image-${index}`] = name;
  });

  return flattenedLocation;
};

/**
 * Insert a new location.
 *
 * @param {Location} location - a Location object.
 * @returns {Promise} - a Promise, resolving to the string value
 *   for the key of the location Redis.
 */
export const insert = async (location: Location): Promise<string> => {
  const client = await redis.getClient();
  const locationHashKey = keyGenerator.getLocationHashKey(location.id);
  const locationGeoKey = keyGenerator.getLocationGeoKey();

  await Promise.all([
    client.HSET(locationHashKey, { ...flatten(location) }),
    client.SADD(keyGenerator.getLocationIDsKey(), locationHashKey),
    client.GEOADD(locationGeoKey, {
      longitude: location.coordinates.longitude,
      latitude: location.coordinates.latitude,
      member: location.id,
    }),
  ]);

  return locationHashKey;
};

/**
 * Get the location object for a given location ID.
 *
 * @param {string} id - a location ID.
 * @returns {Promise} - a Promise, resolving to a location object.
 */
export const findById = async (id: string): Promise<Location | null> => {
  const client = await redis.getClient();
  const locationKey = keyGenerator.getLocationHashKey(id);
  const locationHash = await client.HGETALL(locationKey);

  return Object.entries(locationHash).length === 0 ? null : remap(locationHash);
};

/**
 * Get all the location objects.
 *
 * @returns {Promise<Location[]>} - a Promise, resolving to an array of Location objects.
 */
export const findAll = async (): Promise<Location[]> => {
  const client = await redis.getClient();
  const locationIdsKey = keyGenerator.getLocationIDsKey();
  const locationIds = await client.SMEMBERS(locationIdsKey);

  const pipeline = client.multi();

  for (const locationId of locationIds) {
    pipeline.HGETALL(locationId);
  }

  const locationHashes = await pipeline.execAsPipeline();

  const locations: Location[] = locationHashes.map((locationHash) => {
    return remap(locationHash);
  });

  return locations;
};

export const findNearbyByGeoRadius = async (
  latitude: number,
  longitude: number,
  radius: number,
  unitOfDistance: "m" | "km" | "ft" | "mi",
  sort: "ASC" | "DESC" = "ASC"
) => {
  const client = await redis.getClient();
  const locationGeoKey = keyGenerator.getLocationGeoKey();

  const locationIds = await client.GEORADIUS(
    locationGeoKey,
    { latitude: latitude, longitude: longitude },
    radius,
    unitOfDistance,
    {
      SORT: sort
    }
  );

  const pipeline = client.multi();

  for (const locationId of locationIds) {
    const locationHashKey = keyGenerator.getLocationHashKey(locationId);
    pipeline.HGETALL(locationHashKey);
  }

  const locationHashes = await pipeline.execAsPipeline();

  const locations: Location[] = locationHashes.map((locationHash) => {
    return remap(locationHash);
  });

  return locations;
};
