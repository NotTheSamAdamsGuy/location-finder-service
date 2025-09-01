import { expect, vi, describe, it } from "vitest";
import jwt, { JwtPayload } from "jsonwebtoken";

import { generateToken } from "../../src/services/authentication_service";
import { User } from "../../src/types";

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
      const token = await generateToken("testuser", "USER");
      expect(token).not.toBe(null);

      const decoded: JwtPayload = jwt.verify(
        token,
        process.env.JWT_SECRET_KEY as string
      ) as JwtPayload;

      expect(decoded.username).toEqual("testuser");
      expect(decoded.role).toEqual("USER");
    });
  });
});
