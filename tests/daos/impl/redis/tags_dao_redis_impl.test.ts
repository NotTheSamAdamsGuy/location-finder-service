import {expect, describe, it, vi} from "vitest";

import * as tagsDao from "../../../../src/daos/tags_dao";

const mockClient = {
  SMEMBERS: (hashkey: string) => {
    if (hashkey === "test:locations:tags") {
      const tags = ["tag1", "tag2"];
      return Promise.resolve(tags);
    } else {
      return Promise.resolve([]);
    }
  },
  SADD: (hashkey: string, tag: string) => {
    if (tag === "tag") {
      return Promise.resolve(1);
    } else {
      // TODO: error case
    }
  }
};

vi.mock("../../../../src/daos/impl/redis/redis_client", () => ({
  getClient: vi.fn(() => mockClient)
}));

describe("Tags DAO - Redis", () => {
  describe("findAll", () => {
    it("should return a list of tags", async () => {
      const expected = ["tag1", "tag2"];
      const actual = await tagsDao.findAll();
      expect(actual).toEqual(expected);
    });
  });

  describe("insert", () => {
    it("should return the number of members added to the set", async () => {
      const expected = 1;
      const actual = await tagsDao.insert("tag");
      expect(actual).toEqual(expected);
    });
  });
});