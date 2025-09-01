import { expect, vi, describe, it } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";

import * as uc from "../../src/controllers/users_controller";
import { UserProfile } from "../../src/types";
import { Response } from "express";

vi.mock("../../src/services/users_service", () => ({
  getUserProfile: vi.fn((username) => {
    if (username === "testuser") {
      const profile: UserProfile = {
        username: "testuser",
        firstName: "Test",
        lastName: "User",
      };
      return profile;
    } else if (username === "bobbydroptables") {
      throw new Error("error");
    } else {
      return null;
    }
  }),
}));

describe("UsersController", () => {
  describe("getUserProfile", () => {
    it("should return a user's profile", async () => {
      const expected: UserProfile = {
        username: "testuser",
        firstName: "Test",
        lastName: "User",
      };

      const req = getMockReq({ params: { username: "testuser" } });
      const res = getMockRes().res;

      // @ts-ignore -- ignore the type comparison error with req and res mocks
      const actual = await uc.getUserProfile(req, res);
      expect(expected).toEqual(actual);
    });

    it("should return a null value", async () => {
      const expected = null;

      const req = getMockReq({ params: { username: "nonexistent" } });
      const res = getMockRes().res;

      // @ts-ignore -- ignore the type comparison error with req and res mocks
      const actual = await uc.getUserProfile(req, res);
      expect(actual).toEqual(expected);
    });

    it("should throw an error if an issue occurred while retrieving user data", async () => {
      const req = getMockReq({ params: { username: "bobbydroptables" } });
      const res = getMockRes().res;

      // @ts-ignore -- ignore the type comparison error with req and res mocks
      await expect(uc.getUserProfile(req, res)).rejects.toThrowError();
    });
  });
});
