import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";

import * as usersController from "../controllers/users_controller.ts";
import { checkIfAdmin, hashPassword } from "../middleware/auth.ts";

const router = Router({ mergeParams: true });

// GET /users/abc123/profile
router.get(
  "/:username/profile",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      const data = await usersController.getUserProfile(req, res);
      const profile = data.result;

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

// POST /users
router.post(
  "/",
  passport.authenticate("bearer", { session: false }),
  checkIfAdmin,
  hashPassword,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reply = await usersController.createUser(req, res);
      const id = reply.result;

      return res.status(200).json(id);
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
