import { Router } from "express";
import { nanoid } from "nanoid";
import { body, query, matchedData, validationResult } from "express-validator";

import * as service from "../services/locations_service.ts";
import * as geolocationService from "../services/geolocation_service.ts";
import { Location } from "../types.ts";

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
      const latitude = parseFloat(data.latitude as string);
      const longitude = parseFloat(data.longitude as string);
      const radius = parseFloat(data.radius as string);
      const unitOfDistance: any = data.unitOfDistance;
      const sort: any = data.sort;

      try {
        const locations = await service.getNearbyLocations(
          latitude,
          longitude,
          radius,
          unitOfDistance,
          sort
        );
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
      const { name, streetAddress, city, state, zip, description } = data;

      try {
        const coordinates = await geolocationService.getCoordinates({
          streetAddress: streetAddress,
          city: city,
          state: state,
          zip: zip,
        });

        const location: Location = {
          id: nanoid(),
          name: name,
          streetAddress: streetAddress,
          city: city,
          state: state,
          zip: zip,
          coordinates: coordinates,
          description: description,
        };
        const locationKey = await service.addLocation(location);
        return res.status(200).json(locationKey);
      } catch (err) {
        return next(err);
      }
    }

    return res.status(400).json({ errors: result.array() });
  }
);

export default router;
