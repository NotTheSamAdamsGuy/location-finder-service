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
}

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
}

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

export type SessionPayload = {
  username: string;
  role: string;
};

export type ServiceReply = {
  success: boolean;
  message?: string;
  result: unknown;
};

export type ControllerReply = {
  message?: string;
  result?: unknown;
}