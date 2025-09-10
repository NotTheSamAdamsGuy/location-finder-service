import { Request, Response, Router } from "express";
import { body, query, validationResult } from "express-validator";
import multer from "multer";
import passport from "passport";

import * as locationsController from "../controllers/locations_controller.ts";
import * as multerUtils from "../utils/multer_utils.ts";

const router = Router({ mergeParams: true });

router.get(
  "/",
  async (req, res, next) => {
    res.set("Content-Type", "application/json");
    return next();
  },
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      const locations = await locationsController.getAllLocations();
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
  async (req: Request, res: Response, next) => {
    const error = validationResult(req);

    if (!error.isEmpty) {
      return res.status(400).json({ errors: error.array() });
    }

    try {
      const locations = await locationsController.getNearbyLocations(req, res);
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
      const location = await locationsController.getLocation(req, res);
      return location ? res.status(200).json(location) : res.sendStatus(404);
    } catch (err) {
      return next(err);
    }
  }
);

// POST /locations
const allowlist = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

const upload = multer({
  fileFilter: (req, file, cb) => {
    if (!allowlist.includes(file.mimetype)) {
      return cb(new Error("File type not allowed. Only images are permitted."));
    }
    cb(null, true);
  },
  storage: multerUtils.getStorageConfig(),
});

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
  body("tag").optional(),
  async (req, res, next) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }

    try {
      const locationKey = await locationsController.postLocation(req, res);
      return res.status(200).json(locationKey);
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
