import { expect, vi, describe, it } from "vitest";
import {
  LocationFeature,
  LocationFeatureCollection,
} from "@notthesamadamsguy/location-finder-types";

import * as ls from "../../src/services/locations_service.ts";
import { NearbyLocationsParams } from "../../src/types.ts";

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
        address: "123 Any Street",
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
        tags: [],
        displayOnSite: true,
      },
    },
  ],
};

vi.mock("../../src/daos/location_dao", () => ({
  findAll: vi.fn(() => {
    return mockLocations;
  }),

  findById: vi.fn((locationId) => {
    let mockObject: LocationFeature;

    if (locationId === "123456") {
      mockObject = mockLocations.features[0];

      return mockObject;
    } else if (locationId === "3456") {
      throw new Error("error");
    }
  }),

  findNearby: vi.fn((data) => {
    if (data.latitude === 30) {
      // success case
      return {
        type: "FeatureCollection",
        features: [mockLocations.features[0]],
      };
    } else {
      // error condition
      throw new Error("error");
    }
  }),

  insert: vi.fn((location: LocationFeature) => {
    if (location.properties.city === "Anytown") {
      return "hashkey";
    } else if (location.properties.city === "Boogerville") {
      throw new Error("error");
    }
  }),

  update: vi.fn((location: LocationFeature) => {
    if (location.properties.city === "New Jack City") {
      return "hashkey";
    } else {
      throw new Error("error");
    }
  }),

  remove: vi.fn((locationId: string) => {
    if (locationId === "123") {
      return true;
    } else if (locationId === "456") {
      return false;
    } else {
      throw new Error("error");
    }
  }),
}));

describe("LocationsService", () => {
  describe("getLocation", () => {
    it("should return a Location object on success", async () => {
      const data = await ls.getLocation("123456");
      const actual = data.result;
      const expected: LocationFeature = mockLocations.features[0];
      expect(actual).toEqual(expected);
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
      const actual = data.result as LocationFeatureCollection;
      const expected = mockLocations;
      expect(actual).toEqual(expected);
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
      const actual = data.result as LocationFeatureCollection;
      const expected: LocationFeatureCollection = {
        type: "FeatureCollection",
        features: [mockLocations.features[0]],
      };
      expect(actual).toEqual(expected);
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
      const location: LocationFeature = {
        id: "123456",
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0],
        },
        properties: {
          name: "Mock Location 1",
          address: "123 Any Street",
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
          description: "A mock location",
          images: [],
          tags: ["tag1", "tag2"],
          displayOnSite: false,
        },
      };

      const data = await ls.addLocation(location);
      const locationHashKey = data.result;

      expect(locationHashKey).toEqual("hashkey");
    });

    it("should throw an error saying it can't save location data", async () => {
      const location: LocationFeature = {
        id: "123457",
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0],
        },
        properties: {
          name: "Mock Location 2",
          address: "123 Any Street",
          city: "Boogerville",
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
          description: "A mock location",
          images: [],
          tags: ["tag1", "tag2"],
          displayOnSite: false,
        },
      };

      await expect(ls.addLocation(location)).rejects.toThrowError(
        "Unable to save location data"
      );
    });
  });

  describe("updateLocation", () => {
    it("should get the location key after saving to the database", async () => {
      const location: LocationFeature = {
        id: "123456",
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0],
        },
        properties: {
          name: "Mock Location 1",
          address: "123 Any Street",
          city: "New Jack City",
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
          description: "A mock location",
          images: [
            {
              originalFilename: "filename.jpg",
              filename: "123456",
              description: "A description",
            },
          ],
          tags: ["tag1", "tag2"],
          displayOnSite: false,
        },
      };

      const data = await ls.updateLocation(location);
      const locationHashKey = data.result;

      expect(locationHashKey).toEqual("hashkey");
    });

    it("should throw an error saying it can't save location data", async () => {
      const location: LocationFeature = {
        id: "123457",
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0],
        },
        properties: {
          name: "Mock Location 2",
          address: "123 Any Street",
          city: "Boogerville",
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
          description: "A mock location",
          images: [],
          tags: ["tag1", "tag2"],
          displayOnSite: false,
        },
      };

      await expect(ls.updateLocation(location)).rejects.toThrowError(
        "Unable to update location data"
      );
    });
  });

  describe("removeLocation", () => {
    it("should return a success value of true after successfully deleting a location", async () => {
      const locationId = "123";
      const data = await ls.removeLocation(locationId);
      expect(data.success).toEqual(true);
    });

    it("should return a success value of false after unsuccessfully deleting a location", async () => {
      const locationId = "456";
      const data = await ls.removeLocation(locationId);
      expect(data.success).toEqual(false);
    });

    it("should throw an error when an error occured while trying to delete the location", async () => {
      const locationId = "789";
      await expect(ls.removeLocation(locationId)).rejects.toThrowError(
        "Unable to delete location data"
      );
    });
  });
});
