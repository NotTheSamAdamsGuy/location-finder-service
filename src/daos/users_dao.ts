import { loadDao } from "./daoloader.ts";
import { User } from "../types.ts";

const impl = await loadDao("users");

/**
 * Get all of the usernames.
 */
export const findAllUsernames = (): Promise<string[]> => {
  return impl.findAllUsernames();
}

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
 * @returns {Promise<string>} - A promise, resolving to the hashkey of the new entry in the database.
 */
export const insert = async (user: User): Promise<string> => impl.insert(user);

/**
 * Update a user object in the database.
 * @param {User} user the User to update
 * @returns {Promise<boolean>} A promise, resolving to a boolean (true if operation was successful)
 */
export const update = async (user: User): Promise<boolean> => impl.update(user);

/**
 * Remove a user object from the database.
 * @param {string} username the username of the User to remove
 * @returns {Promise<boolean>} A promise, resolving to a boolean (true if operation was successful)
 */
export const remove = async (username: string): Promise<boolean> => impl.remove(username);