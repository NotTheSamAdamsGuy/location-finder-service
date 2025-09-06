// Prefix that all keys will start with, taken from config.
let prefix = process.env.REDIS_KEY_PREFIX;

/**
 * Takes a string containing a Redis key name and returns a
 * string containing that key with the application's configurable
 * prefix added to the front.  Prefix is configured in config.json.
 *
 * @param {string} key - a Redis key
 * @returns {string} - a Redis key with the application prefix prepended to
 *  the value of 'key'
 * @private
 */
const getKey = (key: string) => `${prefix}:${key}`;

/**
 * Takes a numeric location ID and returns the location information key
 * value for that ID.
 *
 * Key name: prefix:locations:info:[locationId]
 * Redis type stored at this key: hash
 *
 * @param {string} locationId - the ID of a location.
 * @returns - the location information key for the provided location ID.
 */
export const getLocationHashKey = (locationId: string): string => getKey(`locations:info:${locationId}`);

/**
 * Returns the Redis key used to store geo information for locations.
 *
 * Key name: prefix:locations:geo
 * Redis type stored at this key: geo
 *
 * @returns {string} - the Redis key used to store location geo information.
 */
export const getLocationGeoKey = (): string => getKey(`locations:geo`);

/**
 * Returns the Redis key name used for the set storing all location IDs.
 *
 * Key name: prefix:locations:ids
 * Redis type stored at this key: set
 *
 * @returns - the Redis key name used for the set storing all location IDs.
 */
export const getLocationIDsKey = () => getKey('locations:ids');

/**
 * Takes a string username and returns the user key
 * value for that username.
 *
 * Key name: prefix:users:info:[username]
 * Redis type stored at this key: hash
 *
 * @param {string} username - the username of a user.
 * @returns - the user information key for the provided username.
 */
export const getUserHashKey = (username: string) => getKey(`users:info:${username}`);

/**
 * Returns the Redis key used to store tag information
 *
 * Key name: prefix:tags
 * Redis type stored at this key: tags
 * @returns the Redis key name used to store tag information
 */
export const getTagsKey = () => getKey('tags');
