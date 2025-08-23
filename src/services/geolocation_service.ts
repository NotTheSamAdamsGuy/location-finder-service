import * as geolocationDao from "../daos/geolocation_dao.ts";
import { GeoLocation } from "../types.ts";

export const getGeolocation = async (locationText: string): Promise<GeoLocation> => {
  return await geolocationDao.geocodeLocation(locationText);
};