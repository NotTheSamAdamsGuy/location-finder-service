// interface Service {
//   host: string | undefined;
//   port: string | undefined;
//   logLevel: string | undefined;
//   dataStore: string;
// }

// interface DataStore {
//   host: string | undefined;
//   port: string | undefined;
//   password: string | undefined;
//   keyPrefix?: string | undefined;
// }

// interface DataStores {
//   redis: DataStore;
// }

// interface Config {
//   service: Service,
//   dataStores: DataStores
// }

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
  },
  multer: {
    storageType: process.env.MULTER_STORAGE_TYPE,
    diskStorage: {
      path: process.env.MULTER_STORAGE_PATH
    },
    s3Storage: {
      bucket: process.env.MULTER_STORAGE_S3_BUCKET,
    }
  }
}