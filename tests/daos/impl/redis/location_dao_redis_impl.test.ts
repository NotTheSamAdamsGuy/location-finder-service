import { expect, describe, it, vi } from "vitest";

import * as locationDao from "../../../../src/daos/location_dao";
import { Location } from "../../../../src/types";

const mockLocations = [
  {
    id: "123",
    name: "Test Location",
    streetAddress: "123 Main St.",
    city: "Anytown",
    state: "US",
    zip: "12345",
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
    description: "A nice place.",
    imageNames: ["1234", "5678"],
  },
  {
    id: "456",
    name: "Test Location 2",
    streetAddress: "456 Main St.",
    city: "Anytown",
    state: "US",
    zip: "12345",
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
    description: "A nicer place.",
    imageNames: ["2345", "6789"],
  },
];

const mockLocationHashes: Array<Record<string, any>> = [
  {
    id: "123",
    name: "Test Location",
    streetAddress: "123 Main St.",
    city: "Anytown",
    state: "US",
    zip: "12345",
    latitude: 0,
    longitude: 0,
    description: "A nice place.",
    "image-0": "1234",
    "image-1": "5678",
  },
  {
    id: "456",
    name: "Test Location 2",
    streetAddress: "456 Main St.",
    city: "Anytown",
    state: "US",
    zip: "12345",
    latitude: 0,
    longitude: 0,
    description: "A nicer place.",
    "image-0": "2345",
    "image-1": "6789",
  },
];

const mockClient = {
  HGETALL: (hashkey: string) => {
    if (hashkey === "test:locations:info:123") {
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
  }
};

vi.mock("../../../../src/daos/impl/redis/redis_client", () => ({
  getClient: vi.fn(() => mockClient),
}));

describe("LocationDao - Redis", () => {
  describe("findById", () => {
    it("should return a Location when given a valid ID", async () => {
      const location = await locationDao.findById("123");
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
      const locations = await locationDao.findNearbyByGeoRadius(0, 0, 5, "mi", "ASC");
      console.log(locations);
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
          longitude: 0
        },
        description: "The nicest place.",
        imageNames: [
          "3939"
        ]
      }
      const locationHashKey = await locationDao.insert(location);
      expect(locationHashKey).toEqual("test:locations:info:789");
    });
  });
});
