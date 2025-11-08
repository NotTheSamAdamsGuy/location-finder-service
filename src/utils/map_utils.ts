export const MAPBOX_CONSTANTS = {
  EARTH_CIRCUMFERENCE: {
    mi: 24317.81514,
    km: 39135.742,
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
  calculateHorizontalTileDistance: (
    zoomlevel: number,
    latitude: number,
    unitOfDistance: "km" | "mi"
  ) => {
    let C = MAPBOX_CONSTANTS.EARTH_CIRCUMFERENCE.km;

    if (unitOfDistance === "mi") {
      C = MAPBOX_CONSTANTS.EARTH_CIRCUMFERENCE.mi;
    }

    // Math.cos() uses radians, so we need to convert degrees to radians
    const latitudeInRadians = latitude * (Math.PI / 180);
    return (C * Math.cos(latitudeInRadians)) / 2 ** (zoomlevel);
  },
};
