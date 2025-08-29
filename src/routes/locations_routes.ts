import { Router } from "express";
import { body, query, matchedData, validationResult } from "express-validator";
import multer from "multer";
import passport from "passport";

import * as service from "../services/locations_service.ts";
import * as multerUtils from "../utils/multer_utils.ts";

const router = Router({ mergeParams: true });

router.get(
  "/",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      const locations = await service.getAllLocations();
      return locations ? res.status(200).json(locations) : res.sendStatus(404);
    } catch (err) {
      return next(err);
    }
  }
);

// GET /locations/nearby
router.get(
  "/nearby",
  passport.authenticate("bearer", { session: false }),
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
router.get(
  "/:locationId",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      const location = await service.getLocation(req.params.locationId);
      return location ? res.status(200).json(location) : res.sendStatus(404);
    } catch (err) {
      return next(err);
    }
  }
);

// POST /locations
const upload = multer({ storage: multerUtils.getStorageConfig() });

router.post(
  "/",
  passport.authenticate("bearer", { session: false }),
  upload.array("images"),
  body("name").notEmpty(),
  body("streetAddress").notEmpty(),
  body("city").notEmpty(),
  body("state").notEmpty(),
  body("zip").notEmpty(),
  body("description").optional(),
  body("imageDescription").optional(),
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
