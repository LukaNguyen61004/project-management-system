import { Resend } from "resend";
import { env } from "../config/env.js";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

// Lay URL dau tien trong danh sach CORS lam link trong email
const firstUrl = (process.env.FRONTEND_URLS ?? "").split(",")[0]?.trim();
const frontendUrl = firstUrl || "http://localhost:5173";

export const sendInviteEmail = async (
    to: string,
    token: string,
    projectName: string
) => {
    // Chua config Resend thi bo qua, khong chan flow invite
    if (!resend) return;

    const inviteUrl = `${frontendUrl}/invite?token=${token}`;

    await resend.emails.send({
        from: "PMS <onboarding@resend.dev>",
        to,
        subject: `Bạn được mời tham gia project "${projectName}"`,
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                <h2 style="color:#0052cc;">Lời mời tham gia project</h2>
                <p>Bạn được mời tham gia project <b>${projectName}</b>.</p>
                <p>Nếu chưa có tài khoản, hãy đăng ký bằng chính email này, sau đó bấm nút bên dưới:</p>
                <a href="${inviteUrl}"
                   style="display:inline-block;background:#0052cc;color:#fff;
                          padding:10px 20px;border-radius:4px;text-decoration:none;">
                    Tham gia project
                </a>
                <p style="color:#888;font-size:12px;margin-top:16px;">
                    Link có hiệu lực trong 7 ngày. Nếu bạn không mong đợi email này, hãy bỏ qua.
                </p>
            </div>
        `,
    });
};