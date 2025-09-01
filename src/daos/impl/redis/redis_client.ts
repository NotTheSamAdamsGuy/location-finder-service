import { createClient } from "redis";
import { logger } from "../../../logging/logger.ts";

/**
 * Get a Redis client object
 * @returns a Promise, resolving to a Redis client.
 */
export const getClient = async () => {
  const client = await createClient({
    socket: {
      port: parseInt(process.env.REDIS_PORT as string, 10),
      host: process.env.REDIS_HOST,
    },
    password: process.env.REDIS_PASSWORD
  })
    .on("error", (err) => logger.error(`Redis Client Error: ${err}`))
    .connect();

  return client;
};