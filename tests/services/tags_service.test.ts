import { expect, vi, describe, it } from "vitest";

import * as service from "../../src/services/tags_service";

vi.mock("../../src/daos/tags_dao", () => ({
  findAll: vi.fn(() => {
    return ["tag1", "tag2"];
  }),
  insert: vi.fn((tag) => {
    if (tag === "tag") {
      return { message: "success" };
    } else {
      throw new Error("error");
    }
  })
}));

describe("TagsService", () => {
  describe("getAllTags", () => {
    it("should return a list of tags", async () => {
      const expected = ["tag1", "tag2"];
      const actual = await service.getAllTags();
      expect(actual).toEqual(expected);
    });
  });

  describe("addTag", () => {
    it("should return a success message when the tag has been added to the database", async () => {
      const expected = JSON.stringify({ message: "success" });
      const actual = await service.addTag("tag");
      expect(actual).toEqual(expected);
    });

    it("should throw an error saying it can't save location data", async () => {
      await expect(service.addTag("bad tag")).rejects.toThrowError(
        "error"
      );
    });
  });
});
