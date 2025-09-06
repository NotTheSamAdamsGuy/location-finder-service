import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import { body, validationResult } from "express-validator";

import * as tagsController from "../controllers/tags_controller.ts";

const router = Router({ mergeParams: true });

// GET /tags
router.get(
  "/",
  passport.authenticate("bearer", { session: false }),
  async (req, res, next) => {
    try {
      const data = await tagsController.getAllTags();
      return res.status(200).json(data.result);
    } catch (err) {
      return next(err);
    }
  }
);

// POST /tags
router.post(
  "/",
  passport.authenticate("bearer", { session: false }),
  body("tag").notEmpty(),
  async (req: Request, res: Response, next: NextFunction) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }

    try {
      const data = await tagsController.addTag(req, res);
      return res.status(201).json({ message: "Tag added successfully", result: data.result });
    } catch (err) {
      return next(err);
    }
  }
);

router.put(
  "/",
  passport.authenticate("bearer", { session: false }),
  body("currentTag").notEmpty(),
  body("newTag").notEmpty(),
  async (req: Request, res: Response, next: NextFunction) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }

    try {
      const data = await tagsController.updateTag(req, res);
      let statusCode = 200;
      let message = "Tag updated successfully";

      if (data.message === "added") {
        statusCode = 201;
        message = "Tag added successfully";
      }

      return res.status(statusCode).json({ message: message, result: data.result });
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
