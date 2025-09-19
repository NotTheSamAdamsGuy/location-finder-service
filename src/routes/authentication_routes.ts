import { Request, Response, Router } from "express";
import { body, validationResult } from "express-validator";

import * as authenticationController from "../controllers/authentication_controller.ts";
import { comparePassword } from "../middleware/auth.ts";
import { BadRequestError, UnauthorizedError } from "../utils/errors.ts";

const router = Router({ mergeParams: true });

// post /authentication/login
router.post(
  "/login",
  body("username").notEmpty(),
  body("password").notEmpty(),
  comparePassword,
  async (req: Request, res: Response, next) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      throw new BadRequestError("Missing one or more required fields", error.array());
    }

    try {
      const reply = await authenticationController.generateToken(req, res);
      const token = reply.result;
      return res.json({ token: token });
    } catch (err: any) {
      // const httpErr = err as Error;
      console.log(err.message);
      if (err.message === "Invalid credentials") {
        // return res.status(401).json({ message: httpErr.message });
        return next(new UnauthorizedError());
      }

      return next(err);
    }
  }
);

export default router;
