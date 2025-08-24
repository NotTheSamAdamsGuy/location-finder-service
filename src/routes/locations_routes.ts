import { Router } from "express";
import { body, query, matchedData, validationResult } from "express-validator";

import * as service from "../services/locations_service.ts";

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
    const result = validationResult(req);

    if (result.isEmpty()) {
      const data = matchedData(req);

      try {
        const locations = await service.getNearbyLocations(data);
        return res.status(200).json(locations);
      } catch (err) {
        return next(err);
      }
    }

    return res.status(400).json({ errors: result.array() });
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
router.post(
  "/",
  body("name").notEmpty(),
  body("streetAddress").notEmpty(),
  body("city").notEmpty(),
  body("state").notEmpty(),
  body("zip").notEmpty(),
  body("description").optional(),
  async (req, res, next) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      const data = matchedData(req);

      try {
        const locationKey = await service.addLocation(data);
        return res.status(200).json(locationKey);
      } catch (err) {
        return next(err);
      }
    }
    return res.status(400).json({ errors: result.array() });
  }
);

export default router;
