import { GoogleGenerativeAI } from "@google/generative-ai";
import { SprintStatus } from "@prisma/client";
import { env } from "../config/env.js";
import { buildSprintSummaryData } from "../helper/sprint-summary.helper.js";
import { findProjectMember } from "../repositories/project.repository.js";
import { findSprintById, getSprintIssues } from "../repositories/sprint.repository.js";
import prisma from "../lib/prisma.js";

export const summarizeSprintService = async (
    sprintId: number,
    userId: number
) => {
    const sprint = await findSprintById(sprintId);
    if (!sprint) throw new Error("Sprint not found");

    const member = await findProjectMember(sprint.project_id, userId);
    if (!member) throw new Error("You are not a member of this project");

    if (sprint.sprint_status !== SprintStatus.completed) {
        throw new Error("Sprint must be completed before generating summary");
    }

    // Đã có summary → trả lại, không gọi AI lại
    if (sprint.sprint_summary) {
        const issues = await getSprintIssues(sprintId);
        const summaryData = buildSprintSummaryData(sprint, issues);
        return { stats: summaryData.stats, summary: sprint.sprint_summary, cached: true };
    }

    const issues = await getSprintIssues(sprintId);
    const summaryData = buildSprintSummaryData(sprint, issues);

    // Sprint không có issue
    if (issues.length === 0) {
        const summary = "Sprint này không có issue nào.";
        await prisma.sprint.update({
            where: { sprint_id: sprintId },
            data: { sprint_summary: summary, sprint_summary_created_at: new Date() },
        });
        return { stats: summaryData.stats, summary, cached: false };
    }

    if (!env.GEMINI_API_KEY) {
        throw new Error("AI is not configured (missing GEMINI_API_KEY)");
    }

    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Bạn là Scrum Master. Dựa trên dữ liệu sprint sau, viết tóm tắt bằng tiếng Việt dạng markdown.

DỮ LIỆU (đã tính sẵn, KHÔNG tự đếm lại):
${JSON.stringify(summaryData, null, 2)}

CẤU TRÚC BẮT BUỘC:
## Tổng quan
## Đã hoàn thành
## Chưa hoàn thành
## Điểm đáng chú ý
## Gợi ý cho sprint tiếp theo

Quy tắc:
- Dùng đúng số liệu trong stats
- Liệt kê issue bằng key (vd: PROJ-3)
- Ngắn gọn, tối đa 300 từ
- Không bịa thêm issue không có trong dữ liệu`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    await prisma.sprint.update({
        where: { sprint_id: sprintId },
        data: {
            sprint_summary: summary,
            sprint_summary_created_at: new Date(),
        },
    });

    return { stats: summaryData.stats, summary, cached: false };
};