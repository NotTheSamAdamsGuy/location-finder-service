import * as usersDao from "../daos/users_dao.ts";
import { User } from "../types.ts";

/**
 * Gets the user data for the user with the matching username value.
 * @param {string} username - a username string
 * @returns {User} a Promise, resolving to User object if the user exists, otherwise null
 */
export const getUserByUsername = async (username: string): Promise<User | null> => {
  try {
    return usersDao.findByUsername(username);
  } catch (err: any) {
    throw new Error("Unable to fetch user data.", err);
  }
};