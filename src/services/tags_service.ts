import * as tagsDao from "../daos/tags_dao.ts";
import { logger } from "../logging/logger.ts";

export type TagsServiceReply = {
  success: boolean;
  message?: string;
  result: string | string[] | null;
};

/**
 * Get all of the tags from the database.
 * @returns a Promise resolving to a TagServiceReply object
 */
export const getAllTags = async (): Promise<TagsServiceReply> => {
  try {
    const tags = await tagsDao.findAll();
    return { success: true, result: tags };
  } catch (err) {
    logger.error(
      "Encountered error while retrieving tags from database client",
      err
    );
    throw err;
  }
};

/**
 * Get a tag from the database.
 * @returns a Promise resolving to a TagServiceReply object
 */
export const getTag = async (tagToFind: string): Promise<TagsServiceReply> => {
  try {
    const tag = await tagsDao.find(tagToFind);
    return ({ success: true, result: tag })
  } catch (err) {
    logger.error(
      "Encountered error while retrieving tag from database client",
      err
    );
    throw err;
  }
}

/**
 * Add a tag into the database
 * @param tag a string
 * @returns a Promise resolving to a TagServiceReply object
 */
export const addTag = async (tag: string): Promise<TagsServiceReply> => {
  try {
    await tagsDao.insert(tag);
    return { success: true, result: tag };
  } catch (err) {
    logger.error(
      "Encountered error while trying to send tag data to database client",
      err
    );
    throw err;
  }
};

/**
 * Update an existing tag with a new value
 * @param currentTag the value of an existing tag
 * @param newTag the new value for the tag
 * @returns a Promise resolving to a TagServiceReply object
 */
export const updateTag = async (
  currentTag: string,
  newTag: string
): Promise<TagsServiceReply> => {
  try {
    const results = (await tagsDao.update(currentTag, newTag)) as number[];
    const reply = {
      success: true,
      result: newTag,
      message: "updated",
    };

    if (results[0] === 0) {
      // tag did not exist in database, so one was added instead
      reply.message = "added";
    }

    return reply;
  } catch (err) {
    logger.error(
      "Encountered error while trying to send tag data to database client",
      err
    );
    throw err;
  }
};
