import { expect, vi, describe, it } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";

import * as geolocationController from "../../src/controllers/geolocation_controller";
import { Address } from "../../src/types";

const mockAddress: Address = {
  streetAddress: "123 Main St.",
  city: "Anytown",
  state: "US",
  zip: "12345",
};

vi.mock("../../src/services/geolocation_service", () => ({
  getAddress: vi.fn((params) => {
    const { latitude } = params;

    if (latitude === 47) {
      return {success: true, result: mockAddress };
    } else {
      throw new Error("error");
    }
  }),
}));

describe("GeolocationController", () => {
  describe("getAddress", () => {
    it("should return an address", async () => {
      const req = getMockReq({
        query: {
          latitude: "47",
          longitude: "100",
        },
      });
      const res = getMockRes().res;
      const expected = { result: mockAddress };
      // @ts-ignore -- ignore the type comparison error with req and res mocks
      const actual = await geolocationController.getAddress(req, res);

      expect(expected).toEqual(actual);
    });

    // TODO test negative case
  });
});
