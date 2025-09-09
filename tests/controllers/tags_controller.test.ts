import { expect, vi, describe, it } from "vitest";

import * as controller from "../../src/controllers/tags_controller";
import { getMockReq, getMockRes } from "vitest-mock-express";

vi.mock("../../src/services/tags_service", () => ({
  getAllTags: vi.fn(() => {
    return { success: true, result: ["tag1", "tag2"] };
  }),
  getTag: vi.fn((tag: string) => {
    if (tag === "tag") {
      return { success: true, result: tag };
    } else if (tag === "tag2") {
      return { success: true, result: null };
    } else {
      throw new Error("error");
    }
  }),
  addTag: vi.fn((tag: string) => {
    if (tag === "tag") {
      return { success: true, result: tag };
    } else {
      throw new Error("error");
    }
  }),
  updateTag: vi.fn((currentTag: string, newTag: string) => {
    if (currentTag === "tag") {
      return { success: true, result: newTag, message: "updated" };
    } else if (currentTag === "tag2") {
      return { success: true, result: newTag, message: "added" };
    } else {
      throw new Error("error");
    }
  }),
  removeTag: vi.fn((tag: string) => {
    if (tag === "tagToDelete") {
      return { success: true };
    } else {
      throw new Error("error");
    }
  })
}));

describe("TagsController", () => {
  describe("getAllTags", () => {
    it("should return a result containing list of tags", async () => {
      const expected = { result: ["tag1", "tag2"] };
      const actual = await controller.getAllTags();
      expect(actual).toEqual(expected);
    });
  });

  describe("getTag", () => {
    it("should return a tag", async () => {
      const req = getMockReq({ params: { tag: "tag" } });
      const res = getMockRes().res;

      const expected = { result: "tag" };
      // @ts-ignore -- ignore the type comparison error with req and res mocks
      const actual = await controller.getTag(req, res);
      expect(actual).toEqual(expected);
    });

    it("should return a null", async () => {
      const req = getMockReq({ params: { tag: "tag2" } });
      const res = getMockRes().res;

      const expected = { result: null };
      // @ts-ignore -- ignore the type comparison error with req and res mocks
      const actual = await controller.getTag(req, res);
      expect(actual).toEqual(expected);
    });

    it("should throw an error", async () => {
      const req = getMockReq({ body: { tag: "tag3" } });
      const res = getMockRes().res;

      await expect(
        // @ts-ignore -- ignore the type comparison error with req and res mocks
        controller.addTag(req, res)
      ).rejects.toThrowError("error");
    });
  });

  describe("addTag", () => {
    it("should return a result containing the tag", async () => {
      const req = getMockReq({ body: { tag: "tag" } });
      const res = getMockRes().res;

      // @ts-ignore -- ignore the type comparison error with req and res mocks
      const actual = await controller.addTag(req, res);
      const expected = { result: "tag" };
      expect(actual).toEqual(expected);
    });

    it("should throw an error if it was unable to save the data", async () => {
      const req = getMockReq({ body: { tag: "tag2" } });
      const res = getMockRes().res;

      await expect(
        // @ts-ignore -- ignore the type comparison error with req and res mocks
        controller.addTag(req, res)
      ).rejects.toThrowError("error");
    });
  });

  describe("updateTag", () => {
    it("should return a success - updated message", async () => {
      const req = getMockReq({ body: { currentTag: "tag", newTag: "newTag" } });
      const res = getMockRes().res;

      // @ts-ignore -- ignore the type comparison error with req and res mocks
      const actual = await controller.updateTag(req, res);
      const expected = { result: "newTag", message: "updated" };
      expect(actual).toEqual(expected);
    });

    it("should return a success - added message", async () => {
      const req = getMockReq({
        body: { currentTag: "tag2", newTag: "newTag" },
      });
      const res = getMockRes().res;

      // @ts-ignore -- ignore the type comparison error with req and res mocks
      const actual = await controller.updateTag(req, res);
      const expected = { result: "newTag", message: "added" };
      expect(actual).toEqual(expected);
    });

    it("should throw an error if it was unable to update the data", async () => {
      const req = getMockReq({ body: { tag: "tag3" } });
      const res = getMockRes().res;

      await expect(
        // @ts-ignore -- ignore the type comparison error with req and res mocks
        controller.updateTag(req, res)
      ).rejects.toThrowError("error");
    });
  });

  describe("removeTag", () => {
    it("should return a success message", async () => {
      const req = getMockReq({
        params: { tag: "tagToDelete" },
      });
      const res = getMockRes().res;

      // @ts-ignore -- ignore the type comparison error with req and res mocks
      const actual = await controller.removeTag(req, res);
      const expected = { message: "deleted" };
      expect(actual).toEqual(expected);
    });

    it("should throw an error if it was unable to delete the data", async () => {
      const req = getMockReq({ body: { tag: "bad tag" } });
      const res = getMockRes().res;

      await expect(
        // @ts-ignore -- ignore the type comparison error with req and res mocks
        controller.updateTag(req, res)
      ).rejects.toThrowError("error");
    });
  });
});
