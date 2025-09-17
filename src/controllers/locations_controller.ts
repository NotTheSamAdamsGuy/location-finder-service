import { Request, Response } from "express";

import * as locationsService from "../services/locations_service.ts";
import * as geolocationService from "../services/geolocation_service.ts";
import { Coordinates, Image, ControllerReply } from "../types.ts";

export type LocationControllerReply = ControllerReply & {
  result?: Location | Location[] | string | null;
};

export const getAllLocations = async () => {
  const data = await locationsService.getAllLocations();
  return { result: data.result } as LocationControllerReply;
};

export const getLocation = async (req: Request, res: Response) => {
  const locationId = req.params.locationId;
  const data = await locationsService.getLocation(locationId);
  return { result: data.result } as LocationControllerReply;
};

export const getNearbyLocations = async (req: Request, res: Response) => {
  const latitude = parseFloat(req.query.latitude as string);
  const longitude = parseFloat(req.query.longitude as string);
  const radius = parseFloat(req.query.radius as string);
  const unitOfDistance: any = req.query.unitOfDistance;
  const sort: any = req.query.sort;

  const data = await locationsService.getNearbyLocations({
    latitude,
    longitude,
    radius,
    unitOfDistance,
    sort,
  });

  return { result: data.result } as LocationControllerReply
};

export const addLocation = async (req: Request, res: Response) => {
  const name = req.body.name;
  const streetAddress = req.body.streetAddress;
  const city = req.body.city;
  const state = req.body.state;
  const zip = req.body.zip;
  const description = req.body.description || "";
  const multerStorageType = process.env.MULTER_STORAGE_TYPE;
  const files = req.files as Express.Multer.File[] | Express.MulterS3.File[];

  let imageDescriptions: string[] = [];

  if (req.body.imageDescription) {
    if (Array.isArray(req.body.imageDescription)) {
      imageDescriptions = req.body.imageDescription;
    } else {
      imageDescriptions = [req.body.imageDescription];
    }
  }

  let tags: string[] = [];

  if (req.body.tag) {
    if (Array.isArray(req.body.tag)) {
      tags = req.body.tag;
    } else {
      tags = [req.body.tag];
    }
  }

  const images: Image[] = files?.map((file, index) => {
    let image: Image = {
      originalFilename: "",
      filename: "",
    };

    if (multerStorageType === "s3") {
      const tempFile = file as Express.MulterS3.File;
      image.originalFilename = tempFile.originalname;
      image.filename = tempFile.key;
    } else {
      image.originalFilename = file.originalname;
      image.filename = file.filename;
    }

    if (imageDescriptions[index] && imageDescriptions[index] !== "") {
      image.description = imageDescriptions[index];
    }

    return image;
  });

  let coordinates: Coordinates = {
    latitude: -1,
    longitude: -1,
  };

  try {
    const geoServiceReply = await geolocationService.getCoordinates({
      streetAddress: streetAddress,
      city: city,
      state: state,
      zip: zip,
    });
    coordinates = geoServiceReply.result;
  } catch (err: any) {
    throw new Error("Unable to fetch coordinates data", err);
  }
  
  const locationServiceReply = await locationsService.addLocation({
    name: name,
    streetAddress: streetAddress,
    city: city,
    state: state,
    zip: zip,
    description: description,
    images: images,
    coordinates: coordinates,
    tags: tags,
  });

  return { result: locationServiceReply.result } as LocationControllerReply;
};
