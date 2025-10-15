import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";

import * as usersController from "../controllers/users_controller.ts";
import { checkIfAdmin, comparePassword, hashPassword } from "../middleware/auth.ts";
import { InternalServerError, NotFoundError } from "../utils/errors.ts";
import { sendSuccess } from "../middleware/responseHandler.ts";

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
        sendSuccess(res, profile);
      } else {
        throw new NotFoundError("Profile not found");
      }
    } catch (err) {
      return next(err);
    }
  }
);

// GET /users/usernames
router.get("/usernames",
  passport.authenticate("bearer", {session: false }),
  async (req, res, next) => {
    try {
      const data = await usersController.getAllUsernames();
      const usernames = data.result;

      if (usernames) {
        sendSuccess(res, usernames);
      } else {
        throw new InternalServerError("Unable to retrieve usernames");
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

      sendSuccess(res, id);
    } catch (err) {
      return next(err);
    }
  }
);

router.put(
  "/",
  passport.authenticate("bearer", { session: false }),
  checkIfAdmin,
  comparePassword,
  hashPassword,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reply = await usersController.updateUser(req);
      if (reply.success) {
        sendSuccess(res, { success: true });
      } else {
        throw new InternalServerError("Unable to update user");
      }
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
