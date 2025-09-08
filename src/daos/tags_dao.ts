import { loadDao } from "./daoloader.ts";

const impl = await loadDao("tags");

/**
 * Get all of the tags.
 */
export const findAll = (): Promise<string[]> => {
  return impl.findAll();
}

/**
 * Get one of the tags.
 */
export const find = (tag: string): Promise<string | null> => {
  return impl.find(tag);
};

/**
 * Insert a tag string into the database
 * @param tag a tag string
 * @returns a Promise, resolving to the number of entries added to the set
 */
export const insert = (tag: string): Promise<number> => {
  return impl.insert(tag);
}

/**
 * Edit a tag string in the database
 * @param currentTag the current value of the tag
 * @param newTag the new value of the tag
 * @returns a Promise, resolving to the number of entries added to the set
 */
export const update = (currentTag: string, newTag: string): Promise<any> => {
  return impl.update(currentTag, newTag);
}