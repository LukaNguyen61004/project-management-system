import type { JwtPayload } from "jsonwebtoken";

export interface AuthJwtPayload extends JwtPayload{
    userId: number;
    email: string;
    provider: string;
}

export interface RefreshJwtPayload extends JwtPayload {
  userId: number;
  familyId: string;
  jti: string;
}