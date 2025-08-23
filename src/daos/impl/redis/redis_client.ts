import { createClient } from "redis";

/**
 * Get a Redis client object
 * @returns a Promise, resolving to a Redis client.
 */
export const getClient = async () => {
  const client = await createClient()
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect();

  return client;
};