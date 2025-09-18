import { Request, Response } from "express";

import * as authenticationService from "../services/authentication_service.ts";
import * as usersService from "../services/users_service.ts";
import { ControllerReply } from "../types.ts";

type AuthenticationControllerReply = ControllerReply & {
  result: string;
};

export const generateToken = async (
  req: Request,
  res: Response
): Promise<AuthenticationControllerReply> => {
  const { username } = req.body;
  const userServiceReply = await usersService.getUser(username);
  const user = userServiceReply.result;

  if (user === null || user.username !== username) {
    throw new Error("Invalid credentials");
  }

  const authServiceReply = await authenticationService.generateToken(
    username,
    user.role
  );
  const token = authServiceReply.result;

  return { result: token };
};
