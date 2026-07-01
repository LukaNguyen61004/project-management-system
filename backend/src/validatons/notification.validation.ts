import {z} from "zod";
export const notificationSchema = z.object({
    notifi_id: z
       .coerce
       .number()
       .int()
       .positive()
})