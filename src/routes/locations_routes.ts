import { Router } from "express";
import { body, query, matchedData, validationResult } from "express-validator";
import multer from "multer";
import { nanoid } from "nanoid";

import * as service from "../services/locations_service.ts";
import * as multerUtils from "../utils/multer_utils.ts";

const router = Router({ mergeParams: true });

router.get("/", async (req, res, next) => {
  try {
    const locations = await service.getAllLocations();
    return locations ? res.status(200).json(locations) : res.sendStatus(404);
  } catch (err) {
    return next(err);
  }
});

// GET /locations/nearby
router.get(
  "/nearby",
  query("latitude").notEmpty(),
  query("longitude").notEmpty(),
  query("radius").notEmpty(),
  query("unitOfDistance").notEmpty(),
  async (req, res, next) => {
    const error = validationResult(req);

    if (!error.isEmpty) {
      return res.status(400).json({ errors: error.array() });
    }

    const data = matchedData(req);

    try {
      const locations = await service.getNearbyLocations(data);
      return res.status(200).json(locations);
    } catch (err) {
      return next(err);
    }
  }
);

// GET /locations/abc123
router.get("/:locationId", async (req, res, next) => {
  try {
    const location = await service.getLocation(req.params.locationId);
    return location ? res.status(200).json(location) : res.sendStatus(404);
  } catch (err) {
    return next(err);
  }
});

// POST /locations
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./public/data/uploads/");
//   },
//   filename: function (req, file, cb) {
//     const splitFilename = file.originalname?.split(".");
//     const fileExtension = splitFilename[splitFilename.length - 1];
//     cb(null, `${nanoid()}.${fileExtension}`);
//   },
// });

const upload = multer({ storage: multerUtils.getStorageConfig() });

router.post(
  "/",
  upload.array("images"),
  body("name").notEmpty(),
  body("streetAddress").notEmpty(),
  body("city").notEmpty(),
  body("state").notEmpty(),
  body("zip").notEmpty(),
  body("description").optional(),
  async (req, res, next) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }

    const data = matchedData(req);
    data.files = req.files;

    try {
      const locationKey = await service.addLocation(data);
      return res.status(200).json(locationKey);
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
