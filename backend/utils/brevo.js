const axios = require('axios');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'noreply@aishop.com';
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'AI Shop';

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP via Email using Brevo
const sendOTPEmail = async (toEmail, otp, purpose = 'login') => {
  console.log(`\n🔑 ==========================================`);
  console.log(`🔑 OTP for ${toEmail}: ${otp}`);
  console.log(`🔑 Purpose: ${purpose}`);
  console.log(`🔑 ==========================================\n`);
  const subjects = {
    login: '🔐 Your AI Shop Login OTP',
    register: '✅ Verify your AI Shop Account',
    reset: '🔑 AI Shop Password Reset OTP',
  };

  const messages = {
    login: `Your login OTP is`,
    register: `Your account verification OTP is`,
    reset: `Your password reset OTP is`,
  };

  try {
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
        to: [{ email: toEmail }],
        subject: subjects[purpose] || '🔐 Your AI Shop OTP',
        htmlContent: `
          <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="background: linear-gradient(135deg, #6366f1, #d946ef); width: 60px; height: 60px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <span style="font-size: 28px;">🛍️</span>
              </div>
              <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0;">AI Shop</h1>
            </div>
            <div style="background: white; border-radius: 12px; padding: 24px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <p style="color: #6b7280; margin-bottom: 16px; font-size: 15px;">${messages[purpose] || 'Your OTP is'}:</p>
              <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; letter-spacing: 12px; font-size: 36px; font-weight: 800; color: #6366f1; margin: 16px 0;">
                ${otp}
              </div>
              <p style="color: #9ca3af; font-size: 13px; margin-top: 16px;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
            </div>
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">If you didn't request this, please ignore this email.</p>
          </div>
        `,
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`✅ OTP email sent to ${toEmail}`);
    return true;
  } catch (err) {
    console.error('❌ Brevo email error:', err.response?.data || err.message);
    return false;
  }
};

// Send OTP via SMS using Brevo
const sendOTPSMS = async (phone, otp, purpose = 'login') => {
  const messages = {
    login: `Your AI Shop login OTP is ${otp}. Valid for 10 minutes. Do not share.`,
    register: `Your AI Shop verification OTP is ${otp}. Valid for 10 minutes.`,
    reset: `Your AI Shop password reset OTP is ${otp}. Valid for 10 minutes. Do not share.`,
  };

  try {
    await axios.post(
      'https://api.brevo.com/v3/transactionalSMS/sms',
      {
        sender: 'AISHOP',
        recipient: phone.startsWith('+') ? phone : `+91${phone}`,
        content: messages[purpose] || `Your AI Shop OTP is ${otp}. Valid for 10 minutes.`,
        type: 'transactional',
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`✅ OTP SMS sent to ${phone}`);
    return true;
  } catch (err) {
    console.error('❌ Brevo SMS error:', err.response?.data || err.message);
    return false;
  }
};

module.exports = { generateOTP, sendOTPEmail, sendOTPSMS };
