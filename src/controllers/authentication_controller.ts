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

export const generateTokens = async (req: Request, res: Response) => {
  const { username } = req.body;

  try {
    const response = await authenticationService.generateTokens(
      username
    );
    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const refreshTokens = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  try {
    const response = await authenticationService.refreshTokens(refreshToken);
    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ error: err });
  }
}
