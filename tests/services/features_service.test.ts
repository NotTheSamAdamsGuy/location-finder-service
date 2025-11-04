import { expect, vi, describe, it } from "vitest";

import * as fs from "../../src/services/features_service.ts";
import { Location, NearbyLocationsParams } from "../../src/types.ts";
import { FeatureCollection } from "geojson";

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
    tags: ["tag1", "tag2"],
    displayOnSite: true,
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
    tags: [],
    displayOnSite: false,
  },
];

const mockFeatureCollection: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [0, 0],
      },
      properties: {
        id: "123456",
        name: "Mock Location 1",
        streetAddress: "123 Any Street",
        city: "Anytown",
        state: "US",
        zip: "12345",
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
      },
    },
  ],
};

vi.mock("../../src/daos/location_dao", () => ({
  findById: vi.fn((locationId) => {
    let mockObject: Location;

    if (locationId === "123456") {
      mockObject = mockLocations[0];
      return mockObject;
    } else if (locationId === "3456") {
      return null;
    } else {
      throw new Error("error");
    }
  }),
  findNearby: vi.fn((data) => {
    if (data.latitude === 30) {
      // success case
      return [mockLocations[0]];
    } else {
      // error condition
      throw new Error("error");
    }
  }),
}));

describe("FeaturesService", () => {
  describe("getFeature", () => {
    it("should return a Feature object on success", async () => {
      const data = await fs.getFeature("123456");
      const feature = data.result;
      expect(feature).toEqual(mockFeatureCollection.features[0]);
    });

    it("should return a null value when the feature does not exist", async () => {
      const data = await fs.getFeature("3456");
      const feature = data.result;
      const success = data.success;
      expect(feature).toBe(null);
      expect(success).toBe(true);
    });

    it("should throw an error", async () => {
      await expect(fs.getFeature("34536")).rejects.toThrowError(
        "Unable to fetch feature data."
      );
    });
  });

  describe("getNearbyFeatures", () => {
    it("should return a FeatureCollection object on success", async () => {
      const nearbyLocationsParams: NearbyLocationsParams = {
        latitude: 30,
        longitude: -120,
        height: 300,
        width: 300,
        unitOfDistance: "mi",
        sort: "ASC",
      };

      const data = await fs.getNearbyFeatures(nearbyLocationsParams);
      const featureCollection: FeatureCollection = data.result;
      expect(featureCollection).toEqual(mockFeatureCollection);
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
        fs.getNearbyFeatures(nearbyLocationsParams)
      ).rejects.toThrowError("Unable to fetch nearby features: Error: error");
    });
  });
});
