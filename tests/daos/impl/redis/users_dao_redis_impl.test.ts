import {expect, describe, it, vi} from "vitest";

import * as userDao from "../../../../src/daos/impl/redis/users_dao_redis_impl";
import { User } from "../../../../src/types";

const mockClient = {
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
  } 
};

vi.mock("../../../../src/daos/impl/redis/redis_client", () => ({
  getClient: vi.fn(() => mockClient)
}));

describe("User DAO - Redis", () => {
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
});