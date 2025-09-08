import * as keyGenerator from "./redis_key_generator.ts";
import * as redis from "./redis_client.ts";

const tagsKey = keyGenerator.getTagsKey();

/**
 * Get all of the tags.
 */
export const findAll = async () => {
  const client = await redis.getClient();
  const result = await client.SMEMBERS(tagsKey);
  await client.close();
  return result;
};

/**
 * Get a tag from the database
 * @param tag a string
 * @returns a tag string or null if the tag does not exist
 */
export const find = async (tagToFind: string): Promise<string | null> => {
  const client = await redis.getClient();
  const tags = await client.SMEMBERS(tagsKey);
  const tagExists = tags.find((tag) => tag === tagToFind);

  return tagExists ? tagToFind : null;
};

/**
 * Insert a tag string into the database
 * @param tag a tag string
 * @returns a Promise, resolving to the number of entries added to the set
 */
export const insert = async (tag: string): Promise<number> => {
  const client = await redis.getClient();
  const result = await client.SADD(tagsKey, tag);
  await client.close();
  return result;
}

/**
 * Edit a tag string in the database
 * @param currentTag the current value of the tag
 * @param newTag the new value of the tag
 * @returns a Promise, resolving to an array containing the responses from Redis
 */
export const update = async (currentTag: string, newTag: string): Promise<any> => {
  const client = await redis.getClient();
  
  const pipeline = client.multi();

  pipeline.SREM(tagsKey, currentTag);
  pipeline.SADD(tagsKey, newTag);

  const result = await pipeline.execAsPipeline();
  await client.close();

  return result;
}
