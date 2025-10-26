export type Image = {
  originalFilename: string;
  filename: string;
  description?: string;
};

export type Location = {
  id: string;
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  coordinates: Coordinates;
  description: string;
  images: Image[];
  tags?: string[];
  displayOnSite: boolean;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Address = {
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
};

export type GeolocationSearchInputs = {
  latitude: string;
  longitude: string;
  radius: string;
  unitOfDistance: "mi" | "km" | "ft" | "m";
  sort: "ASC" | "DESC";
};

export type NearbyLocationsParams = {
  longitude: number;
  latitude: number;
  radius: number;
  unitOfDistance: "m" | "km" | "ft" | "mi";
  sort: "ASC" | "DESC";
};

export type AddLocationParams = {
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  description: string;
  files?: Express.Multer.File[] | Express.MulterS3.File[];
  imageDescription?: string;
  coordinates: Coordinates;
  images: Image[];
  tags?: string[];
  displayOnSite?: boolean
};

export type UpdateLocationParams = AddLocationParams & {
  id: string;
};

export type User = {
  username: string;
  password: string | null;
  firstName: string | undefined;
  lastName: string | undefined;
  role: "USER" | "ADMIN";
  lastLoginTimestamp: number;
};

export type UserProfile = {
  username: string;
  firstName: string;
  lastName: string;
  role: string;
};

export type SessionPayload = {
  username: string;
  role: string;
};

export type ServiceReply = {
  success: boolean;
  message?: string;
  result?: unknown;
};

export type ControllerReply = {
  message?: string;
  result?: unknown;
};

type MapboxContextBase = {
  id: string;
  name: string;
};

type MapboxContext = {
  country?: MapboxContextBase & {
    country_code: string;
    country_code_alpha_3: string;
  };
  region?: MapboxContextBase & {
    region_code: string;
    region_code_full: string;
  };
  postcode?: MapboxContextBase;
  district?: MapboxContextBase;
  place?: MapboxContextBase;
  locality?: MapboxContextBase;
  neighborhood?: MapboxContextBase;
  address?: MapboxContextBase & {
    address_number: string;
    street_name: string;
  };
  street?: MapboxContextBase;
};

export type MapboxSuggestion = {
  name: string;
  name_preferred?: string;
  mapbox_id: string;
  feature_type: string;
  address?: string;
  full_address?: string;
  place_formatted: string;
  context: MapboxContext;
  language: string;
  maki?: string;
  poi_category?: string[];
  poi_category_ids?: string[];
};

type MapboxRoutablePoint = {
  name: string;
  latitude: number;
  longitude: number;
};

export type MapboxFeature = {
  type: string;
  geometry: {
    coordinates: number[],
    type: string
  };
  properties: MapboxSuggestion & {
    coordinates: {
      latitude: number,
      longitude: number,
      accuracy?: string,
      routable_points?: MapboxRoutablePoint[]
    },
  };
};
