import { Request, Response } from "express";
import { logger } from "../logging/logger.ts";
import * as TagsService from "../services/tags_service.ts";

export type TagsControllerResult = {
  result: string | string[] | null;
  message?: string;
};

/**
 * Get all the tags in the database
 * @returns an array containing TagsServiceReply objects
 */
export const getAllTags = async (): Promise<TagsControllerResult> => {
  try {
    const data = await TagsService.getAllTags();
    return { result: data.result };
  } catch (err) {
    logger.error("Unable to get tags data", err);
    throw err;
  }
};

/**
 * Get the matching tag in the database
 * @returns a string or null
 */
export const getTag = async (
  req: Request,
  res: Response
): Promise<TagsControllerResult> => {
  try {
    const tag = req.params.tag;
    const data = await TagsService.getTag(tag);
    return { result: data.result };
  } catch (err) {
    logger.error("Unable to get tag data", err);
    throw err;
  }
};

/**
 * Add a tag to the database
 * @param req a Request object
 * @param res a Response object
 * @returns a Promise, resolving to a TagsServiceReply object
 */
export const addTag = async (
  req: Request,
  res: Response
): Promise<TagsControllerResult> => {
  const tag = req.body.tag;

  try {
    const data = await TagsService.addTag(tag);
    return { result: data.result };
  } catch (err) {
    logger.error("Encountered error while posting tag data to service", err);
    throw err;
  }
};

/**
 * Update a tag in the database
 * @param req a Request object
 * @param res a Response object
 * @returns a Promise, resolving to a TagsServiceReply object
 */
export const updateTag = async (
  req: Request,
  res: Response
): Promise<TagsControllerResult> => {
  const currentTag = req.body.currentTag;
  const newTag = req.body.newTag;

  try {
    const data = await TagsService.updateTag(currentTag, newTag);
    return { result: data.result, message: data.message || undefined };
  } catch (err) {
    logger.error("Encountered error while putting tag data to service", err);
    throw err;
  }
};
