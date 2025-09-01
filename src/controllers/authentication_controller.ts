import { Request, Response } from "express";

import * as authenticationService from "../services/authentication_service.ts";
import * as usersService from "../services/users_service.ts";
import { User } from "../types.ts";

export const generateToken = async (req: Request, res: Response) => {
  const {username, password} = req.body;
  const user: User | null = await usersService.getUserByUsername(username);
  
  if (user === null || (user.username !== username || user.password !== password)) {
    throw new Error("Invalid credentials");
  }

  return authenticationService.generateToken(username, user.role);
}