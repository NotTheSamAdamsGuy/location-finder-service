import multer from "multer";
import multerS3 from "multer-s3";
import { nanoid } from "nanoid";
import { S3Client } from "@aws-sdk/client-s3";

import { config } from "../../config.ts";

export const getStorageConfig = () => {
  switch (config.multer.storageType) {
    case "s3":
      return s3Storage;
    default:
      return diskStorage;
  }
};

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.multer.diskStorage.path!);
  },
  filename: function (req, file, cb) {
    const splitFilename = file.originalname?.split(".");
    const fileExtension = splitFilename[splitFilename.length - 1];
    cb(null, `${nanoid()}.${fileExtension}`);
  },
});

const s3 = new S3Client();

const s3Storage = multerS3({
  s3: s3,
  bucket: config.multer.s3Storage.bucket!,
  metadata: function (req, file, cb) {
    cb(null, {fieldName: file.fieldname});
  },
  key: function (req, file, cb) {
    // cb(null, Date.now().toString())
    const splitFilename = file.originalname?.split(".");
    const fileExtension = splitFilename[splitFilename.length - 1];
    cb(null, `${nanoid()}.${fileExtension}`);
  }
});