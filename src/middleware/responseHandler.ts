import { Response } from "express";

export const sendSuccess = (res: Response, data: unknown) => {
  res.status(200).json(data);
};
