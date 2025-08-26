import { expect, vi, describe, it } from "vitest";
import { User, UserProfile } from "../../src/types";
import * as service from "../../src/services/users_service";

const mockUser: User = {
  username: "testuser",
  password: "password",
  firstName: "Test",
  lastName: "User",
  role: "USER",
  lastLoginTimestamp: 12345,
};

const mockUserProfile: UserProfile = {
  username: mockUser.username,
  firstName: mockUser.firstName as string,
  lastName: mockUser.lastName as string,
};

vi.mock("../../src/daos/users_dao", () => ({
  findByUsername: vi.fn((username) => {
    if (username === "testuser") {
      return mockUser;
    } else {
      return null;
    }
  }),
}));

describe("UsersService", () => {
  describe("getUserByUsername", () => {
    it("should return a user object if the user exists", async () => {
      const user = await service.getUserByUsername("testuser");
      expect(user).toEqual(mockUser);
    });

    it("should return a null value if the user does not exist", async () => {
      const user = await service.getUserByUsername("joeyjoejoeshabadoo");
      expect(user).toBe(null);
    });
  }),
    describe("getUserProfile", () => {
      it("should return a UserProfile object if the user exists", async () => {
        const userProfile = await service.getUserProfile("testuser");
        expect(userProfile).toEqual(mockUserProfile);
      });

      it("should return a null value if the user does not exist", async () => {
        const userProfile = await service.getUserProfile("joeyjoejoeshabadoo");
        expect(userProfile).toBe(null);
      })
    });
});
