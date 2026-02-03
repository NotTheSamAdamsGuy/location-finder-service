import * as usersService from "../services/users_service.ts";
import { SignJWT, jwtVerify } from "jose";
import { v4 as uuidv4 } from "uuid";

import {
  SessionPayload,
  ServiceReply,
  ServiceResponse,
  Tokens,
} from "../types.ts";
import { config } from "../../config.ts";
import { logger } from "../logging/logger.ts";
import * as sessionDao from "../daos/session_dao.ts";
import { User } from "@notthesamadamsguy/location-finder-types";
import { InternalServerError, UnauthorizedError } from "../utils/errors.ts";

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

const generateAccessToken = async (user: User) => {
  const { username, role } = user;
  const payload: SessionPayload = {
    username: username,
    role: role,
  };

  return await new SignJWT({ role: role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setSubject(username)
    .setExpirationTime(
      `${process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME_SECONDS}s`
    )
    .sign(encodedKey);
};

const generateRefreshToken = async (user: User) => {
  const refreshTokenId = uuidv4();
  return await new SignJWT({
    tokenId: refreshTokenId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setSubject(user.username)
    .setExpirationTime(`${process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME_DAYS}d`)
    .sign(encodedKey);
};

/** Generate JWT access and refresh tokens for valid username and password combinations.
 * @param {string} username a username string
 * @returns {ServiceResponse<Tokens>} an ServiceResponse object containing JWT access token and refresh token strings.
 */
export const generateTokens = async (
  username: string
): Promise<ServiceResponse<Tokens>> => {
  const response = await usersService.getUserNew(username);

  if (response.error) {
    throw new InternalServerError(
      `Unable to generate tokens: ${response.error}`
    );
  }

  const user = response.data;

  if (user) {
    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);
    const success = await sessionDao.insert(refreshToken, username);

    if (success) {
      return {
        status: "success",
        data: { accessToken: accessToken, refreshToken: refreshToken },
      };
    } else {
      throw new InternalServerError("Unable to save session data");
    }
  } else {
    throw new InternalServerError("Unable to retrieve user data");
  }
};

export const refreshTokens = async (
  refreshToken: string
): Promise<ServiceResponse<Tokens>> => {
  const payload = await decrypt(refreshToken);
  const userId = payload?.sub;
  const storedUserId = await sessionDao.get(refreshToken);

  if (!storedUserId || !userId || storedUserId !== userId) {
    throw new UnauthorizedError();
  }

  const response = await usersService.getUserNew(userId);

  if (response.error) {
    throw new InternalServerError(
      `Unable to generate tokens: ${response.error}`
    );
  }

  const user = response.data as User;
  const newAccessToken = await generateAccessToken(user);
  const newRefreshToken = await generateRefreshToken(user);

  return {
    status: "success",
    data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
  };
};

// TODO: remove this
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
