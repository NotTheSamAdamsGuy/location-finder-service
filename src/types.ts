export type Location = {
  id: string;
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  coordinates: Coordinates;
  description: string;
}

export type LocationHash = {
  id: string;
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  latitude: string;
  longitude: string;
  description: string;
}

export type Coordinates = {
  latitude: number;
  longitude: number;
};