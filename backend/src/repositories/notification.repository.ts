import type { Prisma } from "@prisma/client"
import prisma from "../lib/prisma.js"
import type { CreateNotificationData } from "../types/notification.type.js"


export const getNotificationsByUser = async (receiverId: number)=>{
    return prisma.notification.findMany({
        where:{
            receiver_id: receiverId
        },
        include:{
            sender:{
                select:{
                    user_id:true,
                    user_name:true,
                    user_avatar_url:true,
                }
            },
           
        },
         orderBy:{
                notifi_created_at: "desc"
            }
    })
}

export const markAsRead = async (notifiId: number)=>{
    return prisma.notification.update({
        where:{
            notifi_id:notifiId
        },
        data:{
            is_read:true,
        }
    })
}

export const markAllAsRead = async (receiverId: number)=>{
    return prisma.notification.updateMany({
        where:{
            receiver_id: receiverId,
            is_read:false
        },
        data:{
            is_read: true
        }
    })
}

export const createNotification = async(data: CreateNotificationData)=>{
    return  prisma.notification.create({
        data
    })
}
