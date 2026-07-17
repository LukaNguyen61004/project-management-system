import { GoogleGenerativeAI } from "@google/generative-ai";
import { SprintStatus } from "@prisma/client";
import { env } from "../config/env.js";
import { buildSprintSummaryData } from "../helper/sprint-summary.helper.js";
import { findScheduleChangesForSprint } from "../repositories/activity.repository.js";
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

    // ---------- Cache: đã có summary → không gọi AI lại ----------
    if (sprint.sprint_summary) {
        const issues = await getSprintIssues(sprintId);
        const summaryData = buildSprintSummaryData(sprint, issues);
        const schedule_changes = await findScheduleChangesForSprint(
            sprint.project_id,
            sprintId,
            issues.map((i) => i.issue_id)
        );

        return {
            stats: summaryData.stats,
            member_progress: summaryData.member_progress,
            manager_stats: summaryData.manager_stats,
            schedule_changes,
            summary: sprint.sprint_summary,
            cached: true,
        };
    }

    const issues = await getSprintIssues(sprintId);
    const summaryData = buildSprintSummaryData(sprint, issues);

    // Query log đổi ngày / estimate — nằm ở repository
    const schedule_changes = await findScheduleChangesForSprint(
        sprint.project_id,
        sprintId,
        issues.map((i) => i.issue_id)
    );

    const payload = { ...summaryData, schedule_changes };

    // Sprint không có issue
    if (issues.length === 0) {
        const summary = "Sprint này không có issue nào.";
        await prisma.sprint.update({
            where: { sprint_id: sprintId },
            data: { sprint_summary: summary, sprint_summary_created_at: new Date() },
        });
        return {
            stats: summaryData.stats,
            member_progress: summaryData.member_progress,
            manager_stats: summaryData.manager_stats,
            schedule_changes,
            summary,
            cached: false,
        };
    }

    if (!env.GEMINI_API_KEY) {
        throw new Error("AI is not configured (missing GEMINI_API_KEY)");
    }

    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Bạn là Scrum Master viết báo cáo cho Manager. Tiếng Việt.

DỮ LIỆU (đã tính sẵn, KHÔNG tự đếm lại, KHÔNG bịa reason):
${JSON.stringify(payload, null, 2)}

CẤU TRÚC BẮT BUỘC (chỉ dùng heading ## như dưới, không thêm # tiêu đề khác):
## Highlight cho Manager
## Tổng quan
## Chưa hoàn thành
## Thay đổi lịch / estimate
## Gợi ý cho sprint tiếp theo

Quy tắc định dạng (BẮT BUỘC):
- KHÔNG viết "Kính gửi Manager" hay lời chào
- KHÔNG dùng bảng markdown (| ... | hoặc |:---)
- KHÔNG dùng **bold** và *italic*
- Mỗi ý một dòng, bắt đầu bằng "- " (gạch ngang + space), không dùng dấu *
- Không lặp lại bảng tiến độ member (UI đã có sẵn)
- Dùng đúng member_progress, manager_stats, schedule_changes
- Nếu schedule_changes rỗng → viết "Không có thay đổi được ghi nhận"
- Liệt kê issue bằng key (vd: PROJ-3)
- Tối đa ~550 từ
- Không bịa issue / reason không có trong dữ liệu`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    await prisma.sprint.update({
        where: { sprint_id: sprintId },
        data: {
            sprint_summary: summary,
            sprint_summary_created_at: new Date(),
        },
    });

    return {
        stats: summaryData.stats,
        member_progress: summaryData.member_progress,
        manager_stats: summaryData.manager_stats,
        schedule_changes,
        summary,
        cached: false,
    };
};
