import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

const createTransporter = () => {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    if (!emailUser || !emailPass) {
        console.warn('EMAIL_USER or EMAIL_PASS not set. Using dev mode.');
        return null;
    }
    
    const emailHost = process.env.EMAIL_HOST || 'smtp.sendgrid.net';
    const emailPort = Number(process.env.EMAIL_PORT) || 587;
    const requireTLS = process.env.EMAIL_REQUIRE_TLS === 'true';

    return nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailPort === 465,
        requireTLS,
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });
};

const getPasswordResetTemplate = (resetUrl, userName) => {
    return {
        subject: 'StudLink — відновлення пароля',
        html: `
            <!DOCTYPE html>
            <html lang="uk">
            <head>
                <meta charset="utf-8" />
                <style>
                    body { margin: 0; padding: 40px 0; font-family: 'Inter', Arial, sans-serif; background: #0f172a; color: #111827; }
                    .wrapper { max-width: 640px; margin: 0 auto; background: #0b1220; border-radius: 28px; overflow: hidden; border: 1px solid rgba(148, 163, 184, 0.2); box-shadow: 0 18px 60px rgba(15, 23, 42, 0.45); }
                    .header { background: radial-gradient(circle at 0% 0%, rgba(59,130,246,0.45), transparent), radial-gradient(circle at 100% 0%, rgba(147,51,234,0.45), transparent), radial-gradient(circle at 50% 100%, rgba(14,165,233,0.35), transparent); padding: 48px 56px; text-align: left; color: #f8fafc; position: relative; }
                    .header h1 { margin: 0 0 8px; font-size: 30px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
                    .header p { margin: 0; font-size: 16px; opacity: 0.85; }
                    .content { padding: 48px 56px; background: linear-gradient(180deg, rgba(15,23,42,0.6) 0%, rgba(15,23,42,0.95) 100%); color: #e2e8f0; line-height: 1.7; }
                    .content h2 { margin-top: 0; font-size: 24px; font-weight: 600; color: #f1f5f9; }
                    .button { display: inline-block; margin: 32px 0; padding: 16px 40px; border-radius: 999px; background: linear-gradient(135deg, #2563eb, #7c3aed); color: #f8fafc !important; font-weight: 600; text-decoration: none; letter-spacing: 0.04em; box-shadow: 0 18px 30px rgba(79, 70, 229, 0.35); }
                    .info { margin-top: 32px; padding: 24px; border-radius: 20px; background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(148, 163, 184, 0.25); }
                    .info p { margin: 0; font-size: 15px; color: #cbd5f5; }
                    .footer { padding: 32px 56px 40px; background: #050b17; text-align: center; color: #64748b; font-size: 13px; border-top: 1px solid rgba(148, 163, 184, 0.12); letter-spacing: 0.03em; }
                    @media (max-width: 680px) {
                        body { padding: 24px 0; }
                        .wrapper { margin: 0 16px; border-radius: 22px; }
                        .header, .content, .footer { padding: 32px 28px; }
                        .button { width: 100%; text-align: center; }
                    }
                </style>
            </head>
            <body>
                <div class="wrapper">
                    <div class="header">
                        <h1>StudLink</h1>
                        <p>Відновлення доступу до акаунта</p>
                    </div>
                    <div class="content">
                        <h2>Привіт${userName ? `, ${userName}` : ''}!</h2>
                        <p>Ми отримали запит на скидання пароля до твого акаунта StudLink. Щоб встановити новий пароль, натисни на кнопку нижче.</p>
                        <p>Посилання залишатиметься активним протягом <strong>60 хвилин</strong> з моменту отримання листа.</p>
                        <a href="${resetUrl}" class="button" target="_blank" rel="noopener">Відновити пароль</a>
                        <div class="info">
                            <p><strong>Не робив(ла) цей запит?</strong><br />Просто проігноруй лист — доступ до акаунта не зміниться.</p>
                        </div>
                    </div>
                    <div class="footer">
                        © ${new Date().getFullYear()} StudLink · Разом будуємо сильну студентську спільноту
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
StudLink — відновлення пароля

Привіт${userName ? `, ${userName}` : ''}!

Ми отримали запит на скидання пароля до твого акаунта StudLink.

Перейди за посиланням (діє 60 хвилин):
${resetUrl}

Якщо ти не запитував(ла) відновлення, просто проігноруй цей лист — нічого не зміниться.

© ${new Date().getFullYear()} StudLink
        `
    };
};

export const sendPasswordResetEmail = async (email, resetUrl, userName) => {
    try {
        const transporter = createTransporter();
        
        if (!transporter) {
            return await sendPasswordResetEmailDev(email, resetUrl, userName);
        }
        
        const template = getPasswordResetTemplate(resetUrl, userName);
        
        const fromAddress = process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER;
        const fromName = process.env.EMAIL_FROM_NAME || 'StudLink';

        const mailOptions = {
            from: `"${fromName}" <${fromAddress}>`,
            to: email,
            ...template
        };
        
        const result = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        console.log('Falling back to dev mode...');
        return await sendPasswordResetEmailDev(email, resetUrl, userName);
    }
};

export const sendPasswordResetEmailDev = async (email, resetUrl, userName) => {
    console.log('\n=== PASSWORD RESET EMAIL (DEV MODE) ===');
    console.log('To:', email);
    console.log('Subject: Відновлення пароля - StudLink');
    console.log('Reset URL:', resetUrl);
    console.log('User:', userName);
    console.log('=====================================\n');
    
    return { success: true, messageId: 'dev-mode' };
};

const getVerificationCodeTemplate = (code, type = 'login') => {
    const typeText = type === 'login' ? 'входу в систему' : 'підтвердження профілю';
    return {
        subject: `StudLink — код для ${typeText}`,
        html: `
            <!DOCTYPE html>
            <html lang="uk">
            <head>
                <meta charset="utf-8" />
                <style>
                    body { margin: 0; font-family: 'Inter', Arial, sans-serif; background: #020617; color: #e2e8f0; }
                    .wrapper { max-width: 460px; margin: 24px auto; background: radial-gradient(circle at top, rgba(37,99,235,0.3), rgba(15,23,42,0.95)); border-radius: 24px; padding: 36px 40px 44px; box-shadow: 0 18px 48px rgba(15, 23, 42, 0.5); border: 1px solid rgba(148,163,184,0.25); text-align: center; }
                    h1 { margin: 0; font-size: 26px; letter-spacing: 0.08em; text-transform: uppercase; color: #f8fafc; }
                    p { margin: 16px 0; font-size: 15px; color: #cbd5f5; }
                    .code { margin: 32px auto 24px; display: inline-block; padding: 18px 28px; border-radius: 18px; background: rgba(15,23,42,0.85); border: 1px solid rgba(148,163,184,0.4); font-size: 36px; letter-spacing: 0.5em; color: #60a5fa; font-weight: 700; box-shadow: inset 0 0 35px rgba(37,99,235,0.25); }
                    .timer { margin-top: 12px; font-size: 13px; color: #94a3b8; letter-spacing: 0.06em; }
                    .footer { margin-top: 32px; font-size: 12px; color: #64748b; letter-spacing: 0.04em; }
                    @media (max-width: 520px) {
                        .wrapper { margin: 16px; padding: 32px 24px; }
                        .code { width: 100%; letter-spacing: 0.4em; }
                    }
                </style>
            </head>
            <body>
                <div class="wrapper">
                    <h1>StudLink</h1>
                    <p>Ось твій код для ${typeText}. Введи його на сайті, щоб продовжити.</p>
                    <div class="code">${code}</div>
                    <div class="timer">Код дійсний протягом 15 хвилин</div>
                    <p>Якщо ти не запитував(ла) код, просто проігноруй цей лист - акаунт залишиться захищеним.</p>
                    <div class="footer">© ${new Date().getFullYear()} StudLink · Турбуємось про безпеку твоїх даних</div>
                </div>
            </body>
            </html>
        `,
        text: `
StudLink — код для ${typeText}

Твій код: ${code}

Він дійсний протягом 15 хвилин. Якщо ти не запитував(ла) код, проігноруй цей лист - акаунт залишиться захищеним.

© ${new Date().getFullYear()} StudLink
        `
    };
};

export const sendVerificationCodeEmail = async (email, code, type = 'login') => {
    try {
        const transporter = createTransporter();
        
        if (!transporter) {
            return await sendVerificationCodeEmailDev(email, code, type);
        }
        
        const template = getVerificationCodeTemplate(code, type);
        
        const fromAddress = process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER;
        const fromName = process.env.EMAIL_FROM_NAME || 'StudLink';

        const mailOptions = {
            from: `"${fromName}" <${fromAddress}>`,
            to: email,
            ...template
        };
        
        const result = await transporter.sendMail(mailOptions);
        console.log('Verification code email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending verification code email:', error);
        console.log('Falling back to dev mode...');
        return await sendVerificationCodeEmailDev(email, code, type);
    }
};

export const sendVerificationCodeEmailDev = async (email, code, type) => {
    console.log('\n=== VERIFICATION CODE EMAIL (DEV MODE) ===');
    console.log('To:', email);
    console.log('Type:', type);
    console.log('Code:', code);
    console.log('==========================================\n');
    
    return { success: true, messageId: 'dev-mode' };
};
