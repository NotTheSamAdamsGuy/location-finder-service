import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import { v4 as uuidv4 } from "uuid";
import { MapSearchReply, MapboxSuggestion } from "@notthesamadamsguy/location-finder-types";

import { config } from "../../config.ts";
import { sendSuccess } from "../middleware/responseHandler.ts";
import { BadRequestError } from "../utils/errors.ts";
import { logger } from "../logging/logger.ts";
import { query, validationResult } from "express-validator";
import * as mapsController from "../controllers/maps_controller.ts";

const router = Router({ mergeParams: true });

// /maps/search?q=abc123
router.get(
  "/search",
  async (req: Request, res: Response, next: NextFunction) => {
    res.set("Content-Type", "application/json");
    return next();
  },
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      const sessionToken = uuidv4();
      const latitude = req.query["latitude"];
      const longitude = req.query["longitude"];
      const proximity =
        latitude && longitude ? `${longitude},${latitude}` : "ip";
      const url = `${process.env.MAPBOX_SEARCHBOX_API_URL}/suggest?q=${req.query["q"]}&limit=10&session_token=${sessionToken}&proximity=${proximity}&country=US&access_token=${config.secrets.mapboxAccessToken}`;

      const mapboxResponse = await fetch(url);
      const data = await mapboxResponse.json();
      const suggestions: MapboxSuggestion[] = data.suggestions;

      if (suggestions) {
        const returnData: MapSearchReply = {
          suggestions: suggestions,
          sessionToken: sessionToken,
        };

        sendSuccess(res, returnData);
      } else {
        logger.error(`${mapboxResponse.status} ${mapboxResponse.statusText}`);
        throw new BadRequestError("Cannot process request");
      }
    } catch (err) {
      return next(err);
    }
  }
);

// /maps/location/abc123
router.get(
  "/location/:mapboxLocationId",
  async (req: Request, res: Response, next: NextFunction) => {
    res.set("Content-Type", "application/json");
    return next();
  },
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      const mapboxLocationId = req.params["mapboxLocationId"];
      const sessionToken = req.query["sessionToken"];
      const url = `${process.env.MAPBOX_SEARCHBOX_API_URL}/retrieve/${mapboxLocationId}?session_token=${sessionToken}&access_token=${config.secrets.mapboxAccessToken}`;

      logger.debug(`Calling Mapbox at ${url}`);

      const mapboxResponse = await fetch(url);
      const data = await mapboxResponse.json();
      const features: GeoJSON.FeatureCollection = data.features;

      if (features) {
        sendSuccess(res, features);
      } else {
        logger.error(`${mapboxResponse.status} ${mapboxResponse.statusText}`);
        throw new BadRequestError("Cannot process request");
      }
    } catch (err) {
      return next(err);
    }
  }
);

router.get(
  "/locations/nearby",
  passport.authenticate("bearer", { session: false }),
  query("latitude").notEmpty(),
  query("longitude").notEmpty(),
  query("unitOfDistance")
    .notEmpty()
    .isIn(["mi", "km"])
    .withMessage('unitOfDistance must be "mi" or "km"'),
  query("zoomlevel").notEmpty(),
  query("mapWidthInPx").notEmpty(),
  query("mapHeightInPx").notEmpty(),
  async (req: Request, res: Response, next: NextFunction) => {
    const error = validationResult(req);
    
    if (!error.isEmpty) {
      return res.status(400).json({ errors: error.array() });
    }

    try {
      const data = await mapsController.getNearbyLocations(req);
      const locations = data.result;
      sendSuccess(res, locations);
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
