import { Router } from "express";
import { body, matchedData, validationResult } from "express-validator";

import { generateToken } from "../services/authentication_service.ts";

const router = Router({ mergeParams: true });

// post /authentication/login
router.post(
  "/login",
  body("username").notEmpty(),
  body("password").notEmpty(),
  async (req, res, next) => {
    const error = validationResult(req);
    console.log(error);

    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }

    const { username, password } = matchedData(req);

    try {
      const token = await generateToken(username, password);
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
