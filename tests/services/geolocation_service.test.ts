import { expect, vi, describe, it } from "vitest";

import * as service from "../../src/services/geolocation_service.ts";
import { Coordinates } from "../../src/types.ts";

interface FeatureCollection {
  features: [
    {
      properties: {
        context: {
          address: {
            name: string;
          };
          postcode: {
            name: string;
          };
          place: {
            name: string;
          };
          region: {
            region_code: string;
          };
        };
      };
    }
  ];
}

vi.mock("../../src/daos/geolocation_dao", () => ({
  geocodeLocation: vi.fn((locationText) => {
    if (locationText === "123 Main St. Anytown, US 12345") {
      return {
        latitude: 30,
        longitude: -120,
      };
    } else {
      throw new Error("error");
    }
  }),

  reverseGeocodeLocation: vi.fn((latitude, longitude) => {
    if (longitude === -122.3453729 && latitude === 47.6276307) {
      const featureCollection: FeatureCollection = {
        features: [
          {
            properties: {
              context: {
                address: {
                  name: "565 Ward Place",
                },
                postcode: {
                  name: "98109",
                },
                place: {
                  name: "Seattle",
                },
                region: {
                  region_code: "WA",
                },
              },
            },
          },
        ],
      };
      return featureCollection;
    } else {
      throw new Error("error");
    }
  }),
}));

describe("GeolocationService - ", () => {
  describe("getCoordinates", () => {
    it("should return a set of coordinates on success", async () => {
      const coordinates: Coordinates = await service.getCoordinates({
        streetAddress: "123 Main St.",
        city: "Anytown",
        state: "US",
        zip: "12345",
      });

      expect(coordinates).toEqual({
        latitude: 30,
        longitude: -120,
      });
    });

    it("should throw an error", async () => {
      await expect(
        service.getCoordinates({
          streetAddress: "124 Main St.",
          city: "Anytown",
          state: "US",
          zip: "12345",
        })
      ).rejects.toThrowError("Unable to get coordinates for location.");
    });
  });

  describe("getAddress", () => {
    it("should return an address when given coordinates", async () => {
      const expectedAddress = {
        streetAddress: "565 Ward Place",
        city: "Seattle",
        state: "WA",
        zip: "98109",
      };
      const coordinates: Coordinates = {
        longitude: -122.3453729,
        latitude: 47.6276307,
      };
      const actualAddress = await service.getAddress(coordinates);
      expect(expectedAddress).toEqual(actualAddress);
    });

    it("should throw an error", async () => {
      await expect(
        service.getAddress({
          latitude: 0,
          longitude: 0,
        })
      ).rejects.toThrowError("Unable to get address data for coordinates.");
    });
  });
});
