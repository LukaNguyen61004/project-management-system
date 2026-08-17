import { GoogleGenerativeAI } from "@google/generative-ai";
import { SprintStatus } from "@prisma/client";
import { env } from "../config/env.js";
import { buildSprintSummaryData } from "../helper/sprint-summary.helper.js";
import { findScheduleChangesForSprint } from "../repositories/activity.repository.js";
import { findProjectMember } from "../repositories/project.repository.js";
import { findSprintById, getSprintIssues } from "../repositories/sprint.repository.js";
import prisma from "../lib/prisma.js";

const DATE_FIELDS = new Set(["start_date", "end_date", "due_date"]);

const toDDMMYYYY = (value: string | Date | null) => {
    if (!value) return value;
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${d.getUTCFullYear()}`;
};

// Format ngày trong schedule_changes sang DD/MM/YYYY trước khi đưa cho AI,
// tránh AI echo lại chuỗi ISO dài (2026-07-14T00:00:00.000Z)
const formatScheduleChanges = <
    T extends {
        field_name: string | null;
        old_value: string | null;
        new_value: string | null;
        created_at: Date;
    }
>(changes: T[]) =>
    changes.map((c) => {
        const isDateField = DATE_FIELDS.has(c.field_name ?? "");
        return {
            ...c,
            old_value: isDateField ? toDDMMYYYY(c.old_value) : c.old_value,
            new_value: isDateField ? toDDMMYYYY(c.new_value) : c.new_value,
            created_at: toDDMMYYYY(c.created_at),
        };
    });

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

    //  Cache: đã có summary → không gọi AI lại 
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

    const payload = { ...summaryData, schedule_changes: formatScheduleChanges(schedule_changes) };

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
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        // Giảm thinking để tránh response rỗng / timeout trên free tier
        generationConfig: {
            thinkingConfig: { thinkingBudget: 0 },
        } as object,
    });

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
- status = done nghĩa là ĐÃ hoàn thành, kể cả khi assignee = Unassigned
- unassigned_count chỉ là issue CHƯA done và chưa assign — KHÔNG gọi đó là "chưa hoàn thành" nếu issue đã done
- done_without_assignee_count chỉ là cảnh báo quy trình (done nhưng thiếu người nhận), KHÔNG đồng nghĩa chưa hoàn thành
- Nếu schedule_changes rỗng → viết "Không có thay đổi được ghi nhận"
- Liệt kê issue bằng key (vd: PROJ-3)
- Mọi ngày tháng PHẢI viết dạng DD/MM/YYYY (vd: 14/07/2026). TUYỆT ĐỐI KHÔNG viết dạng ISO như 2026-07-14T00:00:00.000Z
- Tối đa ~550 từ
- Không bịa issue / reason không có trong dữ liệu`;

    let summary: string;
    try {
        const result = await model.generateContent(prompt);
        summary = result.response.text()?.trim() ?? "";
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[ai] Gemini summarize failed:", msg);
        if (/429|quota|rate|resource.?exhausted/i.test(msg)) {
            throw new Error("AI quota exceeded. Try again later");
        }
        if (/API key|invalid|permission|403/i.test(msg)) {
            throw new Error("AI is not configured (missing GEMINI_API_KEY)");
        }
        throw new Error("AI failed to generate sprint summary");
    }

    if (!summary) {
        throw new Error("AI failed to generate sprint summary");
    }

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
