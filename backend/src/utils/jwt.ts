import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export const generateAccessToken = ( payload: object) => {
  return jwt.sign(
    payload,
    env.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

export const generateRefreshToken = (payload: object) => {
  return jwt.sign(
    payload,
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
};