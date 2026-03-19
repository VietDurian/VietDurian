// Vo Lam Thuy Vi
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const hasCreds = !!(process.env.GMAIL_USER && process.env.GMAIL_PASS);

const transporter = hasCreds
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    })
    : null;

function renderTemplate(templateFile, fallbackHtml, replacements) {
    try {
        const templatePath = path.join(
            __dirname,
            "..",
            "views",
            "email-templates",
            templateFile
        );

        let html = fs.readFileSync(templatePath, "utf8");

        Object.entries(replacements).forEach(([key, value]) => {
            html = html.replace(new RegExp(`{{${key}}}`, "g"), String(value ?? ""));
        });

        return html;
    } catch {
        let html = fallbackHtml;

        Object.entries(replacements).forEach(([key, value]) => {
            html = html.replace(new RegExp(`{{${key}}}`, "g"), String(value ?? ""));
        });

        return html;
    }
}

function getStatusEmailContent({ name, status, reason }) {
    const isApproved = status === "approved";

    const subject = isApproved
        ? "Hồ sơ CCCD của bạn đã được xác minh"
        : "Hồ sơ CCCD của bạn đã bị từ chối";

    const templateFile = isApproved
        ? "cccd-approved.html"
        : "cccd-rejected.html";

    const fallbackHtml = isApproved
        ? `
      <!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Hồ sơ CCCD đã được xác minh</title>
        </head>
        <body style="margin:0;padding:0;background:#f4f7f5;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
          <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
            <div style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.06);border:1px solid #e5e7eb;">
              <div style="background:linear-gradient(135deg,#14532d,#1f7a4c);padding:28px 24px;text-align:center;">
                <h1 style="margin:0;font-size:24px;line-height:1.4;color:#ffffff;font-weight:700;">
                  Hồ sơ CCCD đã được xác minh
                </h1>
              </div>

              <div style="padding:32px 24px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
                  Xin chào <strong>{{name}}</strong>,
                </p>

                <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
                  Hồ sơ CCCD và giấy tờ xác minh mà bạn đã gửi lên hệ thống đã được
                  <strong style="color:#166534;">xác minh thành công</strong>.
                </p>

                <div style="margin:20px 0;padding:16px 18px;background:#ecfdf3;border:1px solid #bbf7d0;border-radius:14px;">
                  <p style="margin:0;font-size:15px;line-height:1.7;color:#166534;">
                    Trạng thái hồ sơ: <strong>Approved</strong>
                  </p>
                </div>

                <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4b5563;">
                  Bạn có thể tiếp tục sử dụng hệ thống như bình thường. Nếu cần cập nhật lại giấy tờ trong tương lai, vui lòng thực hiện theo hướng dẫn trong ứng dụng.
                </p>

                <p style="margin:24px 0 0;font-size:15px;line-height:1.7;">
                  Trân trọng,<br />
                  <strong>VietDurian Team</strong>
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
        : `
      <!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Hồ sơ CCCD bị từ chối</title>
        </head>
        <body style="margin:0;padding:0;background:#f8f5f5;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
          <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
            <div style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.06);border:1px solid #e5e7eb;">
              <div style="background:linear-gradient(135deg,#b91c1c,#dc2626);padding:28px 24px;text-align:center;">
                <h1 style="margin:0;font-size:24px;line-height:1.4;color:#ffffff;font-weight:700;">
                  Hồ sơ CCCD chưa được chấp thuận
                </h1>
              </div>

              <div style="padding:32px 24px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
                  Xin chào <strong>{{name}}</strong>,
                </p>

                <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
                  Hồ sơ CCCD và giấy tờ xác minh mà bạn đã gửi hiện
                  <strong style="color:#b91c1c;">chưa được chấp thuận</strong>.
                </p>

                <div style="margin:20px 0;padding:16px 18px;background:#fef2f2;border:1px solid #fecaca;border-radius:14px;">
                  <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#991b1b;">
                    Trạng thái hồ sơ: <strong>Rejected</strong>
                  </p>
                  <p style="margin:0;font-size:15px;line-height:1.7;color:#991b1b;">
                    Lý do: {{reason}}
                  </p>
                </div>

                <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4b5563;">
                  Vui lòng kiểm tra lại ảnh CCCD, mặt trước, mặt sau hoặc giấy tờ bổ sung và gửi lại hồ sơ mới nếu cần.
                </p>

                <p style="margin:24px 0 0;font-size:15px;line-height:1.7;">
                  Trân trọng,<br />
                  <strong>VietDurian Team</strong>
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    return { subject, templateFile, fallbackHtml };
}

async function sendPermissionStatusEmail({ name, email, status, reason }) {
    if (!hasCreds) {
        console.warn(
            `⚠️ Email không được gửi (thiếu GMAIL_USER/GMAIL_PASS). status=${status}, email=${email}`
        );
        return true;
    }

    const safeStatus = status === "approved" ? "approved" : "rejected";

    const { subject, templateFile, fallbackHtml } = getStatusEmailContent({
        name,
        status: safeStatus,
        reason,
    });

    const html = renderTemplate(templateFile, fallbackHtml, {
        name: name || "Người dùng",
        reason: reason || "Không có lý do cụ thể",
    });

    await transporter.sendMail({
        from: process.env.GMAIL_USER || "noreply@vietdurian.com",
        to: email,
        subject,
        html,
    });

    return true;
}

const emailService = { sendPermissionStatusEmail };

module.exports = { emailService };