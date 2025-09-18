import { Request, Response } from "express";

import * as userService from "../services/users_service.ts";
import { ControllerReply, UserProfile } from "../types.ts";

type UserProfileControllerReply = ControllerReply & {
  result: UserProfile | null;
};

export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<UserProfileControllerReply> => {
  const data = await userService.getUserProfile(req.params.username);
  return { result: data.result };
};

type CreateUserContollerReply = ControllerReply & {
  result: string;
};

export const createUser = async (
  req: Request,
  res: Response
): Promise<CreateUserContollerReply> => {
  const { username, password, firstName, lastName, role } = { ...req.body };
  const reply = await userService.createUser(username, password, firstName, lastName, role);
  return { result: reply.result };
};
