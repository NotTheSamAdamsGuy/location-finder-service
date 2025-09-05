import * as keyGenerator from "./redis_key_generator.ts";
import * as redis from "./redis_client.ts";
import { logger } from "../../../logging/logger.ts";

export const findAll = async () => {
  const client = await redis.getClient();
  const tagsKey = keyGenerator.getLocationsTagsKey();
  return await client.SMEMBERS(tagsKey);
};

export const insert = async (tag: string): Promise<number> => {
  const client = await redis.getClient();
  const tagsKey = keyGenerator.getLocationsTagsKey();
  return await client.SADD(tagsKey, tag);
}
