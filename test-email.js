// test-email.js
import nodemailer from 'nodemailer';

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: 'mail.bluebirdedu.com',
    port: 465,  // or 587 for TLS
    secure: true, // true for 465, false for other ports
    auth: {
      user: '_mainaccount@bluebirdedu.com',
      pass: 'Bharatbohra%26231090'
    },
    tls: {
      rejectUnauthorized: false // Add this for testing
    }
  });

  try {
    const info = await transporter.sendMail({
      from: '"BlueBird Edu" <_mainaccount@bluebirdedu.com>', // Use the same email as auth
      to: "crce.9892.ce@gmail.com", // Use your personal email for testing
      subject: "Test Email from BlueBird Edu",
      text: "If you're seeing this, email sending is working!",
      html: "<b>If you're seeing this, email sending is working!</b>",
    });

    console.log("Email sent successfully:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

testEmail();