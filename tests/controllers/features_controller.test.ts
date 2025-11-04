import { expect, vi, describe, it } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";

import * as featuresController from "../../src/controllers/features_controller";
import { FeatureCollection } from "geojson";

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

const mockEmptyFeatureCollection: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

vi.mock("../../src/services/features_service", () => ({
  getFeature: vi.fn((locationId) => {
    if (locationId === "123456") {
      return { success: true, result: mockFeatureCollection.features[0] };
    } else if (locationId === "345678") {
      return { success: true, result: null };
    } else {
      throw new Error("error");
    }
  }),
  getNearbyFeatures: vi.fn((params) => {
    if (params.latitude === 47) {
      return { result: mockFeatureCollection };
    } else if (params.latitude === 48) {
      return { result: mockEmptyFeatureCollection };
    } else {
      throw new Error("error");
    }
  }),
}));

describe("FeaturesController", () => {
  describe("getFeature", () => {
    it("should return a single feature", async () => {
      const req = getMockReq({ params: { featureId: "123456" } });
      const res = getMockRes().res;

      const expected = {
        result: mockFeatureCollection.features[0],
      } as featuresController.FeatureReply;
      // @ts-ignore -- ignore the type comparison error with req and res mocks
      const actual = await featuresController.getFeature(req, res);

      expect(expected).toEqual(actual);
    });

    it("should return a null value when the feature cannot be found", async () => {
      const req = getMockReq({ params: { featureId: "345678" } });
      const res = getMockRes().res;

      const expected = {
        result: null,
      } as featuresController.FeatureReply;
      // @ts-ignore -- ignore the type comparison error with req and res mocks
      const actual = await featuresController.getFeature(req, res);

      expect(expected).toEqual(actual);
    });

    it("should throw an error if an exception occurred", async () => {
      const req = getMockReq({ params: { featureId: "435233" } });
      const res = getMockRes().res;

      await expect(
        // @ts-ignore -- ignore the type comparison error with req and res mocks
        featuresController.getFeature(req, res)
      ).rejects.toThrowError("error");
    });
  });

  describe("getNearbyFeatures", () => {
    it("should return a FeatureCollection containing at least one Feature", async () => {
      const expected = {
        result: mockFeatureCollection,
      } as featuresController.FeatureColletionReply;
      const req = getMockReq({
        query: {
          latitude: "47",
          longitude: "100",
          mapHeightInPx: "300",
          mapWidthInPx: "300",
          unitOfDistance: "mi",
          sort: "ASC",
        },
      });
      const res = getMockRes().res;

      // @ts-ignore -- ignore the type comparison error with req and res mocks
      const actual = await featuresController.getNearbyFeatures(req, res);

      expect(expected).toEqual(actual);
    });

    it("should return an empty FeatureCollection", async () => {
      const expected = {
        result: mockEmptyFeatureCollection,
      } as featuresController.FeatureColletionReply;
      const req = getMockReq({
        query: {
          latitude: "48",
          longitude: "100",
          mapHeightInPx: "300",
          mapWidthInPx: "300",
          unitOfDistance: "mi",
          sort: "ASC",
        },
      });
      const res = getMockRes().res;

      // @ts-ignore -- ignore the type comparison error with req and res mocks
      const actual = await featuresController.getNearbyFeatures(req, res);

      expect(expected).toEqual(actual);
    });

    it("should throw an error if an exception occurred", async () => {
      const req = getMockReq({ query: { latitude: "90" } });
      const res = getMockRes().res;

      await expect(
        // @ts-ignore -- ignore the type comparison error with req and res mocks
        featuresController.getNearbyFeatures(req, res)
      ).rejects.toThrowError("error");
    });
  });
});
