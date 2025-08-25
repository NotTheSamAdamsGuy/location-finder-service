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
}

export type Coordinates = {
  latitude: number;
  longitude: number;
};