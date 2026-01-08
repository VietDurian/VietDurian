//Vo Lam Thuy Vi
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const hasCreds = !!(process.env.GMAIL_USER && process.env.GMAIL_PASS);

const transporter = hasCreds
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
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
        Object.entries(replacements).forEach(([k, v]) => {
            html = html.replace(new RegExp(`{{${k}}}`, "g"), String(v ?? ""));
        });
        return html;
    } catch {
        let html = fallbackHtml;
        Object.entries(replacements).forEach(([k, v]) => {
            html = html.replace(new RegExp(`{{${k}}}`, "g"), String(v ?? ""));
        });
        return html;
    }
}

async function sendPermissionStatusEmail({ name, email, status, role, reason }) {
    if (!hasCreds) {
        console.warn(
            `⚠️ Email không được gửi (thiếu GMAIL_USER/GMAIL_PASS). status=${status}, email=${email}`
        );
        return true;
    }

    const isApproved = status === "approved";
    const subject = isApproved
        ? "Yêu cầu nâng cấp tài khoản đã được chấp thuận"
        : "Yêu cầu nâng cấp tài khoản đã bị từ chối";

    const templateFile = isApproved
        ? "permission-approved.html"
        : "permission-rejected.html";

    const fallbackHtml = isApproved
        ? `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>Chúc mừng, {{name}}!</h2>
          <p>Yêu cầu nâng cấp tài khoản của bạn lên vai trò <strong>{{role}}</strong> đã được chấp thuận.</p>
          <p>Bạn có thể đăng nhập và sử dụng các tính năng tương ứng.</p>
        </body>
      </html>
    `
        : `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>Xin chào {{name}},</h2>
          <p>Rất tiếc, yêu cầu nâng cấp tài khoản của bạn lên vai trò <strong>{{role}}</strong> đã bị từ chối.</p>
          <p>Lý do: {{reason}}</p>
        </body>
      </html>
    `;

    const html = renderTemplate(templateFile, fallbackHtml, {
        name: name || "Người dùng",
        role: role || "",
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