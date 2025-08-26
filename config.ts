export const config = {
  service: {
    host: process.env.LF_API_HOST,
    port: process.env.LF_API_PORT,
    logLevel: process.env.LOG_LEVEL,
    dataStore: "redis",
    geolocationDataStore: "mapbox"
  },
  dataStores: {
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
      keyPrefix: process.env.REDIS_KEY_PREFIX
    },
    mapbox: {
      geocodeUrl: process.env.MAPBOX_GEOCODE_URL,
      accessToken: process.env.MAPBOX_ACCESS_TOKEN
    }
  }
}