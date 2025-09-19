import { Request, Response, Router } from "express";
import { body, query, validationResult } from "express-validator";
import multer from "multer";
import passport from "passport";

import * as locationsController from "../controllers/locations_controller.ts";
import * as multerUtils from "../utils/multer_utils.ts";
import { checkIfAdmin } from "../middleware/auth.ts";
import { BadRequestError, NotFoundError } from "../utils/errors.ts";
import { sendSuccess } from "../middleware/responseHandler.ts";

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
      const data = await locationsController.getAllLocations();
      const locations = data.result;

      if (locations) {
        sendSuccess(res, locations);
      } else {
        throw new BadRequestError("Cannot process request");
      }
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
      const data = await locationsController.getNearbyLocations(req, res);
      const locations = data.result;
      sendSuccess(res, locations);
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
      const data = await locationsController.getLocation(req, res);
      const location = data.result;

      if (location) {
        sendSuccess(res, location);
      } else {
        throw new NotFoundError("Location not found");
      }
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
  checkIfAdmin,
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
      throw new BadRequestError("Missing one or more required fields", error.array());
    }

    try {
      const data = await locationsController.addLocation(req, res);
      const locationKey = data.result;
      sendSuccess(res, locationKey);
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
