import * as usersService from "../services/users_service.ts";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../types.ts";

/**
 * Generate a JWT token for valid username and password combinations.
 * @param {string} username - a username string
 * @param {string} role - a role string
 * @returns {string} - a JWT token string
 */
export const generateToken = async (username: string, role: string) => {
  const user: User | null = await usersService.getUserByUsername(username);

  if (user) {
    const secretKey: jwt.Secret = process.env.JWT_SECRET_KEY as jwt.Secret;
    const payload: JwtPayload = {
      username: username,
      role: role
    };
    const options: jwt.SignOptions = {
      expiresIn: parseInt(process.env.JWT_TOKEN_EXPIRATION_TIME_MILLISECONDS as string),
    };

    const token = jwt.sign(payload, secretKey, options);

    return token;
  } else {
    throw new Error("Invalid user");
  }
};