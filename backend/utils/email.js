const nodemailer = require('nodemailer');

const createTransporter = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"AI Shop" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text,
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('Email error:', err.message);
    // Don't throw — email failure shouldn't break the request
  }
};
