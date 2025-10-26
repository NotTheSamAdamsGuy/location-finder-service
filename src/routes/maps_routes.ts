import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import { v4 as uuidv4 } from "uuid";

import { config } from "../../config.ts";
import { MapboxFeature, MapboxSuggestion } from "../types.ts";
import { sendSuccess } from "../middleware/responseHandler.ts";
import { BadRequestError } from "../utils/errors.ts";
import { logger } from "../logging/logger.ts";

const router = Router({ mergeParams: true });

type MapboxSuggestionReply = {
  suggestions: MapboxSuggestion[];
  attribution: string;
};

type MapSearchReply = {
  suggestions: MapboxSuggestion[];
  sessionToken: string;
};

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
          sessionToken: sessionToken
        };
        
        sendSuccess(res, returnData);
      } else {
        logger.error(`${mapboxResponse.status} ${mapboxResponse.statusText}`)
        throw new BadRequestError("Cannot process request");
      }
    } catch (err) {
      return next(err);
    }
  }
);

type MapboxRetrieveReply = {
  type: string;
  features: MapboxFeature[];
  attribution: string;
};

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
      console.log(req.params);
      const mapboxLocationId = req.params["mapboxLocationId"];
      const sessionToken = req.query["sessionToken"];
      const url = `${process.env.MAPBOX_SEARCHBOX_API_URL}/retrieve/${mapboxLocationId}?session_token=${sessionToken}&access_token=${config.secrets.mapboxAccessToken}`;

      logger.debug(`Calling Mapbox at ${url}`);

      const mapboxResponse = await fetch(url);
      const data = await mapboxResponse.json();
      const features: MapboxRetrieveReply = data.features;

      if (features) {
        sendSuccess(res, features);
      } else {
        logger.error(`${mapboxResponse.status} ${mapboxResponse.statusText}`)
        throw new BadRequestError("Cannot process request");
      }
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
