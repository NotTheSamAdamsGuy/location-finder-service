import { Request, Response } from "express";

import * as geolocationService from "../services/geolocation_service.ts";

export const getAddress = (req: Request, res: Response) => {
  const longitude = parseFloat(req.query.longitude as string);
  const latitude = parseFloat(req.query.latitude as string);

  return geolocationService.getAddress({longitude, latitude});
};