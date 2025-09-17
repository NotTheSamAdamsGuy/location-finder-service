import { Request, Response, Router } from "express";
import { body, validationResult } from "express-validator";

import * as authenticationController from "../controllers/authentication_controller.ts";

const router = Router({ mergeParams: true });

// post /authentication/login
router.post(
  "/login",
  body("username").notEmpty(),
  body("password").notEmpty(),
  async (req: Request, res: Response, next) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }

    try {
      const reply = await authenticationController.generateToken(req, res);
      const token = reply.result;
      return res.json({ token: token });
    } catch (err) {
      const httpErr = err as Error;

      if (httpErr.message === "Invalid credentials") {
        return res.status(401).json({ message: httpErr.message });
      }
      return next(err);
    }
  }
);

export default router;
