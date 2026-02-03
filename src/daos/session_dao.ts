import { loadDao } from "./daoloader.ts";

const impl = await loadDao("session");

/**
 * Get a session value from the database
 * @param {string} refreshToken a refresh token string
 * @returns a Promise, resolving to the username string or a null if the string does not exist
 */
export const get = (refreshToken: string) => {
  return impl.get(refreshToken);
}

/**
 * Insert a session value into the database
 * @param {string} refreshToken a refresh token string
 * @param {string} username a username
 * @returns a Promise, resolving to a boolean - true if the insert was successful, false if it failed.
 */
export const insert = (refreshToken: string, username: string): Promise<boolean> => {
  return impl.insert(refreshToken, username);
}

export const remove = (refreshToken: string): Promise<number> => {
  return impl.remove(refreshToken);
}