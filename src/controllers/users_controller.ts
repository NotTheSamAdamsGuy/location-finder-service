import { Request, Response } from "express";

import * as userService from "../services/users_service.ts";
import { logger } from "../logging/logger.ts";

export const getUserProfile = async (req: Request, res: Response) => {
  const data = await userService.getUserProfile(req.params.username);
  return { result: data.result };
}