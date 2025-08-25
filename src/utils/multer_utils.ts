import multer from "multer";
import multerS3 from "multer-s3";
import { nanoid } from "nanoid";
import { S3Client, S3ClientConfig } from "@aws-sdk/client-s3";

const multerStorageType = process.env.MULTER_STORAGE_TYPE;
const multerStoragePath = process.env.MULTER_STORAGE_PATH ??= "";
const multerStorageS3Bucket = process.env.MULTER_STORAGE_S3_BUCKET ??= "";
const multerStorageS3ACL = process.env.MULTER_STORAGE_S3_ACL ??= "";

/**
 * Get the Multer storage engine configuration.
 * @returns an Multer storage engine object
 */
export const getStorageConfig = () => {
  switch (multerStorageType) {
    case "s3":
      return s3Storage;
    default:
      return diskStorage;
  }
};

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, multerStoragePath);
  },
  filename: function (req, file, cb) {
    cb(null, `${nanoid()}.${getFileExtension(file)}`);
  },
});

const s3ClientConfig: S3ClientConfig = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ""
  }
};

const s3 = new S3Client(s3ClientConfig);

const s3Storage = multerS3({
  s3: s3,
  bucket: multerStorageS3Bucket,
  acl: multerStorageS3ACL,
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