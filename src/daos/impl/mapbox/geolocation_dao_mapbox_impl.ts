import { GeoLocation } from "../../../types.ts";
import { config } from "../../../../config.ts";

export const geocodeLocation = async (locationText: string): Promise<GeoLocation | null> => {
  const mapboxConfig = config.dataStores.mapbox;
  const url = `${mapboxConfig.geocodeUrl}?q=${encodeURIComponent(locationText)}&types=address&access_token=${mapboxConfig.accessToken}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.features?.length > 0) {
      return data.features[0].properties.coordinates;
    } 
  } catch (err) {
    console.log(err);
  }

  return null;
};