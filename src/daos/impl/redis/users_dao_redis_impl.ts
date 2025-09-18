import * as redis from "./redis_client.ts";
import * as keyGenerator from "./redis_key_generator.ts";
import { User } from "../../../types.ts";
import { logger } from "../../../logging/logger.ts";

/**
 * Convert a Redis hash into a User object
 * @param {Record<string, any>} userHash - a Redis hash containing user info
 * @returns {User} - a User object
 * @private
 */
const remap = (userHash: Record<string, any>): User => {
  const user: User = {
    username: userHash.username,
    password: userHash.password,
    firstName: userHash.firstName,
    lastName: userHash.lastName,
    role: userHash.role,
    lastLoginTimestamp: userHash.lastLoginTimestamp,
  };

  return user;
};

/**
 * Takes a location domain object and flattens its structure out into
 * a set of key/value pairs suitable for storage in a Redis hash.
 *
 * @param {User} user - a User domain object.
 * @returns {Record<string, any>} - a flattened version of 'user', with no nested
 *  inner objects, suitable for storage in a Redis hash.
 * @private
 */
const flatten = (user: User): Record<string, any> => {
  const { username, password, firstName, lastName, role, lastLoginTimestamp } =
    user;
  const flattenedUser: Record<string, any> = {
    username: username,
    password: password,
    firstName: firstName,
    lastName: lastName,
    role: role,
    lastLoginTimestamp: lastLoginTimestamp,
  };

  return flattenedUser;
};

/**
 * Get the user object for a username.
 *
 * @param {string} username - a username.
 * @returns {Promise<User>} - a Promise, resolving to a User object.
 */
export const findByUsername = async (
  username: string
): Promise<User | null> => {
  const client = await redis.getClient();
  const userHashKey = keyGenerator.getUserHashKey(username);
  const userHash = await client.HGETALL(userHashKey);

  await client.close();

  return Object.entries(userHash).length === 0 ? null : remap(userHash);
};

/**
 * Insert a new user.
 *
 * @param {User} user - a User object.
 * @returns {Promise<string>} - a Promise, resolving to the string value
 *   for the key of the location Redis.
 */
export const insert = async (user: User): Promise<string> => {
  const client = await redis.getClient();
  const userHashKey = keyGenerator.getUserHashKey(user.username);

  await Promise.all([
    client.HSET(userHashKey, { ...flatten(user) }),
    client.SADD(keyGenerator.getUserIDsKey(), userHashKey),
  ]);

  logger.debug(`inserted new user ${userHashKey}`);

  await client.close();

  return userHashKey;
};
