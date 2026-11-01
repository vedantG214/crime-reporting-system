const nodemailer = require('nodemailer');

// 1. Email Transporter (Gmail / Mock)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'crimeguard.alert@gmail.com',
    pass: process.env.EMAIL_PASS || 'mockpassword',
  },
});

// 2. Email Sender Function
async function sendEmailNotification(to, subject, textContent) {
  try {
    if (!process.env.EMAIL_USER) {
      console.log(`[MOCK EMAIL SENT] To: ${to} | Subject: ${subject} | Body: ${textContent}`);
      return;
    }
    await transporter.sendMail({
      from: `"CrimeGuard Alert" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: textContent,
    });
    console.log(`Email successfully sent to: ${to}`);
  } catch (err) {
    console.log(`[Notification Fallback] Mock Email logged for: ${to}`);
  }
}

// 3. SMS Alert Simulator Function
async function sendSMSNotification(phone, message) {
  console.log(`[INSTANT SMS ALERT] Sent to: ${phone} | Message: ${message}`);
}

module.exports = { sendEmailNotification, sendSMSNotification };