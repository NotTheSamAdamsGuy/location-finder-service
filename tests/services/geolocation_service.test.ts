import { expect, vi, describe, it } from "vitest";

import * as service from "../../src/services/geolocation_service.ts";
import { Coordinates } from "../../src/types.ts";

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
      await expect(service.getCoordinates({
        streetAddress: "124 Main St.",
        city: "Anytown",
        state: "US",
        zip: "12345",
      })).rejects.toThrowError("Unable to get coordinates for location.");
    });
  });
});
