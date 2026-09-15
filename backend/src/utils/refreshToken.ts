import { createHash } from "crypto";

export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const ROTATION_GRACE_MS = 15_000;

export function hashRefreshToken(token: string){
    return createHash("sha256").update(token).digest("hex");
}