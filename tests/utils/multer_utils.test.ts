import { expect, describe, it, vi, afterEach } from "vitest";

import * as utils from "../../src/utils/multer_utils";

describe("Multer Utils", () => {
  describe("getStorageConfig", () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("should return disk storage config", () => {
      vi.stubEnv('MULTER_STORAGE_TYPE', 'disk');
      vi.stubEnv("MULTER_STORAGE_PATH", "/test-path");

      const keys = Object.keys(utils.getStorageConfig());

      expect(keys).toContain("getFilename");
      expect(keys).toContain("getDestination");
      expect(keys).not.toContain("s3");
    });

    it("should return S3 storage config", () => {
      vi.stubEnv('MULTER_STORAGE_TYPE', 's3');
      vi.stubEnv("MULTER_STORAGE_PATH", "test-bucket");

      const keys = Object.keys(utils.getStorageConfig());

      expect(keys).toContain("s3");
      expect(keys).not.toContain("getFilename");
    });

    vi.unstubAllEnvs();
  });
});
