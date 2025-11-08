import { expect, vi, describe, it } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";
import { UserProfile } from "@notthesamadamsguy/location-finder-types";

import * as uc from "../../src/controllers/users_controller";

vi.mock("../../src/services/users_service", () => ({
  getUser: vi.fn((username) => {
    if (username === "testuser3") {
      return { success: true, result: { password: "other_pw" } };
    }
  }),
  getUserProfile: vi.fn((username) => {
    if (username === "testuser") {
      const profile: UserProfile = {
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        role: "USER",
      };
      return { success: true, result: profile };
    } else if (username === "bobbydroptables") {
      throw new Error("error");
    } else {
      return { success: true, result: null };
    }
  }),
  getAllUsernames: vi.fn(() => {
    return { success: true, result: ["testuser1", "testuser2", "testuser3"] };
  }),
  createUser: vi.fn((username, password, firstName, lastName, role) => {
    if (username === "testuser") {
      return { success: true, result: "test:users:info:testuser" };
    }
  }),
  updateUser: vi.fn((req) => {
    if (req === "testuser") {
      return { success: true };
    } else if (req === "testuser2") {
      return {
        success: false,
        message: "An error occurred while updating the database.",
      };
    } else if (req === "testuser3") {
      return {
        success: false,
        message: "Invalid credentials",
      };
    }
  }),
  removeUser: vi.fn((req) => {
    if (req === "testuser") {
      return { success: true };
    } else if (req === "testuser2") {
      return {
        success: false,
        message: "An error occurred while updating the database.",
      };
    }
  })
}));

describe("UsersController", () => {
  describe("getUserProfile", () => {
    it("should return a user's profile", async () => {
      const profile: UserProfile = {
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        role: "USER",
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

  describe("getAllUsernames", () => {
    it("should return an object containing all the usernames", async () => {
      const actual = await uc.getAllUsernames();
      const expected = { result: ["testuser1", "testuser2", "testuser3"] };
      expect(actual).toEqual(expected);
    });
  });

  describe("createUser", () => {
    it("should return a hashkey", async () => {
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

  describe("updateUser", () => {
    it("should return success: true - no password update", async () => {
      const req = getMockReq({
        body: {
          username: "testuser",
          firstName: "Test",
          lastName: "User",
          role: "USER",
        },
      });

      const expected = { success: true };
      // @ts-ignore -- ignore the type comparison error with req and res mocks
      const actual = await uc.updateUser(req);
      expect(actual).toEqual(expected);
    });

    it("should return success:false if there was an error", async () => {
      const req = getMockReq({
        body: {
          username: "testuser2",
          password: null,
          firstName: "UpdatedTest",
          lastName: "User",
          role: "USER",
        },
      });

      // @ts-ignore -- ignore the type comparison error with req and res mocks
      const actual = await uc.updateUser(req);
      const expected = {
        success: false,
        message: "Internal error",
      };
      expect(actual).toEqual(expected);
    });
  });

  describe("removeUser", () => {
    it("should receive a success message when the user has been deleted", async () => {
      const username = "testuser";
      const req = getMockReq({ params: { username: username } });
      const res = getMockRes().res;

      // @ts-ignore -- ignore the type comparison error with req and res mocks
      const actual = await uc.removeUser(req, res);
      const expected = {
        success: true,
        result: undefined,
      };

      expect(actual).toEqual(expected);
    });

    it("should throw an error when a user is unable to be deleted", async () => {
      const username = "testuser2";
      const req = getMockReq({ params: { username: username } });
      const res = getMockRes().res;

      // @ts-ignore -- ignore the type comparison error with req and res mocks
      const actual = await uc.removeUser(req, res);
      const expected = {
        message: "Internal error",
        success: false,
      };

      expect(actual).toEqual(expected);
    });
  });
});
