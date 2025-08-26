import { expect, vi, describe, it } from "vitest";

import * as ls from "../../src/services/locations_service.ts";
import { Location, GeolocationSearchInputs } from "../../src/types.ts";

vi.mock("../../src/daos/location_dao", () => ({
  findAll: vi.fn().mockReturnValue([
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
      imageNames: ["123", "456", "789"],
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
      imageNames: ["234", "567", "890"],
    },
  ]),

  findById: vi.fn((locationId) => {
    let mockObject: Location;

    if (locationId === "123456") {
      mockObject = {
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
        imageNames: ["123", "456", "789"],
      };

      return mockObject;
    } else if (locationId === "3456") {
      throw new Error("error");
    }
  }),

  findNearbyByGeoRadius: vi.fn((data) => {
    if (data === 30) {
      // TODO - figure out why the full data object isn't coming through here
      // success case
      return [
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
          imageNames: ["123", "456", "789"],
        },
      ];
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
      const location = await ls.getLocation("123456");
      expect(location).toEqual({
        id: "123456",
        name: "Mock Location 1",
        streetAddress: "123 Any Street",
        city: "Anytown",
        state: "US",
        zip: "12345",
        description: "A mock location",
        coordinates: {
          latitude: 0,
          longitude: 0,
        },
        imageNames: ["123", "456", "789"],
      });
    });

    it("should throw an error", async () => {
      await expect(ls.getLocation("3456")).rejects.toThrowError(
        "Unable to fetch location data."
      );
    });
  });

  describe("getAllLocations", () => {
    it("should return an array of Location objects on success", async () => {
      const locations = await ls.getAllLocations();
      expect(locations.length).toBe(2);
      expect(locations[0]).toEqual({
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
        imageNames: ["123", "456", "789"],
      });
      expect(locations[1]).toEqual({
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
        imageNames: ["234", "567", "890"],
      });
    });
  });

  describe("getNearbyLocations", () => {
    it("should return an array of Location objects on success", async () => {
      const geolocationInputs: GeolocationSearchInputs = {
        latitude: "30",
        longitude: "-120",
        radius: "5",
        unitOfDistance: "mi",
        sort: "ASC",
      };
      const locations = await ls.getNearbyLocations(geolocationInputs);

      expect(locations.length).toBe(1);
      expect(locations[0]).toEqual({
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
        imageNames: ["123", "456", "789"],
      });
    });

    it("should throw an error", async () => {
      const geolocationInputs: GeolocationSearchInputs = {
        latitude: "40",
        longitude: "-120",
        radius: "5",
        unitOfDistance: "mi",
        sort: "ASC",
      };
      await expect(
        ls.getNearbyLocations(geolocationInputs)
      ).rejects.toThrowError("Unable to fetch nearby locations");
    });
  });

  describe("addLocation", () => {
    it("should get the location key after saving to the database", async () => {
      const location = {
        id: "123456",
        name: "Mock Location 1",
        streetAddress: "123 Any Street",
        city: "Anytown",
        state: "US",
        zip: "12345",
        description: "A mock location",
        files: [],
      };
      const locationHashKey: string = await ls.addLocation(location);
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
        description: "A mock location",
        files: [],
      };

      await expect(ls.addLocation(location)).rejects.toThrowError(
        "Unable to save location data"
      );
    });
  });
});
