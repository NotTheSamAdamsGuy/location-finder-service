export type Address = { // used in geolocations controller, maybe service
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
  radius?: number;
  height?: number;
  width?: number;
  unitOfDistance: "m" | "km" | "ft" | "mi";
  sort: "ASC" | "DESC";
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
