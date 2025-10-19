import { sendPasswordResetEmail } from './src/utils/emailService.js';

const testEmail = async () => {
    console.log('Testing email configuration...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
    console.log('EMAIL_FROM_NAME:', process.env.EMAIL_FROM_NAME || 'Not set');
    console.log('---');
    
    try {
        const result = await sendPasswordResetEmail(
            'test@example.com',
            'http://localhost:5176/reset-password?token=test123',
            'Test User'
        );
        
        console.log('Email test result:', result);
    } catch (error) {
        console.error('Email test failed:', error);
    }
};

testEmail();
