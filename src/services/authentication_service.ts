import * as usersService from "../services/users_service.ts";
import jwt, { JwtPayload } from "jsonwebtoken";

import { User } from "../types.ts";
import { config } from "../../config.ts";

/**
 * Generate a JWT token for valid username and password combinations.
 * @param {string} username - a username string
 * @param {string} role - a role string
 * @returns {string} - a JWT token string
 */
export const generateToken = async (username: string, role: string) => {
  const user: User | null = await usersService.getUserByUsername(username);

  if (user) {
    const secretKey: jwt.Secret = config.secrets.jwtSecretKey as jwt.Secret;
    const payload: JwtPayload = {
      username: username,
      role: role
    };
    const options: jwt.SignOptions = {
      expiresIn: parseInt(process.env.JWT_TOKEN_EXPIRATION_TIME_SECONDS as string),
    };

    const token = jwt.sign(payload, secretKey, options);

    return token;
  } else {
    throw new Error("Invalid user");
  }
};