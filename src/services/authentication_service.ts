import * as usersService from "../services/users_service.ts";
import { SignJWT, jwtVerify } from "jose";

import { User, SessionPayload, ServiceReply } from "../types.ts";
import { config } from "../../config.ts";

type AuthenticationServiceReply = ServiceReply & {
  result: string;
}

const secretKey = config.secrets.jwtSecretKey;
const encodedKey = new TextEncoder().encode(secretKey);

/**
 * Generate a JWT token for valid username and password combinations.
 * @param {string} username - a username string
 * @param {string} role - a role string
 * @returns {string} - a JWT token string
 */
export const generateToken = async (username: string, role: string): Promise<AuthenticationServiceReply> => {
  const user: User | null = await usersService.getUserByUsername(username);

  if (user) {
    const payload: SessionPayload = {
      username: username,
      role: role,
    };

    const token = await encrypt(payload);

    return { success: true, result: token };
  } else {
    throw new Error("Invalid user");
  }
};


export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${process.env.JWT_TOKEN_EXPIRATION_TIME_SECONDS}s`)
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.log("Failed to verify session");
  }
}