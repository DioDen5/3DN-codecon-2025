import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

const createTransporter = () => {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    if (!emailUser || !emailPass) {
        console.warn('EMAIL_USER or EMAIL_PASS not set. Using dev mode.');
        return null;
    }
    
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.sendgrid.net',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });
};

const getPasswordResetTemplate = (resetUrl, userName) => {
    return {
        subject: 'Відновлення пароля - 3DN CodeCon',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>3DN CodeCon</h1>
                        <p>Відновлення пароля</p>
                    </div>
                    <div class="content">
                        <h2>Привіт, ${userName}!</h2>
                        <p>Ви запросили відновлення пароля для вашого акаунту в 3DN CodeCon.</p>
                        <p>Натисніть кнопку нижче, щоб встановити новий пароль:</p>
                        <a href="${resetUrl}" class="button">Відновити пароль</a>
                        <p><strong>Важливо:</strong> Це посилання дійсне протягом 1 години.</p>
                        <p>Якщо ви не запитували відновлення пароля, просто проігноруйте цей лист.</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 3DN CodeCon. Всі права захищені.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
            Привіт, ${userName}!
            
            Ви запросили відновлення пароля для вашого акаунту в 3DN CodeCon.
            
            Перейдіть за посиланням: ${resetUrl}
            
            Це посилання дійсне протягом 1 години.
            
            Якщо ви не запитували відновлення пароля, просто проігноруйте цей лист.
            
            © 2025 3DN CodeCon
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
        
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'StudLink'}" <denyszastavniy@gmail.com>`,
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
    console.log('Subject: Відновлення пароля - 3DN CodeCon');
    console.log('Reset URL:', resetUrl);
    console.log('User:', userName);
    console.log('=====================================\n');
    
    return { success: true, messageId: 'dev-mode' };
};
