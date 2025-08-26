import { loadDao } from "./daoloader.ts";
import { User } from "../types.ts";

const impl = await loadDao("user");

/**
 * Get the user object for a username.
 *
 * @param {string} username - a username.
 * @returns {Promise<User>} - a Promise, resolving to a User object.
 */
export const findByUsername = async (username: string): Promise<User> =>
  impl.findByUsername(username);
