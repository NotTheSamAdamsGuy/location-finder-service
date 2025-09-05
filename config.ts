/* v8 ignore start */
import fs from "fs";

import { logger } from "./src/logging/logger.ts";

let awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
let awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
let jwtSecretKey = process.env.JWT_SECRET_KEY;
let mapboxAccessToken = process.env.MAPBOX_ACCESS_TOKEN;
let redisPassword = process.env.REDIS_PASSWORD;

if (process.env.NODE_ENV === "production") {
  try {
    jwtSecretKey = fs
      .readFileSync(`${process.env.JWT_SECRET_KEY}`, "utf8")
      .trim();
  } catch (err) {
    logger.error("Unable to retrieve JWT secret key", err);
    throw err;
  }

  try {
    mapboxAccessToken = fs
      .readFileSync(`${process.env.MAPBOX_ACCESS_TOKEN}`, "utf8")
      .trim();
  } catch (error) {
    logger.error("Unable to retrieve access token");
    throw error;
  }

  try {
    awsAccessKeyId = fs
      .readFileSync(`${process.env.AWS_ACCESS_KEY_ID}`, "utf8")
      .trim();

    awsSecretAccessKey = fs
      .readFileSync(`${process.env.AWS_SECRET_ACCESS_KEY}`, "utf8")
      .trim();
  } catch (error) {
    logger.error("Unable to retrieve one or more AWS secret values");
    throw error;
  }

  try {
    redisPassword = fs
      .readFileSync(`${process.env.REDIS_PASSWORD}`, "utf8")
      .trim();
  } catch (err) {
    logger.error("Unable to retrieve Redis password", err);
    throw err;
  }
}

export const config = {
  service: {
    host: process.env.LF_API_HOST,
    port: process.env.LF_API_PORT,
    logLevel: process.env.LOG_LEVEL,
    dataStore: "redis",
    geolocationDataStore: "mapbox",
  },
  secrets: {
    awsAccessKeyId: awsAccessKeyId,
    awsSecretAccessKey: awsSecretAccessKey,
    jwtSecretKey: jwtSecretKey,
    mapboxAccessToken: mapboxAccessToken,
    redisPassword: redisPassword
  }
}
/* v8 ignore stop */