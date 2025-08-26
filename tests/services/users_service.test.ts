import { expect, vi, describe, it } from "vitest";
import { User } from "../../src/types";
import * as service from "../../src/services/users_service";

const mockUser: User = {
  username: "testuser",
  password: "password",
  firstName: "Test",
  lastName: "User",
  role: "USER",
  lastLoginTimestamp: 12345
};

vi.mock("../../src/daos/users_dao", () => ({
  findByUsername: vi.fn((username) => {
    if (username === "testuser") {
      return mockUser;
    } else {
      return null;
    }
  })
}));

describe("UsersService", () => {
  describe("getUserByUsername", () => {
    it("should return a user object if the user exists", async () => {
      const user = await service.getUserByUsername("testuser");
      expect(user).toEqual(mockUser)
    });

    it("should return a null value if the user does not exist", async () => {
      const user = await service.getUserByUsername("joeyjoejoeshabadoo");
      expect(user).toBe(null);
    })
  })
});