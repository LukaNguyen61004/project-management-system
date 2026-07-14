import type { Request, Response } from "express";
import { summarizeSprintService } from "../services/ai.service.js";
import { sendError } from "../helper/httpError.js";

export const summarizeSprintController = async (req: Request, res: Response) => {
  try {
    const sprintId = Number(req.params.sprintId);
    if (isNaN(sprintId)) {
      return sendError(res, new Error("Invalid sprint id"), 400);
    }

    const userId = req.user!.userId;
    const result = await summarizeSprintService(sprintId, userId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return sendError(res, error, 400);
  }
};
