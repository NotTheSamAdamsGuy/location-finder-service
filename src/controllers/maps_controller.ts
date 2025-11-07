import { Request } from "express";

import { MAPBOX_CONSTANTS } from "../utils/map_utils.ts";
import * as locationsService from "../services/locations_service.ts";

export const getNearbyLocations = async (req: Request) => {
  const latitude = parseFloat(req.query.latitude as string);
  const longitude = parseFloat(req.query.longitude as string);
  const unitOfDistance = req.query.unitOfDistance as string;
  const zoomlevel = parseInt(req.query.zoomlevel as string, 10);
  const mapDimensionsInPx = {
    width: parseInt(req.query.mapWidthInPx as string, 10),
    height: parseInt(req.query.mapHeightInPx as string, 10),
  };

  const horizontalTileDistance =
    MAPBOX_CONSTANTS.calculateHorizontalTileDistance(
      zoomlevel,
      latitude,
      unitOfDistance as "km" | "mi"
    );
  const unitOfDistancePerPixel =
    horizontalTileDistance / MAPBOX_CONSTANTS.TILE_WIDTH_IN_PX;
  const mapWidthInUnitOfDistance =
    mapDimensionsInPx.width * unitOfDistancePerPixel;
  const mapHeightInUnitOfDistance =
    mapDimensionsInPx.height * unitOfDistancePerPixel;

  // get information for nearby locations
  const data = await locationsService.getNearbyLocations({
    latitude: latitude,
    longitude: longitude,
    height: mapHeightInUnitOfDistance,
    width: mapWidthInUnitOfDistance,
    unitOfDistance: unitOfDistance as "km" | "mi",
    sort: "ASC",
  });
  
  const collection = data.result;

  return { result: collection };
};
