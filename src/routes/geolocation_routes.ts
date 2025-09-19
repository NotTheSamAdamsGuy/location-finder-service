import { NextFunction, Request, Response, Router } from "express";
import { query, validationResult } from "express-validator";
import passport from "passport";

import * as geolocationController from "../controllers/geolocation_controller.ts";
import { sendSuccess } from "../middleware/responseHandler.ts";
import { BadRequestError, NotFoundError } from "../utils/errors.ts";

const router = Router({ mergeParams: true });

router.get(
  "/address",
  passport.authenticate("bearer", { session: false }),
  query("latitude").notEmpty(),
  query("longitude").notEmpty(),
  async (req: Request, res: Response, next: NextFunction) => {
    const error = validationResult(req);

    if (!error.isEmpty) {
      throw new BadRequestError("Missing one or more required fields", error.array());
    }

    try {
      const address = await geolocationController.getAddress(req, res);

      if (address) {
        sendSuccess(res, address);
      } else {
        throw new NotFoundError("Address not found");
      }
    } catch (err) {
      return next(err);
    }
  }
);

export default router;