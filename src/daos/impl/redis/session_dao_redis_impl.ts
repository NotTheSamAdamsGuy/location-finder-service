import { getSessionKey } from "./redis_key_generator.ts";
import * as redis from "./redis_client.ts";
import { DatabaseError } from "../../../utils/errors.ts";

const secondsInMinute = 60;
const minutesInHour = 60;
const hoursInDay = 24;
const daysString = process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME_DAYS;
const numberOfDays = daysString ? parseInt(daysString, 10) : 7;

/**
 * Get a session value from the database
 * @param {string} refreshToken a refresh token string
 * @returns a Promise, resolving to the username string or a null if the string does not exist
 */
export const get = async (refreshToken: string) => {
  const key = getSessionKey(refreshToken);
  const client = await redis.getClient();
  let userId = null;
  let success = false;
  let error;

  try {
    userId = client.get(key);
    success = true;
  } catch (err) {
    error = new DatabaseError(`Unable to retrieve session data: ${err}`);
  } finally {
    await client.close();
  }

  if (success) {
    return userId;
  } else {
    throw error;
  }
};

/**
 * Insert a session value into the database
 * @param {string} refreshToken a refresh token string
 * @param {string} username a username
 * @returns a Promise, resolving to a boolean - true if the insert was successful, false if it failed.
 */
export const insert = async (
  refreshToken: string,
  username: string
): Promise<boolean> => {
  const key = getSessionKey(refreshToken);
  const client = await redis.getClient();
  let success = false;
  let error;

  try {
    const result = client.set(key, username, {
      EX: secondsInMinute * minutesInHour * hoursInDay * numberOfDays,
    });
    success = true;
  } catch (err) {
    error = err;
  } finally {
    await client.close();
  }

  if (success) {
    return success;
  } else {
    throw error;
  }
};

/**
 * Delete the provided refresh token from the database
 * @param refreshToken the token to delete
 * @returns the number of keys deleted
 */
export const remove = async (refreshToken: string): Promise<number> => {
  const key = getSessionKey(refreshToken);
  const client = await redis.getClient();
  let numberOfKeysDeleted = 0;
  let success = false;
  let error;

  try {
    success = true;
    numberOfKeysDeleted = await client.del(key);
  } catch (err) {
    error = new DatabaseError(`Unable to delete session data: ${err}`);
  } finally {
    await client.close();
  }

  if (success) {
    return numberOfKeysDeleted;
  } else {
    throw error;
  }
};
