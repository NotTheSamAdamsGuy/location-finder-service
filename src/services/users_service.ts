import * as usersDao from "../daos/users_dao.ts";
import { User, UserProfile, ServiceReply } from "../types.ts";


export type UserServiceReply = ServiceReply & {
  result: User | null;
};

/**
 * Gets the user data for the user with the matching username value.
 * @param {string} username - a username string
 * @returns {User} a Promise, resolving to User object if the user exists, otherwise null
 */
export const getUser = async (username: string): Promise<UserServiceReply> => {
  try {
    const user = await usersDao.findByUsername(username);
    return {success: true, result: user};
  } catch (err: any) {
    throw new Error("Unable to fetch user data.", err);
  }
};

export type UserProfileServiceReply = ServiceReply & {
  result: UserProfile | null;
};

/**
 * Gets the user profile for the user with the matching username value.
 * @param {string} username - a username string
 * @returns {User} a Promise, resolving to UserProfile object if the user exists, otherwise null
 */
export const getUserProfile = async (
  username: string
): Promise<UserProfileServiceReply> => {
  try {
    const user = await usersDao.findByUsername(username);
    if (user) {
      const profile: UserProfile = {
        username: user.username,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
      };

      return { success: true, result: profile };
    }

    return { success: true, result: null };
  } catch (err: any) {
    throw new Error("Unable to fetch profile data", err);
  }
};
