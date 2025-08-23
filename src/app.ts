import express from "express";

import { config } from "../config.ts";
import locationsRoutes from "./routes/locations_routes.ts";

const app = express();
const host = config.service.host;
const port = config.service.port;

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.get("/", async (req, res) => {
  res.status(200).json({ message: "Hello world!" });
});

app.use("/locations", locationsRoutes);

app.listen(port, () => {
  console.log(`App listening on http://${host}:${port}`);
});