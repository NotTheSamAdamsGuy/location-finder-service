import { expect, vi, describe, it } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";

import * as uc from "../../src/controllers/users_controller";
import { UserProfile } from "../../src/types";

vi.mock("../../src/services/users_service", () => ({
  getUserProfile: vi.fn((username) => {
    if (username === "testuser") {
      const profile: UserProfile = {
        username: "testuser",
        firstName: "Test",
        lastName: "User",
      };
      return { success: true, result: profile };
    } else if (username === "bobbydroptables") {
      throw new Error("error");
    } else {
      return { success: true, result: null };
    }
  }),
  createUser: vi.fn((username, password, firstName, lastName, role) => {
    if (username === "testuser") {
      return { success: true, result: "test:users:info:testuser" };
    }
  }),
}));

describe("UsersController", () => {
  describe("getUserProfile", () => {
    it("should return a user's profile", async () => {
      const profile: UserProfile = {
        username: "testuser",
        firstName: "Test",
        lastName: "User",
      };
      const expected = { result: profile };

      const req = getMockReq({ params: { username: "testuser" } });
      const res = getMockRes().res;

      // @ts-ignore -- ignore the type comparison error with req and res mocks
      const actual = await uc.getUserProfile(req, res);
      expect(expected).toEqual(actual);
    });

    it("should return a null value", async () => {
      const profile = null;
      const expected = { result: profile };

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

  describe("createUser", () => {
    it("should return a user ID", async () => {
      const req = getMockReq({
        body: {
          username: "testuser",
          password: "password",
          firstName: "Test",
          lastName: "User",
          role: "USER",
        },
      });
      const res = getMockRes().res;

      // @ts-ignore -- ignore the type comparison error with req and res mocks
      const actual = await uc.createUser(req, res);
      const expected = { result: "test:users:info:testuser" };
      expect(actual).toEqual(expected);
    });
  });
});
