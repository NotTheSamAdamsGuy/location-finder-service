import { Router } from "express";
import { body, query, matchedData, validationResult } from "express-validator";
import multer from "multer";

import * as userService from "../services/users_service.ts";

const router = Router({ mergeParams: true });

// GET /users?username=abc123
router.get("/", query("username").notEmpty(), async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(400).json({ errors: error.array() });
  }

  const data = matchedData(req);
  try {
    const user = await userService.getUserByUsername(data.username);
    return res.status(200).json(user);
  } catch (err) {
    return next(err);
  }
});

export default router;