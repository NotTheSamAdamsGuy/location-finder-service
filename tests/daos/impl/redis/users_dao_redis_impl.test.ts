import {expect, describe, it, vi} from "vitest";

import * as userDao from "../../../../src/daos/users_dao";
import { User } from "../../../../src/types";

const mockClient = {
  HGET: (hashkey: string, username: string) => {
    if (hashkey === "test:users:info:new_testuser") {
      return Promise.resolve(null);
    } else {
      return Promise.resolve("testuser2")
    }
  },
  HGETALL: (hashkey: string) => {
    if (hashkey === "test:users:info:testuser") {
      const user: User = {
        username: "testuser",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: "USER",
        lastLoginTimestamp: 12345
      }
      return Promise.resolve(user);
    } else {
      return Promise.resolve([]);
    }
  },
  HSET: (hashkey: string, user: User) => {
    if (hashkey === "test:users:info:new_testuser") {
      return 1;
    } else if (hashkey === "test:users:info:updated_testuser") {
      return 1;
    } else {
      throw new Error("error");
    }
  },
  SADD: () => {
    return Promise.resolve(1);
  },
  close: () => {
    return;
  },
  SMEMBERS: () => {
    return [
      "test:users:info:testuser1",
      "test:users:info:testuser2",
      "test:users:info:testuser3",
    ];
  }
};

vi.mock("../../../../src/daos/impl/redis/redis_client", () => ({
  getClient: vi.fn(() => mockClient)
}));

describe("User DAO - Redis", () => {
  describe("findAllUsernames", () => {
    it("returns an array of username strings", async () => {
      const usernames = await userDao.findAllUsernames();
      const expectedUsernames = ["testuser1", "testuser2", "testuser3"];
      expect(usernames).toEqual(expectedUsernames);
    });
  });

  describe("findByUsername", () => {
    it("returns a user object if a user exists", async () => {
      const user = await userDao.findByUsername("testuser");
      expect(user).toEqual({
        username: "testuser",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: "USER",
        lastLoginTimestamp: 12345
      })
    });

    it("returns a null value if a user does not exist", async () => {
      const user = await userDao.findByUsername("joeyjoejoeshabadoo");
      expect(user).toBe(null);
    });
  });

  describe("insert", () => {
    it("returns the hashkey for the user added to the database", async () => {
      const user: User = {
        username: "new_testuser",
        password: "password",
        firstName: "NewTest",
        lastName: "User",
        role: "USER",
        lastLoginTimestamp: 12345
      }

      const actual = await userDao.insert(user);
      const expected = "test:users:info:new_testuser"
      
      expect(actual).toEqual(expected);
    });

    it("should throw an error if the user already exists", async () => {
      const user: User = {
        username: "testuser2",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: "USER",
        lastLoginTimestamp: 12345
      }

      await expect(
        userDao.insert(user)
      ).rejects.toThrowError("Entry already exists");
    });
  });

  describe("update", () => {
    it("should return true if the update was successful", async () => {
      const user: User = {
        username: "updated_testuser",
        password: "password",
        firstName: "UpdatedTest",
        lastName: "User",
        role: "USER",
        lastLoginTimestamp: 12345
      }

      const actual = await userDao.update(user);
      const expected = true;
      
      expect(actual).toEqual(expected);
    });

    it("should return false if an issue occurred during the update", async () => {
      const user: User = {
        username: "failed_update",
        password: "password",
        firstName: "UpdatedTest",
        lastName: "User",
        role: "USER",
        lastLoginTimestamp: 12345
      }

      const actual = await userDao.update(user);
      const expected = false;
      
      expect(actual).toEqual(expected);
    })
  });
});