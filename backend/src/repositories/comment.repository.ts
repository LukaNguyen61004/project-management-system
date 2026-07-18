import prisma from "../lib/prisma.js"
import type { CreateCommentInput, UpdateCommentInput } from "../validations/comment.validation.js"

export const createComment = async (issueId: number, userId: number, data: CreateCommentInput) => {
    return prisma.comment.create({
        data: {
            issue_id: issueId,
            user_id: userId,
            content: data.content
        }
    })

};

export const getCommentById = async (commentId: number) => {
    return prisma.comment.findUnique({
        where: {
            comment_id: commentId
        },
        include: {
            user: {
                select: {
                    user_id:true,
                    user_name:true,
                    user_avatar_url:true,
                }
            }
        }
    })
}

export const getIssueComments = async (issueId: number) => {
    return prisma.comment.findMany({
        where: {
            issue_id: issueId,
        },
        include :{
            user:{
                select:{
                    user_id:true,
                    user_name:true,
                    user_avatar_url:true,
                }
            }

        },
        orderBy: {
            created_at:"asc",
        }
    })
}

export const getCommentByIssueId = async (issueId: number, commentId: number,)=>{
    return prisma.comment.findFirst({
        where:{
            comment_id: commentId,
            issue_id: issueId
        }
    })
}

export const updateComment = async (commentId: number, data: UpdateCommentInput) => {
    return prisma.comment.update({
        where: {
            comment_id: commentId,
        }, 
        data,
    })
}

export const deleteComment = async( commentId: number)=>{
    return prisma.comment.delete({
        where:{
            comment_id: commentId,
        }
    })
}

