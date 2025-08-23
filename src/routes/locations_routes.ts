import { Router } from "express";
import { nanoid } from "nanoid";

import * as service from "../services/locations_service.ts";
import * as geolocationService from "../services/geolocation_service.ts";
import { Location } from "../types.ts";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const locations = await service.getAllLocations();
    return locations ? res.status(200).json(locations) : res.sendStatus(404);
  } catch (err) {
    return next(err);
  }
});

// GET /locations/999
router.get("/:locationId", async (req, res, next) => {
  try {
    const location = await service.getLocation(req.params.locationId);
    return location ? res.status(200).json(location) : res.sendStatus(404);
  } catch (err) {
    return next(err);
  }
});

// POST /locations/{location}
router.post("/", async (req, res, next) => {
  try {
    const { name, streetAddress, city, state, zip, description } = { ...req.body };
    const hasRequiredFields = {
      name: name ? true : false,
      streetAddress: streetAddress ? true : false,
      city: city ? true : false,
      state: state ? true : false,
      zip: zip ? true : false,
      description: description ? true : false
    };

    const missingFields = Object.entries(hasRequiredFields).filter(([, value]) => value === false);
    const missingFieldNames = missingFields.map(([key]) => key);

    if (Object.values(hasRequiredFields).indexOf(false) > -1) {
      throw new Error (`One or more required fields are missing values: ${missingFieldNames.join(", ")}`);
    }

    let coordinates = {
      lat: 0,
      lng: 0
    }

    try {
      const geolocation = await geolocationService.getGeolocation(`${streetAddress} ${city} ${state}, ${zip}`);
      coordinates["lat"] = geolocation.latitude;
      coordinates["lng"] = geolocation.longitude;
    } catch (err) {
      console.log(err);
      throw new Error("Unable to get coordinates for location.");
    }

    const location: Location = {
      id: nanoid(),
      name: name,
      streetAddress: streetAddress,
      city: city,
      state: state,
      zip: zip,
      coordinates: coordinates,
      description: description,
    };
    const locationKey = await service.addLocation(location);
    return res.status(200).json(locationKey);
  } catch (err) {
    return next(err);
  }
});

export default router;
