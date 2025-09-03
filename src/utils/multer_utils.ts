import multer from "multer";
import multerS3 from "multer-s3";
import { nanoid } from "nanoid";
import { S3Client, S3ClientConfig } from "@aws-sdk/client-s3";

import { config } from "../../config.ts";

/**
 * Get the Multer storage engine configuration.
 * @returns an Multer storage engine object
 */
export const getStorageConfig = () => {
  switch (process.env.MULTER_STORAGE_TYPE) {
    case "s3":
      return s3Storage;
    default:
      return diskStorage;
  }
};

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.MULTER_STORAGE_PATH as string);
  },
  filename: function (req, file, cb) {
    cb(null, `${nanoid()}.${getFileExtension(file)}`);
  },
});

const s3ClientConfig: S3ClientConfig = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: config.secrets.awsAccessKeyId as string,
    secretAccessKey: config.secrets.awsSecretAccessKey as string
  }
};

const s3 = new S3Client(s3ClientConfig);

const s3Storage = multerS3({
  s3: s3,
  bucket: process.env.MULTER_STORAGE_S3_BUCKET as string,
  acl: process.env.MULTER_STORAGE_S3_ACL,
  key: function (req, file, cb) {
    cb(null, `${nanoid()}.${getFileExtension(file)}`);
  }
});

/**
 * Return the extension of the given file.
 * @param {Express.Multer.File | Express.MulterS3.File} file - a File object
 * @returns a string containing the file's extension.
 */
function getFileExtension(file: Express.Multer.File | Express.MulterS3.File) {
  const splitFilename = file.originalname?.split(".");
  return splitFilename[splitFilename.length - 1];
}