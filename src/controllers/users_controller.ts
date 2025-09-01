import { Request, Response } from "express";

import * as userService from "../services/users_service.ts";
import { logger } from "../logging/logger.ts";

export const getUserProfile = async (req: Request, res: Response) => {
  return await userService.getUserProfile(req.params.username);
}