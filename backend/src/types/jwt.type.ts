import type { JwtPayload } from "jsonwebtoken";

export interface AuthJwtPayload extends JwtPayload{
    userId: number;
    email: string;
    provider: string;
}