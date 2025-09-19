import { expect, describe, it, vi } from "vitest";

import * as locationDao from "../../../../src/daos/location_dao";
import { Location } from "../../../../src/types";

const mockLocations: Location[] = [
  {
    id: "123456",
    name: "Mock Location 1",
    streetAddress: "123 Main Street",
    city: "Anytown",
    state: "US",
    zip: "12345",
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
  },
  {
    id: "234567",
    name: "Mock Location 2",
    streetAddress: "456 Main Street",
    city: "Anytown",
    state: "US",
    zip: "12345",
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
  },
];

const mockLocationHashes: Array<Record<string, any>> = [
  {
    id: "123456",
    name: "Mock Location 1",
    streetAddress: "123 Main Street",
    city: "Anytown",
    state: "US",
    zip: "12345",
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
  },
  {
    id: "234567",
    name: "Mock Location 2",
    streetAddress: "456 Main Street",
    city: "Anytown",
    state: "US",
    zip: "12345",
    latitude: 0,
    longitude: 0,
    description: "A nicer place.",
    "image-originalFileName-0": "test-image-4",
    "image-filename-0": "234",
    "image-description-0": "",
    "image-originalFileName-1": "test-image-5",
    "image-filename-1": "567",
    "image-description-1": "",
  },
];

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
      return Promise.resolve(mockLocations);
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
  GEORADIUS: () => {
    return Promise.resolve(mockLocations);
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
};

vi.mock("../../../../src/daos/impl/redis/redis_client", () => ({
  getClient: vi.fn(() => mockClient),
}));

describe("LocationDao - Redis", () => {
  describe("findById", () => {
    it("should return a Location when given a valid ID", async () => {
      const location = await locationDao.findById("123456");
      expect(location).toEqual(mockLocations[0]);
    });

    it("should return a null value when given an ID for a nonexistent location", async () => {
      const location = await locationDao.findById("234");
      expect(location).toEqual(null);
    });
  });

  describe("findAll", () => {
    it("should return an array of locations on success", async () => {
      const locations = await locationDao.findAll();
      expect(locations).toEqual(mockLocations);
    });
  });

  describe("findNearbyByGeoRadius", () => {
    it("should return an array of locations on success", async () => {
      const locations = await locationDao.findNearbyByGeoRadius(
        0,
        0,
        5,
        "mi",
        "ASC"
      );
      expect(locations).toEqual(mockLocations);
    });
  });

  describe("insert", () => {
    it("should return a hash key after saving a new location", async () => {
      const location: Location = {
        id: "789",
        name: "Test Location 3",
        streetAddress: "789 Main St.",
        city: "Anytown",
        state: "USA",
        zip: "12345",
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
      };
      const locationHashKey = await locationDao.insert(location);
      expect(locationHashKey).toEqual("test:locations:info:789");
    });
    it("should throw an error if the location already exists", async () => {
      const location = mockLocations[1];

      await expect(locationDao.insert(location)).rejects.toThrowError(
        "Entry already exists"
      );
    });
  });
});
