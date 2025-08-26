import express, { Request, Response, NextFunction } from "express";

import { config } from "../config.ts";
import locationsRoutes from "./routes/locations_routes.ts";
import { logger } from "./logging/logger.ts";

const app = express();
const host = config.service.host;
const port = config.service.port;

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get("/", async (req, res) => {
  res.status(200).json({ message: "Hello world!" });
});

app.use("/locations", locationsRoutes);

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

app.use(errorHandler);

app.listen(port, () => {
  console.log(`App listening on http://${host}:${port}`);
});
