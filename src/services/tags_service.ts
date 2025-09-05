import * as tagsDao from "../daos/tags_dao.ts";
import { logger } from "../logging/logger.ts";

export const getAllTags = async () => {
  const tags = await tagsDao.findAll();
  return tags;
};

export const addTag = async (tag: string): Promise<string> => {
  try {
    await tagsDao.insert(tag);
    return JSON.stringify({ message: "success" });
  } catch (err) {
    logger.error(
      "Encountered error while trying to send tag data to database client",
      err
    );
    throw err;
  }
};
