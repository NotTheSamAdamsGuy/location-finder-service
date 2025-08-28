export type Location = {
  id: string;
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  coordinates: Coordinates;
  description: string;
  imageNames: string[];
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

export type User = {
  username: string;
  password: string | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  role: "USER" | "ADMIN";
  lastLoginTimestamp: number | undefined;
};

export type UserProfile = {
  username: string;
  firstName: string;
  lastName: string;
};
