import type { Request, Response } from "express";
import { summarizeSprintService } from "../services/ai.service.js";

export const summarizeSprintController = async (req: Request, res: Response) => {
  try {
    const sprintId = Number(req.params.sprintId);
    if (isNaN(sprintId)) {
      return res.status(400).json({ success: false, error: "Invalid sprint id" });
    }

    const userId = req.user!.userId;
    const result = await summarizeSprintService(sprintId, userId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};