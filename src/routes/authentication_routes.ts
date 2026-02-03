import { Request, Response, Router } from "express";
import { body, validationResult } from "express-validator";

import * as authenticationController from "../controllers/authentication_controller.ts";
import { comparePassword } from "../middleware/auth.ts";
import { BadRequestError, UnauthorizedError } from "../utils/errors.ts";

const router = Router({ mergeParams: true });

// post /authentication/login
// router.post(
//   "/login",
//   body("username").notEmpty(),
//   body("password").notEmpty(),
//   comparePassword,
//   async (req: Request, res: Response, next) => {
//     const error = validationResult(req);

//     if (!error.isEmpty()) {
//       throw new BadRequestError("Missing one or more required fields", error.array());
//     }

//     try {
//       // const reply = await authenticationController.generateToken(req, res);
//       // const token = reply.result;
//       // return res.json({ token: token });
//       // const reply = await authenticationController.generateTokens(req);
//       // const tokens = reply.result;
//       // return res.json(tokens);
//       const response = await authenticationController.generateTokens(req, res);

      
//     } catch (err: any) {
//       if (err.message === "Invalid credentials") {
//         return next(new UnauthorizedError());
//       }

//       return next(err);
//     }
//   }
// );

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
      return await authenticationController.generateTokens(req, res);
    } catch (err: any) {
      return next(err);
    }
  }
);

router.post(
  "/refreshTokens",
  body("refreshToken").notEmpty(),
  async (req: Request, res: Response, next) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      throw new BadRequestError("Missing one or more required fields", error.array());
    }

    try {
      return await authenticationController.refreshTokens(req, res);
    } catch (err: any) {
      return next(err);
    }
  }
)

export default router;
