import { expect, vi, describe, it } from "vitest";

import * as controller from "../../src/controllers/tags_controller";
import { getMockReq, getMockRes } from "vitest-mock-express";

vi.mock("../../src/services/tags_service", () => ({
  getAllTags: vi.fn(() => {
    return ["tag1", "tag2"];
  }),
  addTag: vi.fn((tag: string) => {
    if (tag === "tag") {
      return JSON.stringify({message: "success"});
    } else {
      throw new Error("error");
    }
  })
}));

describe("TagsController", () => {
  describe("getAllTags", () => {
    it("should return a list of tags", async () => {
      const expected = ["tag1", "tag2"];
      const actual = await controller.getAllTags();
      expect(actual).toEqual(expected);
    });
  });

  describe("postTag", () => {
    it("should return a success message", async () => {
      const req = getMockReq({ body: {tag: "tag"} });
      const res = getMockRes().res;

      // @ts-ignore -- ignore the type comparison error with req and res mocks
      const actual = await controller.postTag(req, res);
      const expected = "{\"message\":\"success\"}";
      expect(actual).toEqual(expected);
    });

    it("should throw an error if it was unable to save the data", async () => {
      const req = getMockReq({ body: {tag: "tag2"} });
      const res = getMockRes().res;

      await expect(
        // @ts-ignore -- ignore the type comparison error with req and res mocks
        controller.postTag(req, res)
      ).rejects.toThrowError("error");
    });
  });
});