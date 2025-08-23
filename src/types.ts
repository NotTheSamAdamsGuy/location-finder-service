export type Location = {
  id: string;
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
}

export type LocationHash = {
  id: string;
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  lat: string;
  lng: string;
  description: string;
}

export type GeoLocation = {
  latitude: number,
  longitude: number
};