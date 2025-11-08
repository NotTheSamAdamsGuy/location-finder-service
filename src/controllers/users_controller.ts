import { Request, Response } from "express";
import { UserProfile } from "@notthesamadamsguy/location-finder-types";

import * as userService from "../services/users_service.ts";
import { ControllerReply } from "../types.ts";

type UserProfileControllerReply = ControllerReply & {
  result: UserProfile | null;
};

type UsernamesControllerReply = ControllerReply & {
  result: string[];
};

export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<UserProfileControllerReply> => {
  const data = await userService.getUserProfile(req.params.username);
  return { result: data.result };
};

export const getAllUsernames = async (): Promise<UsernamesControllerReply> => {
  const reply = await userService.getAllUsernames();
  return { result: reply.result as string[] };
};

type CreateUserContollerReply = ControllerReply & {
  result: string;
};

export const createUser = async (
  req: Request,
  res: Response
): Promise<CreateUserContollerReply> => {
  const { username, password, firstName, lastName, role } = { ...req.body };
  const reply = await userService.createUser(
    username,
    password,
    firstName,
    lastName,
    role
  );
  return { result: reply.result };
};

type UpdateControllerReply = ControllerReply & {
  success: boolean;
  result?: string;
};
export const updateUser = async (
  req: Request
): Promise<UpdateControllerReply> => {
  const username: string = req.body.username;
  const password: string = req.body.password;
  const firstName: string = req.body.firstName;
  const lastName: string = req.body.lastName;
  const role: string = req.body.role;
  const newPassword: string = req.body.newPassword;

  // update the password if the user provided a new one
  const passwordToSubmit =
    password && newPassword && newPassword !== password
      ? newPassword
      : password;

  const reply = await userService.updateUser(
    username,
    passwordToSubmit,
    firstName,
    lastName,
    role
  );

  if (reply.success) {
    return { success: reply.success };
  } else {
    return { success: false, message: "Internal error" };
  }
};

type RemoveControllerReply = ControllerReply & {
  success: boolean;
  result?: string;
};

/**
 * Remove a user from the database.
 * @param {Express.Request} req
 * @returns {Promise<RemoveControllerReply>}
 */
export const removeUser = async (req: Request): Promise<RemoveControllerReply> => {
  const username = req.params.username;
  const reply = await userService.removeUser(username);
  
  if (reply.success) {
    return { success: reply.success };
  } else {
    return { success: false, message: "Internal error" };
  }
};
