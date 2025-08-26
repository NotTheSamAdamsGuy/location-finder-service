import * as usersDao from "../daos/users_dao.ts";
import { User, UserProfile } from "../types.ts";

/**
 * Gets the user data for the user with the matching username value.
 * @param {string} username - a username string
 * @returns {User} a Promise, resolving to User object if the user exists, otherwise null
 */
export const getUserByUsername = async (
  username: string
): Promise<User | null> => {
  try {
    return usersDao.findByUsername(username);
  } catch (err: any) {
    throw new Error("Unable to fetch user data.", err);
  }
};

export const getUserProfile = async (
  username: string
): Promise<UserProfile | null> => {
  try {
    const user = await usersDao.findByUsername(username);
    if (user) {
      return {
        username: user.username as string,
        firstName: user.firstName as string,
        lastName: user.lastName as string,
      };
    }

    return null;
  } catch (err: any) {
    throw new Error("Unable to fetch profile data", err);
  }
};
