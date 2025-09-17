import { Request, Response } from "express";

import * as geolocationService from "../services/geolocation_service.ts";

export const getAddress = async (req: Request, res: Response) => {
  const longitude = parseFloat(req.query.longitude as string);
  const latitude = parseFloat(req.query.latitude as string);

  try {
    const geoReply = await geolocationService.getAddress({longitude, latitude});
    return { result: geoReply.result };
  } catch (err: any) {
    throw new Error("Unable to fetch coordinates data", err);
  }
};