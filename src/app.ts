import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import BearerStrategy from "passport-http-bearer";

import { config } from "../config.ts";
import authenticationRoutes from "./routes/authentication_routes.ts";
import locationsRoutes from "./routes/locations_routes.ts";
import geolocationRoutes from "./routes/geolocation_routes.ts";
import usersRoutes from "./routes/users_routes.ts";
import tagsRoutes from "./routes/tags_routes.ts";
import { logger } from "./logging/logger.ts";
import * as usersService from "./services/users_service.ts";
import { decrypt } from "./services/authentication_service.ts";
import { errorHandler } from "./middleware/errorHandler.ts";

const app = express();
const host = config.service.host;
const port = config.service.port;

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Configure the Bearer Strategy
passport.use(
  new BearerStrategy.Strategy(async function (token, done) {
    try {
      const payload = await decrypt(token);
      const userServiceReply = await usersService.getUser(payload?.username as string);
      const user = userServiceReply.result;

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
app.use("/tags", tagsRoutes);

app.use(errorHandler); // this should come after all other app.use instances

app.listen(port, () => {
  logger.info(`App listening on http://${host}:${port}`);
});

process.on('uncaughtException', (err) => {
  console.log('uncaught exception');
});
