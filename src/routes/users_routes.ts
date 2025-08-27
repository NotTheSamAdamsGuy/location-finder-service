import { Router } from "express";
import { body, query, matchedData, validationResult } from "express-validator";
import multer from "multer";
import passport from "passport";

import * as userService from "../services/users_service.ts";

const router = Router({ mergeParams: true });

// GET /users/abc123/profile
router.get(
  "/:username/profile",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    const username = req.params.username;

    try {
      const profile = await userService.getUserProfile(username);

      if (profile) {
        return res.status(200).json(profile);
      } else {
        return res.status(404).send({ error: "Profile not found" });
      }
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
