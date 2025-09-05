import { loadDao } from "./daoloader.ts";

const impl = await loadDao("tags");

/**
 * Get all of the tags.
 */
export const findAll = (): Promise<string[]> => {
  return impl.findAll();
}

/**
 * Insert a tag string into the database
 * @param tag a tag string
 * @returns a Promise, resolving to the tag's ID string
 */
export const insert = (tag: string): Promise<number> => {
  return impl.insert(tag);
}