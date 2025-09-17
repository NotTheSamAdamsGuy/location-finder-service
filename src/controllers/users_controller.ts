import { Request, Response } from "express";

import * as userService from "../services/users_service.ts";
import { logger } from "../logging/logger.ts";
import { ControllerReply, UserProfile } from "../types.ts";

type UserProfileControllerReply = ControllerReply & {
  result: UserProfile | null;
}

export const getUserProfile = async (req: Request, res: Response): Promise<UserProfileControllerReply>=> {
  const data = await userService.getUserProfile(req.params.username);
  return { result: data.result };
}