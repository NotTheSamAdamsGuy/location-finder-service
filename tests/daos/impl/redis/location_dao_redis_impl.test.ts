import { expect, describe, it, vi } from "vitest";
import {
  LocationFeature,
  LocationFeatureCollection,
} from "@notthesamadamsguy/location-finder-types";

import * as locationDao from "../../../../src/daos/location_dao";

const mockLocations: LocationFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      id: "123456",
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [0, 0],
      },
      properties: {
        name: "Mock Location 1",
        address: "123 Main Street",
        city: "Anytown",
        state: {
          name: "State",
          abbreviation: "ST",
        },
        postalCode: "12345",
        country: {
          name: "United States",
          countryCode: "US",
        },
        coordinates: {
          latitude: 0,
          longitude: 0,
        },
        description: "A nice place.",
        images: [
          {
            originalFilename: "test-image-1",
            filename: "123",
            description: "",
          },
          {
            originalFilename: "test-image-2",
            filename: "456",
            description: "",
          },
        ],
        tags: ["tag1", "tag2"],
        displayOnSite: true,
      },
    },
    {
      id: "234567",
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [0, 0],
      },
      properties: {
        name: "Mock Location 2",
        address: "456 Main Street",
        city: "Anytown",
        state: {
          name: "State",
          abbreviation: "ST",
        },
        postalCode: "12345",
        country: {
          name: "United States",
          countryCode: "US",
        },
        coordinates: {
          latitude: 0,
          longitude: 0,
        },
        description: "A nicer place.",
        images: [
          {
            originalFilename: "test-image-4",
            filename: "234",
            description: "",
          },
          {
            originalFilename: "test-image-5",
            filename: "567",
            description: "",
          },
        ],
        tags: [],
        displayOnSite: true,
      },
    },
  ],
};

const mockLocationHashes: Array<Record<string, any>> = [
  {
    id: "123456",
    name: "Mock Location 1",
    address: "123 Main Street",
    city: "Anytown",
    state: "State",
    stateAbbreviation: "ST",
    postalCode: "12345",
    country: "United States",
    countryCode: "US",
    latitude: 0,
    longitude: 0,
    description: "A nice place.",
    "image-originalFileName-0": "test-image-1",
    "image-filename-0": "123",
    "image-description-0": "",
    "image-originalFileName-1": "test-image-2",
    "image-filename-1": "456",
    "image-description-1": "",
    "tag-0": "tag1",
    "tag-1": "tag2",
    displayOnSite: "true",
  },
  {
    id: "234567",
    name: "Mock Location 2",
    address: "456 Main Street",
    city: "Anytown",
    state: "State",
    stateAbbreviation: "ST",
    postalCode: "12345",
    country: "United States",
    countryCode: "US",
    latitude: 0,
    longitude: 0,
    description: "A nicer place.",
    "image-originalFileName-0": "test-image-4",
    "image-filename-0": "234",
    "image-description-0": "",
    "image-originalFileName-1": "test-image-5",
    "image-filename-1": "567",
    "image-description-1": "",
    displayOnSite: "true",
  },
];

const mockLocationIds = ["123456", "234567"];

const mockClient = {
  HGET: (hashkey: string) => {
    if (hashkey === "test:locations:info:789") {
      return Promise.resolve(null);
    } else {
      return Promise.resolve("234567");
    }
  },
  HGETALL: (hashkey: string) => {
    if (hashkey === "test:locations:info:123456") {
      return Promise.resolve(mockLocationHashes[0]);
    } else {
      return Promise.resolve([]);
    }
  },
  SMEMBERS: (locationsIdKey: string) => {
    if (locationsIdKey === "test:locations:ids") {
      return Promise.resolve(mockLocationIds);
    }
  },
  multi: () => {
    return {
      HGETALL: () => {
        return true;
      },
      execAsPipeline: () => {
        return Promise.resolve(mockLocationHashes);
      },
    };
  },
  GEOSEARCH: () => {
    return Promise.resolve(mockLocationIds);
  },
  HSET: () => {
    return Promise.resolve(1);
  },
  SADD: () => {
    return Promise.resolve(1);
  },
  GEOADD: () => {
    return Promise.resolve(1);
  },
  close: () => {
    return;
  },
  DEL: (locationKey: string) => {
    if (locationKey === "test:locations:info:123") {
      return 1;
    } else {
      throw new Error("error");
    }
  },
  SREM: () => {
    return 0;
  },
  ZREM: () => {
    return 0;
  },
};

vi.mock("../../../../src/daos/impl/redis/redis_client", () => ({
  getClient: vi.fn(() => mockClient),
}));

describe("LocationDao - Redis", () => {
  describe("findById", () => {
    it("should return a Location when given a valid ID", async () => {
      const actual = await locationDao.findById("123456");
      const expected = mockLocations.features[0];
      expect(actual).toEqual(expected);
    });

    it("should return a null value when given an ID for a nonexistent location", async () => {
      const location = await locationDao.findById("234");
      expect(location).toEqual(null);
    });
  });

  describe("findAll", () => {
    it("should return an array of locations on success", async () => {
      const actual = await locationDao.findAll();
      const expected = mockLocations;
      expect(actual).toEqual(expected);
    });
  });

  describe("insert", () => {
    it("should return a hash key after saving a new location", async () => {
      const location: LocationFeature = {
        id: "789",
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0],
        },
        properties: {
          name: "Test Location 3",
          address: "789 Main St.",
          city: "Anytown",
          state: {
            name: "State",
            abbreviation: "ST",
          },
          postalCode: "12345",
          country: {
            name: "United States",
            countryCode: "US",
          },
          coordinates: {
            latitude: 0,
            longitude: 0,
          },
          description: "The nicest place.",
          images: [
            {
              originalFilename: "originalName",
              filename: "3939",
              description: "",
            },
          ],
          displayOnSite: true,
        },
      };
      const locationHashKey = await locationDao.insert(location);
      expect(locationHashKey).toEqual("test:locations:info:789");
    });
    it("should throw an error if the location already exists", async () => {
      const location = mockLocations.features[1];

      await expect(locationDao.insert(location)).rejects.toThrowError(
        "Entry already exists"
      );
    });
  });

  describe("update", () => {
    it("should return a hash key after saving a new location", async () => {
      const location: LocationFeature = {
        id: "789",
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0],
        },
        properties: {
          name: "Test Location 3",
          address: "789 Main St.",
          city: "Anytown",
          state: {
            name: "State",
            abbreviation: "ST",
          },
          postalCode: "12345",
          country: {
            name: "United States",
            countryCode: "US",
          },
          coordinates: {
            latitude: 0,
            longitude: 0,
          },
          description: "The nicest place.",
          images: [],
          displayOnSite: false,
        },
      };
      const locationHashKey = await locationDao.update(location);
      expect(locationHashKey).toEqual("test:locations:info:789");
    });
  });

  describe("remove", () => {
    it("should return true after successfully deleting a location hash", async () => {
      const locationId = "123";
      const isDeleted = await locationDao.remove(locationId);
      expect(isDeleted).toEqual(true);
    });

    it("should return false after being unable to delete a location hash", async () => {
      const locationId = "456";
      const isDeleted = await locationDao.remove(locationId);
      expect(isDeleted).toEqual(false);
    });
  });

  describe("findNearby", () => {
    it("should return an array of locations on success - radius", async () => {
      const params: locationDao.FindNearbyParams = {
        latitude: 0,
        longitude: 0,
        radius: 5,
        unitOfDistance: "km",
        sort: "ASC",
      };

      const locations = await locationDao.findNearby(params);

      expect(locations).toEqual(mockLocations);
    });

    it("should return an array of locations on success - box", async () => {
      const params: locationDao.FindNearbyParams = {
        latitude: 0,
        longitude: 0,
        height: 5,
        width: 5,
        unitOfDistance: "km",
        sort: "ASC",
      };

      const locations = await locationDao.findNearby(params);

      expect(locations).toEqual(mockLocations);
    });

    it("should throw an error", async () => {
      const params: locationDao.FindNearbyParams = {
        latitude: 0,
        longitude: 0,
        radius: 5,
        height: 5,
        width: 5,
        unitOfDistance: "km",
        sort: "ASC",
      };

      await expect(locationDao.findNearby(params)).rejects.toThrowError(
        "Please provide only radius or height and width."
      );
    });
  });
});
