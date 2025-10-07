import * as keyGenerator from "./redis_key_generator.ts";
import * as redis from "./redis_client.ts";
import { Image, Location } from "../../../types.ts";
import { logger } from "../../../logging/logger.ts";
import { DatabaseError } from "../../../utils/errors.ts";

const locationIdsKey = keyGenerator.getLocationIDsKey();
const locationGeoKey = keyGenerator.getLocationGeoKey();

/**
 * Converts the image properties from a hash into an array of Image objects.
 * @param {Record<string, string>} data - image properties from a redis hash
 * @returns - an array of Image objects
 */
const convertImagePropertiesToImageArray = (
  data: Record<string, string>
): Image[] => {
  interface DynamicData {
    [key: string]: string;
  }

  const images: Image[] = [];

  const groupedById = Object.entries(data as Record<string, string>)
    .filter((entry) => {
      return entry[0].startsWith("image");
    })
    .map((entry) => {
      let item: DynamicData = {};
      const splitKey = entry[0].split("-");
      item["id"] = splitKey[2];
      item["key"] = splitKey[1];
      item["value"] = entry[1];

      return item;
    })
    .reduce<Record<string, DynamicData[]>>((accumulator, currentItem) => {
      const key = currentItem.id; // The key to group by
      if (!accumulator[key]) {
        accumulator[key] = []; // Initialize an empty array for the key if it doesn't exist
      }
      accumulator[key].push(currentItem); // Add the current item to the array for that key
      return accumulator;
    }, {});

  Object.values(groupedById).map((value) => {
    const image: Image = {
      originalFilename: value[0].value,
      filename: value[1].value,
      description: value[2].value,
    };

    images.push(image);
  });

  return images;
};

const convertTagMembersToArray = (data: Record<string, string>): string[] => {
  return Object.entries(data)
    .filter((entry) => entry[0].startsWith("tag-"))
    .map((entry) => entry[1]);
};

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

  const images = convertImagePropertiesToImageArray(data);
  const tags = convertTagMembersToArray(data);

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
    images: images,
    tags: tags,
    displayOnSite: data.displayOnSite === "true" ? true : false,
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
    displayOnSite: `${location.displayOnSite}`,
  };

  location.images?.forEach((image, index) => {
    flattenedLocation[`image-originalFilename-${index}`] =
      image.originalFilename;
    flattenedLocation[`image-filename-${index}`] = image.filename;
    flattenedLocation[`image-description-${index}`] = image.description || "";
  });

  location.tags?.forEach((tag, index) => {
    flattenedLocation[`tag-${index}`] = tag;
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

  // check if user already exists; if yes, throw an error
  const locationId = await client.HGET(locationHashKey, "id");
  if (locationId) {
    await client.close();
    throw new DatabaseError("Entry already exists");
  }

  await Promise.all([
    client.HSET(locationHashKey, { ...flatten(location) }),
    client.SADD(keyGenerator.getLocationIDsKey(), locationHashKey),
    client.GEOADD(locationGeoKey, {
      longitude: location.coordinates.longitude,
      latitude: location.coordinates.latitude,
      member: location.id,
    }),
  ]);

  logger.debug(`inserted new location ${locationHashKey}`);

  await client.close();

  return locationHashKey;
};

/**
 * Update an existing location.
 *
 * @param {Location} location - a Location object.
 * @returns {Promise} - a Promise, resolving to the string value
 *   for the ID of the location in the database.
 */
export const update = async (location: Location): Promise<string> => {
  const client = await redis.getClient();
  const locationHashKey = keyGenerator.getLocationHashKey(location.id);
  const locationGeoKey = keyGenerator.getLocationGeoKey();

  // determine which fields are not in the updated data so we can remove them using HDEL
  const existingHashFields = Array.from(Object.keys(await client.HGETALL(locationHashKey)));
  const newHashFields = Array.from(Object.keys(flatten(location)));
  const fieldsToRemove = existingHashFields.filter((field) => newHashFields.indexOf(field) === -1);

  if (fieldsToRemove.length > 0) {
    await client.HDEL(locationHashKey, fieldsToRemove);
  }

  await Promise.all([
    client.HSET(locationHashKey, { ...flatten(location) }),
    client.GEOADD(locationGeoKey, {
      longitude: location.coordinates.longitude,
      latitude: location.coordinates.latitude,
      member: location.id,
    }),
  ]);

  logger.debug(`updated location ${locationHashKey}`);

  await client.close();

  return locationHashKey;
};

/**
 * Delete a location.
 *
 * @param {string} locationId A location ID
 * @returns {Promise} a Promise, resolving to a boolean - true if the deletion
 *   was successful, false if it was not.
 */
export const remove = async (locationId: string): Promise<boolean> => {
  const client = await redis.getClient();
  const locationHashKey = keyGenerator.getLocationHashKey(locationId);
  let isDeleted = false;

  try {
    const results = await Promise.all([
      client.DEL(locationHashKey),
      client.ZREM(locationGeoKey, locationId),
      client.SREM(locationIdsKey, locationHashKey)
    ]);

    const numDeleted = results[0];

    if (numDeleted > 0) {
      isDeleted = true;
      logger.debug(`deleted hash with key ${locationHashKey}`);
    } else {
      logger.debug(`hash with key ${locationHashKey} not found`);
    }
  } catch (err) {
    logger.error(err);
  } finally {
    await client.close();
  }

  return isDeleted;
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

  await client.close();

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

  await client.close();

  return locations;
};

export const findNearbyByGeoRadius = async (
  latitude: number,
  longitude: number,
  radius: number,
  unitOfDistance: "m" | "km" | "ft" | "mi",
  sort: "ASC" | "DESC" = "ASC"
): Promise<Location[]> => {
  const client = await redis.getClient();
  const locationGeoKey = keyGenerator.getLocationGeoKey();

  const locationIds = await client.GEORADIUS(
    locationGeoKey,
    { latitude: latitude, longitude: longitude },
    radius,
    unitOfDistance,
    {
      SORT: sort,
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

  await client.close();

  return locations;
};
