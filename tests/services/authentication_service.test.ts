import { expect, vi, describe, it } from "vitest";
import { jwtVerify } from "jose";

import { generateToken } from "../../src/services/authentication_service";
import { User } from "../../src/types";
import { config } from "../../config";

vi.mock("../../src/services/users_service", () => ({
  getUserByUsername: (username: string) => {
    if (username === "testuser") {
      const user: User = {
        username: "testuser",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: "USER",
        lastLoginTimestamp: undefined,
      };

      return user;
    } else {
      return null;
    }
  },
}));

describe("AuthenticationService", () => {
  describe("generateToken", () => {
    it("should return a token for a valid user", async () => {
      const reply = await generateToken("testuser", "USER");
      const token = reply.result;
      
      expect(token).not.toBe(null);

      const secretKey = config.secrets.jwtSecretKey;
      const encodedKey = new TextEncoder().encode(secretKey);

      const { payload } = await jwtVerify(token, encodedKey, {
        algorithms: ["HS256"],
      });

      expect(payload.username).toEqual("testuser");
      expect(payload.role).toEqual("USER");
    });
  });
});
