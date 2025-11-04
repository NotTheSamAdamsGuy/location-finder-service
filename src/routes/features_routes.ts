import { Request, Response, Router } from "express";
import { query, validationResult } from "express-validator";
import passport from "passport";

import * as featuresController from "../controllers/features_controller.ts";
import { NotFoundError } from "../utils/errors.ts";
import { sendSuccess } from "../middleware/responseHandler.ts";

const router = Router({ mergeParams: true });

// GET /features/nearby
router.get(
  "/nearby",
  // passport.authenticate("bearer", { session: false }),
  query("latitude").notEmpty(),
  query("longitude").notEmpty(),
  query("unitOfDistance")
    .notEmpty()
    .isIn(["mi", "km"])
    .withMessage('unitOfDistance must be "mi" or "km"'),
  query("zoomlevel").notEmpty(),
  query("mapWidthInPx").notEmpty(),
  query("mapHeightInPx").notEmpty(),
  async (req: Request, res: Response, next) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }

    try {
      const data = await featuresController.getNearbyFeatures(req);
      const features = data.result;
      res.setHeader("Access-Control-Allow-Origin", "*");
      sendSuccess(res, features);
    } catch (err) {
      return next(err);
    }
  }
);

// GET /features/abc123
router.get(
  "/:featureId",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      const data = await featuresController.getFeature(req);
      const feature = data.result;

      if (feature) {
        sendSuccess(res, feature);
      } else {
        throw new NotFoundError("Feature not found");
      }
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
