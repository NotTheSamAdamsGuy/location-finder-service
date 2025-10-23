import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import { v4 as uuidv4 } from "uuid";

import { config } from "../../config.ts";
import { MapboxSuggestion } from "../types.ts";
import { sendSuccess } from "../middleware/responseHandler.ts";
import { BadRequestError } from "../utils/errors.ts";
import { logger } from "../logging/logger.ts";

const router = Router({ mergeParams: true });

type MapboxSuggestionReply = {
  suggestions: MapboxSuggestion[];
  attribution: string;
};

// /search?q=abc123
router.get(
  "/",
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
      const url = `${process.env.MAPBOX_SEARCHBOX_API_URL}?q=${req.query["q"]}&limit=10&session_token=${sessionToken}&proximity=${proximity}&country=US&access_token=${config.secrets.mapboxAccessToken}`;

      const mapboxResponse = await fetch(url);
      const data = await mapboxResponse.json();
      const suggestions: MapboxSuggestionReply = data.suggestions;

      if (suggestions) {
        sendSuccess(res, suggestions);
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
