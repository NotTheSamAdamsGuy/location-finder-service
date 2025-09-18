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
    } else if (username === "bobbydroptables") {
      throw new Error("error");
    } else {
      return null;
    }
  }),
  insert: vi.fn((user) => {
    return `test:users:info:${user.username}`;
  }),
}));

describe("UsersService", () => {
  describe("getUser", () => {
    it("should return a user object if the user exists", async () => {
      const reply = await service.getUser("testuser");
      const user = reply.result;
      expect(user).toEqual(mockUser);
    });

    it("should return a null value if the user does not exist", async () => {
      const reply = await service.getUser("joeyjoejoeshabadoo");
      const user = reply.result;
      expect(user).toBe(null);
    });

    it("should throw an error if an issue occurred while retrieving user data", async () => {
      await expect(service.getUser("bobbydroptables")).rejects.toThrowError(
        "Unable to fetch user data."
      );
    });
  }),
    describe("getUserProfile", () => {
      it("should return a UserProfile object if the user exists", async () => {
        const data = await service.getUserProfile("testuser");
        const userProfile = data.result;
        expect(userProfile).toEqual(mockUserProfile);
      });

      it("should return a null value if the user does not exist", async () => {
        const data = await service.getUserProfile("joeyjoejoeshabadoo");
        const userProfile = data.result;
        expect(userProfile).toBe(null);
      });

      it("should throw an error if an issue occurred while retrieving user profile data", async () => {
        await expect(
          service.getUserProfile("bobbydroptables")
        ).rejects.toThrowError("Unable to fetch profile data");
      });
    });

  describe("createUser", () => {
    it("should return a database id", async () => {
      const username = "testuser2";
      const password = "password";
      const firstName = "Test";
      const lastName = "User";
      const role = "USER";

      const actual = await service.createUser(
        username,
        password,
        firstName,
        lastName,
        role
      );
      const expected = { success: true, result: "test:users:info:testuser2" };
      expect(actual).toEqual(expected);
    });

    it("should throw an error if the user already exists", async () => {
      const username = "testuser";
      const password = "password";
      const firstName = "Test";
      const lastName = "User";
      const role = "USER";

      await expect(
        service.createUser(username, password, firstName, lastName, role)
      ).rejects.toThrowError("Unable to create user: User already exists");
    });
  });
});
