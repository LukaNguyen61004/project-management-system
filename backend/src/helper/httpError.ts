import type { Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";

// Map message nghiệp vụ → HTTP status 
const ERROR_STATUS_MAP: Record<string, number> = {
  "Project not found": 404,
  "Project not found or access denied": 404,
  "Issue not found": 404,
  "Sprint not found": 404,
  "Epic not found": 404,
  "User not found": 404,
  "Invitaion not found": 404,
  "Invitation not found": 404,

  "You are not a member of this project": 403,
  "You are not member of this project": 403,
  "Insufficient permissions": 403,
  "Only admin can update issue in sprint": 403,
  "Only project owner can delete": 403,
  "Cannot remove project owner": 403,
  " project owner cannot leave": 403,

  "Epic name already exists": 409,
  "Email already exist": 409,
  "Project key already exists": 409,
  "Sprint name duplicated": 409,
  "Invalid sprint status transition": 400,
  "Invitation already sent": 409,
  "User already in project": 409,

  "Invalid credentials": 401,
  "Invalid token": 401,
  "Invalid refresh token": 401,
  "Access token required": 401,
  "Invalid token format": 401,
  "Invalid or experied token": 401,
  "Unauthorized": 401,
  "This account uses Google login": 401,
  "This email uses password login": 401,
  "Invalid Google Account": 401,
  "Google login is not configured on this server": 401,

  "Epic does not belong to this project": 400,
  "Assignee is not a member of this project": 400,
  "No fields provided for update": 400,
  "Issue already has this status": 400,
  "Issue already had the same priority": 400,
  "Issue and sprint aren't in the same project": 400,
  "Issue is already moved to this sprint": 400,
  "Sprint must be completed before generating summary": 400,
  "Reason is required when changing due date or estimate": 400,
  "Reason is required when changing sprint dates": 400,
  "AI is not configured (missing GEMINI_API_KEY)": 400,
  "Refresh token required": 400,
  "Invitation already accepted": 400,
  "Invitation expired": 400,
  "Invalid account state": 400,
};

// Message được phép trả client trên production (4xx) 
const SAFE_CLIENT_MESSAGES = new Set([
  ...Object.keys(ERROR_STATUS_MAP),
  "Too many auth attempts. Please try again later.",
  "Too many AI requests. Please try again in a minute.",
  " Use leave project instead",
  "This invitation is not for your account",
  "User is not a project member",
  "Issue is already unassigned",
  "Issue is not assigned any sprint",
  "Issue already assigned to this user",
  "Invalid project id",
  "Invalid issue id",
  "Invalid sprint id",
]);

/**
 * Trả lỗi HTTP thống nhất.
 * - Zod → 400
 * - Message có trong ERROR_STATUS_MAP → dùng status map
 * - Không có → dùng fallbackStatus
 * - Production + 500/unknown → "Internal server error"
 */
export function sendError(
  res: Response,
  error: unknown,
  fallbackStatus = 500
) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: error.issues.map((i) => i.message).join(". "),
    });
  }

  const message =
    error instanceof Error ? error.message : "Unknown error";

  const status = ERROR_STATUS_MAP[message] ?? fallbackStatus;

  if (env.NODE_ENV !== "production") {
    return res.status(status).json({ error: message });
  }

  if (status < 500 && SAFE_CLIENT_MESSAGES.has(message)) {
    return res.status(status).json({ error: message });
  }

  console.error("[ERROR]", error);
  return res.status(status >= 500 ? status : 500).json({
    error: "Internal server error",
  });
}
