import { Request } from "express";

import * as featuresService from "../services/features_service.ts";
import { ControllerReply } from "../types.ts";
import { MAPBOX_CONSTANTS } from "../utils/map_utils.ts";

export type FeatureReply = ControllerReply & {
  result: GeoJSON.Feature | null;
};

export type FeatureColletionReply = ControllerReply & {
  result: GeoJSON.FeatureCollection;
};

type DimensionsType = {
  height: number;
  width: number;
  unitOfMeasure: "px" | "mi" | "km";
};

type MapDimensionsConversionProps = {
  zoomlevel: number;
  mapDimensions: DimensionsType;
  latitude: number;
  unitOfDistance: "mi" | "km";
};

/**
 * Get details for a given feature.
 * @param {Express.Request} req
 * @returns {Promise<FeatureReply>}
 */
export const getFeature = async (req: Request): Promise<FeatureReply> => {
  const featureId = req.params.featureId;
  const data = await featuresService.getFeature(featureId);
  return { result: data.result } as FeatureReply;
};

/**
 * Get nearby features.
 * @param {Express.Request} req
 * @returns {Promise<FeatureColletionReply>}
 */
export const getNearbyFeatures = async (req: Request) => {
  const latitude = parseFloat(req.query.latitude as string);
  const longitude = parseFloat(req.query.longitude as string);
  const unitOfDistance = req.query.unitOfDistance as string;
  const zoomlevel = parseInt(req.query.zoomlevel as string, 10);
  const mapDimensionsInPx: DimensionsType = {
    width: parseInt(req.query.mapWidthInPx as string, 10),
    height: parseInt(req.query.mapHeightInPx as string, 10),
    unitOfMeasure: "px",
  };

  const actualUnitsOfDistance = convertMapDimensionsToActualUnitsOfDistance({
    zoomlevel: zoomlevel,
    mapDimensions: mapDimensionsInPx,
    latitude: latitude,
    unitOfDistance: unitOfDistance as "km" | "mi",
  });

  // get information for nearby locations
  const data = await featuresService.getNearbyFeatures({
    latitude: latitude,
    longitude: longitude,
    height: actualUnitsOfDistance.height,
    width: actualUnitsOfDistance.width,
    unitOfDistance: unitOfDistance as "km" | "mi",
    sort: "ASC",
  });
  
  const featuresCollection = data.result;

  return { result: featuresCollection };
};

/**
 * Convert a map's dimensions in pixels to the actual distances of the 
 * area represented by the map.
 * @param props
 * @returns {DimensionsType} an object containing the actual distances represented by the map
 * 
 * Note: we need to do this conversion because Redis calculates nearby locations based on 
 * height and width distances of a bounding box, not the bounding coordinates as used by Mapbox.
 */
const convertMapDimensionsToActualUnitsOfDistance = (
  props: MapDimensionsConversionProps
) => {
  const { zoomlevel, mapDimensions, latitude, unitOfDistance } = props;
  const horizontalTileDistance =
    MAPBOX_CONSTANTS.calculateHorizontalTileDistance(
      zoomlevel,
      latitude,
      unitOfDistance
    );
  const unitOfDistancePerPixel =
    horizontalTileDistance / MAPBOX_CONSTANTS.TILE_WIDTH_IN_PX;
  const actualWidth = mapDimensions.width * unitOfDistancePerPixel;
  const actualHeight =
    mapDimensions.height * unitOfDistancePerPixel;

  const actualDimensions: DimensionsType = {
    height: actualHeight,
    width: actualWidth,
    unitOfMeasure: unitOfDistance,
  };

  return actualDimensions;
};
