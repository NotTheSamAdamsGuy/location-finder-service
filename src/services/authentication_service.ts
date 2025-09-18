import * as usersService from "../services/users_service.ts";
import { SignJWT, jwtVerify } from "jose";

import { SessionPayload, ServiceReply } from "../types.ts";
import { config } from "../../config.ts";
import { logger } from "../logging/logger.ts";

type AuthenticationServiceReply = ServiceReply & {
  result: string;
};

const secretKey = config.secrets.jwtSecretKey;
const encodedKey = new TextEncoder().encode(secretKey);

/**
 * Generate a JWT token for valid username and password combinations.
 * @param {string} username - a username string
 * @param {string} role - a role string
 * @returns {string} - a JWT token string
 */
export const generateToken = async (
  username: string,
  role: string
): Promise<AuthenticationServiceReply> => {
  const userServiceReply = await usersService.getUser(username);
  const user = userServiceReply.result;

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
    logger.error("Failed to verify session");
  }
}

export async function getRole(session: string) {
  try {
    const payload = await decrypt(session);

    if (payload) {
      return payload.role;
    } else {
      throw new Error("Empty session payload");
    }
  } catch (err) {
    logger.error(err);
  }
}