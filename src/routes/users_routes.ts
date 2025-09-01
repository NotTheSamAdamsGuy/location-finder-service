import { Router } from "express";
import passport from "passport";

import * as usersController from "../controllers/users_controller.ts";

const router = Router({ mergeParams: true });

// GET /users/abc123/profile
router.get(
  "/:username/profile",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      const profile = await usersController.getUserProfile(req, res);

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
