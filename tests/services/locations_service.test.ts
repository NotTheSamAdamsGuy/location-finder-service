import { expect, vi, describe, it } from "vitest";

import * as ls from "../../src/services/locations_service.ts";
import {
  Location,
  NearbyLocationsParams,
} from "../../src/types.ts";

const mockLocations: Location[] = [
  {
    id: "123456",
    name: "Mock Location 1",
    streetAddress: "123 Any Street",
    city: "Anytown",
    state: "US",
    zip: "12345",
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
    description: "A mock location",
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
      {
        originalFilename: "test-image-3",
        filename: "789",
        description: "",
      },
    ],
    tags: ["tag1", "tag2"]
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
    description: "A second mock location",
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
      {
        originalFilename: "test-image-6",
        filename: "890",
        description: "",
      },
    ],
    tags: []
  },
];

vi.mock("../../src/daos/location_dao", () => ({
  findAll: vi.fn(() => {
    return mockLocations;
  }),

  findById: vi.fn((locationId) => {
    let mockObject: Location;

    if (locationId === "123456") {
      mockObject = mockLocations[0];

      return mockObject;
    } else if (locationId === "3456") {
      throw new Error("error");
    }
  }),

  findNearbyByGeoRadius: vi.fn((data) => {
    if (data === 30) {
      // TODO - figure out why the full data object isn't coming through here
      // success case
      return [mockLocations[0]];
    } else {
      // error condition
      throw new Error("error");
    }
  }),

  insert: vi.fn((location: Location) => {
    if (location.city === "Anytown") {
      return "hashkey";
    } else if (location.city === "Boogerville") {
      throw new Error("error");
    }
  }),
}));

describe("LocationsService", () => {
  describe("getLocation", () => {
    it("should return a Location object on success", async () => {
      const data = await ls.getLocation("123456");
      const location = data.result;
      expect(location).toEqual(mockLocations[0]);
    });

    it("should throw an error", async () => {
      await expect(ls.getLocation("3456")).rejects.toThrowError(
        "Unable to fetch location data."
      );
    });
  });

  describe("getAllLocations", () => {
    it("should return an array of Location objects on success", async () => {
      const data = await ls.getAllLocations();
      const locations = data.result as Location[];
      expect(locations!.length).toBe(2);
      expect(locations).toEqual(mockLocations);
    });
  });

  describe("getNearbyLocations", () => {
    it("should return an array of Location objects on success", async () => {
      const nearbyLocationsParams: NearbyLocationsParams = {
        latitude: 30,
        longitude: -120,
        radius: 5,
        unitOfDistance: "mi",
        sort: "ASC",
      };

      const data = await ls.getNearbyLocations(nearbyLocationsParams);
      const locations = data.result as Location[];

      expect(locations.length).toBe(1);
      expect(locations[0]).toEqual(mockLocations[0]);
    });

    it("should throw an error", async () => {
      const nearbyLocationsParams: NearbyLocationsParams = {
        latitude: 40,
        longitude: -120,
        radius: 5,
        unitOfDistance: "mi",
        sort: "ASC",
      };
      await expect(
        ls.getNearbyLocations(nearbyLocationsParams)
      ).rejects.toThrowError("Unable to fetch nearby locations");
    });
  });

  describe("addLocation", () => {
    it("should get the location key after saving to the database", async () => {
      const location: Location = {
        id: "123456",
        name: "Mock Location 1",
        streetAddress: "123 Any Street",
        city: "Anytown",
        state: "US",
        zip: "12345",
        coordinates: {
          latitude: 0,
          longitude: 0
        },
        description: "A mock location",
        images: [],
        tags: ["tag1", "tag2"]
      };

      const data = await ls.addLocation(location);
      const locationHashKey = data.result;
      
      expect(locationHashKey).toEqual("hashkey");
    });

    it("should throw an error saying it can't save location data", async () => {
      const location = {
        id: "123457",
        name: "Mock Location 2",
        streetAddress: "123 Any Street",
        city: "Boogerville",
        state: "US",
        zip: "12345",
        coordinates: {
          latitude: 0,
          longitude: 0
        },
        description: "A mock location",
        images: [],
        tags: ["tag1", "tag2"]
      };

      await expect(ls.addLocation(location)).rejects.toThrowError(
        "Unable to save location data"
      );
    });
  });
});
