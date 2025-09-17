import { Request, Response } from "express";

import * as authenticationService from "../services/authentication_service.ts";
import * as usersService from "../services/users_service.ts";
import { ControllerReply, User } from "../types.ts";

type AuthenticationControllerReply = ControllerReply & {
  result: string;
}

export const generateToken = async (req: Request, res: Response): Promise<AuthenticationControllerReply> => {
  const {username, password} = req.body;
  const user: User | null = await usersService.getUserByUsername(username);
  
  if (user === null || (user.username !== username || user.password !== password)) {
    throw new Error("Invalid credentials");
  }

  const reply = await authenticationService.generateToken(username, user.role);
  const token = reply.result;

  return { result: token };
}