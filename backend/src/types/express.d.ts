import { AuthJwtPayload } from "./jwt.type.ts";

declare global {
    namespace Express {
        interface Request {
            user?: AuthJwtPayload;
        }
    }
}

export{};