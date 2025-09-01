import { expect, vi, describe, it } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";

import * as authenticationController from "../../src/controllers/authentication_controller";

vi.mock("../../src/services/users_service", () => ({
  getUserByUsername: vi.fn((username) => {
    if (username === "testuser") {
      return {
        username: "testuser",
        password: "password",
        firstName: "test",
        lastName: "user",
        role: "USER"
      }
    } else {
      return new Error("error");
    }
  })
}));

vi.mock("../../src/services/authentication_service", () => ({
  generateToken: vi.fn((username, role) => {
    if (username === "testuser") {
      return "thisisatoken"
    } else {
      return new Error("error");
    }
  })
}));

describe("AuthenticationController", () => {
  describe("generateToken", () => {
    it("should return a token", async () => {
      const req = getMockReq({ body: { username: "testuser", password: "password" } });
      const res = getMockRes().res;

      // @ts-ignore -- ignore the type comparison error with req and res mocks
      const actual = await authenticationController.generateToken(req, res);
      const expected = "thisisatoken";

      expect(actual).toEqual(expected);
    });

    it("should throw an error if an invalid user is provided", async () => {
      const req = getMockReq({ body: { username: "invaliduser", password: "password" } });
      const res = getMockRes().res;
      
      // @ts-ignore -- ignore the type comparison error with req and res mocks
      await expect(authenticationController.generateToken(req, res)).rejects.toThrowError();
    });
  });
});