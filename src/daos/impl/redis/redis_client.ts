import { createClient } from "redis";
import { logger } from "../../../logging/logger.ts";

/**
 * Get a Redis client object
 * @returns a Promise, resolving to a Redis client.
 */
export const getClient = async () => {
  const client = await createClient()
    .on("error", (err) => logger.error(`Redis Client Error: ${err}`))
    .connect();

  return client;
};