import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";
import { generateRefreshToken } from "../utils/jwt.js";
import { hashRefreshToken, REFRESH_TOKEN_TTL_MS } from "../utils/refreshToken.js";

type Db = Prisma.TransactionClient | typeof prisma;

export const createRefreshToken = async (db: Db, userId: number, familyId: string) => {
    const id = randomUUID();
    const token = generateRefreshToken({userId, familyId}, id);

    await db.refreshToken.create({
        data:{
            id,
            user_id: userId,
            family_id: familyId,
            token_hash: hashRefreshToken(token),
            expires_at: new Date(Date.now()+ REFRESH_TOKEN_TTL_MS),
        }
    })
    
   return {token, id};
}

export const lockByTokenHash = async (tx: Prisma.TransactionClient, tokenHash: string)=>{
    await tx.$executeRaw `SELECT 1 FROM "RefreshToken" WHERE token_hash = ${tokenHash} FOR UPDATE`;

    return tx.refreshToken.findUnique({
        where: {
            token_hash: tokenHash
        }
    })
}

export const markReplaced = async (db: Db, oldId: string, newId: string ) =>{
  return db.refreshToken.update({
    where: {id: oldId},
    data: {
        replaced_by: newId,
        rotated_at: new Date(),
    }
  })
}

export  const  revokeAllForUser = async (db: Db, userId: number) => {
  return db.refreshToken.updateMany({
    where: { user_id: userId, revoked_at: null },
    data: { revoked_at: new Date() },
  });
}

export const revokeFamily = async (db: Db, familyId: string) => {
  return db.refreshToken.updateMany({
    where: { family_id: familyId, revoked_at: null },
    data: { revoked_at: new Date() },
  });
};