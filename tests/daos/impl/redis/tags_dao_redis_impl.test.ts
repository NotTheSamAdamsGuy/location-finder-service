import {expect, describe, it, vi} from "vitest";

import * as tagsDao from "../../../../src/daos/tags_dao";

const mockClient = {
  SMEMBERS: (hashkey: string) => {
    if (hashkey === "test:tags") {
      const tags = ["tag1", "tag2"];
      return Promise.resolve(tags);
    } else if (hashkey === "test2:tags") {
      const tags = ["single tag"];
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
  },
  SREM: (hashkey: string, tag: string) => {
    if (tag === "tagToDelete") {
      return Promise.resolve(1);
    } else {
      return Promise.resolve(0);
    }
  },
  multi: () => {
    let first = 1;
    let second = 1;
    return {
      SREM: (key, value) => {
        if (value === "currentTag2") first = 0;
        return true;
      },
      SADD: (key, value) => {
        return true;
      },
      execAsPipeline: () => {
        return Promise.resolve([first, second]);
      },
      close: () => {
        return;
      }
    }
  },
  close: () => {
    return true;
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

  // TODO: uncomment these after I figure out how to get vi.stubEnv working - possibly due to when we are setting the value
  // describe("find", () => {
  //   it("should return the tag when the tag exists in the db", async () => {
  //     vi.stubEnv("process.env.REDIS_KEY_PREFIX", "test2");
  //     const expected = "single tag";
  //     const actual = await tagsDao.find("single tag");
  //     expect(actual).toEqual(expected);
  //   });

  //   it("should return a null value when the tag does not exist in the db", async () => {
  //     vi.stubEnv("process.env.REDIS_KEY_PREFIX", "test2");
  //     const expected = null;
  //     const actual = await tagsDao.find("no tag");
  //     expect(actual).toEqual(expected);
  //   });

  //   vi.unstubAllEnvs();
  // });

  describe("insert", () => {
    it("should return the number of members added to the set", async () => {
      const expected = 1;
      const actual = await tagsDao.insert("tag");
      expect(actual).toEqual(expected);
    });
  });

  describe("update", () => {
    it("should return [1, 1] when a tag is updated", async () => {
      const expected = [1, 1];
      const actual = await tagsDao.update("currentTag", "newTag");
      expect(actual).toEqual(expected);
    });

    it("should return [0, 1] when a tag is created", async () => {
      const expected = [0, 1];
      const actual = await tagsDao.update("currentTag2", "newTag2");
      expect(actual).toEqual(expected);
    });
  })

  describe("remove", () => {
    it("should return a 1", async () => {
      const expected = 1;
      const actual = await tagsDao.remove("tagToDelete");
      expect(actual).toEqual(expected);
    });
  });
});