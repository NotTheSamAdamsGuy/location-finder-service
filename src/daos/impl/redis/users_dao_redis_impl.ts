import * as redis from "./redis_client.ts";
import * as keyGenerator from "./redis_key_generator.ts";
import { User } from "../../../types.ts";

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
    lastLoginTimestamp: userHash.lastLoginTimestamp
  };

  return user;
};

/**
 * Get the user object for a username.
 *
 * @param {string} username - a username.
 * @returns {Promise<User>} - a Promise, resolving to a User object.
 */
export const findByUsername = async (username: string): Promise<User | null> => {
  const client = await redis.getClient();
  const userHashKey = keyGenerator.getUserHashKey(username);
  const userHash = await client.HGETALL(userHashKey);

  await client.close();

  return Object.entries(userHash).length === 0 ? null : remap(userHash);
};