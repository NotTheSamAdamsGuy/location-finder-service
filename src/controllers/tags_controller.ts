import { Request, Response } from "express";
import { logger } from "../logging/logger.ts";
import * as tagsService from "../services/tags_service.ts";

export const getAllTags = async () => {
  try {
    return await tagsService.getAllTags();
  } catch (err) {
    logger.error("Unable to get tags data", err);
    throw err;
  }
}

/**
 * Post a tag to the tags service
 * @param req a Request object
 * @param res a Response object
 * @returns a Promise, resolving to a string
 */
export const postTag = async (req: Request, res: Response): Promise<string> => {
  const tag = req.body.tag;

  try {
    return await tagsService.addTag(tag);
  } catch (err) {
    logger.error("Encountered error while posting tag data to service", err);
    throw (err);
  }
}