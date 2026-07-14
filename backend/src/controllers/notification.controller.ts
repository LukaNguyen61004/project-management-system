import type { Request, Response } from "express";
import { getNotificationsService, markAsReadService, markAllAsReadService } from "../services/notification.service.js";
import { sendError } from "../helper/httpError.js";

export const getNotificationsController = async (req: Request, res: Response) => {
    try {
        const receiverId = req.user!.userId;
        const notifications = await getNotificationsService(receiverId);

        return res.status(200).json({
            message: "Notifications retrieved successfully",
            data: notifications,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

export const markAsReadController = async (req: Request, res: Response) => {
    try {
        const notificationId = Number(req.params.notifiId);
        const notification = await markAsReadService(notificationId);

        return res.status(200).json({
            message: "Notification marked as read successfully",
            data: notification,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

export const markAllAsReadController = async (req: Request, res: Response) => {
    try {
        const receiverId = req.user!.userId;
        await markAllAsReadService(receiverId);

        return res.status(200).json({
            message: "All notifications marked as read successfully",
        });
    } catch (error) {
        return sendError(res, error);
    }
};
