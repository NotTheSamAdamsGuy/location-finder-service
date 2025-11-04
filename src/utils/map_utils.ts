import { Location, MapLocation } from "../types.ts";

export const MAPBOX_CONSTANTS = {
  EARTH_CIRCUMFERENCE: {
    mi: 24317.81514,
    km: 39135.742
  },
  TILE_WIDTH_IN_PX: 512,

  /**
   * Get the unit of distance represented by the width of a single map tile.
   * @param {number} zoomlevel the zoom level of the map
   * @param {number} latitude the latitude represented by the center of the map
   * @param {"km" | "mi"} unitOfDistance the unit of distance
   * @returns {number} the unit of distance represented by the width of a single map tile 
   * 
   * Calculations are based on details found at 
   * https://docs.mapbox.com/help/glossary/zoom-level/ and
   * https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
   */
  calculateHorizontalTileDistance: (zoomlevel: number, latitude: number, unitOfDistance: "km" | "mi") => {
    let C = MAPBOX_CONSTANTS.EARTH_CIRCUMFERENCE.km;

    if (unitOfDistance === "mi") {
      C = MAPBOX_CONSTANTS.EARTH_CIRCUMFERENCE.mi;
    }

    return C * Math.cos(latitude  * (Math.PI / 180)) / 2 ** (zoomlevel - 1);
  },

  convertLocationsToMapLocations: (locations: Location[]): MapLocation[] => {
    const mapLocations: MapLocation[] = locations.map(location => {
      return {
        id: location.id,
        name: location.name,
        streetAddress: location.streetAddress,
        city: location.city,
        state: location.state,
        zip: location.zip,
        images: location.images.map((image) => image.filename),
        description: location.description,
        tags: location.tags,
        coordinates: location.coordinates,
        type: "location"
      }
    });

    return mapLocations;
  }
}