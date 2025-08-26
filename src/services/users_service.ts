import * as usersDao from "../daos/users_dao.ts";

export const getUserByUsername = async (username: string) => {
  try {
    return usersDao.findByUsername(username);
  } catch (err: any) {
    throw new Error("Unable to fetch user data.", err);
  }
};