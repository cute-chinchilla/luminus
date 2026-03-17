import { Resend } from 'resend';

export interface EmailData {
    name: string;
    phone: string;
    message: string;
}

export async function sendContactEmail(env: any, data: EmailData) {
    const resend = new Resend(env.RESEND_API_KEY);

    const { name, phone, message } = data;
    const fromEmail = env.RESEND_FROM_EMAIL || 'noreply@luminus-clinic.com';
    const adminEmail = env.ADMIN_EMAIL;

    if (!adminEmail) {
        throw new Error('ADMIN_EMAIL is not defined');
    }

    return await resend.emails.send({
        from: `LUMINUS Contact <${fromEmail}>`,
        to: [adminEmail],
        subject: `[문의] ${name}님의 상담 신청입니다.`,
        html: `
      <h2>새로운 상담 신청 내역</h2>
      <p><strong>이름:</strong> ${name}</p>
      <p><strong>연락처:</strong> ${phone}</p>
      <p><strong>문의내용:</strong></p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">
        ${message}
      </div>
      <p style="color: #888; font-size: 12px; margin-top: 20px;">
        본 메일은 루미너스의원 웹사이트 예약/문의 폼을 통해 자동 발송되었습니다.
      </p>
    `,
    });
}
