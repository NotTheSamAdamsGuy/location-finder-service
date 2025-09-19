import { expect, vi, describe, it } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";

import * as locationsController from "../../src/controllers/locations_controller";
import { Location } from "../../src/types";

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
    displayOnSite: false
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
    displayOnSite: false
  },
];

vi.mock("../../src/services/locations_service", () => ({
  getAllLocations: vi.fn(() => {
    return { success: true, result: mockLocations };
  }),
  getLocation: vi.fn((locationId) => {
    if (locationId === "123456") {
      return { success: true, result: mockLocations[0] };
    } else if (locationId === "345678") {
      return { success: true, result: null };
    } else {
      throw new Error("error");
    }
  }),
  getNearbyLocations: vi.fn((params) => {
    if (params.latitude === 47) {
      return { result: mockLocations[0] };
    } else if (params.latitude === 48) {
      return { result: [] };
    } else {
      throw new Error("error");
    }
  }),
  addLocation: vi.fn((params) => {
    if (params.name === "New Mock Location") {
      return { result: "locationId" };
    } else {
      throw new Error("error");
    }
  }),
}));

vi.mock("../../src/services/geolocation_service", () => ({
  getCoordinates: vi.fn(({streetAddress}) => {
    if (streetAddress === "234 Main Street") {
      return { result: { latitude: 0, longitude: 0 } };
    } else if (streetAddress === "345 Main Street") {
      throw new Error("geocode error");
    }
  }),
}));

describe("LocationsController", () => {
  describe("getAllLocations", () => {
    it("should return an array of locations", async () => {
      const expected = {
        result: mockLocations,
      } as locationsController.LocationControllerReply;
      const actual = await locationsController.getAllLocations();

      expect(expected).toEqual(actual);
    });
  });

  describe("getLocation", () => {
    it("should return a single location", async () => {
      const req = getMockReq({ params: { locationId: "123456" } });
      const res = getMockRes().res;

      const expected = {
        result: mockLocations[0],
      } as locationsController.LocationControllerReply;
      // @ts-ignore -- ignore the type comparison error with req and res mocks
      const actual = await locationsController.getLocation(req, res);

      expect(expected).toEqual(actual);
    });

    it("should return a null value when the location does not exist", async () => {
      const req = getMockReq({ params: { locationId: "345678" } });
      const res = getMockRes().res;

      const expected = {
        result: null,
      } as locationsController.LocationControllerReply;
      // @ts-ignore -- ignore the type comparison error with req and res mocks
      const actual = await locationsController.getLocation(req, res);

      expect(expected).toEqual(actual);
    });

    it("should throw an error if an exception occurred", async () => {
      const req = getMockReq({ params: { locationId: "435233" } });
      const res = getMockRes().res;

      await expect(
        // @ts-ignore -- ignore the type comparison error with req and res mocks
        locationsController.getLocation(req, res)
      ).rejects.toThrowError("error");
    });
  });

  describe("getNearbyLocations", () => {
    it("should return an array of nearby locations", async () => {
      const expected = {
        result: mockLocations[0],
      } as locationsController.LocationControllerReply;
      const req = getMockReq({
        query: {
          latitude: "47",
          longitude: "100",
          radius: "5",
          unitOfDistance: "mi",
          sort: "ASC",
        },
      });
      const res = getMockRes().res;

      // @ts-ignore -- ignore the type comparison error with req and res mocks
      const actual = await locationsController.getNearbyLocations(req, res);

      expect(expected).toEqual(actual);
    });

    it("should return an empty array", async () => {
      const expected = {
        result: [],
      } as locationsController.LocationControllerReply;
      const req = getMockReq({
        query: {
          latitude: "48",
          longitude: "100",
          radius: "5",
          unitOfDistance: "mi",
          sort: "ASC",
        },
      });
      const res = getMockRes().res;

      // @ts-ignore -- ignore the type comparison error with req and res mocks
      const actual = await locationsController.getNearbyLocations(req, res);

      expect(expected).toEqual(actual);
    });

    it("should throw an error if an exception occurred", async () => {
      const req = getMockReq({ query: { latitude: "90" } });
      const res = getMockRes().res;

      await expect(
        // @ts-ignore -- ignore the type comparison error with req and res mocks
        locationsController.getLocation(req, res)
      ).rejects.toThrowError("error");
    });
  });

  // TODO: postLocation
  describe("addLocation", () => {
    const locationParams = {
      name: "New Mock Location",
      streetAddress: "234 Main Street",
      city: "Anytown",
      state: "US",
      zip: "12345",
      description: "A mock location",
      imageDescription: "Ann image of the location",
      tag: "tag1",
      displayOnSite: false
    };

    it("should receive a locationId value after a location has been created successfully", async () => {
      const req = getMockReq({ body: locationParams });
      const res = getMockRes().res;

      // @ts-ignore -- ignore the type comparison error with req and res mocks
      const actual = await locationsController.addLocation(req, res);
      const expected = {
        result: "locationId",
      } as locationsController.LocationControllerReply;

      expect(actual).toEqual(expected);
    });

    it("should throw an error if there was a failure", async () => {
      const newLocationParams = { ...locationParams };
      newLocationParams.name = "Another Mock Location";
      const req = getMockReq({ body: newLocationParams });
      const res = getMockRes().res;

      await expect(
        // @ts-ignore -- ignore the type comparison error with req and res mocks
        locationsController.addLocation(req, res)
      ).rejects.toThrowError("error");
    });
  });
});
