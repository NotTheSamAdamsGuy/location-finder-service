import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";

import { getRole } from "../services/authentication_service.ts";
import { logger } from "../logging/logger.ts";
import { getUser } from "../services/users_service.ts";

export const checkIfAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers["authorization"];
  const token = authorization?.split(" ")[1];

  if (token) {
    const role = await getRole(token);

    if (role === "ADMIN") {
      next();
    } else {
      res
        .status(403)
        .send("User does not have permission to access this route");
    }
  }
};

export const hashPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const saltRounds = 10;

  if (req.body.password) {
    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      req.body.password = hashedPassword;
      next();
    } catch (err) {
      logger.error("Error hashing password:", err);
      res.status(500).send("Internal server error while hashing password");
    }
  }
};

export const comparePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body.username && req.body.password) {
    try {
      const plainPassword = req.body.password;
      const userServiceReply = await getUser(req.body.username);
      const user = userServiceReply.result;

      if (user) {
        const hashedPassword = user.password;
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);

        if (isMatch) {
          next();
        } else {
          res.status(401).send("Invalid credentials");
        }
      } else {
        res.status(401).send("Invalid credentials");
      }
    } catch (error) {
      logger.error("Error comparing passwords:", error);
      res.status(500).send("Internal server error while validating password");
    }
  }
};
