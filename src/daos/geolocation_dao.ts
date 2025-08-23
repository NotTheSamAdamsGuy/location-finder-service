import { loadDao } from "./daoloader.ts"
import { GeoLocation } from "../types.ts";
import { config } from "../../config.ts";

const impl = await loadDao('geolocation', config.service.geolocationDataStore);

export const geocodeLocation = async (locationText: string): Promise<GeoLocation> => impl.geocodeLocation(locationText);