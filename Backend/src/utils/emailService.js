import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

// Create transporter for email sending
const createTransporter = () => {
    // For development, we'll use a test account
    // In production, configure with real SMTP settings
    return nodemailer.createTransporter({
        host: 'smtp.gmail.com', // or your SMTP server
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER || 'your-email@gmail.com',
            pass: process.env.EMAIL_PASS || 'your-app-password'
        }
    });
};

// Email templates
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

// Send password reset email
export const sendPasswordResetEmail = async (email, resetUrl, userName) => {
    try {
        const transporter = createTransporter();
        const template = getPasswordResetTemplate(resetUrl, userName);
        
        const mailOptions = {
            from: `"3DN CodeCon" <${process.env.EMAIL_USER || 'noreply@3dncodecon.com'}>`,
            to: email,
            ...template
        };
        
        const result = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return { success: false, error: error.message };
    }
};

// For development - log email instead of sending
export const sendPasswordResetEmailDev = async (email, resetUrl, userName) => {
    console.log('\n=== PASSWORD RESET EMAIL (DEV MODE) ===');
    console.log('To:', email);
    console.log('Subject: Відновлення пароля - 3DN CodeCon');
    console.log('Reset URL:', resetUrl);
    console.log('User:', userName);
    console.log('=====================================\n');
    
    return { success: true, messageId: 'dev-mode' };
};
