import nodemailer from 'nodemailer';

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: 'mail.bluebirdedu.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: '_mainaccount@bluebirdedu.com',
      pass: encodeURIComponent('Bharatbohra@231090')
    },
    debug: true, // Enable debug logging
    logger: true // Enable logger
  });

  try {
    // Verify connection configuration
    await transporter.verify();
    console.log('Server is ready to take our messages');

    const info = await transporter.sendMail({
      from: '"BlueBird Edu" <_mainaccount@bluebirdedu.com>',
      to: "crce.9892.ce@gmail.com",
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