import { loadDao } from "./daoloader.ts";
import { User } from "../types.ts";

const impl = await loadDao("users");

/**
 * Get the user object for a username.
 *
 * @param {string} username - a username.
 * @returns {Promise<User>} - a Promise, resolving to a User object.
 */
export const findByUsername = async (username: string): Promise<User> =>
  impl.findByUsername(username);

/**
 * Insert a user object into the database.
 * @param {User} user - a User object
 * @returns {Promise<string>} - A promise, resolving to the ID of the new entry in the database.
 */
export const insert = async (user: User): Promise<string> => impl.insert(user);