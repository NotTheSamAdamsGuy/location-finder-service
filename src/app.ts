import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import BearerStrategy from "passport-http-bearer";
import jwt, { JwtPayload } from "jsonwebtoken";

import { config } from "../config.ts";
import authenticationRoutes from "./routes/authentication_routes.ts";
import locationsRoutes from "./routes/locations_routes.ts";
import geolocationRoutes from "./routes/geolocation_routes.ts";
import usersRoutes from "./routes/users_routes.ts";
import { logger } from "./logging/logger.ts";
import * as usersService from "./services/users_service.ts";

const app = express();
const host = config.service.host;
const port = config.service.port;

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Configure the Bearer Strategy
passport.use(
  new BearerStrategy.Strategy(function (token, done) {
    try {
      const decoded: JwtPayload = jwt.verify(
        token,
        process.env.JWT_SECRET_KEY as string
      ) as JwtPayload;
      const user = usersService.getUserByUsername(decoded.username);

      if (!user) {
        return done(null, false); // No user found with this token
      }

      return done(null, user); // User authenticated
    } catch (err) {
      return done(err); // Handle errors
    }
  })
);

app.get("/", async (req, res) => {
  res.status(200).json({ message: "Hello world!" });
});

app.get("/healthcheck", async (req, res) => {
  res.status(200).json({ message: "it's alive!" });
});

app.use("/authentication", authenticationRoutes);
app.use("/locations", locationsRoutes);
app.use("/geolocation", geolocationRoutes)
app.use("/users", usersRoutes);

function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log the error for debugging purposes (optional but recommended)
  logger.error(err);

  // Determine the status code and message
  const statusCode = 500;
  const message = err.message || "Internal Server Error";

  // Send a JSON response with the error details
  res.status(statusCode).json({
    status: "error",
    message: message,
    // Include stack trace in development for debugging, but not in production
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

app.use(errorHandler); // this should come after all other app.use instances

app.listen(port, () => {
  logger.info(`App listening on http://${host}:${port}`);
});
