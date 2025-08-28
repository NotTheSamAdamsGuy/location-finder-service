import { Router } from "express";
import { query, matchedData, validationResult } from "express-validator";
import passport from "passport";

import { getAddress } from "../services/geolocation_service.ts";

const router = Router({ mergeParams: true });

router.get(
  "/address",
  passport.authenticate("bearer", { session: false }),
  query("latitude").notEmpty(),
  query("longitude").notEmpty(),
  async (req, res, next) => {
    const error = validationResult(req);

    if (!error.isEmpty) {
      return res.status(400).json({ errors: error.array() });
    }

    const data = matchedData(req);
    const latitude = parseFloat(data.latitude);
    const longitude = parseFloat(data.longitude);

    try {
      const address = await getAddress({ latitude, longitude });
      return address ? res.status(200).json(address) : res.sendStatus(404);
    } catch (err) {
      return next(err);
    }
  }
);

export default router;