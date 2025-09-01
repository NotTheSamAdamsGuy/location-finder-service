import { NextFunction, Request, Response, Router } from "express";
import { query, validationResult } from "express-validator";
import passport from "passport";

import * as geolocationController from "../controllers/geolocation_controller.ts";

const router = Router({ mergeParams: true });

router.get(
  "/address",
  passport.authenticate("bearer", { session: false }),
  query("latitude").notEmpty(),
  query("longitude").notEmpty(),
  async (req: Request, res: Response, next: NextFunction) => {
    const error = validationResult(req);

    if (!error.isEmpty) {
      return res.status(400).json({ errors: error.array() });
    }

    try {
      const address = await geolocationController.getAddress(req, res);
      return address ? res.status(200).json(address) : res.sendStatus(404);
    } catch (err) {
      return next(err);
    }
  }
);

export default router;