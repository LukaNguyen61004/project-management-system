import type { Response } from "express";
import { env } from "../config/env.js";
import { REFRESH_TOKEN_TTL_MS } from "./refreshToken.js";

const isProd = env.NODE_ENV === "production";

export function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,         
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_TTL_MS
  });
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });
}